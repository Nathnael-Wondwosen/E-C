const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Payment Service' });
});

// Placeholder routes
app.get('/', (req, res) => {
  res.json({ message: 'Payment Service is running!' });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});