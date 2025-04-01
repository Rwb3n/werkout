const jwt = require('jsonwebtoken');
const { protect } = require('../../../src/backend/src/middleware/auth.middleware');

// Mock the next function
const next = jest.fn();

// Mock response
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    // Mock request object
    const req = {
      headers: {}
    };

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    // Mock request object
    const req = {
      headers: {
        authorization: 'Bearer invalid_token'
      }
    };

    // Mock jwt.verify to throw an error
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user in request and call next if token is valid', async () => {
    // Mock decoded token
    const decoded = {
      id: 'user_id',
      email: 'test@example.com'
    };

    // Mock request object
    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      }
    };

    // Mock jwt.verify to return decoded token
    jest.spyOn(jwt, 'verify').mockReturnValue(decoded);

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
}); 