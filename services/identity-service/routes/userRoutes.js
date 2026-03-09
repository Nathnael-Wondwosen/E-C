const registerUserRoutes = ({ app, deps }) => {
  const {
    User,
    toResponseUser,
    authenticateToken,
    requireSelfOrAdmin
  } = deps;

  app.get('/api/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user: toResponseUser(user) });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to load user' });
    }
  });

  app.put('/api/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const { displayName, profile, status } = req.body;
      const updates = {};

      if (typeof displayName === 'string') updates.displayName = displayName;
      if (profile && typeof profile === 'object') updates.profile = profile;
      if (status && (req.auth.roles || []).includes('admin')) updates.status = status;

      const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, user: toResponseUser(user) });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  });
};

module.exports = registerUserRoutes;
