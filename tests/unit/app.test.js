const express = require('express');

describe('Express Application', () => {
  let app;
  
  beforeEach(() => {
    jest.resetModules();
  });
  
  test('should create an Express application', () => {
    app = require('../../src/app');
    
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.use).toBe('function');
  });
  
  test('should have JSON parsing middleware', () => {
    app = require('../../src/app');
    
    // Check if express.json middleware is applied
    const hasJsonMiddleware = app._router && app._router.stack.some(layer => 
      layer && layer.handle && (layer.handle.name === 'jsonParser' || layer.name === 'jsonParser')
    );
    
    expect(hasJsonMiddleware).toBe(true);
  });
  
  test('should have URL encoding middleware', () => {
    app = require('../../src/app');
    
    const hasUrlencodedMiddleware = app._router && app._router.stack.some(layer => 
      layer && layer.handle && (layer.handle.name === 'urlencodedParser' || layer.name === 'urlencodedParser')
    );
    
    expect(hasUrlencodedMiddleware).toBe(true);
  });
  
  test('should have CORS middleware', () => {
    app = require('../../src/app');
    
    const hasCorsMiddleware = app._router && app._router.stack.some(layer => 
      layer && layer.handle && (layer.handle.name === 'corsMiddleware' || layer.name === 'corsMiddleware')
    );
    
    expect(hasCorsMiddleware).toBe(true);
  });
  
  test('should have helmet security middleware', () => {
    app = require('../../src/app');
    
    const hasHelmetMiddleware = app._router && app._router.stack.some(layer => 
      layer && layer.handle && (layer.handle.name === 'helmetMiddleware' || layer.name === 'helmet')
    );
    
    expect(hasHelmetMiddleware).toBe(true);
  });
  
  test('should have morgan logging middleware in development', () => {
    process.env.NODE_ENV = 'development';
    app = require('../../src/app');
    
    const hasMorganMiddleware = app._router && app._router.stack.some(layer => 
      layer && layer.handle && layer.handle.name === 'logger'
    );
    
    expect(hasMorganMiddleware).toBe(true);
  });
  
  test('should have health check endpoint', (done) => {
    const request = require('supertest');
    app = require('../../src/app');
    
    request(app)
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({
          status: 'healthy',
          timestamp: expect.any(String)
        });
        done();
      });
  });
  
  test('should have API routes mounted at /api', () => {
    app = require('../../src/app');
    
    const hasApiRouter = app._router && app._router.stack.some(layer => 
      layer && layer.regexp && layer.regexp.toString().includes('\\/api')
    );
    
    expect(hasApiRouter).toBe(true);
  });
  
  test('should handle 404 errors', (done) => {
    const request = require('supertest');
    app = require('../../src/app');
    
    request(app)
      .get('/non-existent-route')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({
          error: 'Not Found',
          message: 'The requested resource was not found',
          path: '/non-existent-route'
        });
        done();
      });
  });
  
  test('should have error handling middleware', () => {
    app = require('../../src/app');
    
    const errorMiddleware = app._router && app._router.stack.find(layer => 
      layer && layer.handle && layer.handle.length === 4 // Error handlers have 4 parameters
    );
    
    expect(errorMiddleware).toBeDefined();
  });
});