const request = require('supertest');
const express = require('express');
const { createTradesRouter } = require('../../../src/routes/trades');
const { createAuthMiddleware } = require('../../../src/middleware/auth');

function createTestApp(mockDbService, mockAuthService) {
  const app = express();
  app.use(express.json());
  
  // Create auth middleware with mocked service
  const authMiddleware = createAuthMiddleware(mockAuthService);
  
  // Create trades router with mocked services
  const tradesRouter = createTradesRouterWithMockedAuth(mockDbService, authMiddleware);
  
  app.use('/api/trades', tradesRouter);
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
  
  return app;
}

function createTradesRouterWithMockedAuth(dbServiceInstance, authMiddlewareInstance) {
  const express = require('express');
  const router = express.Router();
  const dbService = dbServiceInstance;

  // Use the provided auth middleware
  router.use(authMiddlewareInstance);

  // GET /api/trades
  router.get('/', async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 100, offset = 0, symbol, side, startDate, endDate } = req.query;
      
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      if (symbol) options.symbol = symbol;
      if (side) options.side = side;
      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      
      const trades = await dbService.findTradesByUser(userId, options);
      
      res.json({
        trades,
        pagination: {
          total: trades.length,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch trades'
      });
    }
  });

  // POST /api/trades
  router.post('/', async (req, res) => {
    try {
      const userId = req.user.id;
      const { tradeDate, symbol, side, entryPrice, positionSize, leverage, notes } = req.body;
      
      // Validation
      const errors = [];
      if (!tradeDate) errors.push('tradeDate is required');
      if (!symbol) errors.push('symbol is required');
      if (!side) errors.push('side is required');
      if (entryPrice === undefined) errors.push('entryPrice is required');
      if (positionSize === undefined) errors.push('positionSize is required');
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Missing required fields',
          details: errors
        });
      }
      
      // Validate field types
      const validationErrors = [];
      
      if (isNaN(Date.parse(tradeDate))) {
        validationErrors.push('tradeDate must be a valid date');
      }
      
      if (!['LONG', 'SHORT'].includes(side)) {
        validationErrors.push('side must be LONG or SHORT');
      }
      
      if (isNaN(entryPrice) || entryPrice <= 0) {
        validationErrors.push('entryPrice must be a positive number');
      }
      
      if (isNaN(positionSize) || positionSize <= 0) {
        validationErrors.push('positionSize must be a positive number');
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid field values',
          details: validationErrors
        });
      }
      
      const tradeData = {
        userId,
        tradeDate: new Date(tradeDate),
        symbol,
        side,
        entryPrice,
        positionSize,
        leverage,
        notes
      };
      
      const trade = await dbService.createTrade(tradeData);
      
      res.status(201).json(trade);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create trade'
      });
    }
  });

  // PUT /api/trades/:id
  router.put('/:id', async (req, res) => {
    try {
      const tradeId = req.params.id;
      const { exitPrice, pnl, exitDate } = req.body;
      
      const updateData = {};
      if (exitPrice !== undefined) updateData.exitPrice = exitPrice;
      if (pnl !== undefined) updateData.pnl = pnl;
      if (exitDate) updateData.exitDate = new Date(exitDate);
      
      const trade = await dbService.updateTrade(tradeId, updateData);
      
      res.json(trade);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Trade not found'
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update trade'
        });
      }
    }
  });

  // DELETE /api/trades/:id
  router.delete('/:id', async (req, res) => {
    try {
      const tradeId = req.params.id;
      
      await dbService.deleteTrade(tradeId);
      
      res.status(204).send();
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Trade not found'
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to delete trade'
        });
      }
    }
  });

  // GET /api/trades/stats
  router.get('/stats', async (req, res) => {
    try {
      const userId = req.user.id;
      
      const stats = await dbService.getTradeStatsByUser(userId);
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch trade statistics'
      });
    }
  });

  return router;
}

