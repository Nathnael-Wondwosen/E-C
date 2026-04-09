// services/api-gateway/services/UserService.js
// User profile and management service

const { ApiError } = require('../middleware/errorHandler');

class UserService {
  constructor(userRepository, identityUserRepository) {
    this.userRepository = userRepository;
    this.identityUserRepository = identityUserRepository;
  }

  async findUserWithSource(userId) {
    const legacyUser = await this.userRepository.findById(userId);
    if (legacyUser) {
      return { user: legacyUser, source: 'legacy' };
    }

    const identityUser = await this.identityUserRepository.findById(userId);
    if (identityUser) {
      return { user: identityUser, source: 'identity' };
    }

    return { user: null, source: '' };
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  async getUserProfile(userId) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const { user } = await this.findUserWithSource(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      return this.normalizeUserProfile(user);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get user profile: ${error.message}`, 500);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise}
   */
  async updateUserProfile(userId, updateData) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const { user: existing, source } = await this.findUserWithSource(userId);
      if (!existing) {
        throw new ApiError('User not found', 404);
      }

      const sanitizedData = {
        ...updateData,
        updatedAt: new Date()
      };

      // Remove undefined fields
      Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

      const repo = source === 'identity' ? this.identityUserRepository : this.userRepository;
      const result = await repo.updateById(userId, sanitizedData);
      return {
        success: true,
        user: this.normalizeUserProfile(result)
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to update user profile: ${error.message}`, 500);
    }
  }

  /**
   * Get user summary map for multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Object>} Map of user summaries
   */
  async getUserSummaryMap(userIds = []) {
    try {
      const uniqueIds = [...new Set((userIds || []).map(id => String(id || '')).filter(Boolean))];
      if (!uniqueIds.length) return {};

      const users = await this.userRepository.findByIds(uniqueIds);
      const summaryMap = {};

      users.forEach(user => {
        const key = String(user?._id?.toString?.() || user?.id || '');
        if (!key) return;

        summaryMap[key] = {
          id: key,
          name: user?.profile?.name || user?.name || '',
          email: user?.email || user?.profile?.email || '',
          phone: user?.profile?.phone || '',
          userType: user?.userType || ''
        };
      });

      return summaryMap;
    } catch (error) {
      throw new ApiError(`Failed to get user summary map: ${error.message}`, 500);
    }
  }

  /**
   * Normalize user profile response
   * @private
   */
  normalizeUserProfile(user) {
    const resolvedUserType =
      user.userType ||
      user.role ||
      (Array.isArray(user.roles) && user.roles.length ? user.roles[0] : '') ||
      user?.profile?.userType ||
      'buyer';

    const resolvedName =
      user.name ||
      user.displayName ||
      user.username ||
      user?.profile?.name ||
      '';

    const resolvedIsActive =
      typeof user.isActive === 'boolean'
        ? user.isActive
        : String(user.status || 'active').toLowerCase() !== 'inactive';

    return {
      id: String(user?._id?.toString?.() || user?.id || ''),
      email: user.email,
      name: resolvedName,
      userType: resolvedUserType,
      isActive: resolvedIsActive,
      profile: user.profile || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

module.exports = UserService;
