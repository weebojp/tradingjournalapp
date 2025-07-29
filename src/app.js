const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// API routes
const authRoutes = require('./routes/auth');
const tradesRoutes = require('./routes/trades');
const tagsRoutes = require('./routes/tags');

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/tags', tagsRoutes);

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

module.exports = app;