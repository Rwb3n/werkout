/**
 * Jest setup file
 * This file runs before the tests
 */

// Load environment variables
require('dotenv').config();

// Set default environment variables for tests
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/werkout-test';
process.env.JWT_SECRET = 'test-secret';
process.env.CLERK_SECRET_KEY = 'test-clerk-key';

// Mock implementations for external services can be added here 