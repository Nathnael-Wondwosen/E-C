// services/api-gateway/services/CategoryService.js
// Category business logic service with caching and scope support

const { ApiError } = require('../middleware/errorHandler');

class CategoryService {
  constructor(categoryRepository, cacheHelper) {
    this.categoryRepository = categoryRepository;
    this.cacheHelper = cacheHelper;
  }

  /**
   * List all categories with pagination and cursor support
   * @param {Object} options - { page, limit, cursor, scope }
   * @returns {Promise}
   */
  async listCategories(options = {}) {
    const { page, limit = 20, cursor, scope } = options;
    const cacheKey = `categories:list:${scope || 'all'}:${page || cursor}`;

    // Check cache
    if (this.cacheHelper) {
      const cached = await this.cacheHelper.get(cacheKey);
      if (cached) return cached;
    }

    try {
      let result;

      // Cursor-based pagination
      if (cursor) {
        const categories = await this.categoryRepository.findWithCursor(cursor, limit, scope);
        const hasMore = categories.length > limit;
        const items = categories.slice(0, limit);
        
        result = {
          items: items.map(this.normalizeCategory),
          nextCursor: hasMore ? items[items.length - 1]?.id || null : null,
          limit
        };
      } 
      // Offset pagination
      else if (page) {
        const skip = (page - 1) * limit;
        const [categories, total] = await Promise.all([
          this.categoryRepository.findByScope(scope, { skip, limit }),
          this.categoryRepository.count({ scope })
        ]);

        result = {
          items: categories.map(this.normalizeCategory),
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit))
        };
      } 
      // No pagination - get all
      else {
        const categories = await this.categoryRepository.findByScope(scope);
        result = categories.map(this.normalizeCategory);
      }

      // Cache result
      if (this.cacheHelper) {
        await this.cacheHelper.set(cacheKey, result, 10000);
      }

      return result;
    } catch (error) {
      throw new ApiError(`Failed to list categories: ${error.message}`, 500);
    }
  }

  /**
   * Get single category by ID
   * @param {string} categoryId - Category ID
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async getCategory(categoryId, scope) {
    try {
      if (!categoryId) {
        throw new ApiError('Category ID is required', 400);
      }

      const category = await this.categoryRepository.findById(categoryId, scope);
      
      if (!category) {
        throw new ApiError('Category not found', 404);
      }

      return this.normalizeCategory(category);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get category: ${error.message}`, 500);
    }
  }

  /**
   * Create new category
   * @param {Object} data - Category data
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async createCategory(data, scope) {
    try {
      if (!data.name || !data.name.trim()) {
        throw new ApiError('Category name is required', 400);
      }

      const categoryData = {
        ...data,
        name: String(data.name).trim(),
        description: data.description ? String(data.description).trim() : '',
        scope: scope,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.categoryRepository.create(categoryData);
      
      // Invalidate cache
      if (this.cacheHelper) {
        await this.cacheHelper.invalidate(`categories:list:${scope}:*`);
      }

      return this.normalizeCategory(result);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to create category: ${error.message}`, 500);
    }
  }

  /**
   * Update category
   * @param {string} categoryId - Category ID
   * @param {Object} data - Update data
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async updateCategory(categoryId, data, scope) {
    try {
      if (!categoryId) {
        throw new ApiError('Category ID is required', 400);
      }

      // Verify category exists and user has access
      const existing = await this.categoryRepository.findById(categoryId, scope);
      if (!existing) {
        throw new ApiError('Category not found or access denied', 404);
      }

      const updateData = {
        ...data,
        name: data.name ? String(data.name).trim() : undefined,
        description: data.description ? String(data.description).trim() : undefined,
        updatedAt: new Date()
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const result = await this.categoryRepository.updateById(categoryId, updateData);

      // Invalidate cache
      if (this.cacheHelper) {
        await this.cacheHelper.invalidate(`categories:list:${scope}:*`);
      }

      return this.normalizeCategory(result);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to update category: ${error.message}`, 500);
    }
  }

  /**
   * Delete category
   * @param {string} categoryId - Category ID
   * @param {string} scope - Market scope
   * @returns {Promise}
   */
  async deleteCategory(categoryId, scope) {
    try {
      if (!categoryId) {
        throw new ApiError('Category ID is required', 400);
      }

      // Verify category exists and user has access
      const existing = await this.categoryRepository.findById(categoryId, scope);
      if (!existing) {
        throw new ApiError('Category not found or access denied', 404);
      }

      await this.categoryRepository.deleteById(categoryId);

      // Invalidate cache
      if (this.cacheHelper) {
        await this.cacheHelper.invalidate(`categories:list:${scope}:*`);
      }

      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to delete category: ${error.message}`, 500);
    }
  }

  /**
   * Normalize category response
   * @private
   */
  normalizeCategory(category) {
    return {
      ...category,
      id: (category._id || category.id)?.toString?.() || category.id
    };
  }
}

module.exports = CategoryService;
