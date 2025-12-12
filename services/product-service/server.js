const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Product Service' });
});

// Placeholder routes
app.get('/', (req, res) => {
  res.json({ message: 'Product Service is running!' });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});