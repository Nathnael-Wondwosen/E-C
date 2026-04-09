// services/api-gateway/services/OrderService.js
// Business logic for order operations

const { ApiError } = require('../middleware/errorHandler');

class OrderService {
  constructor(orderRepository, productRepository, userRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
  }

  /**
   * Create new order with inventory validation
   */
  async createOrder(userId, orderData) {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 'USER_NOT_FOUND', 404);
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new ApiError('Order must contain items', 'VALIDATION_ERROR', 400);
    }

    // Validate inventory for each item
    for (const item of orderData.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ApiError(
          `Product ${item.productId} not found`,
          'PRODUCT_NOT_FOUND',
          404
        );
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          `Insufficient stock for ${product.name}`,
          'INSUFFICIENT_STOCK',
          400
        );
      }
    }

    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Number(orderData.tax ?? (subtotal * 0.15));
    const shippingPayload = orderData.shippingInfo || orderData.shippingAddress || {};
    const shipping = shippingPayload.country === 'Local' ? 0 : Number(orderData.shipping ?? 15);
    const total = subtotal + tax + shipping;

    // Create order
    const order = await this.orderRepository.create({
      userId,
      orderNumber: this.generateOrderNumber(),
      items: orderData.items,
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: shippingPayload,
      shippingInfo: shippingPayload,
      paymentMethod: orderData.paymentMethod || '',
      notes: orderData.notes || ''
    });

    return this.normalizeOrder(order);
  }

  /**
   * List orders for user with filtering
   */
  async getUserOrders(userId, { page = 1, limit = 10, status = null } = {}) {
    const query = { userId };
    if (status) query.status = status;

    return this.orderRepository.find(query, {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    // Enrich with product details
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        return {
          ...item,
          product: product ? { id: product._id, name: product.name } : null
        };
      })
    );

    return this.normalizeOrder({ ...order, items: enrichedItems });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 'VALIDATION_ERROR', 400);
    }

    const order = await this.orderRepository.updateById(orderId, { status });
    if (!order) {
      throw new ApiError('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    return this.normalizeOrder(order);
  }

  /**
   * Get orders by scope (admin)
   */
  async getOrdersByScope(scope, { page = 1, limit = 20 } = {}) {
    const query = { scope };
    return this.orderRepository.find(query, {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 20)),
      sort: { createdAt: -1 }
    });
  }

  /**
   * Create order from user's cart
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data (shipping address, notes)
   * @param {Object} cartRepository - Cart repository instance
   * @returns {Promise}
   */
  async createOrderFromCart(userId, orderData, cartRepository) {
    try {
      // Get user's cart
      const cart = await cartRepository.findByUserId(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new ApiError('Cart is empty', 400);
      }

      // Validate all cart items
      const validatedItems = [];
      for (const cartItem of cart.items) {
        const product = await this.productRepository.findById(cartItem.productId);
        if (!product) {
          throw new ApiError(`Product ${cartItem.productId} not found`, 404);
        }
        if (product.stock < cartItem.quantity) {
          throw new ApiError(`Insufficient stock for ${product.name}`, 400);
        }

        validatedItems.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: product.price,
          name: product.name
        });
      }

      // Calculate totals
      const subtotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingPayload = orderData.shippingInfo || orderData.shippingAddress || {};
      const tax = Number(orderData.tax ?? (subtotal * 0.15));
      const shipping = (shippingPayload.country === 'Local') ? 0 : Number(orderData.shipping ?? 15);
      const total = subtotal + tax + shipping;

      // Create order
      const order = await this.orderRepository.create({
        userId,
        orderNumber: this.generateOrderNumber(),
        items: validatedItems,
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: shippingPayload,
        shippingInfo: shippingPayload,
        paymentMethod: orderData.paymentMethod || '',
        notes: orderData.notes || '',
        createdAt: new Date()
      });

      // Clear the cart
      await cartRepository.clearCart(userId);

      return {
        success: true,
        order: this.normalizeOrder(order),
        message: 'Order created successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to create order from cart: ${error.message}`, 500);
    }
  }

  /**
   * Get order statistics
   */
  async getStats(scope = null) {
    const match = {};
    if (scope) match.scope = scope;

    const stats = await this.orderRepository.collection
      .aggregate([
        { $match: match },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ],
            revenue: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$total' },
                  avgOrderValue: { $avg: '$total' }
                }
              }
            ],
            thisMonth: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                }
              },
              { $count: 'count' }
            ]
          }
        }
      ])
      .toArray();

    return stats[0] || {};
  }

  // Helper methods

  generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  normalizeOrder(order) {
    if (!order) return null;
    const shippingInfo = order.shippingInfo || order.shippingAddress || {};
    return {
      id: order._id?.toString?.() || order._id,
      ...order,
      shippingInfo,
      shippingAddress: shippingInfo,
      _id: undefined
    };
  }
}

module.exports = OrderService;
