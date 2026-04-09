// services/api-gateway/repositories/index.js
// Export all repositories for easy import

const Repository = require('./Repository');

class ProductRepository extends Repository {
  constructor(db) {
    super(db, 'products');
  }

  async findByScope(scope, options = {}) {
    return this.find({ scope }, options);
  }

  async findFeatured(limit = 10) {
    return this.collection.find({ isFeatured: true }).limit(limit).toArray();
  }

  async findByCategoryId(categoryId, options = {}) {
    return this.find({ categoryId }, options);
  }

  async searchByName(name, scope = null) {
    const query = { name: { $regex: name, $options: 'i' } };
    if (scope) query.scope = scope;
    return this.collection.find(query).limit(20).toArray();
  }
}

class CategoryRepository extends Repository {
  constructor(db) {
    super(db, 'categories');
  }

  async findByScope(scope, options = {}) {
    return this.find({ scope, isActive: true }, options);
  }

  async findWithChildren(parentId = null) {
    return this.collection
      .find({ parentId, isActive: true })
      .sort({ order: 1 })
      .toArray();
  }
}

class UserRepository extends Repository {
  constructor(db) {
    super(db, 'users');
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findActive() {
    return this.find({ isActive: { $ne: false } });
  }

  async findAdmins() {
    return this.find({ role: 'admin' });
  }
}

class OrderRepository extends Repository {
  constructor(db) {
    super(db, 'orders');
  }

  async findByUserId(userId, options = {}) {
    return this.find({ userId }, options);
  }

  async findByStatus(status, options = {}) {
    return this.find({ status }, options);
  }

  async findByDateRange(startDate, endDate) {
    return this.collection
      .find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
      .toArray();
  }

  async getStats(scope = null) {
    const match = scope ? { scope } : {};
    return this.collection
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            averageAmount: { $avg: '$total' }
          }
        }
      ])
      .toArray();
  }
}

class CartRepository extends Repository {
  constructor(db) {
    super(db, 'carts');
  }

  async findByUserId(userId) {
    return this.findOne({ userId });
  }

  async upsertCart(userId, items) {
    return this.collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          items,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async clearCart(userId) {
    return this.collection.deleteOne({ userId });
  }
}

class WishlistRepository extends Repository {
  constructor(db) {
    super(db, 'wishlists');
  }

  async findByUserId(userId) {
    return this.findOne({ userId });
  }

  async addItem(userId, item) {
    return this.collection.findOneAndUpdate(
      { userId },
      {
        $push: { items: item },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async removeItem(userId, productId) {
    const wishlist = await this.findByUserId(userId);
    if (!wishlist) {
      return null;
    }

    const nextItems = (wishlist.items || []).filter((item) => {
      const currentProductId = String(item?.productId || item?.id || item || '');
      return currentProductId !== String(productId);
    });

    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: nextItems,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }
}

class InquiryRepository extends Repository {
  constructor(db) {
    super(db, 'product_inquiries');
  }

  buildThreadKey(productId, buyerId, sellerId) {
    const normalizedProductId = String(productId || '').trim();
    const normalizedBuyerId = String(buyerId || '').trim();
    const normalizedSellerId = String(sellerId || '').trim();
    if (!normalizedProductId || !normalizedBuyerId || !normalizedSellerId) return '';
    return `thread:${normalizedProductId}:${normalizedBuyerId}:${normalizedSellerId}`;
  }

  async findByBuyerId(buyerId, options = {}) {
    const result = await this.find(
      { $or: [{ buyerId }, { fromUserId: buyerId }] },
      options
    );
    return Array.isArray(result?.documents) ? result.documents : [];
  }

  async findBySellerId(sellerId, options = {}) {
    const result = await this.find(
      { $or: [{ sellerId }, { toUserId: sellerId }] },
      options
    );
    return Array.isArray(result?.documents) ? result.documents : [];
  }

  async findById(id) {
    const objectId = this.toObjectId(id);
    return this.findOne({ $or: [{ _id: objectId }, { id: String(id || '') }] });
  }

  async updateById(id, updateData) {
    const result = await this.collection.findOneAndUpdate(
      { _id: this.toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result?.value || result || null;
  }

  async addMessage(id, message) {
    const result = await this.collection.findOneAndUpdate(
      { _id: this.toObjectId(id) },
      {
        $push: { messages: message },
        $set: {
          message: message.text,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result?.value || result || null;
  }

  async findThreadByParticipantsAndProduct(productId, buyerId, sellerId) {
    const normalizedProductId = String(productId || '').trim();
    const normalizedBuyerId = String(buyerId || '').trim();
    const normalizedSellerId = String(sellerId || '').trim();
    if (!normalizedProductId || !normalizedBuyerId || !normalizedSellerId) return null;

    const threadKey = this.buildThreadKey(normalizedProductId, normalizedBuyerId, normalizedSellerId);
    if (threadKey) {
      const byKey = await this.collection.findOne({ threadKey });
      if (byKey) return byKey;
    }

    return this.collection.findOne({
      productId: normalizedProductId,
      $or: [{ buyerId: normalizedBuyerId }, { fromUserId: normalizedBuyerId }],
      $and: [{ $or: [{ sellerId: normalizedSellerId }, { toUserId: normalizedSellerId }] }]
    });
  }

  async markAsRead(id, userId, readAt = new Date()) {
    const normalizedUserId = String(userId || '').trim();
    if (!normalizedUserId) return null;
    const fieldPath = `lastReadAtByUser.${normalizedUserId}`;
    const result = await this.collection.findOneAndUpdate(
      { _id: this.toObjectId(id) },
      {
        $set: {
          [fieldPath]: readAt,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result?.value || result || null;
  }
}

class IdentityUserRepository extends Repository {
  constructor(db) {
    super(db, 'identityusers');
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findActive() {
    return this.find({ isActive: { $ne: false } });
  }
}

module.exports = {
  Repository,
  ProductRepository,
  CategoryRepository,
  UserRepository,
  OrderRepository,
  CartRepository,
  WishlistRepository,
  InquiryRepository,
  IdentityUserRepository
};
