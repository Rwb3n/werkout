/**
 * Frontend Logger Utility
 * 
 * This utility provides logging functions for the frontend.
 * It logs to the console in development mode and also sends error logs
 * to a server endpoint in production to be saved.
 */

// Function to generate a timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Constants for log levels
const LOG_LEVEL = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// In-memory log storage (for potential sending to server)
const logBuffer = [];
const MAX_BUFFER_SIZE = 100; // Prevent memory issues by capping at 100 entries

// Basic log function
const log = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  // Add to buffer
  logBuffer.push(logEntry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift(); // Remove oldest log when buffer is full
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const consoleMethod = level === LOG_LEVEL.ERROR ? 'error' 
      : level === LOG_LEVEL.WARN ? 'warn'
      : level === LOG_LEVEL.INFO ? 'info'
      : 'log';
    
    console[consoleMethod](`[${timestamp}] [${level}] ${message}`, data || '');
  }

  // In production, we would send errors to the server
  if (process.env.NODE_ENV === 'production' && level === LOG_LEVEL.ERROR) {
    sendErrorToServer(logEntry);
  }

  return logEntry;
};

// Function to send error logs to server (to be implemented)
const sendErrorToServer = async (logEntry) => {
  try {
    // Only implement in production to avoid unnecessary requests during development
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // We would use fetch to send logs to server
      // In a real implementation, this would be a proper API endpoint
      /*
      await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
      */
    }
  } catch (error) {
    // Fallback to console in case of failure
    console.error('Failed to send error log to server:', error);
  }
};

// Function to download logs (useful for debugging in production)
const downloadLogs = () => {
  const logText = logBuffer.map(entry => 
    `[${entry.timestamp}] [${entry.level}] ${entry.message} ${entry.data ? JSON.stringify(entry.data) : ''}`
  ).join('\n');
  
  const filename = `frontend_logs_${new Date().toISOString().replace(/:/g, '-')}.log`;
  const blob = new Blob([logText], { type: 'text/plain' });
  
  // Create a download link and trigger it
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

// Expose logger functions
const logger = {
  error: (message, data) => log(LOG_LEVEL.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVEL.WARN, message, data),
  info: (message, data) => log(LOG_LEVEL.INFO, message, data),
  debug: (message, data) => log(LOG_LEVEL.DEBUG, message, data),
  downloadLogs,
  getBuffer: () => [...logBuffer] // Return a copy of the buffer for inspection
};

export default logger; 