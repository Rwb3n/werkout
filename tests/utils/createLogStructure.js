/**
 * Create logging directory structure for the Werkout.in project
 * 
 * This script ensures all required logging directories exist
 */

const fs = require('fs');
const path = require('path');

// Base logs directory
const logsDir = path.join(__dirname, '../../logs');

// Required subdirectories
const requiredDirs = [
  'backend',           // Backend server logs
  'frontend',          // Frontend server logs
  'stability',         // Stability test logs
  'tests',             // Test run logs
  'tests/unit',        // Unit test logs
  'tests/integration', // Integration test logs
  'tests/e2e'          // End-to-end test logs
];

/**
 * Create the log directory structure
 */
function createLogStructure() {
  console.log('Creating log directory structure...');
  
  // Create base logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    console.log(`Creating base logs directory: ${logsDir}`);
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Create each required subdirectory
  for (const dir of requiredDirs) {
    const fullPath = path.join(logsDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating log subdirectory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      console.log(`Log subdirectory already exists: ${dir}`);
    }
  }
  
  console.log('Log directory structure created successfully');
  return true;
}

// Run the function if this script is executed directly
if (require.main === module) {
  createLogStructure();
}

module.exports = createLogStructure; 