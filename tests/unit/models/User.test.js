const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('constructor', () => {
    test('should create a user with required fields', () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedPassword123'
      };
      
      const user = new User(userData);
      
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashedPassword123');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    test('should generate unique id for each user', () => {
      const user1 = new User({ email: 'user1@example.com', passwordHash: 'hash1' });
      const user2 = new User({ email: 'user2@example.com', passwordHash: 'hash2' });
      
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('validation', () => {
    test('should throw error for invalid email format', () => {
      expect(() => {
        new User({ email: 'invalid-email', passwordHash: 'hash' });
      }).toThrow('Invalid email format');
    });

    test('should throw error for missing email', () => {
      expect(() => {
        new User({ passwordHash: 'hash' });
      }).toThrow('Email is required');
    });

    test('should throw error for missing password hash', () => {
      expect(() => {
        new User({ email: 'test@example.com' });
      }).toThrow('Password hash is required');
    });
  });

  describe('password', () => {
    test('should hash password using bcrypt', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await User.hashPassword(plainPassword);
      
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should verify correct password', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await User.hashPassword(plainPassword);
      const user = new User({ email: 'test@example.com', passwordHash: hashedPassword });
      
      const isValid = await user.verifyPassword(plainPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await User.hashPassword(plainPassword);
      const user = new User({ email: 'test@example.com', passwordHash: hashedPassword });
      
      const isValid = await user.verifyPassword('wrongPassword');
      expect(isValid).toBe(false);
    });
  });

  describe('toJSON', () => {
    test('should exclude password hash from JSON output', () => {
      const user = new User({
        email: 'test@example.com',
        passwordHash: 'secretHash'
      });
      
      const json = user.toJSON();
      
      expect(json.email).toBe('test@example.com');
      expect(json.id).toBeDefined();
      expect(json.createdAt).toBeDefined();
      expect(json.passwordHash).toBeUndefined();
    });
  });
});