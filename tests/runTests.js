const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const TestLogger = require('./utils/testLogger');

// Initialize the main test logger
const mainLogger = new TestLogger('test_run');

/**
 * Run a specific test or all tests
 * @param {string} testPath - Optional specific test to run
 */
function runTests(testPath = null) {
  mainLogger.info('Starting test execution');
  
  try {
    const testCommand = constructTestCommand(testPath);
    mainLogger.info(`Executing: ${testCommand}`);
    
    // Run Jest with the specified test path or all tests
    const output = execSync(testCommand, { encoding: 'utf8' });
    
    // Log output
    mainLogger.info('Test execution completed successfully');
    mainLogger.log(output, 'RESULT');
    mainLogger.finalize(true);
    
    console.log('Tests completed successfully. See logs for details.');
    return true;
  } catch (error) {
    mainLogger.error('Test execution failed', error);
    if (error.stdout) {
      mainLogger.log(error.stdout, 'RESULT');
    }
    mainLogger.finalize(false);
    
    console.error('Tests failed. See logs for details.');
    return false;
  }
}

/**
 * Construct the test command based on the provided test path
 * @param {string} testPath - Optional specific test to run
 * @returns {string} The test command to execute
 */
function constructTestCommand(testPath) {
  // Base command with coverage
  let command = 'jest --colors';
  
  // Add coverage if not running a specific test
  if (!testPath) {
    command += ' --coverage';
  } else {
    // Add the specific test path
    command += ` ${testPath}`;
  }
  
  return command;
}

// If this script is run directly
if (require.main === module) {
  // Get the test path from command line arguments if provided
  const testPath = process.argv[2];
  
  // Run the tests and exit with appropriate code
  const success = runTests(testPath);
  process.exit(success ? 0 : 1);
}

module.exports = runTests; 