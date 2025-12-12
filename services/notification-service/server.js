const express = require('express');
const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

// Placeholder routes
app.get('/', (req, res) => {
  res.json({ message: 'Notification Service is running!' });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});