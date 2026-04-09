const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { startServer } = require('./app');

startServer().catch((error) => {
  console.error('Failed to start identity-service:', error.message || error);
  process.exit(1);
});
