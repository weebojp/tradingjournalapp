const { PrismaClient } = require('../generated/prisma');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    });
  }
  
  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
  
  async disconnect() {
    await this.prisma.$disconnect();
  }
  
  // User operations
  async createUser(data) {
    return await this.prisma.user.create({
      data
    });
  }
  
  async findUserByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }
  
  async findUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }
  
  // Trade operations
  async createTrade(data) {
    return await this.prisma.trade.create({
      data,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }
  
  async findTradesByUser(userId, options = {}) {
    const { 
      startDate, 
      endDate, 
      symbol, 
      side, 
      pnlFrom, 
      pnlTo, 
      positionSizeFrom, 
      positionSizeTo, 
      minRiskReward, 
      maxRiskReward, 
      limit = 100, 
      offset = 0 
    } = options;
    
    const where = { userId };
    
    if (startDate || endDate) {
      where.tradeDate = {};
      if (startDate) where.tradeDate.gte = startDate;
      if (endDate) where.tradeDate.lte = endDate;
    }
    
    if (symbol) where.symbol = symbol;
    if (side) where.side = side;
    
    // P&L range filter
    if (pnlFrom !== undefined || pnlTo !== undefined) {
      where.pnl = {};
      if (pnlFrom !== undefined) where.pnl.gte = pnlFrom;
      if (pnlTo !== undefined) where.pnl.lte = pnlTo;
    }
    
    // Position size range filter
    if (positionSizeFrom !== undefined || positionSizeTo !== undefined) {
      where.positionSize = {};
      if (positionSizeFrom !== undefined) where.positionSize.gte = positionSizeFrom;
      if (positionSizeTo !== undefined) where.positionSize.lte = positionSizeTo;
    }
    
    // Get trades first without risk-reward filter
    let trades = await this.prisma.trade.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { tradeDate: 'desc' }
    });
    
    // Apply risk-reward ratio filter if specified
    if (minRiskReward !== undefined || maxRiskReward !== undefined) {
      trades = trades.filter(trade => {
        // Calculate risk-reward ratio for closed trades
        if (!trade.pnl || !trade.entryPrice || !trade.exitPrice) {
          return false; // Skip open trades or trades without proper data
        }
        
        const pnl = parseFloat(trade.pnl);
        const entryPrice = parseFloat(trade.entryPrice);
        const exitPrice = parseFloat(trade.exitPrice);
        
        // Calculate risk based on entry price (assuming 1% risk for simplicity)
        const risk = entryPrice * 0.01; // This is a simplified calculation
        const reward = Math.abs(pnl);
        
        if (risk === 0) return false;
        
        const riskRewardRatio = reward / risk;
        
        let passesFilter = true;
        if (minRiskReward !== undefined && riskRewardRatio < minRiskReward) {
          passesFilter = false;
        }
        if (maxRiskReward !== undefined && riskRewardRatio > maxRiskReward) {
          passesFilter = false;
        }
        
        return passesFilter;
      });
    }
    
    // Apply pagination after filtering
    const startIndex = offset;
    const endIndex = startIndex + limit;
    
    return trades.slice(startIndex, endIndex);
  }
  
  async updateTrade(id, data) {
    return await this.prisma.trade.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }
  
  async deleteTrade(id) {
    return await this.prisma.trade.delete({
      where: { id }
    });
  }
  
  async getTradeStatsByUser(userId) {
    // Get all trades with necessary fields for advanced statistics
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      select: { 
        pnl: true,
        tradeDate: true,
        entryPrice: true,
        exitPrice: true,
        positionSize: true,
        side: true,
        symbol: true
      },
      orderBy: { tradeDate: 'asc' }
    });
    
    // Convert to format expected by statistics module
    const tradesForStats = trades
      .filter(trade => trade.pnl !== null) // Only include closed trades for PnL calculations
      .map(trade => ({
        pnl: parseFloat(trade.pnl),
        tradeDate: trade.tradeDate,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        positionSize: trade.positionSize,
        side: trade.side,
        symbol: trade.symbol
      }));

    // Import and use advanced statistics calculation
    const { calculateAdvancedTradeStats } = require('../utils/statistics');
    
    return calculateAdvancedTradeStats(tradesForStats);
  }
  
  // Tag operations
  async createTag(data) {
    return await this.prisma.tag.create({
      data
    });
  }
  
  async findAllTags() {
    return await this.prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
  }
  
  async findTagByName(name) {
    return await this.prisma.tag.findUnique({
      where: { name }
    });
  }
  
  async updateTag(id, data) {
    return await this.prisma.tag.update({
      where: { id },
      data
    });
  }
  
  async deleteTag(id) {
    return await this.prisma.tag.delete({
      where: { id }
    });
  }
  
  // Trade-Tag associations
  async addTagToTrade(tradeId, tagId) {
    return await this.prisma.tradeTag.create({
      data: {
        tradeId,
        tagId
      }
    });
  }
  
  async removeTagFromTrade(tradeId, tagId) {
    return await this.prisma.tradeTag.delete({
      where: {
        tradeId_tagId: {
          tradeId,
          tagId
        }
      }
    });
  }
}

module.exports = DatabaseService;