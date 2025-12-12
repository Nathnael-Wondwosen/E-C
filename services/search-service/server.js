const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Search Service' });
});

// Placeholder routes
app.get('/', (req, res) => {
  res.json({ message: 'Search Service is running!' });
});

app.listen(PORT, () => {
  console.log(`Search Service running on port ${PORT}`);
});