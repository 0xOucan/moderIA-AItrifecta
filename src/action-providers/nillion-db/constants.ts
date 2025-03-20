// Constants for Nillion DB integration

export const NODE_CONFIG = {
  NODE1: {
    url: process.env.SV_NODE1_URL || "",
    did: process.env.SV_NODE1_DID || "",
  },
  NODE2: {
    url: process.env.SV_NODE2_URL || "",
    did: process.env.SV_NODE2_DID || "",
  },
  NODE3: {
    url: process.env.SV_NODE3_URL || "",
    did: process.env.SV_NODE3_DID || "",
  },
};

export type NodeName = keyof typeof NODE_CONFIG;

// Collection schema IDs
export const SCHEMA_IDS = {
  SERVICE: process.env.SCHEMA_ID_SERVICE || "",
  BOOKING: process.env.SCHEMA_ID_BOOKING || "",
  REVIEW: process.env.SCHEMA_ID_REVIEW || "",
};

// API endpoints for Nillion DB
export const API_ENDPOINTS = {
  CREATE_SCHEMA: "/api/v1/schemas",
  CREATE_DATA: "/api/v1/data/create",
  READ_DATA: "/api/v1/data/read",
  CREATE_QUERY: "/api/v1/queries",
  EXECUTE_QUERY: "/api/v1/queries/execute",
};

// Error messages
export const ERROR_MESSAGES = {
  MISSING_ENV_VARS: "Missing required environment variables for Nillion DB",
  INVALID_NODE_CONFIG: "Invalid node configuration",
  SCHEMA_CREATION_FAILED: "Failed to create schema",
  DATA_CREATION_FAILED: "Failed to create data",
  DATA_RETRIEVAL_FAILED: "Failed to retrieve data",
  QUERY_CREATION_FAILED: "Failed to create query",
  QUERY_EXECUTION_FAILED: "Failed to execute query",
};

// Service types for the marketplace
export const SERVICE_TYPES = [
  "language_class",
  "tutoring",
  "consulting",
  "coaching",
  "other",
];

// Status for bookings
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

// Review ratings
export const RATING_SCALE = {
  MIN: 1,
  MAX: 5,
}; 