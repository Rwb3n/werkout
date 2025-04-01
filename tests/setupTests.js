// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = 5000;
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/werkout-test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};

// Set up global variables for testing
global.testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  userType: 'seeker'
}; 