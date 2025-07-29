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
    const { startDate, endDate, symbol, side, limit = 100, offset = 0 } = options;
    
    const where = { userId };
    
    if (startDate || endDate) {
      where.tradeDate = {};
      if (startDate) where.tradeDate.gte = startDate;
      if (endDate) where.tradeDate.lte = endDate;
    }
    
    if (symbol) where.symbol = symbol;
    if (side) where.side = side;
    
    return await this.prisma.trade.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { tradeDate: 'desc' },
      take: limit,
      skip: offset
    });
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
    const trades = await this.prisma.trade.findMany({
      where: { 
        userId,
        pnl: { not: null }
      },
      select: { pnl: true }
    });
    
    const totalTrades = await this.prisma.trade.count({
      where: { userId }
    });
    
    let totalPnL = 0;
    let winCount = 0;
    let totalWin = 0;
    let lossCount = 0;
    let totalLoss = 0;
    
    trades.forEach(trade => {
      const pnl = parseFloat(trade.pnl);
      totalPnL += pnl;
      
      if (pnl > 0) {
        winCount++;
        totalWin += pnl;
      } else if (pnl < 0) {
        lossCount++;
        totalLoss += Math.abs(pnl);
      }
    });
    
    return {
      totalTrades,
      totalPnL,
      winRate: totalTrades > 0 ? winCount / totalTrades : 0,
      avgWin: winCount > 0 ? totalWin / winCount : 0,
      avgLoss: lossCount > 0 ? totalLoss / lossCount : 0
    };
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