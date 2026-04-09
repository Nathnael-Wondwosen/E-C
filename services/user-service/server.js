const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.USER_SERVICE_PORT || process.env.PORT || 3007;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';

// Middleware
app.use(express.json());

if (mongoUri) {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} else {
  console.warn('user-service: MONGODB_URI not set, starting without a MongoDB connection');
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'User Service is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'User Service' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
