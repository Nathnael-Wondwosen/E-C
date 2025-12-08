const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gateway is running!',
    services: {
      user: 'http://localhost:3001',
      product: 'http://localhost:3002',
      order: 'http://localhost:3003',
      payment: 'http://localhost:3004',
      search: 'http://localhost:3005',
      notification: 'http://localhost:3006'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});