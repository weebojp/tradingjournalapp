const { createAuthMiddleware } = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let mockAuthService;
  let authMiddleware;
  let req, res, next;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock AuthService
    mockAuthService = {
      verifyToken: jest.fn()
    };
    
    // Create auth middleware with injected mock service
    authMiddleware = createAuthMiddleware(mockAuthService);
    
    // Setup mock Express objects
    req = {
      headers: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('Token Extraction', () => {
    test('should extract token from Authorization header with Bearer prefix', async () => {
      const token = 'valid.jwt.token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date()
      };
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
    
    test('should extract token from Authorization header without Bearer prefix', async () => {
      const token = 'valid.jwt.token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com'
      };
      
      req.headers.authorization = token;
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
    
    test('should extract token from x-auth-token header', async () => {
      const token = 'valid.jwt.token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com'
      };
      
      req.headers['x-auth-token'] = token;
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
  });
  
  describe('Authentication Success', () => {
    test('should attach user to request and call next() on valid token', async () => {
      const token = 'valid.jwt.token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date()
      };
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  
  describe('Authentication Failures', () => {
    test('should return 401 when no token provided', async () => {
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Access token is required'
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeNull();
    });
    
    test('should return 401 when Authorization header is empty', async () => {
      req.headers.authorization = '';
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Access token is required'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return 401 when Authorization header is just "Bearer"', async () => {
      req.headers.authorization = 'Bearer';
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Access token is required'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return 401 when token is invalid', async () => {
      const invalidToken = 'invalid.token';
      
      req.headers.authorization = `Bearer ${invalidToken}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Invalid token'));
      
      await authMiddleware(req, res, next);
      
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(invalidToken);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeNull();
    });
    
    test('should return 401 when token is expired', async () => {
      const expiredToken = 'expired.token';
      
      req.headers.authorization = `Bearer ${expiredToken}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Token expired'));
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return 404 when user not found', async () => {
      const token = 'valid.token.but.user.deleted';
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('User not found'));
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      const token = 'valid.token';
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Database connection failed'));
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should not expose internal error details', async () => {
      const token = 'valid.token';
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Internal server error with sensitive info'));
      
      await authMiddleware(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      
      // Should not contain the actual error message
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('sensitive info')
        })
      );
    });
  });
  
  describe('Optional Authentication Middleware', () => {
    test('should create optional auth middleware that continues without user', async () => {
      const optionalAuth = authMiddleware.optional();
      
      await optionalAuth(req, res, next);
      
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    test('should attach user if valid token provided in optional mode', async () => {
      const optionalAuth = authMiddleware.optional();
      const token = 'valid.jwt.token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com'
      };
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await optionalAuth(req, res, next);
      
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    test('should continue without user if invalid token in optional mode', async () => {
      const optionalAuth = authMiddleware.optional();
      const token = 'invalid.token';
      
      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Invalid token'));
      
      await optionalAuth(req, res, next);
      
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});