require('dotenv').config();
const { startServer } = require('./app');

startServer().catch((error) => {
  console.error('Failed to start identity-service:', error.message || error);
  process.exit(1);
});
