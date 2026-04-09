const crypto = require('crypto');

const registerAuthRoutes = ({
  app,
  getDb,
  deps,
  ObjectId
}) => {
  const {
    IDENTITY_SERVICE_URL,
    enforceIdentityBoundary = false,
    googleClient,
    JWT_SECRET,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    normalizeUserType,
    createAuthToken,
    proxyJsonToIdentityService,
    bcrypt,
    jwt
  } = deps;

  const assertIdentityBoundary = (res) => {
    if (enforceIdentityBoundary && !IDENTITY_SERVICE_URL) {
      res.status(503).json({
        error: 'Identity service is required for auth routes. Configure IDENTITY_SERVICE_URL.'
      });
      return false;
    }

    return true;
  };
  const shouldExposeResetToken = ['1', 'true', 'yes', 'on'].includes(
    `${process.env.EXPOSE_PASSWORD_RESET_TOKEN || 'true'}`.toLowerCase()
  );
  const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
  const LOGIN_LOCK_MS = Number(process.env.LOGIN_LOCK_MS || 3 * 60 * 1000);
  const loginThrottleStore = new Map();

  const normalizeLoginKey = (value = '') => String(value || '').trim().toLowerCase();
  const getThrottleKey = (scope, loginKey) => `${scope}:${normalizeLoginKey(loginKey)}`;
  const clearThrottle = (throttleKey) => {
    loginThrottleStore.delete(throttleKey);
  };
  const getThrottleState = (throttleKey) => {
    const entry = loginThrottleStore.get(throttleKey);
    if (!entry) return { locked: false, retryAfterSec: 0 };
    const now = Date.now();
    if (entry.lockUntil && entry.lockUntil > now) {
      return {
        locked: true,
        retryAfterSec: Math.max(1, Math.ceil((entry.lockUntil - now) / 1000))
      };
    }
    if (entry.lockUntil && entry.lockUntil <= now) {
      loginThrottleStore.delete(throttleKey);
    }
    return { locked: false, retryAfterSec: 0 };
  };
  const registerFailure = (throttleKey) => {
    const now = Date.now();
    const entry = loginThrottleStore.get(throttleKey) || { count: 0, lockUntil: 0 };
    if (entry.lockUntil && entry.lockUntil <= now) {
      entry.count = 0;
      entry.lockUntil = 0;
    }
    entry.count += 1;
    if (entry.count >= LOGIN_MAX_ATTEMPTS) {
      entry.lockUntil = now + LOGIN_LOCK_MS;
      entry.count = 0;
    }
    loginThrottleStore.set(throttleKey, entry);
  };
  const respondLocked = (res, retryAfterSec) => {
    res.set('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      error: `Too many failed login attempts. Try again in ${retryAfterSec} seconds.`
    });
  };
  const getAuthenticatedUserId = (req) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return '';
    }

    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded?.sub || decoded?.id || '';
    } catch (error) {
      return '';
    }
  };

  // Authentication Routes
  app.post('/api/auth/login', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      const proxied = await proxyJsonToIdentityService(
        req,
        res,
        '/api/auth/login',
        { suppressUnavailable: !enforceIdentityBoundary }
      );
      if (proxied) {
        return;
      }
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { email, password, userType } = req.body;
      const throttleKey = getThrottleKey('user', email);
      const requestedUserType = String(userType || '').trim();
      const normalizedRequestedUserType = requestedUserType ? normalizeUserType(requestedUserType) : '';

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const throttleState = getThrottleState(throttleKey);
      if (throttleState.locked) {
        return respondLocked(res, throttleState.retryAfterSec);
      }

      const collection = db.collection('users');
      const user = await collection.findOne({ email: email.toLowerCase() });

      if (!user) {
        registerFailure(throttleKey);
        return res.status(404).json({ error: 'Account does not exist. Please sign up first.' });
      }

      if (user.authProvider === 'google' && !user.passwordHash && !user.password) {
        registerFailure(throttleKey);
        return res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
      }

      let passwordMatches = false;
      if (user.passwordHash) {
        passwordMatches = await bcrypt.compare(password, user.passwordHash);
      } else if (user.password) {
        passwordMatches = password === user.password;
        if (passwordMatches) {
          const migratedHash = await bcrypt.hash(password, 10);
          await collection.updateOne(
            { _id: user._id },
            {
              $set: { passwordHash: migratedHash, updatedAt: new Date() },
              $unset: { password: '' }
            }
          );
        }
      }

      if (!passwordMatches) {
        registerFailure(throttleKey);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (normalizedRequestedUserType) {
        const effectiveUserType = String(user.userType || user.role || 'buyer');
        if (effectiveUserType !== normalizedRequestedUserType) {
          registerFailure(throttleKey);
          return res.status(403).json({
            error: `This account does not have ${normalizedRequestedUserType} access`
          });
        }
      }

      if (!user.isActive) {
        registerFailure(throttleKey);
        return res.status(401).json({ error: 'Account is not active' });
      }

      clearThrottle(throttleKey);
      const token = createAuthToken(user);

      res.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          userType: user.userType || user.role || 'buyer',
          isActive: user.isActive
        },
        token
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      const { name, email, password, userType, profile } = req.body;
      const originalBody = req.body;

      // Temporarily modify req.body for proxying
      req.body = {
        email,
        username: email,
        password,
        role: userType || 'buyer',
        roles: [userType || 'buyer'],
        displayName: name || '',
        profile: profile || {}
      };

      const proxied = await proxyJsonToIdentityService(
        req,
        res,
        '/api/auth/register',
        { suppressUnavailable: !enforceIdentityBoundary }
      );

      // Restore original body
      req.body = originalBody;

      if (proxied) {
        return;
      }
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { name, email, password, phone, userType, profile } = req.body;
      const normalizedUserType = normalizeUserType(userType);

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
      }

      const collection = db.collection('users');
      const existingUser = await collection.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        userType: normalizedUserType,
        authProvider: 'local',
        profile: profile || {
          name,
          email: email.toLowerCase(),
          phone,
          userType: normalizedUserType
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newUser);
      const createdUser = await collection.findOne({ _id: result.insertedId });
      const token = createAuthToken(createdUser);

      res.status(201).json({
        success: true,
        user: {
          id: createdUser._id.toString(),
          email: createdUser.email,
          name: createdUser.name,
          userType: createdUser.userType,
          isActive: createdUser.isActive
        },
        token
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      return proxyJsonToIdentityService(req, res, '/api/auth/forgot-password');
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'email is required' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const collection = db.collection('users');
      const user = await collection.findOne({ email: normalizedEmail });

      if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await collection.updateOne(
          { _id: user._id },
          {
            $set: {
              resetPasswordTokenHash: tokenHash,
              resetPasswordExpiresAt: expiresAt,
              updatedAt: new Date()
            }
          }
        );

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
      console.error('Error during forgot password:', error);
      return res.status(500).json({ error: 'Failed to process forgot password request' });
    }
  });

  app.get('/api/auth/reset-password/validate', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      return proxyJsonToIdentityService(req, res, `/api/auth/reset-password/validate?token=${encodeURIComponent(req.query.token || '')}`);
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ error: 'token is required' });
      }

      const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
      const collection = db.collection('users');
      const user = await collection.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
      }

      return res.json({ success: true, message: 'Token is valid' });
    } catch (error) {
      console.error('Error validating reset token:', error);
      return res.status(500).json({ error: 'Failed to validate reset token' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      return proxyJsonToIdentityService(req, res, '/api/auth/reset-password');
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: 'token and password are required' });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
      const collection = db.collection('users');
      const user = await collection.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Reset token is invalid or expired' });
      }

      const passwordHash = await bcrypt.hash(String(password), 10);
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash,
            authProvider: user.authProvider || 'local',
            updatedAt: new Date()
          },
          $unset: {
            resetPasswordTokenHash: '',
            resetPasswordExpiresAt: '',
            password: ''
          }
        }
      );

      return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  app.post('/api/auth/change-password', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      return proxyJsonToIdentityService(req, res, '/api/auth/change-password');
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = getAuthenticatedUserId(req);
      if (!userId || String(userId).startsWith('admin:')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!ObjectId.isValid(userId)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'currentPassword and newPassword are required' });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const collection = db.collection('users');
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let matches = false;
      if (user.passwordHash) {
        matches = await bcrypt.compare(String(currentPassword), user.passwordHash);
      } else if (user.password) {
        matches = String(currentPassword) === String(user.password);
      }

      if (!matches) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(String(newPassword), 10);
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash,
            authProvider: 'local',
            updatedAt: new Date()
          },
          $unset: {
            password: ''
          }
        }
      );

      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ error: 'Failed to change password' });
    }
  });

  app.get('/api/auth/google/config', (_req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    return res.json({
      configured: Boolean(clientId),
      clientId
    });
  });

  app.post('/api/auth/google', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      if (!googleClient) {
        return res.status(500).json({ error: 'Google auth is not configured on server' });
      }

      const { credential, userType } = req.body;
      const rawRequestedUserType = String(userType || '').trim();
      const hasExplicitUserType = Boolean(rawRequestedUserType);
      const normalizedUserType = hasExplicitUserType ? normalizeUserType(rawRequestedUserType) : '';

      if (!credential) {
        return res.status(400).json({ error: 'Google credential is required' });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        return res.status(400).json({ error: 'Invalid Google token payload' });
      }
      if (payload.email_verified === false) {
        return res.status(401).json({ error: 'Google email is not verified' });
      }

      const email = payload.email.toLowerCase();

      if (IDENTITY_SERVICE_URL) {
        const identityResponse = await fetch(`${IDENTITY_SERVICE_URL}/api/auth/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: payload.name || email.split('@')[0],
            ...(hasExplicitUserType ? { userType: normalizedUserType } : {}),
            googleId: payload.sub,
            avatarUrl: payload.picture || ''
          })
        });

        const identityPayload = await identityResponse.json();
        if (!identityResponse.ok) {
          return res.status(identityResponse.status).json(identityPayload);
        }

        const delegatedUser = identityPayload.user || {};
        const delegatedRoles = Array.isArray(delegatedUser.roles) ? delegatedUser.roles : [];
        const delegatedRole =
          (hasExplicitUserType && delegatedRoles.includes(normalizedUserType) ? normalizedUserType : '') ||
          delegatedUser.role ||
          (delegatedRoles.length ? delegatedRoles[0] : '') ||
          normalizedUserType ||
          'buyer';
        return res.json({
          success: true,
          user: {
            id: delegatedUser.id || delegatedUser._id,
            email: delegatedUser.email,
            name: delegatedUser.displayName || delegatedUser.username || payload.name || '',
            userType: delegatedRole,
            isActive: delegatedUser.status !== 'inactive'
          },
          token: identityPayload.token
        });
      }

      const collection = db.collection('users');
      let user = await collection.findOne({ email });
      let effectiveUserType = normalizedUserType || 'buyer';

      if (user) {
        effectiveUserType = String(user.userType || user.role || 'buyer');

        const updates = {
          updatedAt: new Date(),
          authProvider: 'google',
          googleId: payload.sub
        };
        if (hasExplicitUserType) {
          updates.userType = normalizedUserType;
          effectiveUserType = normalizedUserType;
        }

        if (!user.profile) {
          updates.profile = {
            name: payload.name || user.name || '',
            email,
            userType: hasExplicitUserType ? normalizedUserType : effectiveUserType
          };
        } else {
          updates.profile = {
            ...user.profile,
            userType: hasExplicitUserType ? normalizedUserType : (user.profile?.userType || effectiveUserType)
          };
        }

        await collection.updateOne({ _id: user._id }, { $set: updates });
        user = await collection.findOne({ _id: user._id });
      } else {
        const nextUserType = normalizedUserType || 'buyer';
        const newUser = {
          name: payload.name || email.split('@')[0],
          email,
          phone: '',
          userType: nextUserType,
          profile: {
            name: payload.name || email.split('@')[0],
            email,
            phone: '',
            userType: nextUserType
          },
          isActive: true,
          authProvider: 'google',
          googleId: payload.sub,
          avatarUrl: payload.picture || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await collection.insertOne(newUser);
        user = await collection.findOne({ _id: result.insertedId });
        effectiveUserType = nextUserType;
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is not active' });
      }

      const token = createAuthToken(user);
      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          userType: user.userType || effectiveUserType,
          isActive: user.isActive
        },
        token
      });
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  });

  app.post('/api/auth/admin/login', async (req, res) => {
    if (!assertIdentityBoundary(res)) {
      return;
    }

    if (IDENTITY_SERVICE_URL) {
      return proxyJsonToIdentityService(req, res, '/api/auth/admin/login');
    }

    try {
      const { username, password } = req.body;
      const throttleKey = getThrottleKey('admin', username);

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      const throttleState = getThrottleState(throttleKey);
      if (throttleState.locked) {
        return respondLocked(res, throttleState.retryAfterSec);
      }
      if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        return res.status(500).json({ error: 'Admin login is not configured on server' });
      }
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        registerFailure(throttleKey);
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      clearThrottle(throttleKey);
      const token = jwt.sign(
        {
          sub: `admin:${ADMIN_USERNAME}`,
          email: `${ADMIN_USERNAME}@admin.local`,
          userType: 'admin'
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        user: {
          id: `admin:${ADMIN_USERNAME}`,
          username: ADMIN_USERNAME,
          userType: 'admin'
        },
        token
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      return res.status(500).json({ error: 'Failed to login admin user' });
    }
  });
};

module.exports = registerAuthRoutes;
