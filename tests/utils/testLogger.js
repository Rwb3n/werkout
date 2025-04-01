const fs = require('fs');
const path = require('path');

/**
 * A simple logger for test runs
 */
class TestLogger {
  constructor(testName) {
    this.testName = testName;
    this.logsDir = path.join(__dirname, '../../logs');
    this.testLogDir = path.join(this.logsDir, 'tests');
    this.ensureDirectoryExists(this.testLogDir);
    this.logFilePath = path.join(this.testLogDir, `${this.testName}_${this.getTimestamp()}.log`);
    this.initLogFile();
  }

  /**
   * Ensure the logs directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Get current timestamp for log filename
   */
  getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  }

  /**
   * Initialize the log file with a header
   */
  initLogFile() {
    const header = `=== TEST LOG: ${this.testName} ===\nStarted at: ${new Date().toISOString()}\n\n`;
    fs.writeFileSync(this.logFilePath, header);
  }

  /**
   * Log a message
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    // Append to file
    fs.appendFileSync(this.logFilePath, logMessage);
    
    // Also log to console during test development (optional)
    if (process.env.TEST_VERBOSE === 'true') {
      console.log(`${this.testName}: ${message}`);
    }
  }

  /**
   * Log an info message
   */
  info(message) {
    this.log(message, 'INFO');
  }

  /**
   * Log a warning message
   */
  warn(message) {
    this.log(message, 'WARN');
  }

  /**
   * Log an error message
   */
  error(message, error) {
    let errorMsg = message;
    if (error) {
      errorMsg += `\nError: ${error.message}\nStack: ${error.stack}`;
    }
    this.log(errorMsg, 'ERROR');
  }

  /**
   * Log test result
   */
  result(passed, details) {
    const status = passed ? 'PASSED' : 'FAILED';
    const message = `TEST ${status}: ${details || ''}`;
    this.log(message, status);
  }

  /**
   * Finalize the log file with a footer
   */
  finalize(success) {
    const footer = `\nTest ${success ? 'PASSED' : 'FAILED'}\nCompleted at: ${new Date().toISOString()}\n=== END TEST LOG ===\n`;
    fs.appendFileSync(this.logFilePath, footer);
  }
}

module.exports = TestLogger; 