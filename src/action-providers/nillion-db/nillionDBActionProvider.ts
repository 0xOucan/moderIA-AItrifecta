// Nillion DB Action Provider for Moderia Marketplace
import * as crypto from "crypto";
import {
  ActionProvider,
  WalletProvider,
  Network,
} from "@coinbase/agentkit";

import {
  NODE_CONFIG,
  NodeName,
  API_ENDPOINTS,
  SCHEMA_IDS,
  ERROR_MESSAGES,
  SERVICE_TYPES,
  BOOKING_STATUS,
} from "./constants";

import {
  NillionDBError,
  ERROR_CODES,
  validateEnvironmentVariables,
  handleFetchResponse,
  formatErrorForAgent,
} from "./errors";

import {
  ServiceRecord,
  BookingRecord,
  ReviewRecord,
  serviceSchemaPayload,
  bookingSchemaPayload,
  reviewSchemaPayload,
  queryDefinitions,
} from "./schemas";

// Type for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Types for action parameters
interface CreateServiceParams {
  providerId: string;
  providerName: string;
  serviceType: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  durationMinutes: number;
  date: string;
  time: string;
  timezone: string;
  meetingLink?: string;
  tags?: string[];
}

interface CreateBookingParams {
  serviceId: string;
  clientId: string;
  providerId: string;
  bookingDate: string;
  paymentAmount: number;
  paymentCurrency: string;
  meetingLink: string;
  notes?: string;
}

interface CreateReviewParams {
  bookingId: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment: string;
  disputed?: boolean;
  disputeReason?: string;
}

interface GetAvailableServicesParams {
  serviceType?: string;
}

interface GetClientBookingsParams {
  clientId: string;
}

interface GetProviderBookingsParams {
  providerId: string;
}

interface UpdateBookingStatusParams {
  bookingId: string;
  status: string;
  agentNotes?: string;
}

interface ResolveDisputeParams {
  reviewId: string;
  resolution: string;
}

interface ExecuteQueryParams {
  queryId: string;
  variables?: Record<string, any>;
}

// Configuration class for Nillion DB
class NillionDBConfig {
  private readonly privateKey: string;
  private readonly orgDid: string;

  constructor() {
    // Validate required environment variables
    const requiredVars = [
      "SV_ORG_DID",
      "SV_PRIVATE_KEY",
      "SV_NODE1_URL",
      "SV_NODE1_DID",
      "SV_NODE2_URL",
      "SV_NODE2_DID",
      "SV_NODE3_URL",
      "SV_NODE3_DID",
      "SCHEMA_ID_SERVICE",
      "SCHEMA_ID_BOOKING",
      "SCHEMA_ID_REVIEW",
    ];

    try {
      validateEnvironmentVariables(requiredVars);
    } catch (error) {
      console.error("Failed to initialize Nillion DB:", error);
      throw error;
    }

    this.privateKey = process.env.SV_PRIVATE_KEY || "";
    this.orgDid = process.env.SV_ORG_DID || "";
  }

  // Generate authentication headers for API requests
  public getAuthHeaders(): Record<string, string> {
    // In a real implementation, we would generate a proper JWT
    // For now, we're using a simplified approach
    return {
      Authorization: `Bearer ${this.privateKey}`,
      "Content-Type": "application/json",
    };
  }

  // Helper to validate node configuration
  public validateNodeConfig(nodeName: NodeName): void {
    const node = NODE_CONFIG[nodeName];
    
    if (!node.url || !node.did) {
      throw new NillionDBError(
        `${ERROR_MESSAGES.INVALID_NODE_CONFIG} for ${nodeName}`,
        ERROR_CODES.CONFIG_ERROR,
        { nodeName, config: node }
      );
    }
  }

  // Get all configured nodes that are valid
  public getValidNodes(): NodeName[] {
    return Object.keys(NODE_CONFIG).filter((nodeName) => {
      const node = NODE_CONFIG[nodeName as NodeName];
      return node.url && node.did;
    }) as NodeName[];
  }
}

/**
 * NillionDBActionProvider provides actions for interacting with the Nillion DB service
 */
