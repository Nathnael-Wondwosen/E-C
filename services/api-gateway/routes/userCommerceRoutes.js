const registerUserCommerceRoutes = ({
  app,
  getDb,
  middleware,
  ObjectId,
  deps = {}
}) => {
  const {
    authenticateToken,
    requireSelfOrAdmin
  } = middleware;
  const {
    identityServiceUrl = '',
    proxyJsonToIdentityService,
    enforceIdentityBoundary = false
  } = deps;

  const delegateProfileRoute = (req, res) => {
    if (identityServiceUrl && typeof proxyJsonToIdentityService === 'function') {
      return proxyJsonToIdentityService(req, res, `/api/users/${req.params.id}`);
    }

    if (enforceIdentityBoundary) {
      return res.status(503).json({
        error: 'Identity service is required for user profile routes. Configure IDENTITY_SERVICE_URL.'
      });
    }

    return null;
  };

  // Get User Profile
  app.get('/api/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    const delegated = delegateProfileRoute(req, res);
    if (delegated) {
      return delegated;
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
    const delegated = delegateProfileRoute(req, res);
    if (delegated) {
      return delegated;
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
