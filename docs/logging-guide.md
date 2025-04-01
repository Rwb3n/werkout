# Werkout.in Logging Guide

This document explains the logging structure and usage for the Werkout.in platform.

## Log Directory Structure

The project uses a standardized logging structure with the following directories:

- `logs/`
  - `backend/` - Backend server logs
  - `frontend/` - Frontend application logs
  - `stability/` - System stability test logs
  - `tests/` - Test execution logs
    - `unit/` - Unit test logs
    - `integration/` - Integration test logs
    - `e2e/` - End-to-end test logs

## Setting Up the Log Structure

To set up the logging directory structure, run:

```bash
npm run setup:logs
```

This will create all the necessary directories for logging.

## Logging in Tests

Tests use a dedicated logging system that captures detailed information about test execution:

### Basic Test Logging

Run tests with standard logging:

```bash
npm test
```

This will execute all tests and create log files in the appropriate directories.

### Verbose Test Logging

For more detailed console output during test execution:

```bash
npm run test:with-logs
```

### Running Specific Test Suites

Run only unit tests:

```bash
npm run test:unit
```

## Using the TestLogger

For custom test scripts, you can use the `TestLogger` class:

```javascript
const TestLogger = require('./tests/utils/testLogger');

// Create a logger instance with a unique name
const logger = new TestLogger('my_custom_test');

// Log different message types
logger.info('This is an informational message');
logger.warn('This is a warning message');
logger.error('This is an error message', new Error('Something went wrong'));

// Log test results
logger.result(true, 'Test passed with specific details');

// Finalize the log (typically called at the end of a test)
logger.finalize(true);  // true = test passed, false = test failed
```

## Backend Server Logging

The backend server logs to `logs/backend/` directory. Logs include:

- HTTP requests (access logs)
- Application events
- Errors and warnings

These logs are automatically generated when the backend server is running.

## Frontend Logging

The frontend logs to `logs/frontend/` directory. These logs capture:

- Application events
- User interactions
- Errors and warnings

## Stability Test Logging

The stability test script logs to the `logs/stability/` directory when run:

```bash
npm run test:stability
```

This tests both the frontend and backend server stability and logs the results.

## Log Rotation and Maintenance

Log files follow this naming convention:
- Backend access logs: `access_YYYY-MM-DD_HH-MM.log`
- Test logs: `test_name_YYYY-MM-DD_HH-MM-SS.log`

For production environments, consider implementing a log rotation strategy to manage log file growth. 