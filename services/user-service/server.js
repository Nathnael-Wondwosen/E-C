const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service', {
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