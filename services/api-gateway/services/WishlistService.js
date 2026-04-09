// services/api-gateway/services/WishlistService.js
// Wishlist management service

const { ApiError } = require('../middleware/errorHandler');

class WishlistService {
  constructor(wishlistRepository, productRepository) {
    this.wishlistRepository = wishlistRepository;
    this.productRepository = productRepository;
  }

  /**
   * Get user's wishlist
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  async getUserWishlist(userId) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const wishlist = await this.wishlistRepository.findByUserId(userId);
      if (!wishlist) {
        return { items: [] };
      }

      // Get product details for wishlist items
      const productIds = wishlist.items.map((item) =>
        String(item?.productId || item?.id || item || '')
      ).filter(Boolean);
      const products = await this.productRepository.findByIds(productIds);

      // Create product map for quick lookup
      const productMap = {};
      products.forEach(product => {
        productMap[product._id.toString()] = product;
      });

      // Enrich wishlist items with product details
      const enrichedItems = wishlist.items.map((item) => {
        const productId = String(item?.productId || item?.id || item || '');
        const product = productMap[productId];
        return {
          productId,
          addedAt: item?.addedAt || null,
          product: product ? {
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            images: product.images,
            category: product.category,
            sellerId: product.sellerId
          } : null
        };
      });

      return {
        items: enrichedItems,
        totalItems: enrichedItems.length
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get wishlist: ${error.message}`, 500);
    }
  }

  /**
   * Add item to wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise}
   */
  async addToWishlist(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new ApiError('User ID and Product ID are required', 400);
      }

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new ApiError('Product not found', 404);
      }

      // Get or create wishlist
      let wishlist = await this.wishlistRepository.findByUserId(userId);
      if (!wishlist) {
        wishlist = await this.wishlistRepository.create({
          userId,
          items: []
        });
      }

      // Check if product already in wishlist
      const existingItem = wishlist.items.find(item => item.productId === productId);
      if (existingItem) {
        throw new ApiError('Product already in wishlist', 400);
      }

      // Add item to wishlist
      const newItem = {
        productId,
        addedAt: new Date()
      };

      const result = await this.wishlistRepository.addItem(userId, newItem);

      return {
        success: true,
        message: 'Product added to wishlist',
        item: newItem
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to add to wishlist: ${error.message}`, 500);
    }
  }

  /**
   * Remove item from wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise}
   */
  async removeFromWishlist(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new ApiError('User ID and Product ID are required', 400);
      }

      const result = await this.wishlistRepository.removeItem(userId, productId);

      if (!result) {
        throw new ApiError('Item not found in wishlist', 404);
      }

      return {
        success: true,
        message: 'Product removed from wishlist'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to remove from wishlist: ${error.message}`, 500);
    }
  }
}

module.exports = WishlistService;
