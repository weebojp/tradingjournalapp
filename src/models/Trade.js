const crypto = require('crypto');

class Trade {
  constructor(data) {
    // Required field validation
    if (!data.userId) throw new Error('User ID is required');
    if (!data.tradeDate) throw new Error('Trade date is required');
    if (!data.symbol) throw new Error('Symbol is required');
    if (!data.side) throw new Error('Side is required');
    if (data.entryPrice === undefined || data.entryPrice === null) throw new Error('Entry price is required');
    if (data.positionSize === undefined || data.positionSize === null) throw new Error('Position size is required');
    
    // Side validation
    if (!['LONG', 'SHORT'].includes(data.side)) {
      throw new Error('Side must be either LONG or SHORT');
    }
    
    // Numeric validation
    if (data.entryPrice <= 0) throw new Error('Entry price must be positive');
    if (data.positionSize <= 0) throw new Error('Position size must be positive');
    if (data.leverage !== undefined && data.leverage < 1) {
      throw new Error('Leverage must be at least 1');
    }
    
    // Assign values
    this.id = data.id || crypto.randomUUID();
    this.userId = data.userId;
    this.tradeDate = data.tradeDate instanceof Date ? data.tradeDate : new Date(data.tradeDate);
    this.symbol = data.symbol;
    this.side = data.side;
    this.entryPrice = Number(data.entryPrice);
    this.positionSize = Number(data.positionSize);
    this.createdAt = data.createdAt || new Date();
    
    // Optional fields
    this.exitPrice = data.exitPrice !== undefined ? Number(data.exitPrice) : undefined;
    this.stopLoss = data.stopLoss !== undefined ? Number(data.stopLoss) : undefined;
    this.leverage = data.leverage !== undefined ? Number(data.leverage) : 1;
    this.notes = data.notes || undefined;
    this.exitDate = data.exitDate instanceof Date ? data.exitDate : 
                   (data.exitDate ? new Date(data.exitDate) : undefined);
    
    // Initialize tags
    this.strategyTags = data.strategyTags || [];
  }
  
  calculatePnL() {
    if (this.exitPrice === undefined || this.exitPrice === null) {
      return null;
    }
    
    // ポジションサイズは既にレバレッジ適用後の数値なので、レバレッジを重複適用しない
    let pnl;
    if (this.side === 'LONG') {
      pnl = (this.exitPrice - this.entryPrice) * this.positionSize;
    } else { // SHORT
      pnl = (this.entryPrice - this.exitPrice) * this.positionSize;
    }
    
    return pnl;
  }
  
  calculateRRR() {
    if (!this.exitPrice || !this.stopLoss) {
      return null;
    }
    
    let reward, risk;
    if (this.side === 'LONG') {
      reward = this.exitPrice - this.entryPrice;
      risk = this.entryPrice - this.stopLoss;
    } else { // SHORT
      reward = this.entryPrice - this.exitPrice;
      risk = this.stopLoss - this.entryPrice;
    }
    
    if (risk === 0) return null;
    
    return reward / risk;
  }
  
  calculateDuration() {
    if (!this.exitDate) {
      return null;
    }
    
    const durationMs = this.exitDate.getTime() - this.tradeDate.getTime();
    return Math.floor(durationMs / 1000); // Return in seconds
  }
  
  addTag(tag) {
    if (!this.strategyTags.includes(tag)) {
      this.strategyTags.push(tag);
    }
  }
  
  removeTag(tag) {
    const index = this.strategyTags.indexOf(tag);
    if (index > -1) {
      this.strategyTags.splice(index, 1);
    }
  }
}

module.exports = Trade;