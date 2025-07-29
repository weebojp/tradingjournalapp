const DatabaseService = require('../../../src/services/database');

// Mock Prisma Client
jest.mock('../../../src/generated/prisma', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    trade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    tag: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    tradeTag: {
      create: jest.fn(),
      delete: jest.fn()
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('DatabaseService', () => {
  let dbService;
  let mockPrisma;
  
  beforeEach(() => {
    jest.clearAllMocks();
    dbService = new DatabaseService();
    mockPrisma = dbService.prisma;
  });
  
  afterEach(async () => {
    await dbService.disconnect();
  });
  
  describe('Connection Management', () => {
    test('should connect to database', async () => {
      await dbService.connect();
      
      expect(mockPrisma.$connect).toHaveBeenCalledTimes(1);
    });
    
    test('should disconnect from database', async () => {
      await dbService.disconnect();
      
      expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
    });
    
    test('should handle connection errors', async () => {
      mockPrisma.$connect.mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(dbService.connect()).rejects.toThrow('Connection failed');
    });
  });
  
  describe('User Operations', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    test('should create a new user', async () => {
      mockPrisma.user.create.mockResolvedValueOnce(mockUser);
      
      const result = await dbService.createUser({
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      });
      
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword'
        }
      });
      expect(result).toEqual(mockUser);
    });
    
    test('should find user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await dbService.findUserByEmail('test@example.com');
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });
    
    test('should find user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await dbService.findUserById('user123');
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' }
      });
      expect(result).toEqual(mockUser);
    });
  });
  
  describe('Trade Operations', () => {
    const mockTrade = {
      id: 'trade123',
      userId: 'user123',
      tradeDate: new Date(),
      symbol: 'BTC/USDT',
      side: 'LONG',
      entryPrice: '41500.50',
      positionSize: '0.2',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    test('should create a new trade', async () => {
      mockPrisma.trade.create.mockResolvedValueOnce(mockTrade);
      
      const tradeData = {
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 41500.50,
        positionSize: 0.2
      };
      
      const result = await dbService.createTrade(tradeData);
      
      expect(mockPrisma.trade.create).toHaveBeenCalledWith({
        data: tradeData,
        include: { tags: { include: { tag: true } } }
      });
      expect(result).toEqual(mockTrade);
    });
    
    test('should find trades by user', async () => {
      const mockTrades = [mockTrade];
      mockPrisma.trade.findMany.mockResolvedValueOnce(mockTrades);
      
      const result = await dbService.findTradesByUser('user123');
      
      expect(mockPrisma.trade.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        include: { tags: { include: { tag: true } } },
        orderBy: { tradeDate: 'desc' },
        take: 100,
        skip: 0
      });
      expect(result).toEqual(mockTrades);
    });
    
    test('should update a trade', async () => {
      const updatedTrade = { ...mockTrade, exitPrice: '43000.00' };
      mockPrisma.trade.update.mockResolvedValueOnce(updatedTrade);
      
      const result = await dbService.updateTrade('trade123', {
        exitPrice: 43000.00
      });
      
      expect(mockPrisma.trade.update).toHaveBeenCalledWith({
        where: { id: 'trade123' },
        data: { exitPrice: 43000.00 },
        include: { tags: { include: { tag: true } } }
      });
      expect(result).toEqual(updatedTrade);
    });
    
    test('should delete a trade', async () => {
      mockPrisma.trade.delete.mockResolvedValueOnce(mockTrade);
      
      const result = await dbService.deleteTrade('trade123');
      
      expect(mockPrisma.trade.delete).toHaveBeenCalledWith({
        where: { id: 'trade123' }
      });
      expect(result).toEqual(mockTrade);
    });
    
    test('should calculate trade statistics for user', async () => {
      const mockTrades = [
        { pnl: '100.00' },
        { pnl: '-50.00' },
        { pnl: '200.00' }
      ];
      mockPrisma.trade.findMany.mockResolvedValueOnce(mockTrades);
      mockPrisma.trade.count.mockResolvedValueOnce(3);
      
      const result = await dbService.getTradeStatsByUser('user123');
      
      expect(result).toEqual({
        totalTrades: 3,
        totalPnL: 250,
        winRate: expect.any(Number),
        avgWin: expect.any(Number),
        avgLoss: expect.any(Number)
      });
    });
  });
  
  describe('Tag Operations', () => {
    const mockTag = {
      id: 'tag123',
      name: 'MA-Cross',
      descriptionMD: 'Moving Average Cross Strategy',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    test('should create a new tag', async () => {
      mockPrisma.tag.create.mockResolvedValueOnce(mockTag);
      
      const result = await dbService.createTag({
        name: 'MA-Cross',
        descriptionMD: 'Moving Average Cross Strategy'
      });
      
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'MA-Cross',
          descriptionMD: 'Moving Average Cross Strategy'
        }
      });
      expect(result).toEqual(mockTag);
    });
    
    test('should find all tags', async () => {
      const mockTags = [mockTag];
      mockPrisma.tag.findMany.mockResolvedValueOnce(mockTags);
      
      const result = await dbService.findAllTags();
      
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      });
      expect(result).toEqual(mockTags);
    });
    
    test('should find tag by name', async () => {
      mockPrisma.tag.findUnique.mockResolvedValueOnce(mockTag);
      
      const result = await dbService.findTagByName('MA-Cross');
      
      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'MA-Cross' }
      });
      expect(result).toEqual(mockTag);
    });
  });
  
  describe('Trade-Tag Associations', () => {
    test('should add tag to trade', async () => {
      const mockTradeTag = {
        tradeId: 'trade123',
        tagId: 'tag123',
        createdAt: new Date()
      };
      mockPrisma.tradeTag.create.mockResolvedValueOnce(mockTradeTag);
      
      const result = await dbService.addTagToTrade('trade123', 'tag123');
      
      expect(mockPrisma.tradeTag.create).toHaveBeenCalledWith({
        data: {
          tradeId: 'trade123',
          tagId: 'tag123'
        }
      });
      expect(result).toEqual(mockTradeTag);
    });
    
    test('should remove tag from trade', async () => {
      mockPrisma.tradeTag.delete.mockResolvedValueOnce({});
      
      await dbService.removeTagFromTrade('trade123', 'tag123');
      
      expect(mockPrisma.tradeTag.delete).toHaveBeenCalledWith({
        where: {
          tradeId_tagId: {
            tradeId: 'trade123',
            tagId: 'tag123'
          }
        }
      });
    });
  });
});