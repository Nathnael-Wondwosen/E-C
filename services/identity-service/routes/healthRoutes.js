const registerHealthRoutes = ({ app, mongoose }) => {
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      service: 'identity-service',
      status: 'OK',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });
};

module.exports = registerHealthRoutes;
