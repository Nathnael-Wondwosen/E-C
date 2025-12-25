export default function handler(req, res) {
  // Health check endpoint
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'customer-portal'
  });
}