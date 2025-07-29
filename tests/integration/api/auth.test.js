const request = require('supertest');
const express = require('express');
const { createAuthRouter } = require('../../../src/routes/auth');
const { createAuthMiddleware } = require('../../../src/middleware/auth');

function createTestApp(mockAuthService) {
  const app = express();
  app.use(express.json());
  
  // Create auth router with mocked service
  const authRouter = createAuthRouter(mockAuthService);
  
  // Create auth middleware with mocked service for protected routes
  const authMiddleware = createAuthMiddleware(mockAuthService);
  
  // Replace the middleware in the router for protected routes
  // We need to manually handle the /me route with the mocked middleware
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json(req.user);
  });
  
  app.use('/api/auth', authRouter);
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
  
  return app;
}

describe('Auth API', () => {
  let mockAuthService;
  let app;
  
  beforeEach(() => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn(),
      generateResetToken: jest.fn(),
      resetPassword: jest.fn()
    };
    
    app = createTestApp(mockAuthService);
  });
  
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      };
      
      const registeredUser = {
        id: 'user123',
        email: userData.email,
        createdAt: new Date().toISOString()
      };
      
      mockAuthService.register.mockResolvedValueOnce(registeredUser);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: registeredUser
      });
      
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password
      });
    });
    
    test('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // Missing password and confirmPassword
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Missing required fields',
          details: ['password is required', 'confirmPassword is required']
        });
    });
    
    test('should validate password confirmation', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Passwords do not match'
        });
    });
    
    test('should handle registration errors', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      mockAuthService.register.mockRejectedValueOnce(new Error('Email already registered'));
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
        .expect({
          error: 'Registration Failed',
          message: 'Email already registered'
        });
    });
  });
  
  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'correctPassword'
      };
      
      const loginResult = {
        token: 'jwt.token.here',
        user: {
          id: 'user123',
          email: loginData.email,
          createdAt: new Date().toISOString()
        }
      };
      
      mockAuthService.login.mockResolvedValueOnce(loginResult);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).toEqual(loginResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });
    
    test('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // Missing password
      };
      
      await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
    });
    
    test('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };
      
      mockAuthService.login.mockRejectedValueOnce(new Error('Invalid email or password'));
      
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .expect({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
    });
  });
  
  describe('POST /api/auth/logout', () => {
    test('should logout user successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com'
      };
      
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid.token')
        .expect(200)
        .expect({
          message: 'Logged out successfully'
        });
    });
    
    test('should work without authentication (client-side logout)', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(200)
        .expect({
          message: 'Logged out successfully'
        });
    });
  });
  
  describe('GET /api/auth/me', () => {
    test('should get current user info', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      };
      
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid.token')
        .expect(200);
      
      expect(response.body).toEqual(mockUser);
    });
    
    test('should require authentication', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401)
        .expect({
          error: 'Unauthorized',
          message: 'Access token is required'
        });
    });
  });
  
  describe('POST /api/auth/forgot-password', () => {
    test('should generate password reset token', async () => {
      const email = 'test@example.com';
      const resetToken = 'reset.token.here';
      
      mockAuthService.generateResetToken.mockResolvedValueOnce(resetToken);
      
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email })
        .expect(200)
        .expect({
          message: 'Password reset email sent'
        });
      
      expect(mockAuthService.generateResetToken).toHaveBeenCalledWith(email);
    });
    
    test('should validate email field', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Email is required'
        });
    });
    
    test('should handle non-existent email gracefully', async () => {
      const email = 'nonexistent@example.com';
      
      mockAuthService.generateResetToken.mockRejectedValueOnce(new Error('User not found'));
      
      // Return success even for non-existent email to prevent email enumeration
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email })
        .expect(200)
        .expect({
          message: 'Password reset email sent'
        });
    });
  });
  
  describe('POST /api/auth/reset-password', () => {
    test('should reset password successfully', async () => {
      const resetData = {
        token: 'valid.reset.token',
        password: 'newSecurePassword123',
        confirmPassword: 'newSecurePassword123'
      };
      
      const updatedUser = {
        id: 'user123',
        email: 'test@example.com'
      };
      
      mockAuthService.resetPassword.mockResolvedValueOnce(updatedUser);
      
      await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200)
        .expect({
          message: 'Password reset successfully'
        });
      
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetData.token,
        resetData.password
      );
    });
    
    test('should validate required fields', async () => {
      const invalidData = {
        token: 'reset.token'
        // Missing password and confirmPassword
      };
      
      await request(app)
        .post('/api/auth/reset-password')
        .send(invalidData)
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Token, password, and confirmPassword are required'
        });
    });
    
    test('should validate password confirmation', async () => {
      const invalidData = {
        token: 'reset.token',
        password: 'newPassword123',
        confirmPassword: 'differentPassword'
      };
      
      await request(app)
        .post('/api/auth/reset-password')
        .send(invalidData)
        .expect(400)
        .expect({
          error: 'Validation Error',
          message: 'Passwords do not match'
        });
    });
    
    test('should handle invalid reset token', async () => {
      const resetData = {
        token: 'invalid.token',
        password: 'newPassword123',
        confirmPassword: 'newPassword123'
      };
      
      mockAuthService.resetPassword.mockRejectedValueOnce(new Error('Invalid or expired reset token'));
      
      await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400)
        .expect({
          error: 'Reset Failed',
          message: 'Invalid or expired reset token'
        });
    });
  });
});