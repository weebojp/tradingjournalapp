const crypto = require('crypto');

class Tag {
  constructor(data) {
    if (!data.name || data.name === '') {
      throw new Error(data.name === '' ? 'Tag name cannot be empty' : 'Tag name is required');
    }
    
    if (data.name.length > 50) {
      throw new Error('Tag name must be 50 characters or less');
    }
    
    // Only allow letters, numbers, hyphens, and underscores
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(data.name)) {
      throw new Error('Tag name can only contain letters, numbers, hyphens, and underscores');
    }
    
    this.id = data.id || crypto.randomUUID();
    this.name = data.name;
    this.descriptionMD = data.descriptionMD || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Statistics
    this.tradeCount = data.tradeCount || 0;
    this.winCount = data.winCount || 0;
    this.lossCount = data.lossCount || 0;
    
    // Computed property
    Object.defineProperty(this, 'normalizedName', {
      get: function() {
        return this.name.toLowerCase();
      }
    });
  }
  
  get winRate() {
    if (this.tradeCount === 0) return 0;
    return this.winCount / this.tradeCount;
  }
  
  updateStrategyNote(content) {
    this.descriptionMD = content;
    this.updatedAt = new Date();
  }
  
  addTradeResult(isWin) {
    this.tradeCount++;
    if (isWin) {
      this.winCount++;
    } else {
      this.lossCount++;
    }
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      descriptionMD: this.descriptionMD,
      tradeCount: this.tradeCount,
      winCount: this.winCount,
      lossCount: this.lossCount,
      winRate: this.winRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Tag;