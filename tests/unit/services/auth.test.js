const AuthService = require('../../../src/services/auth');
const DatabaseService = require('../../../src/services/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/services/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService;
  let mockDbService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock database service
    mockDbService = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn()
    };
    DatabaseService.mockImplementation(() => mockDbService);
    
    // Set up JWT secret
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
    
    authService = new AuthService();
  });
  
  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };
      
      const hashedPassword = 'hashedPassword123';
      const newUser = {
        id: 'user123',
        email: userData.email,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      mockDbService.createUser.mockResolvedValueOnce(newUser);
      
      const result = await authService.register(userData);
      
      expect(mockDbService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockDbService.createUser).toHaveBeenCalledWith({
        email: userData.email,
        passwordHash: hashedPassword
      });
      expect(result).toEqual({
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt
      });
    });
    
    test('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };
      
      mockDbService.findUserByEmail.mockResolvedValueOnce({ id: 'existingUser' });
      
      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
      expect(mockDbService.createUser).not.toHaveBeenCalled();
    });
    
    test('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      await expect(authService.register(userData)).rejects.toThrow('Invalid email format');
    });
    
    test('should validate password strength', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };
      
      await expect(authService.register(userData)).rejects.toThrow('Password must be at least 8 characters');
    });
  });
  
  describe('User Login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'correctPassword'
      };
      
      const user = {
        id: 'user123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const token = 'generated.jwt.token';
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce(token);
      
      const result = await authService.login(loginData);
      
      expect(mockDbService.findUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.passwordHash);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(result).toEqual({
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    });
    
    test('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password'
      };
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(null);
      
      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });
    
    test('should throw error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };
      
      const user = {
        id: 'user123',
        email: loginData.email,
        passwordHash: 'hashedPassword'
      };
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(false);
      
      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });
  });
  
  describe('Token Verification', () => {
    test('should verify valid token', async () => {
      const token = 'valid.jwt.token';
      const decoded = {
        userId: 'user123',
        email: 'test@example.com',
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 86400
      };
      
      const user = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      jwt.verify.mockReturnValueOnce(decoded);
      mockDbService.findUserById.mockResolvedValueOnce(user);
      
      const result = await authService.verifyToken(token);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(mockDbService.findUserById).toHaveBeenCalledWith(decoded.userId);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      });
    });
    
    test('should throw error for invalid token', async () => {
      const token = 'invalid.token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await expect(authService.verifyToken(token)).rejects.toThrow('Invalid token');
    });
    
    test('should throw error if user not found', async () => {
      const token = 'valid.jwt.token';
      const decoded = {
        userId: 'user123',
        email: 'test@example.com'
      };
      
      jwt.verify.mockReturnValueOnce(decoded);
      mockDbService.findUserById.mockResolvedValueOnce(null);
      
      await expect(authService.verifyToken(token)).rejects.toThrow('User not found');
    });
  });
  
  describe('Password Reset', () => {
    test('should generate password reset token', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user123',
        email,
        createdAt: new Date()
      };
      
      const resetToken = 'reset.token';
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(user);
      jwt.sign.mockReturnValueOnce(resetToken);
      
      const result = await authService.generateResetToken(email);
      
      expect(mockDbService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, type: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toBe(resetToken);
    });
    
    test('should throw error for non-existent email', async () => {
      const email = 'nonexistent@example.com';
      
      mockDbService.findUserByEmail.mockResolvedValueOnce(null);
      
      await expect(authService.generateResetToken(email)).rejects.toThrow('User not found');
    });
  });
});