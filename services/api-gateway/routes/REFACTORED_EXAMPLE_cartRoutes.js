// services/api-gateway/routes/REFACTORED_EXAMPLE_cartRoutes.js
// REFACTORED EXAMPLE: Cart routes after service layer implementation

const { asyncHandler } = require('../middleware/errorHandler');
const { createValidator, schemas } = require('../middleware/validation');

/**
 * Register refactored cart routes
 * Cart is one of the most changed by service layer (was very query-heavy)
 */
function registerRefactoredCartRoutes({ app, cartService, authenticateToken, requireSelfOrAdmin }) {
  /**
   * GET /api/users/:id/cart
   * Get user's shopping cart with enriched product details
   * BEFORE: N+1 queries for each cart item + product details (slow!)
   * AFTER: Single batch lookup + Promise.all enrichment
   */
  app.get('/api/users/:id/cart', authenticateToken, requireSelfOrAdmin, asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.params.id);
    res.json({ success: true, data: cart });
  }));

  /**
   * POST /api/users/:id/cart/items
   * Add item to cart with inventory validation
   * BEFORE: 70 lines scattered across multiple files
   * AFTER: 8 lines (all logic in CartService)
   */
  app.post(
    '/api/users/:id/cart/items',
    authenticateToken,
    requireSelfOrAdmin,
    createValidator({
      productId: { required: true, type: 'string' },
      quantity: { required: true, type: 'number' }
    }),
    asyncHandler(async (req, res) => {
      const cart = await cartService.addToCart(
        req.params.id,
        req.body.productId,
        req.body.quantity
      );
      res.status(201).json({ success: true, data: cart });
    })
  );

  /**
   * PUT /api/users/:id/cart/items/:productId
   * Update item quantity
   * BEFORE: 40 lines of complex updates
   * AFTER: 8 lines
   */
  app.put(
    '/api/users/:id/cart/items/:productId',
    authenticateToken,
    requireSelfOrAdmin,
    createValidator({
      quantity: { required: true, type: 'number' }
    }),
    asyncHandler(async (req, res) => {
      const cart = await cartService.updateCartItem(
        req.params.id,
        req.params.productId,
        req.body.quantity
      );
      res.json({ success: true, data: cart });
    })
  );

  /**
   * DELETE /api/users/:id/cart/items/:productId
   * Remove item from cart
   * BEFORE: 30 lines
   * AFTER: 8 lines
   */
  app.delete(
    '/api/users/:id/cart/items/:productId',
    authenticateToken,
    requireSelfOrAdmin,
    asyncHandler(async (req, res) => {
      const cart = await cartService.removeFromCart(req.params.id, req.params.productId);
      res.json({ success: true, data: cart });
    })
  );

  /**
   * DELETE /api/users/:id/cart
   * Clear entire cart
   * BEFORE: 15 lines
   * AFTER: 8 lines
   */
  app.delete(
    '/api/users/:id/cart',
    authenticateToken,
    requireSelfOrAdmin,
    asyncHandler(async (req, res) => {
      const cart = await cartService.clearCart(req.params.id);
      res.json({ success: true, data: cart });
    })
  );
}

module.exports = registerRefactoredCartRoutes;
