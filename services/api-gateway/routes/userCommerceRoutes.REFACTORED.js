const { asyncHandler } = require('../middleware/errorHandler');

const normalizeOrderDocument = (order) => {
  if (!order) return null;
  const normalized = { ...order };
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id.toString();
  }
  delete normalized._id;
  return normalized;
};

module.exports = ({ app, middleware, services }) => {
  const { authenticateToken, requireSelfOrAdmin, requireAdmin } = middleware;
  const { user, cart, wishlist, inquiry, admin, order } = services;

  app.get('/api/users/:id', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await user.getUserProfile(req.params.id));
  }));

  app.put('/api/users/:id', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await user.updateUserProfile(req.params.id, req.body));
  }));

  app.get('/api/users/:id/cart', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await cart.getUserCart(req.params.id));
  }));

  app.post('/api/users/:id/cart', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body || {};
    res.json(await cart.addToCart(req.params.id, productId, quantity));
  }));

  app.put('/api/users/:id/cart/:productId', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await cart.updateCartItem(req.params.id, req.params.productId, req.body?.quantity));
  }));

  app.delete('/api/users/:id/cart/:productId', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await cart.removeFromCart(req.params.id, req.params.productId));
  }));

  app.get('/api/users/:id/wishlist', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await wishlist.getUserWishlist(req.params.id));
  }));

  app.post('/api/users/:id/wishlist', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await wishlist.addToWishlist(req.params.id, req.body?.productId));
  }));

  app.delete('/api/users/:id/wishlist/:productId', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await wishlist.removeFromWishlist(req.params.id, req.params.productId));
  }));

  app.post('/api/product-inquiries', authenticateToken, asyncHandler(async (req, res) => {
    const result = await inquiry.createInquiry({
      ...req.body,
      buyerId: String(req.auth?.sub || '')
    });
    res.status(201).json(result);
  }));

  app.get('/api/users/:id/inquiries/inbox', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await inquiry.getInboxInquiries(req.params.id));
  }));

  app.get('/api/users/:id/inquiries/sent', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await inquiry.getSentInquiries(req.params.id));
  }));

  app.get('/api/users/:id/inquiries/stream', authenticateToken, requireSelfOrAdmin, (req, res) => {
    const requestedMode = String(req.query?.mode || '').toLowerCase();
    const authUserType = String(req.auth?.userType || req.auth?.role || '').toLowerCase();
    const defaultMode = authUserType === 'seller' ? 'inbox' : 'sent';
    const mode = requestedMode === 'inbox' || requestedMode === 'sent' ? requestedMode : defaultMode;
    const userId = String(req.params.id || '').trim();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    let closed = false;
    let inFlight = false;
    let lastSignature = '';

    const sendEvent = (eventName, payload) => {
      if (closed) return;
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const sendComment = (comment) => {
      if (closed) return;
      res.write(`: ${comment}\n\n`);
    };

    const getSnapshot = async () => {
      const result = mode === 'inbox'
        ? await inquiry.getInboxInquiries(userId)
        : await inquiry.getSentInquiries(userId);

      const inquiries = Array.isArray(result?.inquiries) ? result.inquiries : [];
      const latestUpdatedAt = inquiries.reduce((latest, item) => {
        const stamp = item?.updatedAt || item?.createdAt || '';
        if (!stamp) return latest;
        return String(stamp) > String(latest) ? String(stamp) : latest;
      }, '');
      const unreadTotal = Number(
        result?.unreadTotal ?? inquiries.reduce((sum, row) => sum + Number(row?.unreadCount || 0), 0)
      );
      const total = Number(result?.total ?? inquiries.length);
      const signature = `${total}|${unreadTotal}|${latestUpdatedAt}`;

      return {
        mode,
        total,
        unreadTotal,
        latestUpdatedAt: latestUpdatedAt || null,
        signature,
        serverTime: new Date().toISOString()
      };
    };

    const poll = async () => {
      if (closed || inFlight) return;
      inFlight = true;
      try {
        const snapshot = await getSnapshot();
        if (snapshot.signature !== lastSignature) {
          lastSignature = snapshot.signature;
          sendEvent('snapshot', snapshot);
        } else {
          sendComment('heartbeat');
        }
      } catch (error) {
        sendEvent('error', {
          message: 'stream_poll_failed',
          detail: String(error?.message || 'unknown'),
          serverTime: new Date().toISOString()
        });
      } finally {
        inFlight = false;
      }
    };

    poll();
    const pollTimer = setInterval(poll, 5000);
    const heartbeatTimer = setInterval(() => sendComment('keepalive'), 20000);

    const cleanup = () => {
      if (closed) return;
      closed = true;
      clearInterval(pollTimer);
      clearInterval(heartbeatTimer);
      try {
        res.end();
      } catch (error) {
        // ignore close errors
      }
    };

    req.on('close', cleanup);
    req.on('aborted', cleanup);
  });

  app.put('/api/users/:id/inquiries/:inquiryId/status', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.json(await inquiry.updateInquiryStatus(req.params.inquiryId, req.params.id, req.body?.status));
  }));

  app.put('/api/product-inquiries/:id/status', authenticateToken, asyncHandler(async (req, res) => {
    res.json(await inquiry.updateInquiryStatus(req.params.id, String(req.auth?.sub || ''), req.body?.status));
  }));

  app.post('/api/product-inquiries/:id/messages', authenticateToken, asyncHandler(async (req, res) => {
    res.json(await inquiry.addInquiryMessage(req.params.id, String(req.auth?.sub || ''), req.body?.message));
  }));

  app.post('/api/product-inquiries/:id/read', authenticateToken, asyncHandler(async (req, res) => {
    res.json(await inquiry.markInquiryAsRead(req.params.id, String(req.auth?.sub || '')));
  }));

  app.get('/api/users/:id/orders', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    const result = await order.getUserOrders(req.params.id, req.query || {});
    res.json({
      orders: Array.isArray(result?.documents) ? result.documents.map(normalizeOrderDocument) : [],
      total: result?.total || 0,
      page: result?.page || 1,
      limit: result?.limit || 10,
      totalPages: result?.pages || 1
    });
  }));

  app.get('/api/users/:id/orders/:orderId', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    const orderDetails = await order.getOrder(req.params.orderId);
    if (String(orderDetails?.userId || '') !== String(req.params.id)) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(normalizeOrderDocument(orderDetails));
  }));

  app.get('/api/orders/:id', authenticateToken, asyncHandler(async (req, res) => {
    res.json(normalizeOrderDocument(await order.getOrder(req.params.id)));
  }));

  app.post('/api/users/:id/orders', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    res.status(201).json(await order.createOrderFromCart(req.params.id, req.body || {}, services.repositories.cartRepository));
  }));

  app.get('/api/admin/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const result = await admin.getAllUsers(req.query || {});
    const items = Array.isArray(result?.users) ? result.users : [];
    const summary = {
      roles: items.reduce((acc, item) => {
        const key = String(item.userType || 'unknown');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      statuses: items.reduce((acc, item) => {
        const key = item.isActive ? 'active' : 'inactive';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      items,
      total: result?.total || items.length,
      page: result?.page || 1,
      limit: result?.limit || items.length,
      totalPages: 1,
      summary
    });
  }));

  app.put('/api/admin/users/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    res.json(await admin.updateUser(req.params.id, req.body || {}));
  }));

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    res.json(await admin.deleteUser(String(req.auth?.sub || ''), req.params.id));
  }));
};
