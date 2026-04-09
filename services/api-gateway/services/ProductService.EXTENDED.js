// services/api-gateway/services/ProductService.EXTENDED.js
// EXTENDED ProductService with ownership validation and transformations
// Combine this with the original ProductService.js

const { ApiError } = require('../middleware/errorHandler');

/**
 * Extended Product Service - Add these methods to ProductService.js
 */

class ProductServiceExtended {
  /**
   * Extract owner mapping from product data
   * @param {Object} data - Product data
   * @returns {Object} Owner mapping
   */
  extractOwnerMapping(data = {}) {
    return {
      supplierId: String(data?.supplierId || '').trim(),
      companyId: String(data?.companyId || '').trim(),
      ownerId: String(data?.ownerId || '').trim(),
      sellerId: String(data?.sellerId || '').trim(),
      createdBy: String(data?.createdBy || '').trim()
    };
  }

  /**
   * Check if product has owner mapping
   * @param {Object} data - Product data
   * @returns {boolean}
   */
  hasOwnerMapping(data = {}) {
    const owner = this.extractOwnerMapping(data);
    return Boolean(owner.supplierId || owner.companyId || owner.ownerId || owner.sellerId || owner.createdBy);
  }

  /**
   * Transform product for API response
   * @param {Object} product - Product doc from DB
   * @returns {Object} Transformed product
   */
  transformProduct(product) {
    if (!product) return null;
    
    return {
      ...product,
      id: (product._id || product.id)?.toString?.() || product.id,
      isFeatured: !!product.isFeatured,
      isHotDeal: !!product.isHotDeal,
      isPremium: !!product.isPremium,
      discountPercentage: product.discountPercentage ? Number(product.discountPercentage) : null,
      images: Array.isArray(product.images) ? product.images : [],
      stock: Number(product.stock) || 0,
      price: Number(product.price) || 0,
      hasOwnerMapping: this.hasOwnerMapping(product)
    };
  }

  /**
   * Create product with ownership validation
   * @param {Object} data - Product data
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async createProductWithValidation(data, scope) {
    try {
      // Validate ownership
      if (!this.hasOwnerMapping(data || {})) {
        throw new ApiError(
          'Product owner is required. Provide supplierId or companyId (ownerId/sellerId/createdBy also supported).',
          400
        );
      }

      const ownerMapping = this.extractOwnerMapping(data || {});

      const productData = {
        ...data,
        scope,
        name: String(data.name || ''),
        description: String(data.description || ''),
        price: Number(data.price) || 0,
        category: String(data.category || ''),
        stock: Number(data.stock) || 0,
        sku: String(data.sku || ''),
        images: Array.isArray(data.images)
          ? data.images.filter(url => typeof url === 'string')
          : [],
        thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : '',
        isFeatured: Boolean(data.isFeatured),
        isHotDeal: Boolean(data.isHotDeal),
        isPremium: Boolean(data.isPremium),
        discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
        tags: Array.isArray(data.tags)
          ? data.tags.filter(tag => typeof tag === 'string')
          : [],
        specifications: data.specifications && typeof data.specifications === 'object'
          ? data.specifications
          : {},
        ...ownerMapping,
        variants: Array.isArray(data.variants)
          ? data.variants.map(variant => ({
            ...variant,
            name: String(variant.name || ''),
            price: Number(variant.price) || 0,
            stock: Number(variant.stock) || 0,
            sku: String(variant.sku || ''),
            images: Array.isArray(variant.images)
              ? variant.images.filter(url => typeof url === 'string')
              : []
          }))
          : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.repository.create(productData);
      return this.transformProduct(result);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to create product: ${error.message}`, 500);
    }
  }

  /**
   * Update product with ownership validation
   * @param {string} productId - Product ID
   * @param {Object} data - Update data
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async updateProductWithValidation(productId, data, scope) {
    try {
      if (!productId) {
        throw new ApiError('Product ID is required', 400);
      }

      // Get existing product
      const existing = await this.repository.findById(productId, scope);
      if (!existing) {
        throw new ApiError('Product not found or access denied', 404);
      }

      const updateData = {
        ...data,
        name: data.name ? String(data.name) : undefined,
        description: data.description ? String(data.description) : undefined,
        price: data.price ? Number(data.price) : undefined,
        category: data.category ? String(data.category) : undefined,
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
        sku: data.sku ? String(data.sku) : undefined,
        images: Array.isArray(data.images)
          ? data.images.filter(url => typeof url === 'string')
          : undefined,
        thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : undefined,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        isHotDeal: data.isHotDeal !== undefined ? Boolean(data.isHotDeal) : undefined,
        isPremium: data.isPremium !== undefined ? Boolean(data.isPremium) : undefined,
        discountPercentage: data.discountPercentage !== undefined
          ? data.discountPercentage ? Number(data.discountPercentage) : null
          : undefined,
        tags: Array.isArray(data.tags)
          ? data.tags.filter(tag => typeof tag === 'string')
          : undefined,
        specifications: data.specifications && typeof data.specifications === 'object'
          ? data.specifications
          : undefined,
        variants: Array.isArray(data.variants)
          ? data.variants.map(variant => ({
            ...variant,
            name: String(variant.name || ''),
            price: Number(variant.price) || 0,
            stock: Number(variant.stock) || 0,
            sku: String(variant.sku || ''),
            images: Array.isArray(variant.images)
              ? variant.images.filter(url => typeof url === 'string')
              : []
          }))
          : undefined,
        updatedAt: new Date()
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      // Validate ownership if provided
      const mergedForOwnership = { ...existing, ...updateData };
      if (!this.hasOwnerMapping(mergedForOwnership)) {
        throw new ApiError(
          'Product owner is required. Provide supplierId or companyId (ownerId/sellerId/createdBy also supported).',
          400
        );
      }

      const result = await this.repository.updateById(productId, updateData);
      return this.transformProduct(result);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to update product: ${error.message}`, 500);
    }
  }
}

module.exports = ProductServiceExtended;
