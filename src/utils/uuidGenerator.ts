/**
 * UUID Generator Utility for Nillion DB Schemas
 * 
 * This utility helps generate and manage UUIDs for Nillion DB schemas.
 * It generates UUIDs and logs them for future reference.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Directory to store generated UUIDs
const UUID_LOG_DIR = path.join(process.cwd(), 'testoutputs');
const UUID_LOG_FILE = path.join(UUID_LOG_DIR, 'schema-uuids.json');

// Schema types
type SchemaType = 'SERVICE' | 'BOOKING' | 'REVIEW' | 'CUSTOM';

/**
 * Interface for the UUID log file
 */
interface UuidLog {
  generated_at: string;
  schemas: Record<string, string>;
}

/**
 * Ensure the log directory exists
 */
const ensureLogDirectory = (): void => {
  if (!fs.existsSync(UUID_LOG_DIR)) {
    fs.mkdirSync(UUID_LOG_DIR, { recursive: true });
  }
};

/**
 * Load existing UUID log
 */
const loadUuidLog = (): UuidLog => {
  ensureLogDirectory();
  
  if (fs.existsSync(UUID_LOG_FILE)) {
    try {
      const content = fs.readFileSync(UUID_LOG_FILE, 'utf8');
      return JSON.parse(content) as UuidLog;
    } catch (error) {
      console.error('Error reading UUID log file:', error);
    }
  }
  
  // Return empty log if file doesn't exist or has errors
  return {
    generated_at: new Date().toISOString(),
    schemas: {},
  };
};

/**
 * Save UUID log
 */
const saveUuidLog = (log: UuidLog): void => {
  ensureLogDirectory();
  
  try {
    fs.writeFileSync(UUID_LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing UUID log file:', error);
  }
};

/**
 * Generate a new UUID
 */
export const generateUuid = (): string => {
  return crypto.randomUUID();
};

/**
 * Generate UUIDs for all schema types
 */
export const generateAllSchemaUuids = (): Record<string, string> => {
  const uuids: Record<string, string> = {
    SERVICE: generateUuid(),
    BOOKING: generateUuid(),
    REVIEW: generateUuid(),
  };
  
  // Log the generated UUIDs
  const log = loadUuidLog();
  const timestamp = new Date().toISOString();
  
  // Create a new entry with timestamp
  log.generated_at = timestamp;
  log.schemas = { ...log.schemas, ...uuids };
  
  saveUuidLog(log);
  
  console.log('Generated UUIDs for schemas:');
  console.log(`SERVICE: ${uuids.SERVICE}`);
  console.log(`BOOKING: ${uuids.BOOKING}`);
  console.log(`REVIEW: ${uuids.REVIEW}`);
  console.log(`UUIDs saved to: ${UUID_LOG_FILE}`);
  
  return uuids;
};

/**
 * Generate a UUID for a specific schema type
 */
export const generateSchemaUuid = (schemaType: SchemaType, schemaName?: string): string => {
  const uuid = generateUuid();
  const key = schemaType === 'CUSTOM' ? schemaName || `CUSTOM_${Date.now()}` : schemaType;
  
  if (!key) {
    throw new Error('Schema name is required for CUSTOM schema type');
  }
  
  // Log the generated UUID
  const log = loadUuidLog();
  log.schemas[key] = uuid;
  
  saveUuidLog(log);
  
  console.log(`Generated UUID for schema ${key}: ${uuid}`);
  console.log(`UUID saved to: ${UUID_LOG_FILE}`);
  
  return uuid;
};

/**
 * Get all previously generated UUIDs
 */
export const getAllSchemaUuids = (): UuidLog => {
  return loadUuidLog();
};

/**
 * Print a formatted report of all UUIDs
 */
export const printUuidReport = (): void => {
  const log = loadUuidLog();
  
  console.log('==============================================');
  console.log('           NILLION DB SCHEMA UUIDs            ');
  console.log('==============================================');
  console.log(`Last Generated: ${log.generated_at}`);
  console.log('----------------------------------------------');
  
  Object.entries(log.schemas).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  console.log('==============================================');
  console.log(`UUID log file: ${UUID_LOG_FILE}`);
};

// Export the main function to use from CLI
if (require.main === module) {
  generateAllSchemaUuids();
  printUuidReport();
} 