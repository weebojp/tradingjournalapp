const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createAuthRouter } = require('../../src/routes/auth');
const { createTradesRouter } = require('../../src/routes/trades');
const { createAuthMiddleware } = require('../../src/middleware/auth');

function createTestApp(mockAuthService = null, mockDbService = null) {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware (only in development)
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Trading Journal API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api'
      }
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // API routes with injected services
  const authRouter = createAuthRouter(mockAuthService);
  
  // For trades router, also need to inject the auth middleware
  const authMiddleware = mockAuthService ? createAuthMiddleware(mockAuthService) : require('../../src/middleware/auth');
  const tradesRouter = createTradesRouter(mockDbService);
  
  // Replace the auth middleware in trades router
  if (mockAuthService) {
    // Create a new trades router function that uses the mocked auth middleware
    const tradesRouterWithMockedAuth = createTradesRouterWithMockedAuth(mockDbService, authMiddleware);
    app.use('/api/trades', tradesRouterWithMockedAuth);
  } else {
    app.use('/api/trades', tradesRouter);
  }
  
  app.use('/api/auth', authRouter);

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: req.path
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    
    res.status(status).json({
      error: status === 500 ? 'Internal Server Error' : err.name || 'Error',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return app;
}

function createTradesRouterWithMockedAuth(dbServiceInstance, authMiddlewareInstance) {
  const express = require('express');
  const router = express.Router();
  const dbService = dbServiceInstance;

  // Use the provided auth middleware
  router.use(authMiddlewareInstance);

  // Copy all the trade routes here
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

module.exports = createTestApp;