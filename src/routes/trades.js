const express = require('express');
const DatabaseService = require('../services/database');
const authMiddleware = require('../middleware/auth');

function createTradesRouter(dbServiceInstance = null) {
  const router = express.Router();
  const dbService = dbServiceInstance || new DatabaseService();

// All trade routes require authentication
router.use(authMiddleware);

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

// Export default instance
module.exports = createTradesRouter();

// Export factory function for testing
module.exports.createTradesRouter = createTradesRouter;