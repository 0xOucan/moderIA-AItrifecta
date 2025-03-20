// Database schemas for the Moderia marketplace

import { SCHEMA_IDS, SERVICE_TYPES, BOOKING_STATUS, RATING_SCALE } from "./constants";

// Base interfaces
export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  encrypted: boolean;
}

// Service provider record
export interface ServiceRecord extends BaseRecord {
  provider_id: string;
  provider_name: string;
  service_type: typeof SERVICE_TYPES[number];
  title: string;
  description: string;
  price: number;
  currency: string;
  duration_minutes: number;
  date: string;
  time: string;
  timezone: string;
  meeting_link?: string;
  available: boolean;
  tags: string[];
}

// Booking record
export interface BookingRecord extends BaseRecord {
  service_id: string;
  client_id: string;
  provider_id: string;
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  booking_date: string;
  payment_amount: number;
  payment_currency: string;
  meeting_link: string;
  notes: string;
  agent_notes?: string;
}

// Review record
export interface ReviewRecord extends BaseRecord {
  booking_id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  disputed: boolean;
  dispute_reason?: string;
  agent_resolution?: string;
}

// Schema payloads for Nillion DB
export const serviceSchemaPayload = {
  id: SCHEMA_IDS.SERVICE,
  name: "service",
  description: "Service offerings in the Moderia marketplace",
  fields: [
    { name: "id", type: "string", encrypted: false },
    { name: "created_at", type: "string", encrypted: false },
    { name: "updated_at", type: "string", encrypted: false },
    { name: "encrypted", type: "boolean", encrypted: false },
    { name: "provider_id", type: "string", encrypted: false },
    { name: "provider_name", type: "string", encrypted: true },
    { name: "service_type", type: "string", encrypted: false },
    { name: "title", type: "string", encrypted: false },
    { name: "description", type: "string", encrypted: true },
    { name: "price", type: "number", encrypted: false },
    { name: "currency", type: "string", encrypted: false },
    { name: "duration_minutes", type: "number", encrypted: false },
    { name: "date", type: "string", encrypted: false },
    { name: "time", type: "string", encrypted: false },
    { name: "timezone", type: "string", encrypted: false },
    { name: "meeting_link", type: "string", encrypted: true },
    { name: "available", type: "boolean", encrypted: false },
    { name: "tags", type: "array", arrayType: "string", encrypted: false },
  ],
};

export const bookingSchemaPayload = {
  id: SCHEMA_IDS.BOOKING,
  name: "booking",
  description: "Bookings in the Moderia marketplace",
  fields: [
    { name: "id", type: "string", encrypted: false },
    { name: "created_at", type: "string", encrypted: false },
    { name: "updated_at", type: "string", encrypted: false },
    { name: "encrypted", type: "boolean", encrypted: false },
    { name: "service_id", type: "string", encrypted: false },
    { name: "client_id", type: "string", encrypted: false },
    { name: "provider_id", type: "string", encrypted: false },
    { name: "status", type: "string", encrypted: false },
    { name: "booking_date", type: "string", encrypted: false },
    { name: "payment_amount", type: "number", encrypted: false },
    { name: "payment_currency", type: "string", encrypted: false },
    { name: "meeting_link", type: "string", encrypted: true },
    { name: "notes", type: "string", encrypted: true },
    { name: "agent_notes", type: "string", encrypted: true },
  ],
};

export const reviewSchemaPayload = {
  id: SCHEMA_IDS.REVIEW,
  name: "review",
  description: "Reviews in the Moderia marketplace",
  fields: [
    { name: "id", type: "string", encrypted: false },
    { name: "created_at", type: "string", encrypted: false },
    { name: "updated_at", type: "string", encrypted: false },
    { name: "encrypted", type: "boolean", encrypted: false },
    { name: "booking_id", type: "string", encrypted: false },
    { name: "service_id", type: "string", encrypted: false },
    { name: "client_id", type: "string", encrypted: false },
    { name: "provider_id", type: "string", encrypted: false },
    { name: "rating", type: "number", encrypted: false },
    { name: "comment", type: "string", encrypted: true },
    { name: "disputed", type: "boolean", encrypted: false },
    { name: "dispute_reason", type: "string", encrypted: true },
    { name: "agent_resolution", type: "string", encrypted: true },
  ],
};

// Query definitions for common operations
export const queryDefinitions = {
  // Find available services by type
  FIND_SERVICES_BY_TYPE: {
    id: "find_services_by_type",
    name: "Find Services by Type",
    description: "Find available services by type",
    query: `
      SELECT *
      FROM service
      WHERE service_type = :service_type AND available = true
      ORDER BY date ASC, time ASC
    `,
  },
  
  // Find bookings by client
  FIND_BOOKINGS_BY_CLIENT: {
    id: "find_bookings_by_client",
    name: "Find Bookings by Client",
    description: "Find all bookings for a client",
    query: `
      SELECT *
      FROM booking
      WHERE client_id = :client_id
      ORDER BY booking_date DESC
    `,
  },
  
  // Find bookings by provider
  FIND_BOOKINGS_BY_PROVIDER: {
    id: "find_bookings_by_provider",
    name: "Find Bookings by Provider",
    description: "Find all bookings for a provider",
    query: `
      SELECT *
      FROM booking
      WHERE provider_id = :provider_id
      ORDER BY booking_date DESC
    `,
  },
  
  // Find disputed reviews
  FIND_DISPUTED_REVIEWS: {
    id: "find_disputed_reviews",
    name: "Find Disputed Reviews",
    description: "Find all disputed reviews",
    query: `
      SELECT *
      FROM review
      WHERE disputed = true
      ORDER BY created_at DESC
    `,
  },
}; 