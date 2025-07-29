const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    if (!data.email) {
      throw new Error('Email is required');
    }
    
    if (!data.passwordHash) {
      throw new Error('Password hash is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    this.id = data.id || crypto.randomUUID();
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt || new Date();
  }
  
  static async hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  }
  
  async verifyPassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.passwordHash);
  }
  
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;