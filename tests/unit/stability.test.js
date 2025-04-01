const fs = require('fs');
const path = require('path');
const TestLogger = require('../utils/testLogger');

// Initialize the test logger
const logger = new TestLogger('stability_test');

// Path to test-stability.js
const stabilitySriptPath = path.join(__dirname, '../../scripts/test-stability.js');

// Path to logs directory
const logsDir = path.join(__dirname, '../../logs');
const stabilityLogsDir = path.join(logsDir, 'stability');

describe('Stability Test Script', () => {
  beforeAll(() => {
    // Ensure the stability logs directory exists
    if (!fs.existsSync(stabilityLogsDir)) {
      fs.mkdirSync(stabilityLogsDir, { recursive: true });
    }
    
    logger.info('Starting stability script tests');
  });
  
  afterAll(() => {
    logger.info('Finished stability script tests');
    logger.finalize(true);
  });

  it('should have a valid stability test script file', () => {
    logger.info('Checking if stability test script exists');
    const scriptExists = fs.existsSync(stabilitySriptPath);
    
    expect(scriptExists).toBe(true);
    logger.info('Stability test script exists');
  });

  it('should have the correct function exports', () => {
    logger.info('Checking stability script content');
    const scriptContent = fs.readFileSync(stabilitySriptPath, 'utf8');
    
    // Check for key functions
    expect(scriptContent).toContain('function checkServer');
    expect(scriptContent).toContain('function testBackend');
    expect(scriptContent).toContain('function testFrontend');
    expect(scriptContent).toContain('function main');
    
    logger.info('Stability script contains expected functions');
  });

  it('should have a logs directory structure', () => {
    logger.info('Checking logs directory structure');
    
    // Check main logs directory
    expect(fs.existsSync(logsDir)).toBe(true);
    
    // Check specific log subdirectories
    const requiredDirs = ['backend', 'frontend', 'stability'];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(logsDir, dir);
      const dirExists = fs.existsSync(dirPath);
      expect(dirExists).toBe(true);
      logger.info(`Logs subdirectory "${dir}" exists`);
    }
  });
}); 