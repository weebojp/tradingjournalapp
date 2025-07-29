const Trade = require('../../../src/models/Trade');

describe('Trade Model', () => {
  describe('constructor', () => {
    test('should create a trade with required fields', () => {
      const tradeData = {
        userId: 'user123',
        tradeDate: new Date('2025-07-25'),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 41500.5,
        positionSize: 0.2
      };
      
      const trade = new Trade(tradeData);
      
      expect(trade.userId).toBe('user123');
      expect(trade.tradeDate).toEqual(new Date('2025-07-25'));
      expect(trade.symbol).toBe('BTC/USDT');
      expect(trade.side).toBe('LONG');
      expect(trade.entryPrice).toBe(41500.5);
      expect(trade.positionSize).toBe(0.2);
      expect(trade.id).toBeDefined();
      expect(trade.createdAt).toBeInstanceOf(Date);
    });

    test('should accept optional fields', () => {
      const tradeData = {
        userId: 'user123',
        tradeDate: new Date('2025-07-25'),
        symbol: 'BTC/USDT',
        side: 'SHORT',
        entryPrice: 41500,
        exitPrice: 40000,
        stopLoss: 42000,
        leverage: 5,
        positionSize: 0.5,
        notes: 'Test trade'
      };
      
      const trade = new Trade(tradeData);
      
      expect(trade.exitPrice).toBe(40000);
      expect(trade.stopLoss).toBe(42000);
      expect(trade.leverage).toBe(5);
      expect(trade.notes).toBe('Test trade');
    });
  });

  describe('validation', () => {
    const validTradeData = {
      userId: 'user123',
      tradeDate: new Date('2025-07-25'),
      symbol: 'BTC/USDT',
      side: 'LONG',
      entryPrice: 41500,
      positionSize: 0.2
    };

    test('should throw error for invalid side', () => {
      expect(() => {
        new Trade({ ...validTradeData, side: 'INVALID' });
      }).toThrow('Side must be either LONG or SHORT');
    });

    test('should throw error for negative entry price', () => {
      expect(() => {
        new Trade({ ...validTradeData, entryPrice: -100 });
      }).toThrow('Entry price must be positive');
    });

    test('should throw error for zero position size', () => {
      expect(() => {
        new Trade({ ...validTradeData, positionSize: 0 });
      }).toThrow('Position size must be positive');
    });

    test('should throw error for leverage less than 1', () => {
      expect(() => {
        new Trade({ ...validTradeData, leverage: 0.5 });
      }).toThrow('Leverage must be at least 1');
    });

    test('should throw error for missing required fields', () => {
      expect(() => {
        new Trade({ userId: 'user123' });
      }).toThrow('Trade date is required');
    });
  });

  describe('PnL calculation', () => {
    test('should calculate PnL for LONG position with exit price', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        exitPrice: 42000,
        positionSize: 0.5,
        leverage: 1
      });
      
      expect(trade.calculatePnL()).toBe(1000); // (42000 - 40000) * 0.5
    });

    test('should calculate PnL for SHORT position with exit price', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'SHORT',
        entryPrice: 42000,
        exitPrice: 40000,
        positionSize: 0.5,
        leverage: 1
      });
      
      expect(trade.calculatePnL()).toBe(1000); // (42000 - 40000) * 0.5
    });

    test('should calculate PnL with leverage-adjusted position size', () => {
      // ポジションサイズは既にレバレッジ適用後の数値（0.1 BTC = 証拠金 × レバレッジ ÷ エントリー価格）
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        exitPrice: 42000,
        positionSize: 1.0, // レバレッジ適用後のポジションサイズ
        leverage: 10
      });
      
      expect(trade.calculatePnL()).toBe(2000); // (42000 - 40000) * 1.0
    });

    test('should return null if exit price not set', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      expect(trade.calculatePnL()).toBeNull();
    });
  });

  describe('RRR calculation', () => {
    test('should calculate RRR for LONG position', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        exitPrice: 43000,
        stopLoss: 39000,
        positionSize: 0.5
      });
      
      expect(trade.calculateRRR()).toBe(3); // (43000-40000)/(40000-39000)
    });

    test('should calculate RRR for SHORT position', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'SHORT',
        entryPrice: 42000,
        exitPrice: 40000,
        stopLoss: 43000,
        positionSize: 0.5
      });
      
      expect(trade.calculateRRR()).toBe(2); // (42000-40000)/(43000-42000)
    });

    test('should return null if stop loss or exit price not set', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      expect(trade.calculateRRR()).toBeNull();
    });
  });

  describe('duration calculation', () => {
    test('should calculate duration in seconds when trade is closed', () => {
      const entryTime = new Date('2025-07-25T10:00:00');
      const exitTime = new Date('2025-07-25T14:30:00');
      
      const trade = new Trade({
        userId: 'user123',
        tradeDate: entryTime,
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        exitPrice: 42000,
        positionSize: 0.5,
        exitDate: exitTime
      });
      
      expect(trade.calculateDuration()).toBe(16200); // 4.5 hours in seconds
    });

    test('should return null if trade not closed', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      expect(trade.calculateDuration()).toBeNull();
    });
  });

  describe('tags association', () => {
    test('should initialize with empty tags array', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      expect(trade.strategyTags).toEqual([]);
    });

    test('should add strategy tags', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      trade.addTag('MA-Cross');
      trade.addTag('Breakout');
      
      expect(trade.strategyTags).toContain('MA-Cross');
      expect(trade.strategyTags).toContain('Breakout');
      expect(trade.strategyTags.length).toBe(2);
    });

    test('should not add duplicate tags', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      trade.addTag('MA-Cross');
      trade.addTag('MA-Cross');
      
      expect(trade.strategyTags.length).toBe(1);
    });

    test('should remove tags', () => {
      const trade = new Trade({
        userId: 'user123',
        tradeDate: new Date(),
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 40000,
        positionSize: 0.5
      });
      
      trade.addTag('MA-Cross');
      trade.addTag('Breakout');
      trade.removeTag('MA-Cross');
      
      expect(trade.strategyTags).not.toContain('MA-Cross');
      expect(trade.strategyTags).toContain('Breakout');
    });
  });
});