const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Order Service' });
});

// Placeholder routes
app.get('/', (req, res) => {
  res.json({ message: 'Order Service is running!' });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});