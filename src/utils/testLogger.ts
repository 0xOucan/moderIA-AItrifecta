/**
 * Test Logger Utility
 * 
 * This utility logs terminal output to files with timestamps for debugging and testing purposes.
 * It creates log files in the testoutputs directory with timestamped filenames.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Directory to store logs
const LOGS_DIR = path.join(process.cwd(), 'testoutputs');

// Class for the test logger
export class TestLogger {
  private logFilePath: string;
  private logStream: fs.WriteStream | null = null;
  private operationName: string;
  private startTime: Date;

  /**
   * Create a new test logger
   * @param operationName Name of the operation being logged
   */
  constructor(operationName: string) {
    this.operationName = operationName;
    this.startTime = new Date();
    
    // Create log filename with timestamp
    const timestamp = this.formatTimestamp(this.startTime);
    const sanitizedOpName = operationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.logFilePath = path.join(LOGS_DIR, `${timestamp}_${sanitizedOpName}.md`);
    
    // Create the logs directory if it doesn't exist
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    
    // Open log file stream
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
    
    // Write header to log file
    this.writeHeader();
  }

  /**
   * Format timestamp for filename
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Write header information to log file
   */
  private writeHeader(): void {
    if (!this.logStream) return;
    
    this.logStream.write(`# Test Log: ${this.operationName}\n\n`);
    this.logStream.write(`- **Date:** ${this.startTime.toLocaleDateString()}\n`);
    this.logStream.write(`- **Time:** ${this.startTime.toLocaleTimeString()}\n`);
    this.logStream.write(`- **Operation:** ${this.operationName}\n\n`);
    this.logStream.write(`## Log Entries\n\n`);
  }

  /**
   * Log a message to the log file
   */
  log(message: any, type: 'info' | 'error' | 'success' | 'warning' = 'info'): void {
    if (!this.logStream) return;
    
    const timestamp = new Date().toISOString();
    let formattedMessage = message;
    
    // Format objects and arrays
    if (typeof message === 'object' && message !== null) {
      formattedMessage = util.inspect(message, { depth: null });
    }
    
    // Add emoji based on message type
    let emoji = '';
    switch (type) {
      case 'info':
        emoji = 'ℹ️';
        break;
      case 'error':
        emoji = '❌';
        break;
      case 'success':
        emoji = '✅';
        break;
      case 'warning':
        emoji = '⚠️';
        break;
    }
    
    // Write log entry to file
    this.logStream.write(`### ${emoji} ${timestamp}\n\n`);
    this.logStream.write('```\n');
    this.logStream.write(String(formattedMessage).replace(/password|secret|key/gi, '***REDACTED***'));
    this.logStream.write('\n```\n\n');
    
    // Also log to console
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${formattedMessage}`);
  }

  /**
   * Log an error message
   */
  error(message: any): void {
    this.log(message, 'error');
  }

  /**
   * Log a success message
   */
  success(message: any): void {
    this.log(message, 'success');
  }

  /**
   * Log a warning message
   */
  warning(message: any): void {
    this.log(message, 'warning');
  }

  /**
   * Log a section header
   */
  section(title: string): void {
    if (!this.logStream) return;
    
    this.logStream.write(`\n## ${title}\n\n`);
    console.log(`\n=================== ${title} ===================\n`);
  }

  /**
   * Close the log file
   */
  close(): void {
    if (!this.logStream) return;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
    
    this.logStream.write(`\n## Summary\n\n`);
    this.logStream.write(`- **Start Time:** ${this.startTime.toLocaleString()}\n`);
    this.logStream.write(`- **End Time:** ${endTime.toLocaleString()}\n`);
    this.logStream.write(`- **Duration:** ${duration} seconds\n`);
    
    this.logStream.end();
    this.logStream = null;
    
    console.log(`\nTest log saved to: ${this.logFilePath}`);
  }
}

/**
 * Create a new test logger
 */
export const createTestLogger = (operationName: string): TestLogger => {
  return new TestLogger(operationName);
}; 