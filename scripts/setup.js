/**
 * Werkout.in Project Setup Script
 * 
 * This script initializes the development environment by:
 * 1. Creating necessary directories
 * 2. Initializing package.json files
 * 3. Installing base dependencies
 * 4. Creating basic configuration files
 * 
 * Usage: node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Base directories
const BASE_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(BASE_DIR, 'src', 'frontend');
const BACKEND_DIR = path.join(BASE_DIR, 'src', 'backend');
const SHARED_DIR = path.join(BASE_DIR, 'src', 'shared');

// Configuration files
const frontendEnvExample = `
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
`;

const backendEnvExample = `
# Backend Environment Variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/werkout
JWT_SECRET=your_jwt_secret
AWS_S3_BUCKET=your_s3_bucket
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
`;

const gitignore = `
# dependencies
node_modules/
.pnp/
.pnp.js

# testing
coverage/

# production
build/
dist/
.next/
out/

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

// Frontend package.json
const frontendPackageJson = {
  name: "werkout-frontend",
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint",
    test: "jest"
  },
  dependencies: {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0",
    "tailwindcss": "^3.3.3",
    "jwt-decode": "^3.1.2"
  },
  devDependencies: {
    "@testing-library/jest-dom": "^6.1.3",
    "@testing-library/react": "^14.0.0",
    "@types/node": "^20.6.3",
    "@types/react": "^18.2.22",
    "jest": "^29.7.0",
    "typescript": "^5.2.2",
    "eslint": "^8.49.0",
    "eslint-config-next": "^13.5.2"
  }
};

// Backend package.json
const backendPackageJson = {
  name: "werkout-backend",
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "nodemon src/server.js",
    start: "node src/server.js",
    test: "jest"
  },
  dependencies: {
    "express": "^4.18.2",
    "mongoose": "^7.5.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "aws-sdk": "^2.1365.0",
    "multer": "^1.4.5-lts.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  devDependencies: {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.49.0"
  }
};

// Basic server.js file
const serverJs = `
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

// Next.js App component
const nextAppJs = `
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;

// Create directories
function createDirectories() {
  console.log('Creating directories...');
  [
    FRONTEND_DIR,
    path.join(FRONTEND_DIR, 'pages'),
    path.join(FRONTEND_DIR, 'pages', 'api'),
    path.join(FRONTEND_DIR, 'components'),
    path.join(FRONTEND_DIR, 'styles'),
    path.join(FRONTEND_DIR, 'public'),
    BACKEND_DIR,
    path.join(BACKEND_DIR, 'src'),
    path.join(BACKEND_DIR, 'src', 'models'),
    path.join(BACKEND_DIR, 'src', 'controllers'),
    path.join(BACKEND_DIR, 'src', 'routes'),
    path.join(BACKEND_DIR, 'src', 'middleware'),
    SHARED_DIR,
    path.join(SHARED_DIR, 'types'),
    path.join(SHARED_DIR, 'utils')
  ].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Write files
function writeFiles() {
  console.log('Writing configuration files...');
  
  // Frontend files
  fs.writeFileSync(path.join(FRONTEND_DIR, 'package.json'), JSON.stringify(frontendPackageJson, null, 2));
  fs.writeFileSync(path.join(FRONTEND_DIR, '.env.example'), frontendEnvExample.trim());
  fs.writeFileSync(path.join(FRONTEND_DIR, '.gitignore'), gitignore.trim());
  fs.writeFileSync(path.join(FRONTEND_DIR, 'pages', '_app.js'), nextAppJs.trim());
  fs.writeFileSync(path.join(FRONTEND_DIR, 'styles', 'globals.css'), '/* Global styles */');
  
  // Backend files
  fs.writeFileSync(path.join(BACKEND_DIR, 'package.json'), JSON.stringify(backendPackageJson, null, 2));
  fs.writeFileSync(path.join(BACKEND_DIR, '.env.example'), backendEnvExample.trim());
  fs.writeFileSync(path.join(BACKEND_DIR, '.gitignore'), gitignore.trim());
  fs.writeFileSync(path.join(BACKEND_DIR, 'src', 'server.js'), serverJs.trim());
  
  console.log('Configuration files created successfully.');
}

// Install dependencies
function installDependencies() {
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: BACKEND_DIR, stdio: 'inherit' });
  
  console.log('Dependencies installed successfully.');
}

// Main setup function
function setup() {
  console.log('Starting project setup...');
  
  createDirectories();
  writeFiles();
  
  rl.question('Do you want to install dependencies now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      installDependencies();
    } else {
      console.log('Skipping dependency installation.');
      console.log('You can install dependencies later by running npm install in the frontend and backend directories.');
    }
    
    console.log('\nProject setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create .env files based on the .env.example files');
    console.log('2. Start the frontend development server: cd src/frontend && npm run dev');
    console.log('3. Start the backend development server: cd src/backend && npm run dev');
    console.log('\nRefer to the main README.md for more information.');
    
    rl.close();
  });
}

// Run setup
setup(); 