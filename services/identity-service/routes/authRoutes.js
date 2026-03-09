const crypto = require('crypto');

const registerAuthRoutes = ({
  app,
  deps
}) => {
  const {
    User,
    bcrypt,
    normalizeRole,
    createToken,
    toResponseUser,
    authenticateToken
  } = deps;
  const shouldExposeResetToken = ['1', 'true', 'yes', 'on'].includes(
    `${process.env.EXPOSE_PASSWORD_RESET_TOKEN || 'true'}`.toLowerCase()
  );

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, username, password, role, roles, displayName, profile, sourceRefs } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ success: false, message: 'email, username, and password are required' });
      }

      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User with email or username already exists' });
      }

      const normalizedRole = normalizeRole(role || (Array.isArray(roles) ? roles[0] : 'buyer'));
      const normalizedRoles = Array.isArray(roles) && roles.length
        ? [...new Set(roles.map(normalizeRole))]
        : [normalizedRole];

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        passwordHash,
        role: normalizedRole,
        roles: normalizedRoles,
        displayName: displayName || '',
        profile: profile || {},
        sourceRefs: sourceRefs || {}
      });

      const token = createToken(user);
      return res.status(201).json({ success: true, token, user: toResponseUser(user) });
    } catch (error) {
      console.error('register error:', error);
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const loginKey = email || username;

      if (!loginKey || !password) {
        return res.status(400).json({ success: false, message: 'email/username and password are required' });
      }

      const user = await User.findOne(email ? { email } : { username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = createToken(user);
      return res.json({ success: true, token, user: toResponseUser(user) });
    } catch (error) {
      console.error('login error:', error);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
  });

  app.post('/api/auth/google/exchange', async (req, res) => {
    try {
      const { email, name, userType, googleId, avatarUrl } = req.body;
      if (!email || !googleId) {
        return res.status(400).json({ success: false, message: 'email and googleId are required' });
      }

      const normalizedRole = normalizeRole(userType || 'buyer');
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        const updatedRoles = user.roles.includes(normalizedRole)
          ? user.roles
          : [...user.roles, normalizedRole];

        user.role = user.role || normalizedRole;
        user.roles = updatedRoles;
        user.authProvider = 'google';
        user.googleId = googleId;
        user.avatarUrl = avatarUrl || user.avatarUrl || '';
        user.displayName = name || user.displayName || user.username;
        await user.save();
      } else {
        const generatedUsername = email.toLowerCase();
        user = await User.create({
          email: email.toLowerCase(),
          username: generatedUsername,
          passwordHash: await bcrypt.hash(`google:${googleId}`, 10),
          role: normalizedRole,
          roles: [normalizedRole],
          displayName: name || generatedUsername.split('@')[0],
          status: 'active',
          authProvider: 'google',
          googleId,
          avatarUrl: avatarUrl || ''
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const token = createToken(user);
      return res.json({ success: true, token, user: toResponseUser(user) });
    } catch (error) {
      console.error('google exchange error:', error);
      return res.status(500).json({ success: false, message: 'Google identity exchange failed' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'email is required' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });

      if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        user.resetPasswordTokenHash = tokenHash;
        user.resetPasswordExpiresAt = expiresAt;
        await user.save();

        return res.json({
          success: true,
          message: 'If the email exists, a reset token has been issued.',
          ...(shouldExposeResetToken ? { resetToken: rawToken, expiresAt: expiresAt.toISOString() } : {})
        });
      }

      return res.json({
        success: true,
        message: 'If the email exists, a reset token has been issued.'
      });
    } catch (error) {
      console.error('forgot-password error:', error);
      return res.status(500).json({ success: false, message: 'Failed to process forgot password request' });
    }
  });

  app.get('/api/auth/reset-password/validate', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ success: false, message: 'token is required' });
      }

      const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
      const user = await User.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
      }

      return res.json({ success: true, message: 'Token is valid' });
    } catch (error) {
      console.error('validate reset token error:', error);
      return res.status(500).json({ success: false, message: 'Failed to validate reset token' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'token and password are required' });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }

      const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
      const user = await User.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
      }

      user.passwordHash = await bcrypt.hash(String(password), 10);
      user.authProvider = user.authProvider || 'local';
      user.resetPasswordTokenHash = '';
      user.resetPasswordExpiresAt = null;
      await user.save();

      return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('reset-password error:', error);
      return res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      const user = await User.findById(req.auth.sub);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const matches = await bcrypt.compare(String(currentPassword), user.passwordHash || '');
      if (!matches) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      user.passwordHash = await bcrypt.hash(String(newPassword), 10);
      user.authProvider = 'local';
      user.updatedAt = new Date();
      await user.save();

      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('change-password error:', error);
      return res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  });

  app.post('/api/users/login', async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const loginKey = email || username;

      if (!loginKey || !password) {
        return res.status(400).json({ success: false, message: 'email/username and password are required' });
      }

      const user = await User.findOne(email ? { email } : { username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = createToken(user);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: toResponseUser(user)
      });
    } catch (error) {
      console.error('compat login error:', error);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
  });

  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'username and password are required' });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const hasAdminRole = user.roles.includes('admin') || user.role === 'admin';
      if (!hasAdminRole) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const token = createToken(user);
      return res.json({ success: true, token, user: toResponseUser(user) });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Admin login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.auth.sub);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user: toResponseUser(user) });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to load user profile' });
    }
  });
};

module.exports = registerAuthRoutes;
