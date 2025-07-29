const request = require('supertest');
const app = require('../../src/app');

describe('Trading Journal API Integration Tests', () => {
  describe('POST /api/trades', () => {
    test('should create a new trade', async () => {
      const tradeData = {
        symbol: 'AAPL',
        quantity: 100,
        buyPrice: 150.00,
        sellPrice: 155.00,
        date: '2024-01-15'
      };
      
      const response = await request(app)
        .post('/api/trades')
        .send(tradeData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        symbol: 'AAPL',
        quantity: 100,
        buyPrice: 150.00,
        sellPrice: 155.00,
        profit: 500,
        profitPercentage: 3.33
      });
    });
    
    test('should return 400 for invalid trade data', async () => {
      const invalidData = {
        symbol: '',
        quantity: -10,
        buyPrice: 'invalid'
      };
      
      const response = await request(app)
        .post('/api/trades')
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });
  });
  
  describe('GET /api/trades', () => {
    test('should retrieve all trades', async () => {
      const response = await request(app)
        .get('/api/trades')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('should filter trades by symbol', async () => {
      const response = await request(app)
        .get('/api/trades?symbol=AAPL')
        .expect(200);
      
      response.body.forEach(trade => {
        expect(trade.symbol).toBe('AAPL');
      });
    });
  });
}); 