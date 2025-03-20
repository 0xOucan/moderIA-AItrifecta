/**
 * Setup and Test Script for Moderia AI
 * 
 * This script sets up the environment and runs a complete test of the Nillion DB integration.
 * It first generates UUIDs for the schemas, then runs the demo script.
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { createTestLogger } from '../utils/testLogger';

// Create a test logger
const logger = createTestLogger('setup-and-test');

/**
 * Run a script and capture its output
 */
async function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn('ts-node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('error', (error) => {
      logger.error(`Failed to start script at ${scriptPath}`);
      logger.error(error);
      reject(error);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        logger.success(`Script at ${scriptPath} completed successfully`);
        resolve();
      } else {
        logger.error(`Script at ${scriptPath} exited with code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

/**
 * Main function to run all scripts
 */
async function main() {
  try {
    logger.section('Starting Setup and Test');
    
    // Path to scripts
    const uuidGeneratorPath = path.join(__dirname, '../utils/uuidGenerator.ts');
    const demoScriptPath = path.join(__dirname, './demo-nillion-db.ts');
    
    // Run UUID generator
    logger.section('Generating Schema UUIDs');
    await runScript(uuidGeneratorPath);
    
    // Run demo script
    logger.section('Running Nillion DB Demo');
    await runScript(demoScriptPath);
    
    logger.section('Setup and Test Completed');
    logger.success('All scripts ran successfully!');
  } catch (error) {
    logger.error('Error in setup and test process:');
    logger.error(error);
    process.exit(1);
  } finally {
    logger.close();
  }
}

// Run the script
if (require.main === module) {
  main();
} 