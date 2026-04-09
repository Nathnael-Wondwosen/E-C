const { ApiError } = require('../middleware/errorHandler');

class CartService {
  constructor(cartRepository, productRepository, userRepository) {
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
  }

  async getUserCart(userId) {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return { userId, items: [], total: 0, count: 0 };
    }

    return this.enrichCart(cart);
  }

  async addToCart(userId, productId, quantity = 1) {
    if (!userId || !productId) {
      throw new ApiError('User ID and Product ID are required', 400);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    const normalizedQuantity = Math.max(1, Number(quantity) || 1);
    const currentCart = await this.cartRepository.findByUserId(userId);
    const items = Array.isArray(currentCart?.items) ? [...currentCart.items] : [];
    const existingIndex = items.findIndex((item) => String(item.productId) === String(productId));

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: Number(items[existingIndex].quantity || 0) + normalizedQuantity
      };
    } else {
      items.push({
        productId: String(productId),
        quantity: normalizedQuantity,
        addedAt: new Date()
      });
    }

    await this.cartRepository.upsertCart(userId, items);
    const updatedCart = await this.cartRepository.findByUserId(userId);

    return {
      success: true,
      message: 'Item added to cart',
      ...await this.enrichCart(updatedCart)
    };
  }

  async updateCartItem(userId, productId, quantity) {
    if (!userId || !productId) {
      throw new ApiError('User ID and Product ID are required', 400);
    }

    const normalizedQuantity = Math.max(0, Number(quantity) || 0);
    const currentCart = await this.cartRepository.findByUserId(userId);
    if (!currentCart) {
      throw new ApiError('Cart not found', 404);
    }

    const items = Array.isArray(currentCart.items) ? [...currentCart.items] : [];
    const existingIndex = items.findIndex((item) => String(item.productId) === String(productId));
    if (existingIndex < 0) {
      throw new ApiError('Item not found in cart', 404);
    }

    if (normalizedQuantity === 0) {
      items.splice(existingIndex, 1);
    } else {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: normalizedQuantity
      };
    }

    await this.cartRepository.upsertCart(userId, items);
    const updatedCart = await this.cartRepository.findByUserId(userId);

    return {
      success: true,
      message: 'Cart updated',
      ...await this.enrichCart(updatedCart || { userId, items: [] })
    };
  }

  async removeFromCart(userId, productId) {
    return this.updateCartItem(userId, productId, 0);
  }

  async clearCart(userId) {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    await this.cartRepository.clearCart(userId);
    return {
      success: true,
      message: 'Cart cleared',
      userId,
      items: [],
      total: 0,
      count: 0
    };
  }

  async enrichCart(cart) {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    if (!items.length) {
      return {
        userId: String(cart?.userId || ''),
        items: [],
        total: 0,
        count: 0
      };
    }

    const products = await this.productRepository.findByIds(items.map((item) => item.productId));
    const productMap = new Map(
      products.map((product) => [
        String(product?._id?.toString?.() || product?.id || ''),
        product
      ])
    );

    const enrichedItems = items.map((item) => {
      const product = productMap.get(String(item.productId)) || null;
      const quantity = Number(item.quantity || 0);
      return {
        productId: String(item.productId),
        quantity,
        addedAt: item.addedAt || null,
        product: product ? {
          id: String(product?._id?.toString?.() || product?.id || ''),
          name: product.name || '',
          price: Number(product.price || 0),
          image: Array.isArray(product.images) ? product.images[0] || '' : product.image || '',
          images: Array.isArray(product.images) ? product.images : [],
          stock: Number(product.stock || 0)
        } : null
      };
    });

    return {
      userId: String(cart?.userId || ''),
      items: enrichedItems,
      count: enrichedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      total: enrichedItems.reduce(
        (sum, item) => sum + (Number(item.product?.price || 0) * Number(item.quantity || 0)),
        0
      )
    };
  }
}

module.exports = CartService;
