require('dotenv').config();
const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 5000;

let server;

try {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  throw error;
}

// Graceful shutdown handling
let shutdownTimer;
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }
      process.exit(0);
    });
    
    // Force close after 10 seconds
    shutdownTimer = setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;