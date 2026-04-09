// services/api-gateway/services/DashboardService.js
// Dashboard and analytics service using aggregation pipelines

const { ApiError } = require('../middleware/errorHandler');

class DashboardService {
  constructor(productRepository, categoryRepository, orderRepository, userRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get admin dashboard summary with stats and recent activity
   * @param {string} scope - Market scope
   * @returns {Promise} Dashboard data with stats and recent activity
   */
  async getDashboardSummary(scope) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Fetch all data in parallel
      const [
        productsCount,
        categoriesCount,
        ordersToday,
        activeUsers,
        recentProducts,
        recentCategories,
        recentOrders
      ] = await Promise.all([
        this.productRepository.count({ scope }),
        this.categoryRepository.count({ scope }),
        this.orderRepository.count({ createdAt: { $gte: startOfToday } }),
        this.userRepository.count({ isActive: { $ne: false } }),
        this.getRecentProducts(scope, 4),
        this.getRecentCategories(scope, 3),
        this.getRecentOrders(4)
      ]);

      // Build recent activity feed
      const recentActivity = this.buildActivityFeed(
        recentProducts,
        recentCategories,
        recentOrders
      );

      return {
        stats: {
          products: productsCount,
          categories: categoriesCount,
          ordersToday,
          activeUsers
        },
        recentActivity
      };
    } catch (error) {
      throw new ApiError(`Failed to get dashboard summary: ${error.message}`, 500);
    }
  }

  /**
   * Get product ownership audit report
   * @param {string} scope - Market scope
   * @returns {Promise} Audit data with coverage statistics
   */
  async getProductOwnershipAudit(scope) {
    try {
      const products = await this.productRepository.findByScope(scope, {
        projection: {
          _id: 1,
          id: 1,
          name: 1,
          supplierId: 1,
          companyId: 1,
          ownerId: 1,
          sellerId: 1,
          createdBy: 1
        }
      });

      const missing = products
        .filter(p => !this.hasOwnerMapping(p))
        .map(p => ({
          id: (p._id || p.id)?.toString?.() || p.id,
          name: p.name || '',
          supplierId: p.supplierId || '',
          companyId: p.companyId || '',
          ownerId: p.ownerId || '',
          sellerId: p.sellerId || '',
          createdBy: p.createdBy || ''
        }));

      return {
        totalProducts: products.length,
        missingOwnerCount: missing.length,
        ownerCoveragePercent: products.length 
          ? Math.round(((products.length - missing.length) / products.length) * 100)
          : 100,
        missingOwnerProducts: missing
      };
    } catch (error) {
      throw new ApiError(`Failed to audit product ownership: ${error.message}`, 500);
    }
  }

  /**
   * Get recent products (private)
   * @private
   */
  async getRecentProducts(scope, limit) {
    try {
      return await this.productRepository.findByScope(scope, {
        limit,
        sort: { updatedAt: -1, createdAt: -1 },
        projection: { _id: 1, name: 1, stock: 1, updatedAt: 1, createdAt: 1 }
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get recent categories (private)
   * @private
   */
  async getRecentCategories(scope, limit) {
    try {
      return await this.categoryRepository.findByScope(scope, {
        limit,
        sort: { updatedAt: -1, createdAt: -1 },
        projection: { _id: 1, name: 1, updatedAt: 1, createdAt: 1 }
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get recent orders (private)
   * @private
   */
  async getRecentOrders(limit) {
    try {
      return await this.orderRepository.find({
        limit,
        sort: { createdAt: -1, updatedAt: -1 },
        projection: { _id: 1, orderNumber: 1, total: 1, createdAt: 1, updatedAt: 1, status: 1 }
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Build activity feed from recent items (private)
   * @private
   */
  buildActivityFeed(products, categories, orders) {
    const toTimestamp = (value) => new Date(value || 0).getTime() || 0;

    const activity = [
      ...products.map(item => ({
        id: `product:${item._id?.toString?.() || item.id || ''}`,
        type: 'product',
        title: `Product updated: ${item.name || 'Untitled product'}`,
        description: `Stock level: ${Number(item.stock || 0)} units`,
        time: item.updatedAt || item.createdAt || null
      })),
      ...categories.map(item => ({
        id: `category:${item._id?.toString?.() || item.id || ''}`,
        type: 'category',
        title: `Category updated: ${item.name || 'Untitled category'}`,
        description: 'Catalog structure changed',
        time: item.updatedAt || item.createdAt || null
      })),
      ...orders.map(item => ({
        id: `order:${item._id?.toString?.() || item.id || ''}`,
        type: 'order',
        title: `Order placed: ${item.orderNumber || 'New order'}`,
        description: `Status: ${item.status || 'processing'} | Total: $${Number(item.total || 0).toFixed(2)}`,
        time: item.createdAt || item.updatedAt || null
      }))
    ];

    return activity
      .sort((a, b) => toTimestamp(b.time) - toTimestamp(a.time))
      .slice(0, 8);
  }

  /**
   * Check if product has owner mapping (private)
   * @private
   */
  hasOwnerMapping(product = {}) {
    return Boolean(
      product.supplierId ||
      product.companyId ||
      product.ownerId ||
      product.sellerId ||
      product.createdBy
    );
  }
}

module.exports = DashboardService;
