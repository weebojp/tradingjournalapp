const AuthService = require('../services/auth');

class AuthMiddleware {
  constructor(authService = null) {
    this.authService = authService || new AuthService();
  }
  
  // Main authentication middleware
  authenticate = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Access token is required'
        });
      }
      
      const user = await this.authService.verifyToken(token);
      req.user = user;
      
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  };
  
  // Optional authentication middleware (doesn't fail if no token)
  optionalAuthenticate = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        req.user = null;
        return next();
      }
      
      const user = await this.authService.verifyToken(token);
      req.user = user;
      
      next();
    } catch (error) {
      // If token is invalid, continue without user
      req.user = null;
      next();
    }
  };
  
  // Extract token from request headers
  extractToken(req) {
    let token = null;
    
    // Check Authorization header
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization.trim();
      
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (authHeader && authHeader !== 'Bearer') {
        token = authHeader;
      }
    }
    
    // Check x-auth-token header as fallback
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    
    return token && token.trim() !== '' ? token.trim() : null;
  }
}

// Function to create auth middleware with optional dependency injection
function createAuthMiddleware(authService = null) {
  const authMiddleware = new AuthMiddleware(authService);
  
  // Main middleware function
  const authenticate = authMiddleware.authenticate;
  
  // Add optional method to the main function
  authenticate.optional = () => authMiddleware.optionalAuthenticate;
  
  return authenticate;
}

// Export default instance
module.exports = createAuthMiddleware();

// Also export the factory function for testing
module.exports.createAuthMiddleware = createAuthMiddleware;