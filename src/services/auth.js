const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseService = require('./database');

class AuthService {
  constructor() {
    this.dbService = new DatabaseService();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }
  
  // User registration
  async register(userData) {
    const { email, password } = userData;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Check if user already exists
    const existingUser = await this.dbService.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await this.dbService.createUser({
      email,
      passwordHash
    });
    
    // Return user without password hash
    return {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  }
  
  // User login
  async login(loginData) {
    const { email, password } = loginData;
    
    // Find user by email
    const user = await this.dbService.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  }
  
  // Verify JWT token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Find user by ID
      const user = await this.dbService.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      };
    } catch (error) {
      // Re-throw specific errors
      if (error.message === 'User not found') {
        throw error;
      }
      // JWT verification errors
      throw new Error('Invalid token');
    }
  }
  
  // Generate password reset token
  async generateResetToken(email) {
    const user = await this.dbService.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    
    const resetToken = jwt.sign(
      { userId: user.id, type: 'reset' },
      this.jwtSecret,
      { expiresIn: '1h' }
    );
    
    return resetToken;
  }
  
  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      if (decoded.type !== 'reset') {
        throw new Error('Invalid reset token');
      }
      
      // Validate new password
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      const updatedUser = await this.dbService.updateUser(decoded.userId, {
        passwordHash
      });
      
      return {
        id: updatedUser.id,
        email: updatedUser.email
      };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}

module.exports = AuthService;