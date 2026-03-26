const registerUserCommerceRoutes = ({
  app,
  getDb,
  middleware,
  ObjectId,
  deps = {}
}) => {
  const {
    authenticateToken,
    requireSelfOrAdmin,
    requireAdmin
  } = middleware;
  const {
    identityServiceUrl = '',
    proxyJsonToIdentityService,
    enforceIdentityBoundary = false
  } = deps;

  const delegateProfileRoute = async (req, res) => {
    if (identityServiceUrl && typeof proxyJsonToIdentityService === 'function') {
      const proxied = await proxyJsonToIdentityService(
        req,
        res,
        `/api/users/${req.params.id}`,
        { suppressUnavailable: !enforceIdentityBoundary }
      );
      if (proxied) {
        return true;
      }
    }

    if (enforceIdentityBoundary) {
      res.status(503).json({
        error: 'Identity service is required for user profile routes. Configure IDENTITY_SERVICE_URL.'
      });
      return true;
    }

    return false;
  };

  const buildUserSummaryMap = async (db, userIds = []) => {
    const uniqueIds = [...new Set((userIds || []).map((value) => String(value || '')).filter(Boolean))];
    if (!uniqueIds.length) return {};

    const objectIds = uniqueIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    const users = await db.collection('users').find({
      $or: [
        { _id: { $in: objectIds } },
        { id: { $in: uniqueIds } }
      ]
    }).toArray();

    const summaryMap = {};
    users.forEach((user) => {
      const key = String(user?._id?.toString?.() || user?.id || '');
      if (!key) return;
      summaryMap[key] = {
        id: key,
        name: user?.profile?.name || user?.name || '',
        email: user?.email || user?.profile?.email || '',
        phone: user?.profile?.phone || '',
        userType: user?.userType || ''
      };
    });
    return summaryMap;
  };

  // Get User Profile
  app.get('/api/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    const delegated = await delegateProfileRoute(req, res);
    if (delegated) {
      return;
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const collection = db.collection('users');

      const user = await collection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        userType: user.userType,
        isActive: user.isActive,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Update User Profile
  app.put('/api/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    const delegated = await delegateProfileRoute(req, res);
    if (delegated) {
      return;
    }

    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const updateData = req.body;

      const collection = db.collection('users');

      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });

      res.json({
        success: true,
        user: {
          id: updatedUser._id.toString(),
          email: updatedUser.email,
          name: updatedUser.name,
          userType: updatedUser.userType,
          isActive: updatedUser.isActive,
          profile: updatedUser.profile,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // Get User Cart
  app.get('/api/users/:id/cart', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const collection = db.collection('carts');

      let cart = await collection.findOne({ userId: userId });

      if (!cart) {
        cart = {
          userId: userId,
          items: [],
          total: 0,
          count: 0
        };
      }

      res.json(cart);
    } catch (error) {
      console.error('Error fetching user cart:', error);
      res.status(500).json({ error: 'Failed to fetch user cart' });
    }
  });

  // Add to User Cart
  app.post('/api/users/:id/cart', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const { productId, quantity } = req.body;
      const normalizedProductId = String(productId || '');
      const parsedQuantity = Math.max(1, Number(quantity) || 1);

      if (!normalizedProductId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const collection = db.collection('carts');
      let cart = await collection.findOne({ userId: userId });

      if (!cart) {
        cart = {
          userId: userId,
          items: [{
            productId: normalizedProductId,
            quantity: parsedQuantity
          }],
          total: 0,
          count: parsedQuantity
        };

        await collection.insertOne(cart);
      } else {
        const existingItemIndex = cart.items.findIndex((item) => String(item.productId) === normalizedProductId);

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += parsedQuantity;
        } else {
          cart.items.push({
            productId: normalizedProductId,
            quantity: parsedQuantity
          });
        }

        cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        await collection.updateOne(
          { userId: userId },
          { $set: cart }
        );
      }

      res.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  });

  // Remove from User Cart
  app.delete('/api/users/:id/cart/:productId', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const productId = String(req.params.productId || '');

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const collection = db.collection('carts');
      let cart = await collection.findOne({ userId: userId });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter((item) => String(item.productId) !== productId);
      cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      await collection.updateOne(
        { userId: userId },
        { $set: cart }
      );

      res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  });

  // Update User Cart Item Quantity
  app.put('/api/users/:id/cart/:productId', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const productId = String(req.params.productId || '');
      const requestedQuantity = Number(req.body?.quantity);

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      if (!Number.isFinite(requestedQuantity)) {
        return res.status(400).json({ error: 'quantity is required and must be a number' });
      }

      const collection = db.collection('carts');
      let cart = await collection.findOne({ userId: userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex((item) => String(item.productId) === productId);
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      const safeQuantity = Math.max(0, Math.floor(requestedQuantity));
      if (safeQuantity === 0) {
        cart.items = cart.items.filter((item) => String(item.productId) !== productId);
      } else {
        cart.items[itemIndex].quantity = safeQuantity;
      }

      cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      await collection.updateOne(
        { userId: userId },
        { $set: cart }
      );

      return res.json({ success: true, message: 'Cart quantity updated' });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return res.status(500).json({ error: 'Failed to update cart quantity' });
    }
  });

  // Get User Wishlist
  app.get('/api/users/:id/wishlist', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const collection = db.collection('wishlists');

      let wishlist = await collection.findOne({ userId: userId });

      if (!wishlist) {
        wishlist = {
          userId: userId,
          items: []
        };
      }

      res.json(wishlist);
    } catch (error) {
      console.error('Error fetching user wishlist:', error);
      res.status(500).json({ error: 'Failed to fetch user wishlist' });
    }
  });

  // Add to User Wishlist
  app.post('/api/users/:id/wishlist', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const { productId } = req.body;
      const normalizedProductId = String(productId || '');

      if (!normalizedProductId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const collection = db.collection('wishlists');
      let wishlist = await collection.findOne({ userId: userId });

      if (!wishlist) {
        wishlist = {
          userId: userId,
          items: [normalizedProductId]
        };

        await collection.insertOne(wishlist);
      } else if (!wishlist.items.map((item) => String(item)).includes(normalizedProductId)) {
        wishlist.items.push(normalizedProductId);

        await collection.updateOne(
          { userId: userId },
          { $set: { items: wishlist.items } }
        );
      }

      res.json({ success: true, message: 'Item added to wishlist' });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
  });

  // Remove from User Wishlist
  app.delete('/api/users/:id/wishlist/:productId', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const productId = String(req.params.productId || '');

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const collection = db.collection('wishlists');
      let wishlist = await collection.findOne({ userId: userId });

      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
      }

      wishlist.items = wishlist.items.filter((item) => String(item) !== productId);

      await collection.updateOne(
        { userId: userId },
        { $set: { items: wishlist.items } }
      );

      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
  });

  // Create Product Inquiry (buyer -> product owner/supplier)
  app.post('/api/product-inquiries', authenticateToken, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const buyerUserId = String(req.auth?.sub || '');
      const {
        productId,
        quantity,
        message = '',
        supplierId: explicitSupplierId = ''
      } = req.body || {};

      const normalizedProductId = String(productId || '');
      if (!normalizedProductId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      const productsCollection = db.collection('products');
      let product = null;
      try {
        if (ObjectId.isValid(normalizedProductId)) {
          product = await productsCollection.findOne({ _id: new ObjectId(normalizedProductId) });
        }
      } catch (_error) {
        product = null;
      }
      if (!product) {
        product = await productsCollection.findOne({
          $or: [{ id: normalizedProductId }, { _id: normalizedProductId }]
        });
      }
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const inferredSupplierId = String(
        explicitSupplierId ||
        product.supplierId ||
        product.companyId ||
        product.ownerId ||
        product.sellerId ||
        product.createdBy ||
        ''
      );
      if (!inferredSupplierId) {
        return res.status(400).json({
          error: 'This product is missing owner mapping (supplierId/companyId). Please update product ownership.'
        });
      }
      if (inferredSupplierId === buyerUserId) {
        return res.status(400).json({ error: 'You cannot send an inquiry to your own product.' });
      }

      const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
      const safeMessage = String(message || '').trim();
      if (!safeMessage) {
        return res.status(400).json({ error: 'Inquiry message is required' });
      }

      const now = new Date();
      const inquiriesCollection = db.collection('product_inquiries');
      const inquiryDoc = {
        productId: normalizedProductId,
        productName: String(product.name || ''),
        fromUserId: buyerUserId,
        toUserId: inferredSupplierId,
        quantity: safeQuantity,
        message: safeMessage,
        status: 'new',
        createdAt: now,
        updatedAt: now
      };
      const insertResult = await inquiriesCollection.insertOne(inquiryDoc);

      return res.status(201).json({
        success: true,
        message: 'Inquiry sent to supplier',
        inquiry: {
          id: insertResult.insertedId.toString(),
          ...inquiryDoc
        }
      });
    } catch (error) {
      console.error('Error creating product inquiry:', error);
      return res.status(500).json({ error: 'Failed to send inquiry' });
    }
  });

  // Get received product inquiries for a user (supplier inbox)
  app.get('/api/users/:id/inquiries/inbox', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = String(req.params.id || '');
      const inquiries = await db.collection('product_inquiries')
        .find({ toUserId: userId })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      const buyerMap = await buildUserSummaryMap(db, inquiries.map((row) => row.fromUserId));
      return res.json({
        inquiries: inquiries.map((row) => {
          const rowId = row?._id?.toString?.() || row.id;
          const buyerId = String(row?.fromUserId || '');
          return {
            ...row,
            id: rowId,
            fromUserId: buyerId,
            buyer: buyerMap[buyerId] || { id: buyerId, name: '', email: '' }
          };
        })
      });
    } catch (error) {
      console.error('Error fetching inquiry inbox:', error);
      return res.status(500).json({ error: 'Failed to fetch inquiry inbox' });
    }
  });

  // Get sent product inquiries for a user (buyer outbox)
  app.get('/api/users/:id/inquiries/sent', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = String(req.params.id || '');
      const inquiries = await db.collection('product_inquiries')
        .find({ fromUserId: userId })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      const sellerMap = await buildUserSummaryMap(db, inquiries.map((row) => row.toUserId));
      return res.json({
        inquiries: inquiries.map((row) => {
          const rowId = row?._id?.toString?.() || row.id;
          const sellerId = String(row?.toUserId || '');
          return {
            ...row,
            id: rowId,
            toUserId: sellerId,
            seller: sellerMap[sellerId] || { id: sellerId, name: '', email: '' }
          };
        })
      });
    } catch (error) {
      console.error('Error fetching sent inquiries:', error);
      return res.status(500).json({ error: 'Failed to fetch sent inquiries' });
    }
  });

  // Update inquiry status (seller/inquiry receiver management)
  app.put('/api/users/:id/inquiries/:inquiryId/status', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = String(req.params.id || '');
      const inquiryId = String(req.params.inquiryId || '');
      const nextStatus = String(req.body?.status || '').trim().toLowerCase();
      const allowedStatuses = new Set(['new', 'contacted', 'closed']);

      if (!inquiryId) {
        return res.status(400).json({ error: 'inquiryId is required' });
      }
      if (!allowedStatuses.has(nextStatus)) {
        return res.status(400).json({ error: 'status must be one of: new, contacted, closed' });
      }

      const inquiriesCollection = db.collection('product_inquiries');
      const lookupFilter = ObjectId.isValid(inquiryId)
        ? { _id: new ObjectId(inquiryId) }
        : { $or: [{ _id: inquiryId }, { id: inquiryId }] };
      const inquiry = await inquiriesCollection.findOne(lookupFilter);
      if (!inquiry) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      const isAdmin = req.auth?.userType === 'admin';
      const inquiryReceiverId = String(inquiry.toUserId || '');
      if (!isAdmin && inquiryReceiverId !== userId) {
        return res.status(403).json({ error: 'Forbidden: only inquiry receiver can update status' });
      }

      await inquiriesCollection.updateOne(
        { _id: inquiry._id },
        {
          $set: {
            status: nextStatus,
            updatedAt: new Date()
          }
        }
      );

      const updated = await inquiriesCollection.findOne({ _id: inquiry._id });
      return res.json({
        success: true,
        message: 'Inquiry status updated',
        inquiry: {
          ...updated,
          id: updated?._id?.toString?.() || updated?.id
        }
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return res.status(500).json({ error: 'Failed to update inquiry status' });
    }
  });

  // Admin: list/manage users across legacy and identity collections
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const search = String(req.query.search || '').trim().toLowerCase();
      const roleFilter = String(req.query.role || '').trim().toLowerCase();
      const statusFilter = String(req.query.status || '').trim().toLowerCase();
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

      const normalizeLegacyUser = (row) => {
        const role = String(row?.userType || row?.role || 'buyer').toLowerCase();
        const status = row?.isActive === false ? 'inactive' : 'active';
        return {
          id: row?._id?.toString?.() || row?.id || '',
          source: 'users',
          email: String(row?.email || '').toLowerCase(),
          name: row?.name || row?.profile?.name || '',
          role,
          status,
          phone: row?.profile?.phone || row?.phone || '',
          createdAt: row?.createdAt || null,
          updatedAt: row?.updatedAt || null
        };
      };

      const normalizeIdentityUser = (row) => {
        const role = String(row?.role || (Array.isArray(row?.roles) ? row.roles[0] : 'buyer') || 'buyer').toLowerCase();
        const status = String(row?.status || 'active').toLowerCase();
        return {
          id: row?._id?.toString?.() || row?.id || '',
          source: 'identityusers',
          email: String(row?.email || '').toLowerCase(),
          name: row?.displayName || row?.profile?.name || '',
          role,
          status,
          phone: row?.profile?.phone || '',
          createdAt: row?.createdAt || null,
          updatedAt: row?.updatedAt || null
        };
      };

      const [legacyRows, identityRows] = await Promise.all([
        db.collection('users').find({}, {
          projection: { _id: 1, id: 1, email: 1, name: 1, userType: 1, role: 1, isActive: 1, profile: 1, phone: 1, createdAt: 1, updatedAt: 1 }
        }).toArray(),
        db.collection('identityusers').find({}, {
          projection: { _id: 1, id: 1, email: 1, displayName: 1, role: 1, roles: 1, status: 1, profile: 1, createdAt: 1, updatedAt: 1 }
        }).toArray()
      ]);

      const mergedByEmail = new Map();
      legacyRows.map(normalizeLegacyUser).forEach((row) => {
        const key = row.email || `legacy:${row.id}`;
        mergedByEmail.set(key, row);
      });
      identityRows.map(normalizeIdentityUser).forEach((row) => {
        const key = row.email || `identity:${row.id}`;
        const existing = mergedByEmail.get(key);
        if (!existing) {
          mergedByEmail.set(key, row);
          return;
        }
        mergedByEmail.set(key, {
          ...existing,
          id: row.id || existing.id,
          source: existing.source === row.source ? existing.source : 'both',
          name: row.name || existing.name,
          role: row.role || existing.role,
          status: row.status || existing.status,
          phone: row.phone || existing.phone,
          updatedAt: row.updatedAt || existing.updatedAt
        });
      });

      let rows = [...mergedByEmail.values()];
      if (search) {
        rows = rows.filter((row) =>
          String(row.email || '').includes(search) ||
          String(row.name || '').toLowerCase().includes(search) ||
          String(row.phone || '').includes(search)
        );
      }
      if (roleFilter) {
        rows = rows.filter((row) => String(row.role || '').toLowerCase() === roleFilter);
      }
      if (statusFilter) {
        rows = rows.filter((row) => String(row.status || '').toLowerCase() === statusFilter);
      }

      rows.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      const roleSummary = rows.reduce((acc, row) => {
        const key = String(row?.role || '').toLowerCase();
        if (key) {
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});
      const statusSummary = rows.reduce((acc, row) => {
        const key = String(row?.status || '').toLowerCase();
        if (key) {
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});

      const total = rows.length;
      const start = (page - 1) * limit;
      const items = rows.slice(start, start + limit);
      return res.json({
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        summary: {
          roles: roleSummary,
          statuses: statusSummary
        }
      });
    } catch (error) {
      console.error('Error listing admin users:', error);
      return res.status(500).json({ error: 'Failed to list users' });
    }
  });

  app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = String(req.params.id || '');
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const nextRoleRaw = String(req.body?.role || '').trim().toLowerCase();
      const nextStatusRaw = String(req.body?.status || '').trim().toLowerCase();
      const nextNameRaw = String(req.body?.name || '').trim();
      const nextEmailRaw = String(req.body?.email || '').trim().toLowerCase();
      const nextPhoneRaw = String(req.body?.phone || '').trim();
      const allowedRoles = new Set(['buyer', 'seller', 'admin']);
      const allowedStatuses = new Set(['active', 'inactive']);
      const shouldUpdateRole = !!nextRoleRaw;
      const shouldUpdateStatus = !!nextStatusRaw;
      const shouldUpdateName = !!nextNameRaw;
      const shouldUpdateEmail = !!nextEmailRaw;
      const shouldUpdatePhone = req.body && Object.prototype.hasOwnProperty.call(req.body, 'phone');

      if (!shouldUpdateRole && !shouldUpdateStatus && !shouldUpdateName && !shouldUpdateEmail && !shouldUpdatePhone) {
        return res.status(400).json({ error: 'Provide at least one editable field: role, status, name, email, or phone' });
      }
      if (shouldUpdateRole && !allowedRoles.has(nextRoleRaw)) {
        return res.status(400).json({ error: 'role must be buyer, seller, or admin' });
      }
      if (shouldUpdateStatus && !allowedStatuses.has(nextStatusRaw)) {
        return res.status(400).json({ error: 'status must be active or inactive' });
      }
      if (shouldUpdateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmailRaw)) {
        return res.status(400).json({ error: 'email is invalid' });
      }

      const usersCollection = db.collection('users');
      const identityCollection = db.collection('identityusers');
      const objectIdFilter = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : null;
      const anyIdFilter = objectIdFilter || { _id: userId };

      const [legacyUser, identityUser] = await Promise.all([
        usersCollection.findOne(anyIdFilter),
        identityCollection.findOne(anyIdFilter)
      ]);

      if (!legacyUser && !identityUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingEmail = String(legacyUser?.email || identityUser?.email || '').toLowerCase();
      const nextEmail = shouldUpdateEmail ? nextEmailRaw : existingEmail;
      if (nextEmail) {
        const emailConflictFilter = {
          email: nextEmail,
          ...(legacyUser?._id ? { _id: { $ne: legacyUser._id } } : {})
        };
        const conflictInUsers = await usersCollection.findOne(emailConflictFilter, { projection: { _id: 1 } });
        if (conflictInUsers) {
          return res.status(409).json({ error: 'Another user already uses this email' });
        }

        const identityConflictFilter = {
          email: nextEmail,
          ...(identityUser?._id ? { _id: { $ne: identityUser._id } } : {})
        };
        const conflictInIdentity = await identityCollection.findOne(identityConflictFilter, { projection: { _id: 1 } });
        if (conflictInIdentity) {
          return res.status(409).json({ error: 'Another user already uses this email' });
        }
      }

      const legacyFilter = legacyUser ? { _id: legacyUser._id } : (existingEmail ? { email: existingEmail } : null);
      const identityFilter = identityUser ? { _id: identityUser._id } : (existingEmail ? { email: existingEmail } : null);
      const resolvedLegacyFilter = legacyFilter || (existingEmail ? { email: existingEmail } : null);
      const resolvedIdentityFilter = identityFilter || (existingEmail ? { email: existingEmail } : null);

      const now = new Date();
      if (resolvedLegacyFilter) {
        const legacySet = {
          ...(shouldUpdateRole ? { userType: nextRoleRaw, role: nextRoleRaw } : {}),
          ...(shouldUpdateStatus ? { isActive: nextStatusRaw === 'active' } : {}),
          ...(shouldUpdateName ? { name: nextNameRaw } : {}),
          ...(shouldUpdateEmail ? { email: nextEmail } : {}),
          ...(shouldUpdatePhone ? { phone: nextPhoneRaw, 'profile.phone': nextPhoneRaw } : {}),
          ...(shouldUpdateName ? { 'profile.name': nextNameRaw } : {}),
          ...(shouldUpdateEmail ? { 'profile.email': nextEmail } : {}),
          updatedAt: now
        };

        const legacyUpdate = {
          $set: legacySet
        };
        await usersCollection.updateMany(resolvedLegacyFilter, legacyUpdate);
      }

      if (resolvedIdentityFilter) {
        const identitySet = {
          ...(shouldUpdateRole ? { role: nextRoleRaw, roles: [nextRoleRaw] } : {}),
          ...(shouldUpdateStatus ? { status: nextStatusRaw } : {}),
          ...(shouldUpdateName ? { displayName: nextNameRaw } : {}),
          ...(shouldUpdateEmail ? { email: nextEmail } : {}),
          ...(shouldUpdatePhone ? { 'profile.phone': nextPhoneRaw } : {}),
          ...(shouldUpdateName ? { 'profile.name': nextNameRaw } : {}),
          updatedAt: now
        };
        await identityCollection.updateMany(resolvedIdentityFilter, { $set: identitySet });
      }

      return res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating admin user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = String(req.params.id || '');
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const usersCollection = db.collection('users');
      const identityCollection = db.collection('identityusers');
      const objectIdFilter = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : null;
      const anyIdFilter = objectIdFilter || { _id: userId };

      const [legacyUser, identityUser] = await Promise.all([
        usersCollection.findOne(anyIdFilter),
        identityCollection.findOne(anyIdFilter)
      ]);

      if (!legacyUser && !identityUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetEmail = String(legacyUser?.email || identityUser?.email || '').toLowerCase();
      const authSub = String(req.auth?.sub || '');
      const authEmail = String(req.auth?.email || '').toLowerCase();
      const targetIds = [
        String(legacyUser?._id?.toString?.() || ''),
        String(identityUser?._id?.toString?.() || '')
      ].filter(Boolean);
      if (targetIds.includes(authSub) || (targetEmail && authEmail && targetEmail === authEmail)) {
        return res.status(400).json({ error: 'You cannot delete your own admin account' });
      }

      const deleteFilters = [];
      if (legacyUser?._id) deleteFilters.push({ _id: legacyUser._id });
      if (identityUser?._id) deleteFilters.push({ _id: identityUser._id });
      if (targetEmail) deleteFilters.push({ email: targetEmail });
      if (!deleteFilters.length) {
        return res.status(400).json({ error: 'Unable to resolve user delete filter' });
      }
      const mergedFilter = { $or: deleteFilters };

      const [legacyDelete, identityDelete] = await Promise.all([
        usersCollection.deleteMany(mergedFilter),
        identityCollection.deleteMany(mergedFilter)
      ]);

      return res.json({
        success: true,
        message: 'User deleted successfully',
        deleted: {
          users: legacyDelete.deletedCount || 0,
          identityusers: identityDelete.deletedCount || 0
        }
      });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Get User Orders
  app.get('/api/users/:id/orders', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const collection = db.collection('orders');

      const orders = await collection.find({ userId: userId }).sort({ createdAt: -1 }).toArray();

      res.json({ orders });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  });

  // Get User Order by ID
  app.get('/api/users/:id/orders/:orderId', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const orderId = req.params.orderId;

      const collection = db.collection('orders');
      let order;
      try {
        order = await collection.findOne({
          userId: userId,
          _id: new ObjectId(orderId)
        });
      } catch (objectIdError) {
        order = await collection.findOne({
          userId: userId,
          _id: orderId
        });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        id: order._id.toString(),
        userId: order.userId,
        orderNumber: order.orderNumber,
        items: order.items,
        shippingInfo: order.shippingInfo,
        paymentMethod: order.paymentMethod,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  // Create User Order
  app.post('/api/users/:id/orders', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const userId = req.params.id;
      const orderData = req.body;

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      if (!orderData.shippingInfo) {
        return res.status(400).json({ error: 'Shipping information is required' });
      }

      if (orderData.total === undefined) {
        return res.status(400).json({ error: 'Order total is required' });
      }

      const collection = db.collection('orders');
      const newOrder = {
        userId: userId,
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        items: orderData.items,
        shippingInfo: orderData.shippingInfo,
        paymentMethod: orderData.paymentMethod || 'Credit Card',
        total: orderData.total,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newOrder);

      const cartCollection = db.collection('carts');
      await cartCollection.updateOne(
        { userId: userId },
        { $set: { items: [], count: 0 } },
        { upsert: true }
      );

      res.status(201).json({
        success: true,
        order: {
          id: result.insertedId.toString(),
          ...newOrder
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });
};

module.exports = registerUserCommerceRoutes;