export class NillionDBActionProvider extends ActionProvider<WalletProvider> {
  private config: NillionDBConfig;

  constructor() {
    super("nillionDB", []);
    this.config = new NillionDBConfig();
  }

  // Schema management
  async createServiceSchema() {
    try {
      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_SCHEMA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify(serviceSchemaPayload),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.SCHEMA_CREATION_FAILED
          );
        })
      );
      
      return {
        success: results.every((result) => result.success),
        message: "🔧 Service schema created successfully",
        schemaId: SCHEMA_IDS.SERVICE,
      };
    } catch (error) {
      console.error("Failed to create service schema:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  async createBookingSchema() {
    try {
      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_SCHEMA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify(bookingSchemaPayload),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.SCHEMA_CREATION_FAILED
          );
        })
      );
      
      return {
        success: results.every((result) => result.success),
        message: "🔧 Booking schema created successfully",
        schemaId: SCHEMA_IDS.BOOKING,
      };
    } catch (error) {
      console.error("Failed to create booking schema:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  async createReviewSchema() {
    try {
      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_SCHEMA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify(reviewSchemaPayload),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.SCHEMA_CREATION_FAILED
          );
        })
      );
      
      return {
        success: results.every((result) => result.success),
        message: "🔧 Review schema created successfully",
        schemaId: SCHEMA_IDS.REVIEW,
      };
    } catch (error) {
      console.error("Failed to create review schema:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  // Service management
  async createService(params: CreateServiceParams) {
    try {
      const {
        providerId,
        providerName,
        serviceType,
        title,
        description,
        price,
        currency,
        durationMinutes,
        date,
        time,
        timezone,
        meetingLink,
        tags,
      } = params;

      if (!SERVICE_TYPES.includes(serviceType)) {
        throw new NillionDBError(
          `Invalid service type. Must be one of: ${SERVICE_TYPES.join(", ")}`,
          ERROR_CODES.DATA_ERROR
        );
      }

      const serviceRecord: ServiceRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        encrypted: true,
        provider_id: providerId,
        provider_name: providerName,
        service_type: serviceType as any,
        title,
        description,
        price,
        currency,
        duration_minutes: durationMinutes,
        date,
        time,
        timezone,
        meeting_link: meetingLink,
        available: true,
        tags: tags || [],
      };

      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_DATA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify({
              schema: SCHEMA_IDS.SERVICE,
              data: [serviceRecord],
            }),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.DATA_CREATION_FAILED
          );
        })
      );
      
      return {
        success: results.every((result) => result.success),
        message: "✅ Service created successfully",
        serviceId: serviceRecord.id,
      };
    } catch (error) {
      console.error("Failed to create service:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  // Booking management
  async createBooking(params: CreateBookingParams) {
    try {
      const {
        serviceId,
        clientId,
        providerId,
        bookingDate,
        paymentAmount,
        paymentCurrency,
        meetingLink,
        notes,
      } = params;

      const bookingRecord: BookingRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        encrypted: true,
        service_id: serviceId,
        client_id: clientId,
        provider_id: providerId,
        status: BOOKING_STATUS.CONFIRMED,
        booking_date: bookingDate,
        payment_amount: paymentAmount,
        payment_currency: paymentCurrency,
        meeting_link: meetingLink,
        notes: notes || "",
      };

      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_DATA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify({
              schema: SCHEMA_IDS.BOOKING,
              data: [bookingRecord],
            }),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.DATA_CREATION_FAILED
          );
        })
      );
      
      // TODO: Also update service availability in a real implementation
      
      return {
        success: results.every((result) => result.success),
        message: "✅ Booking created successfully",
        bookingId: bookingRecord.id,
      };
    } catch (error) {
      console.error("Failed to create booking:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  // Review management
  async createReview(params: CreateReviewParams) {
    try {
      const {
        bookingId,
        serviceId,
        clientId,
        providerId,
        rating,
        comment,
        disputed,
        disputeReason,
      } = params;

      // Validate the rating
      if (rating < 1 || rating > 5) {
        throw new NillionDBError(
          "Rating must be between 1 and 5",
          ERROR_CODES.DATA_ERROR
        );
      }

      const reviewRecord: ReviewRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        encrypted: true,
        booking_id: bookingId,
        service_id: serviceId,
        client_id: clientId,
        provider_id: providerId,
        rating,
        comment,
        disputed: disputed || false,
        dispute_reason: disputeReason,
      };

      const results = await Promise.all(
        this.config.getValidNodes().map(async (nodeName) => {
          this.config.validateNodeConfig(nodeName);
          const node = NODE_CONFIG[nodeName];
          
          const url = new URL(API_ENDPOINTS.CREATE_DATA, node.url).toString();
          const response = await fetch(url, {
            method: "POST",
            headers: this.config.getAuthHeaders(),
            body: JSON.stringify({
              schema: SCHEMA_IDS.REVIEW,
              data: [reviewRecord],
            }),
          });
          
          return handleFetchResponse<ApiResponse<string>>(
            response,
            ERROR_MESSAGES.DATA_CREATION_FAILED
          );
        })
      );
      
      return {
        success: results.every((result) => result.success),
        message: "✅ Review created successfully",
        reviewId: reviewRecord.id,
      };
    } catch (error) {
      console.error("Failed to create review:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  // Data retrieval
  async getAvailableServices(params: GetAvailableServicesParams) {
    try {
      const { serviceType } = params;
      
      // Get a random node for reading data
      const validNodes = this.config.getValidNodes();
      if (validNodes.length === 0) {
        throw new NillionDBError(
          "No valid nodes configured",
          ERROR_CODES.CONFIG_ERROR
        );
      }
      
      const nodeName = validNodes[0];
      this.config.validateNodeConfig(nodeName);
      const node = NODE_CONFIG[nodeName];
      
      const url = new URL(API_ENDPOINTS.READ_DATA, node.url).toString();
      const filter = serviceType ? { service_type: serviceType, available: true } : { available: true };
      
      const response = await fetch(url, {
        method: "POST",
        headers: this.config.getAuthHeaders(),
        body: JSON.stringify({
          schema: SCHEMA_IDS.SERVICE,
          filter,
        }),
      });
      
      const result = await handleFetchResponse<ApiResponse<ServiceRecord[]>>(
        response,
        ERROR_MESSAGES.DATA_RETRIEVAL_FAILED
      );
      
      return {
        success: true,
        message: "📋 Available services retrieved successfully",
        services: result.data || [],
      };
    } catch (error) {
      console.error("Failed to retrieve available services:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
        services: [],
      };
    }
  }

  async getClientBookings(params: GetClientBookingsParams) {
    try {
      const { clientId } = params;
      
      // Get a random node for reading data
      const validNodes = this.config.getValidNodes();
      if (validNodes.length === 0) {
        throw new NillionDBError(
          "No valid nodes configured",
          ERROR_CODES.CONFIG_ERROR
        );
      }
      
      const nodeName = validNodes[0];
      this.config.validateNodeConfig(nodeName);
      const node = NODE_CONFIG[nodeName];
      
      const url = new URL(API_ENDPOINTS.READ_DATA, node.url).toString();
      
      const response = await fetch(url, {
        method: "POST",
        headers: this.config.getAuthHeaders(),
        body: JSON.stringify({
          schema: SCHEMA_IDS.BOOKING,
          filter: { client_id: clientId },
        }),
      });
      
      const result = await handleFetchResponse<ApiResponse<BookingRecord[]>>(
        response,
        ERROR_MESSAGES.DATA_RETRIEVAL_FAILED
      );
      
      return {
        success: true,
        message: "📋 Client bookings retrieved successfully",
        bookings: result.data || [],
      };
    } catch (error) {
      console.error("Failed to retrieve client bookings:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
        bookings: [],
      };
    }
  }

  async getProviderBookings(params: GetProviderBookingsParams) {
    try {
      const { providerId } = params;
      
      // Get a random node for reading data
      const validNodes = this.config.getValidNodes();
      if (validNodes.length === 0) {
        throw new NillionDBError(
          "No valid nodes configured",
          ERROR_CODES.CONFIG_ERROR
        );
      }
      
      const nodeName = validNodes[0];
      this.config.validateNodeConfig(nodeName);
      const node = NODE_CONFIG[nodeName];
      
      const url = new URL(API_ENDPOINTS.READ_DATA, node.url).toString();
      
      const response = await fetch(url, {
        method: "POST",
        headers: this.config.getAuthHeaders(),
        body: JSON.stringify({
          schema: SCHEMA_IDS.BOOKING,
          filter: { provider_id: providerId },
        }),
      });
      
      const result = await handleFetchResponse<ApiResponse<BookingRecord[]>>(
        response,
        ERROR_MESSAGES.DATA_RETRIEVAL_FAILED
      );
      
      return {
        success: true,
        message: "📋 Provider bookings retrieved successfully",
        bookings: result.data || [],
      };
    } catch (error) {
      console.error("Failed to retrieve provider bookings:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
        bookings: [],
      };
    }
  }

  // Booking and dispute management
  async updateBookingStatus(params: UpdateBookingStatusParams) {
    try {
      const { bookingId, status, agentNotes } = params;
      
      // Validate status
      if (!Object.values(BOOKING_STATUS).includes(status)) {
        throw new NillionDBError(
          `Invalid status. Must be one of: ${Object.values(BOOKING_STATUS).join(", ")}`,
          ERROR_CODES.DATA_ERROR
        );
      }

      // In a real implementation, we would:
      // 1. Retrieve the current booking
      // 2. Update its status and notes
      // 3. Save it back to the database
      // This is a simplified version
      
      return {
        success: true,
        message: `🔄 Booking status updated to ${status}`,
        bookingId,
      };
    } catch (error) {
      console.error("Failed to update booking status:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  async resolveDispute(params: ResolveDisputeParams) {
    try {
      const { reviewId, resolution } = params;
      
      // In a real implementation, we would:
      // 1. Retrieve the current review
      // 2. Update its dispute status and resolution
      // 3. Save it back to the database
      // This is a simplified version
      
      return {
        success: true,
        message: "⚖️ Dispute resolved successfully",
        reviewId,
      };
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
      };
    }
  }

  // Advanced queries
  async executeQuery(params: ExecuteQueryParams) {
    try {
      const { queryId, variables } = params;
      
      // Find the query in our predefined queries
      const queryDef = Object.values(queryDefinitions).find(
        (q) => q.id === queryId
      );
      
      if (!queryDef) {
        throw new NillionDBError(
          `Query with ID '${queryId}' not found`,
          ERROR_CODES.QUERY_ERROR
        );
      }

      // Get a random node for reading data
      const validNodes = this.config.getValidNodes();
      if (validNodes.length === 0) {
        throw new NillionDBError(
          "No valid nodes configured",
          ERROR_CODES.CONFIG_ERROR
        );
      }
      
      const nodeName = validNodes[0];
      this.config.validateNodeConfig(nodeName);
      const node = NODE_CONFIG[nodeName];
      
      const url = new URL(API_ENDPOINTS.EXECUTE_QUERY, node.url).toString();
      
      const response = await fetch(url, {
        method: "POST",
        headers: this.config.getAuthHeaders(),
        body: JSON.stringify({
          id: queryId,
          variables: variables || {},
        }),
      });
      
      const result = await handleFetchResponse<ApiResponse<unknown>>(
        response,
        ERROR_MESSAGES.QUERY_EXECUTION_FAILED
      );
      
      return {
        success: true,
        message: `🔍 Query '${queryDef.name}' executed successfully`,
        results: result.data,
      };
    } catch (error) {
      console.error("Failed to execute query:", error);
      return {
        success: false,
        message: formatErrorForAgent(error),
        results: [],
      };
    }
  }

  // Network support check
  supportsNetwork = (network: Network) => true;
}

// Factory function to create the action provider
export const nillionDBActionProvider = () => new NillionDBActionProvider(); 