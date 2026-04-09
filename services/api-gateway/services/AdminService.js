// services/api-gateway/services/AdminService.js
// Admin user management service

const { ApiError } = require('../middleware/errorHandler');

class AdminService {
  constructor(userRepository, identityUserRepository) {
    this.userRepository = userRepository;
    this.identityUserRepository = identityUserRepository;
  }

  /**
   * Get all users for admin (combines users and identityusers collections)
   * @param {Object} filters - Filter options
   * @returns {Promise}
   */
  async getAllUsers(filters = {}) {
    try {
      const { role, status, search, page = 1, limit = 50 } = filters;

      // Get users from both collections
      const [users, identityUsers] = await Promise.all([
        this.userRepository.findAll({ page, limit }),
        this.identityUserRepository.findAll({ page, limit })
      ]);

      // Merge and deduplicate by email
      const userMap = new Map();

      // Process regular users
      users.forEach(user => {
        const email = user.email?.toLowerCase();
        if (email) {
          const resolvedRole = String(user.userType || user.role || 'buyer').toLowerCase();
          const resolvedStatus = user.isActive === false ? 'inactive' : 'active';
          userMap.set(email, {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.profile?.name,
            userType: resolvedRole,
            role: resolvedRole,
            isActive: resolvedStatus === 'active',
            status: resolvedStatus,
            phone: user.profile?.phone,
            source: 'users',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          });
        }
      });

      // Process identity users (merge with existing or add new)
      identityUsers.forEach(identityUser => {
        const email = identityUser.email?.toLowerCase();
        if (email) {
          const identityRole = String(
            identityUser.role ||
            (Array.isArray(identityUser.roles) ? identityUser.roles[0] : '') ||
            'buyer'
          ).toLowerCase();
          const identityStatus = String(identityUser.status || 'active').toLowerCase() === 'inactive'
            ? 'inactive'
            : 'active';
          const existing = userMap.get(email);
          if (existing) {
            // Merge data
            userMap.set(email, {
              ...existing,
              name: existing.name || identityUser.displayName || identityUser.name,
              phone: existing.phone || identityUser.phone || identityUser?.profile?.phone,
              userType: existing.userType || identityRole,
              role: existing.role || identityRole,
              isActive: existing.isActive !== undefined ? existing.isActive : identityStatus === 'active',
              status: existing.status || identityStatus,
              sources: ['users', 'identityusers']
            });
          } else {
            // Add new
            userMap.set(email, {
              id: identityUser._id.toString(),
              email: identityUser.email,
              name: identityUser.displayName || identityUser.name,
              userType: identityRole,
              role: identityRole,
              isActive: identityStatus === 'active',
              status: identityStatus,
              phone: identityUser.phone || identityUser?.profile?.phone,
              source: 'identityusers',
              createdAt: identityUser.createdAt,
              updatedAt: identityUser.updatedAt
            });
          }
        }
      });

      // Convert to array and apply filters
      let allUsers = Array.from(userMap.values());

      // Apply role filter
      if (role) {
        const expectedRole = String(role).toLowerCase();
        allUsers = allUsers.filter(user => String(user.userType || '').toLowerCase() === expectedRole);
      }

      // Apply status filter
      if (status !== undefined && status !== '') {
        const expectedStatus = String(status).toLowerCase();
        allUsers = allUsers.filter(user => String(user.status || '').toLowerCase() === expectedStatus);
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        allUsers = allUsers.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      // Sort by creation date (newest first)
      allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        users: allUsers,
        total: allUsers.length,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      throw new ApiError(`Failed to get users: ${error.message}`, 500);
    }
  }

  /**
   * Update user (admin operation)
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise}
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const { name, email, phone, userType, role, isActive, status } = updateData;
      const requestedRoleRaw = String(userType || role || '').trim().toLowerCase();
      const shouldUpdateRole = Boolean(requestedRoleRaw);
      const allowedRoles = new Set(['buyer', 'seller', 'admin']);
      if (shouldUpdateRole && !allowedRoles.has(requestedRoleRaw)) {
        throw new ApiError('role must be buyer, seller, or admin', 400);
      }

      let nextStatus = '';
      if (typeof status === 'string' && status.trim()) {
        const normalizedStatus = status.trim().toLowerCase();
        if (!['active', 'inactive'].includes(normalizedStatus)) {
          throw new ApiError('status must be active or inactive', 400);
        }
        nextStatus = normalizedStatus;
      } else if (isActive !== undefined) {
        nextStatus = Boolean(isActive) ? 'active' : 'inactive';
      }
      const shouldUpdateStatus = Boolean(nextStatus);

      const shouldUpdateName = name !== undefined;
      const shouldUpdateEmail = email !== undefined;
      const shouldUpdatePhone = phone !== undefined;
      const nextEmail = shouldUpdateEmail ? String(email).trim().toLowerCase() : '';
      const nextName = shouldUpdateName ? String(name).trim() : '';
      const nextPhone = shouldUpdatePhone ? String(phone).trim() : '';

      // Check for email conflicts if email is being updated
      if (nextEmail) {
        const existingUser = await this.userRepository.findByEmail(nextEmail);
        const existingIdentityUser = await this.identityUserRepository.findByEmail(nextEmail);

        if ((existingUser && existingUser._id.toString() !== userId) ||
            (existingIdentityUser && existingIdentityUser._id.toString() !== userId)) {
          throw new ApiError('Email already exists', 409);
        }
      }

      const [userById, identityById] = await Promise.all([
        this.userRepository.findById(userId),
        this.identityUserRepository.findById(userId)
      ]);

      const resolvedEmail = nextEmail || userById?.email || identityById?.email || '';
      const [userByEmail, identityByEmail] = resolvedEmail
        ? await Promise.all([
            this.userRepository.findByEmail(resolvedEmail),
            this.identityUserRepository.findByEmail(resolvedEmail)
          ])
        : [null, null];

      const usersDoc = userById || userByEmail || null;
      const identityDoc = identityById || identityByEmail || null;

      if (!usersDoc && !identityDoc) {
        throw new ApiError('User not found', 404);
      }

      // Update in users collection
      const userUpdate = {};
      if (shouldUpdateName) userUpdate.name = nextName;
      if (shouldUpdateEmail) userUpdate.email = nextEmail;
      if (shouldUpdateRole) {
        userUpdate.userType = requestedRoleRaw;
        userUpdate.role = requestedRoleRaw;
      }
      if (shouldUpdateStatus) userUpdate.isActive = nextStatus === 'active';
      if (shouldUpdatePhone) {
        userUpdate.profile = { ...(usersDoc?.profile || {}), phone: nextPhone };
      }
      userUpdate.updatedAt = new Date();

      // Update in identityusers collection
      const identityUpdate = {};
      if (shouldUpdateName) {
        identityUpdate.name = nextName;
        identityUpdate.displayName = nextName;
      }
      if (shouldUpdateEmail) identityUpdate.email = nextEmail;
      if (shouldUpdateRole) {
        identityUpdate.role = requestedRoleRaw;
        identityUpdate.roles = [requestedRoleRaw];
      }
      if (shouldUpdateStatus) {
        identityUpdate.status = nextStatus;
        identityUpdate.isActive = nextStatus === 'active';
      }
      if (shouldUpdatePhone) {
        identityUpdate.phone = nextPhone;
        identityUpdate.profile = { ...(identityDoc?.profile || {}), phone: nextPhone };
      }
      identityUpdate.updatedAt = new Date();

      // Perform updates
      const [userResult, identityResult] = await Promise.all([
        usersDoc && Object.keys(userUpdate).length > 0
          ? this.userRepository.updateById(usersDoc._id?.toString?.() || userId, userUpdate)
          : null,
        identityDoc && Object.keys(identityUpdate).length > 0
          ? this.identityUserRepository.updateById(identityDoc._id?.toString?.() || userId, identityUpdate)
          : null
      ]);

      const updatedUser = userResult || usersDoc || identityResult || identityDoc;
      if (!updatedUser) {
        throw new ApiError('User not found', 404);
      }

      return {
        success: true,
        user: this.normalizeUser(updatedUser),
        message: 'User updated successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to update user: ${error.message}`, 500);
    }
  }

  /**
   * Delete user (admin operation)
   * @param {string} adminId - Admin user ID (for self-protection)
   * @param {string} userId - User ID to delete
   * @returns {Promise}
   */
  async deleteUser(adminId, userId) {
    try {
      if (!adminId || !userId) {
        throw new ApiError('Admin ID and User ID are required', 400);
      }

      // Prevent self-deletion
      if (adminId === userId) {
        throw new ApiError('Cannot delete your own account', 400);
      }

      // Delete from both collections
      await Promise.all([
        this.userRepository.deleteById(userId),
        this.identityUserRepository.deleteById(userId)
      ]);

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to delete user: ${error.message}`, 500);
    }
  }

  /**
   * Normalize user response
   * @private
   */
  normalizeUser(user) {
    const resolvedRole = String(
      user.userType ||
      user.role ||
      (Array.isArray(user.roles) ? user.roles[0] : '') ||
      'buyer'
    ).toLowerCase();
    const resolvedStatus = String(
      user.status || (user.isActive === false ? 'inactive' : 'active')
    ).toLowerCase();
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name || user.displayName || '',
      userType: resolvedRole,
      role: resolvedRole,
      isActive: resolvedStatus === 'active',
      status: resolvedStatus,
      phone: user.phone || user.profile?.phone || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

module.exports = AdminService;
