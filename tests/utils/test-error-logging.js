/**
 * Test script to verify error logging functionality
 * This script intentionally triggers errors to test the logging system
 */

const logger = require('../../src/backend/src/utils/logger');
const fs = require('fs');
const path = require('path');

console.log('Starting error logging test...');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '../../logs/backend');
const errorLogsDir = path.join(logsDir, 'errors');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`Created logs directory: ${logsDir}`);
}

if (!fs.existsSync(errorLogsDir)) {
  fs.mkdirSync(errorLogsDir, { recursive: true });
  console.log(`Created error logs directory: ${errorLogsDir}`);
}

// Test standard logging
console.log('Testing standard logging...');
logger.info('Test info message');
logger.warn('Test warning message');
logger.error('Test error message');
logger.debug('Test debug message');

// Test error logging with Error object
console.log('Testing error logging with Error object...');
try {
  throw new Error('Test error for logging');
} catch (error) {
  logger.logError('Caught an error during testing', error, {
    testId: 'ERROR-TEST-001',
    source: 'test-error-logging.js'
  });
}

// Test error logging with custom object
console.log('Testing error logging with custom object...');
logger.logError('Custom error object test', {
  customField: 'custom value',
  errorCode: 'CUSTOM-001'
}, {
  testId: 'ERROR-TEST-002',
  source: 'test-error-logging.js'
});

// Test API request logging
console.log('Testing API request logging...');
const mockReq = {
  method: 'GET',
  originalUrl: '/api/test',
  ip: '127.0.0.1',
  get: (header) => header === 'User-Agent' ? 'Test User Agent' : null
};

const mockRes = {
  statusCode: 200,
  on: (event, callback) => {
    if (event === 'finish') {
      setTimeout(callback, 10); // Simulate response finishing after 10ms
    }
  }
};

logger.logAPIRequest(mockReq, mockRes, () => {
  console.log('API request logging middleware called next()');
});

// Test deprecation warning
console.log('Testing deprecation warning...');
logger.logDeprecation('oldFunction()', 'newFunction()');

// Wait for logs to be written
setTimeout(() => {
  console.log('\nError logging test completed.');
  console.log(`Check log files in ${logsDir} and ${errorLogsDir} to verify logging.`);
  
  // List log files
  console.log('\nAvailable log files:');
  
  try {
    const mainLogs = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
    console.log('Main logs:');
    mainLogs.forEach(file => console.log(` - ${file}`));
    
    const errorLogs = fs.readdirSync(errorLogsDir).filter(file => file.endsWith('.log'));
    console.log('Error logs:');
    errorLogs.forEach(file => console.log(` - ${file}`));
  } catch (err) {
    console.error('Error listing log files:', err);
  }
}, 1000); // Wait 1 second for all logs to be written 