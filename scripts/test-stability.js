/**
 * Werkout.in Stability Test Script
 * 
 * This script tests the stability of both frontend and backend servers
 * by starting them and checking if they respond correctly.
 * 
 * Usage: node test-stability.js
 */

const { execSync, spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// Paths
const backendDir = path.join(__dirname, '..', 'src', 'backend');
const frontendDir = path.join(__dirname, '..', 'src', 'frontend');

// Configuration
const backendUrl = 'http://localhost:5000/api/health';
const frontendUrl = 'http://localhost:3000';
const maxRetries = 5;
const retryInterval = 2000; // 2 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Wait for a specific amount of time
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if a server is running by making a request to it
 */
const checkServer = async (url, name, retry = 0) => {
  try {
    console.log(`${colors.blue}Checking ${name} at ${url}...${colors.reset}`);
    const response = await fetch(url);
    if (response.ok) {
      console.log(`${colors.green}✓ ${name} is running correctly${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ ${name} returned status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    if (retry < maxRetries) {
      console.log(`${colors.yellow}! ${name} not responding, retrying in ${retryInterval/1000}s (${retry + 1}/${maxRetries})...${colors.reset}`);
      await wait(retryInterval);
      return checkServer(url, name, retry + 1);
    } else {
      console.log(`${colors.red}✗ ${name} is not running: ${error.message}${colors.reset}`);
      return false;
    }
  }
};

/**
 * Check if the required environment files exist
 */
const checkEnvFiles = () => {
  const backendEnvPath = path.join(backendDir, '.env');
  const frontendEnvPath = path.join(frontendDir, '.env.development');
  
  let allFilesExist = true;
  
  if (!fs.existsSync(backendEnvPath)) {
    console.log(`${colors.red}✗ Backend .env file not found at ${backendEnvPath}${colors.reset}`);
    allFilesExist = false;
  } else {
    console.log(`${colors.green}✓ Backend .env file exists${colors.reset}`);
  }
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.log(`${colors.red}✗ Frontend .env.development file not found at ${frontendEnvPath}${colors.reset}`);
    allFilesExist = false;
  } else {
    console.log(`${colors.green}✓ Frontend .env.development file exists${colors.reset}`);
  }
  
  return allFilesExist;
};

/**
 * Test the backend server
 */
const testBackend = async () => {
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
    console.log(`${colors.yellow}Installing backend dependencies...${colors.reset}`);
    try {
      execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
    } catch (error) {
      console.log(`${colors.red}✗ Failed to install backend dependencies${colors.reset}`);
      return false;
    }
  }
  
  console.log(`${colors.blue}Starting backend server...${colors.reset}`);
  
  // Start the backend server
  const backendServer = spawn('node', ['src/server.js'], { 
    cwd: backendDir,
    env: { ...process.env, PORT: 5000 },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Log backend output
  backendServer.stdout.on('data', (data) => {
    console.log(`${colors.blue}Backend:${colors.reset} ${data.toString().trim()}`);
  });
  
  backendServer.stderr.on('data', (data) => {
    console.log(`${colors.red}Backend Error:${colors.reset} ${data.toString().trim()}`);
  });
  
  // Give server time to start
  await wait(2000);
  
  // Check if backend is running
  const backendRunning = await checkServer(backendUrl, 'Backend');
  
  if (!backendRunning) {
    console.log(`${colors.red}✗ Backend stability test failed${colors.reset}`);
    backendServer.kill();
    return false;
  }
  
  console.log(`${colors.green}✓ Backend stability test passed${colors.reset}`);
  backendServer.kill();
  return true;
};

/**
 * Test the frontend server
 */
const testFrontend = async () => {
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    console.log(`${colors.yellow}Installing frontend dependencies...${colors.reset}`);
    try {
      execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    } catch (error) {
      console.log(`${colors.red}✗ Failed to install frontend dependencies${colors.reset}`);
      return false;
    }
  }
  
  console.log(`${colors.blue}Starting frontend server...${colors.reset}`);
  
  // Start the frontend server
  const frontendServer = spawn('npm', ['run', 'dev'], { 
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Log frontend output
  frontendServer.stdout.on('data', (data) => {
    console.log(`${colors.blue}Frontend:${colors.reset} ${data.toString().trim()}`);
  });
  
  frontendServer.stderr.on('data', (data) => {
    console.log(`${colors.red}Frontend Error:${colors.reset} ${data.toString().trim()}`);
  });
  
  // Give server time to start
  await wait(5000);
  
  // Check if frontend is running
  const frontendRunning = await checkServer(frontendUrl, 'Frontend');
  
  if (!frontendRunning) {
    console.log(`${colors.red}✗ Frontend stability test failed${colors.reset}`);
    frontendServer.kill();
    return false;
  }
  
  console.log(`${colors.green}✓ Frontend stability test passed${colors.reset}`);
  frontendServer.kill();
  return true;
};

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}============================================${colors.reset}`);
  console.log(`${colors.blue}Werkout.in Stability Test${colors.reset}`);
  console.log(`${colors.blue}============================================${colors.reset}`);
  
  // Check environment files
  if (!checkEnvFiles()) {
    console.log(`${colors.red}✗ Environment files check failed${colors.reset}`);
    process.exit(1);
  }
  
  // Test backend
  const backendSuccess = await testBackend();
  
  // Test frontend
  const frontendSuccess = await testFrontend();
  
  // Final results
  console.log(`${colors.blue}============================================${colors.reset}`);
  console.log(`${colors.blue}Test Results:${colors.reset}`);
  console.log(`${colors.blue}============================================${colors.reset}`);
  console.log(`Backend: ${backendSuccess ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Frontend: ${frontendSuccess ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Overall: ${backendSuccess && frontendSuccess ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  if (backendSuccess && frontendSuccess) {
    console.log(`${colors.green}✓ Stability test completed successfully!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Stability test failed${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}An unexpected error occurred:${colors.reset}`, error);
  process.exit(1);
}); 