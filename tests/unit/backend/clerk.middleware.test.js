const { requireAuth, optionalAuth } = require('../../../src/backend/src/middleware/clerk.middleware');
const User = require('../../../src/backend/src/models/user.model');
const TestLogger = require('../../utils/testLogger');

// Initialize the test logger
const logger = new TestLogger('clerk_middleware_test');

// Mock the Clerk SDK
jest.mock('@clerk/clerk-sdk-node', () => {
  return {
    Clerk: jest.fn().mockImplementation(() => {
      return {
        verifyToken: jest.fn().mockImplementation((token) => {
          if (token === 'valid_token') {
            return Promise.resolve({
              sub: 'test_clerk_id',
              exp: Math.floor(Date.now() / 1000) + 3600
            });
          } else {
            return Promise.reject(new Error('Invalid token'));
          }
        }),
        users: {
          getUser: jest.fn().mockImplementation((clerkId) => {
            if (clerkId === 'test_clerk_id') {
              return Promise.resolve({
                id: 'test_clerk_id',
                firstName: 'Test',
                lastName: 'User',
                emailAddresses: [
                  {
                    emailAddress: 'test@example.com',
                    verification: { status: 'verified' }
                  }
                ],
                imageUrl: 'https://example.com/image.jpg',
                createdAt: new Date().toISOString()
              });
            } else {
              return Promise.resolve(null);
            }
          })
        }
      };
    })
  };
});

// Mock User model
jest.mock('../../../src/backend/src/models/user.model', () => {
  return {
    findOne: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  };
});

// Mock logger
jest.mock('../../../src/backend/src/utils/logger', () => {
  return {
    info: jest.fn(),
    logError: jest.fn()
  };
});

describe('Clerk Authentication Middleware', () => {
  // Mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Mock next function
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    res.status.mockClear();
    res.json.mockClear();
    next.mockClear();
  });

  afterAll(() => {
    logger.finalize(true);
  });

  describe('requireAuth middleware', () => {
    it('should return 401 if no authorization header is provided', async () => {
      logger.info('Testing requireAuth with no authorization header');
      
      // Mock request without auth header
      const req = {
        headers: {}
      };

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token not provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      logger.info('Testing requireAuth with invalid token');
      
      // Mock request with invalid token
      const req = {
        headers: {
          authorization: 'Bearer invalid_token'
        }
      };

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should find user and call next if token is valid', async () => {
      logger.info('Testing requireAuth with valid token for existing user');
      
      // Mock existing user
      const mockUser = {
        _id: 'user_id',
        clerkId: 'test_clerk_id',
        lastLoginAt: new Date(),
        activityTracking: {
          lastActive: new Date(),
          sessionCount: 0
        },
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock User.findOne to return user
      User.findOne.mockResolvedValue(mockUser);

      // Mock request with valid token
      const req = {
        headers: {
          authorization: 'Bearer valid_token'
        }
      };

      await requireAuth(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'test_clerk_id' });
      expect(req.user).toBe(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should create new user if not found and token is valid', async () => {
      logger.info('Testing requireAuth with valid token for new user');
      
      // Mock User.findOne to return null (user not found)
      User.findOne.mockResolvedValue(null);

      // Mock User constructor and save method
      const mockNewUser = {
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => mockNewUser);

      // Mock request with valid token
      const req = {
        headers: {
          authorization: 'Bearer valid_token'
        }
      };

      await requireAuth(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'test_clerk_id' });
      expect(req.user).toBe(mockNewUser);
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    it('should set req.user to null if no authorization header', async () => {
      logger.info('Testing optionalAuth with no authorization header');
      
      // Mock request without auth header
      const req = {
        headers: {}
      };

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it('should set req.user to user if token is valid', async () => {
      logger.info('Testing optionalAuth with valid token');
      
      // Mock existing user
      const mockUser = {
        _id: 'user_id',
        clerkId: 'test_clerk_id',
        activityTracking: {
          lastActive: new Date()
        },
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock User.findOne to return user
      User.findOne.mockResolvedValue(mockUser);

      // Mock request with valid token
      const req = {
        headers: {
          authorization: 'Bearer valid_token'
        }
      };

      await optionalAuth(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'test_clerk_id' });
      expect(req.user).toBe(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should set req.user to null if token is invalid', async () => {
      logger.info('Testing optionalAuth with invalid token');
      
      // Mock request with invalid token
      const req = {
        headers: {
          authorization: 'Bearer invalid_token'
        }
      };

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
}); 