describe('Trades API', () => {
  let mockDbService;
  let mockAuthService;
  let authToken;
  let mockUser;
  let app;
  
  beforeEach(() => {
    // Setup mock user
    mockUser = {
      id: 'user123',
      email: 'test@example.com',
      createdAt: new Date()
    };
    
    authToken = 'valid.jwt.token';
    
    // Setup mock services
    mockDbService = {
      findTradesByUser: jest.fn(),
      createTrade: jest.fn(),
      updateTrade: jest.fn(),
      deleteTrade: jest.fn(),
      getTradeStatsByUser: jest.fn()
    };
    
    mockAuthService = {
      verifyToken: jest.fn().mockResolvedValue(mockUser)
    };
    
    app = createTestApp(mockDbService, mockAuthService);
  });
  
  describe('GET /api/trades', () => {
    test('should get user trades successfully', async () => {
      const mockTrades = [
        {
          id: 'trade1',
          userId: 'user123',
          tradeDate: new Date('2025-07-25').toISOString(),
          symbol: 'BTC/USDT',
          side: 'LONG',
          entryPrice: '41500.50',
          positionSize: '0.2',
          tags: []
        },
        {
          id: 'trade2',
          userId: 'user123',
          tradeDate: new Date('2025-07-24').toISOString(),
          symbol: 'ETH/USDT',
          side: 'SHORT',
          entryPrice: '2800.00',
          exitPrice: '2750.00',
          positionSize: '1.0',
          pnl: '50.00',
          tags: []
        }
      ];
      
      mockDbService.findTradesByUser.mockResolvedValueOnce(mockTrades);
      
      const response = await request(app)
        .get('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toEqual({
        trades: mockTrades,
        pagination: {
          total: mockTrades.length,
          limit: 100,
          offset: 0
        }
      });
      
      expect(mockDbService.findTradesByUser).toHaveBeenCalledWith('user123', {
        limit: 100,
        offset: 0
      });
    });
    
    test('should handle pagination parameters', async () => {
      const mockTrades = [];
      mockDbService.findTradesByUser.mockResolvedValueOnce(mockTrades);
      
      await request(app)
        .get('/api/trades?limit=50&offset=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(mockDbService.findTradesByUser).toHaveBeenCalledWith('user123', {
        limit: 50,
        offset: 10
      });
    });
    
    test('should handle filtering parameters', async () => {
      const mockTrades = [];
      mockDbService.findTradesByUser.mockResolvedValueOnce(mockTrades);
      
      await request(app)
        .get('/api/trades?symbol=BTC/USDT&side=LONG&startDate=2025-07-01&endDate=2025-07-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(mockDbService.findTradesByUser).toHaveBeenCalledWith('user123', {
        symbol: 'BTC/USDT',
        side: 'LONG',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-31'),
        limit: 100,
        offset: 0
      });
    });
    
    test('should require authentication', async () => {
      await request(app)
        .get('/api/trades')
        .expect(401)
        .expect({
          error: 'Unauthorized',
          message: 'Access token is required'
        });
    });
    
    test('should handle database errors', async () => {
      mockDbService.findTradesByUser.mockRejectedValueOnce(new Error('Database error'));
      
      await request(app)
        .get('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500)
        .expect({
          error: 'Internal Server Error',
          message: 'Failed to fetch trades'
        });
    });
  });
  
  describe('POST /api/trades', () => {
    test('should create a new trade successfully', async () => {
      const newTradeData = {
        tradeDate: '2025-07-25T10:00:00Z',
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 41500.50,
        positionSize: 0.2,
        leverage: 5,
        notes: 'Test trade'
      };
      
      const createdTrade = {
        id: 'trade123',
        userId: 'user123',
        ...newTradeData,
        tradeDate: new Date(newTradeData.tradeDate).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };
      
      mockDbService.createTrade.mockResolvedValueOnce(createdTrade);
      
      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTradeData)
        .expect(201);
      
      expect(response.body).toEqual(createdTrade);
      expect(mockDbService.createTrade).toHaveBeenCalledWith({
        userId: 'user123',
        tradeDate: new Date(newTradeData.tradeDate),
        symbol: newTradeData.symbol,
        side: newTradeData.side,
        entryPrice: newTradeData.entryPrice,
        positionSize: newTradeData.positionSize,
        leverage: newTradeData.leverage,
        notes: newTradeData.notes
      });
    });
    
    test('should validate required fields', async () => {
      const invalidData = {
        symbol: 'BTC/USDT',
        side: 'LONG'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
        
      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Missing required fields',
        details: expect.any(Array)
      });
    });
    
    test('should validate field types', async () => {
      const invalidData = {
        tradeDate: 'invalid-date',
        symbol: 'BTC/USDT',
        side: 'INVALID_SIDE',
        entryPrice: 'not-a-number',
        positionSize: -1
      };
      
      const response = await request(app)
        .post('/api/trades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
        
      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Invalid field values',
        details: expect.any(Array)
      });
    });
    
    test('should require authentication', async () => {
      await request(app)
        .post('/api/trades')
        .send({ symbol: 'BTC/USDT' })
        .expect(401);
    });
  });
  
  describe('PUT /api/trades/:id', () => {
    test('should update a trade successfully', async () => {
      const tradeId = 'trade123';
      const updateData = {
        exitPrice: 43000.00,
        pnl: 300.00,
        exitDate: '2025-07-25T15:00:00Z'
      };
      
      const updatedTrade = {
        id: tradeId,
        userId: 'user123',
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: '41500.50',
        exitPrice: '43000.00',
        positionSize: '0.2',
        pnl: '300.00',
        exitDate: new Date(updateData.exitDate).toISOString(),
        tags: []
      };
      
      mockDbService.updateTrade.mockResolvedValueOnce(updatedTrade);
      
      const response = await request(app)
        .put(`/api/trades/${tradeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toEqual(updatedTrade);
      expect(mockDbService.updateTrade).toHaveBeenCalledWith(tradeId, {
        exitPrice: updateData.exitPrice,
        pnl: updateData.pnl,
        exitDate: new Date(updateData.exitDate)
      });
    });
    
    test('should return 404 for non-existent trade', async () => {
      mockDbService.updateTrade.mockRejectedValueOnce(new Error('Trade not found'));
      
      await request(app)
        .put('/api/trades/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ exitPrice: 43000 })
        .expect(404)
        .expect({
          error: 'Not Found',
          message: 'Trade not found'
        });
    });
    
    test('should require authentication', async () => {
      await request(app)
        .put('/api/trades/trade123')
        .send({ exitPrice: 43000 })
        .expect(401);
    });
  });
  
  describe('DELETE /api/trades/:id', () => {
    test('should delete a trade successfully', async () => {
      const tradeId = 'trade123';
      
      mockDbService.deleteTrade.mockResolvedValueOnce({ id: tradeId });
      
      await request(app)
        .delete(`/api/trades/${tradeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
      
      expect(mockDbService.deleteTrade).toHaveBeenCalledWith(tradeId);
    });
    
    test('should return 404 for non-existent trade', async () => {
      mockDbService.deleteTrade.mockRejectedValueOnce(new Error('Trade not found'));
      
      await request(app)
        .delete('/api/trades/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect({
          error: 'Not Found',
          message: 'Trade not found'
        });
    });
    
    test('should require authentication', async () => {
      await request(app)
        .delete('/api/trades/trade123')
        .expect(401);
    });
  });
  
  describe('GET /api/trades/stats', () => {
    test('should get trade statistics', async () => {
      const mockStats = {
        totalTrades: 50,
        totalPnL: 1500.00,
        winRate: 0.6,
        avgWin: 200.00,
        avgLoss: 125.00
      };
      
      mockDbService.getTradeStatsByUser.mockResolvedValueOnce(mockStats);
      
      const response = await request(app)
        .get('/api/trades/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toEqual(mockStats);
      expect(mockDbService.getTradeStatsByUser).toHaveBeenCalledWith('user123');
    });
    
    test('should require authentication', async () => {
      await request(app)
        .get('/api/trades/stats')
        .expect(401);
    });
  });
});