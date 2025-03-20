// Error handling for Nillion DB integration

import { ERROR_MESSAGES } from "./constants";

// Custom error class for Nillion DB
export class NillionDBError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = "NillionDBError";
    this.code = code;
    this.details = details;
  }
}

// Error codes
export const ERROR_CODES = {
  ENV_ERROR: "ENV_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",
  SCHEMA_ERROR: "SCHEMA_ERROR",
  DATA_ERROR: "DATA_ERROR",
  QUERY_ERROR: "QUERY_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
};

// Helper to validate required environment variables
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new NillionDBError(
      `${ERROR_MESSAGES.MISSING_ENV_VARS}: ${missingVars.join(", ")}`,
      ERROR_CODES.ENV_ERROR,
      { missingVars }
    );
  }
}

// Helper to handle fetch errors
export async function handleFetchResponse<T>(
  response: Response,
  errorMessage: string
): Promise<T> {
  if (!response.ok) {
    let errorDetails;
    
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { status: response.status, statusText: response.statusText };
    }
    
    throw new NillionDBError(
      `${errorMessage}: ${response.status} ${response.statusText}`,
      ERROR_CODES.NETWORK_ERROR,
      errorDetails
    );
  }
  
  return await response.json() as T;
}

// Helper to format errors for the agent
export function formatErrorForAgent(error: unknown): string {
  if (error instanceof NillionDBError) {
    return `❌ Error [${error.code}]: ${error.message}`;
  } else if (error instanceof Error) {
    return `❌ Error: ${error.message}`;
  }
  
  return `❌ Unknown error: ${String(error)}`;
} 