const express = require('express');
const AuthService = require('../services/auth');
const authMiddleware = require('../middleware/auth');

function createAuthRouter(authServiceInstance = null) {
  const router = express.Router();
  const authService = authServiceInstance || new AuthService();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    // Validation
    const errors = [];
    if (!email) errors.push('email is required');
    if (!password) errors.push('password is required');
    if (!confirmPassword) errors.push('confirmPassword is required');
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields',
        details: errors
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Passwords do not match'
      });
    }
    
    const user = await authService.register({ email, password });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration Failed',
      message: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    const result = await authService.login({ email, password });
    
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: 'Authentication Failed',
      message: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  res.json({
    message: 'Logged out successfully'
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      });
    }
    
    try {
      await authService.generateResetToken(email);
    } catch (error) {
      // Return success even for non-existent email to prevent email enumeration
    }
    
    res.json({
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process password reset request'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Token, password, and confirmPassword are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Passwords do not match'
      });
    }
    
    await authService.resetPassword(token, password);
    
    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Reset Failed',
      message: error.message
    });
  }
});

  return router;
}

// Export default instance
module.exports = createAuthRouter();

// Export factory function for testing
module.exports.createAuthRouter = createAuthRouter;