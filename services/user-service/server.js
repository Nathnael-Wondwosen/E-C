const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.USER_SERVICE_PORT || process.env.PORT || 3007;

// Middleware
app.use(express.json());

// MongoDB Connection
// Use MongoDB Atlas connection string from environment variables
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/user-service?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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