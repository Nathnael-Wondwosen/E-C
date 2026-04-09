// services/api-gateway/services/ProductService.js
// Business logic for product operations

const { ApiError } = require('../middleware/errorHandler');

class ProductService {
  constructor(productRepository, categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * List products with filtering, sorting, and pagination
   */
  async listProducts(filters = {}) {
    const { scope, page = 1, limit = 20, sort = null, search = null } = filters;

    let query = {};
    if (scope) query.scope = scope;

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 20))
    };

    if (sort) {
      options.sort = this.parseSortParam(sort);
    }

    return this.productRepository.find(query, options);
  }

  /**
   * Get single product with full details
   */
  async getProduct(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Fetch category details if categoryId exists
    if (product.categoryId) {
      product.category = await this.categoryRepository.findById(product.categoryId);
    }

    return this.normalizeProduct(product);
  }

  /**
   * Create new product with validation
   */
  async createProduct(data) {
    // Validate required fields
    if (!data.name) {
      throw new ApiError('Product name is required', 'VALIDATION_ERROR', 400);
    }
    if (!data.scope) {
      throw new ApiError('Product scope is required', 'VALIDATION_ERROR', 400);
    }
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new ApiError('Valid price is required', 'VALIDATION_ERROR', 400);
    }

    const product = await this.productRepository.create({
      ...data,
      stock: data.stock || 0,
      isFeatured: data.isFeatured || false,
      isActive: true
    });

    return this.normalizeProduct(product);
  }

  /**
   * Update product
   */
  async updateProduct(id, data) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Prevent changing scope (security)
    const updateData = { ...data };
    delete updateData.scope;

    const updated = await this.productRepository.updateById(id, updateData);
    return this.normalizeProduct(updated);
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const exists = await this.productRepository.findById(id);
    if (!exists) {
      throw new ApiError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    return this.productRepository.deleteById(id);
  }

  /**
   * Get featured products
   */
  async getFeatured(scope = null) {
    const query = { isFeatured: true, isActive: true };
    if (scope) query.scope = scope;

    return this.productRepository.collection
      .find(query)
      .limit(10)
      .toArray()
      .then((products) => products.map((p) => this.normalizeProduct(p)));
  }

  /**
   * Get dashboard stats (uses aggregation for efficiency)
   */
  async getDashboardStats(scope = null) {
    const match = {
      isActive: true
    };
    if (scope) match.scope = scope;

    const stats = await this.productRepository.collection
      .aggregate([
        { $match: match },
        {
          $facet: {
            total: [{ $count: 'count' }],
            avgPrice: [{ $group: { _id: null, avg: { $avg: '$price' } } }],
            hotDeals: [{ $match: { isHotDeal: true } }, { $count: 'count' }],
            featured: [{ $match: { isFeatured: true } }, { $count: 'count' }],
            lowStock: [
              { $match: { stock: { $lt: 10 } } },
              { $count: 'count' }
            ]
          }
        }
      ])
      .toArray();

    return stats[0] || {};
  }

  // Helper methods

  /**
   * Normalize product for API response
   */
  normalizeProduct(product) {
    if (!product) return null;
    return {
      id: product._id?.toString?.() || product._id,
      ...product,
      _id: undefined
    };
  }

  /**
   * Parse sort parameter like "price:asc" or "name:desc"
   */
  parseSortParam(sort) {
    if (typeof sort !== 'string') return null;
    const [field, direction] = sort.split(':');
    const safeFields = ['price', 'name', 'createdAt', 'updatedAt', 'stock'];

    if (!safeFields.includes(field)) return null;
    return { [field]: direction === 'desc' ? -1 : 1 };
  }
}

module.exports = ProductService;
