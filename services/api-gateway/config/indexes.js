const ensureGatewayIndexes = async (db) => {
  const tasks = [
    db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true }),
    db.collection('users').createIndex({ createdAt: -1 }),

    db.collection('products').createIndex({ marketScope: 1, createdAt: -1 }),
    db.collection('products').createIndex({ category: 1 }),
    db.collection('products').createIndex({ isFeatured: 1, createdAt: -1 }),
    db.collection('products').createIndex({ isHotDeal: 1, createdAt: -1 }),
    db.collection('products').createIndex({ isPremium: 1, createdAt: -1 }),

    db.collection('categories').createIndex({ marketScope: 1, createdAt: -1 }),
    db.collection('categories').createIndex({ name: 1 }),

    db.collection('hero_slides').createIndex({ marketScope: 1, isActive: 1, createdAt: -1 }),
    db.collection('special_offers').createIndex({ marketScope: 1, isActive: 1, createdAt: -1 }),
    db.collection('banners').createIndex({ marketScope: 1, isActive: 1, createdAt: -1 }),
    db.collection('news_blog_posts').createIndex({ marketScope: 1, isActive: 1, createdAt: -1 }),

    db.collection('services').createIndex({ marketScope: 1, isActive: 1, order: 1 }),
    db.collection('partners').createIndex({ marketScope: 1, isActive: 1, order: 1 }),

    db.collection('orders').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('product_inquiries').createIndex({ toUserId: 1, createdAt: -1 }),
    db.collection('product_inquiries').createIndex({ fromUserId: 1, createdAt: -1 }),
    db.collection('product_inquiries').createIndex({ productId: 1, createdAt: -1 }),
    db.collection('product_inquiries').createIndex(
      { threadKey: 1 },
      { unique: true, sparse: true, partialFilterExpression: { threadKey: { $type: 'string' } } }
    ),
    db.collection('product_reviews').createIndex({ productId: 1, createdAt: -1 }),
    db.collection('product_reviews').createIndex({ productId: 1, userId: 1 }, { unique: true }),
    db.collection('carts').createIndex({ userId: 1 }, { unique: true }),
    db.collection('wishlists').createIndex({ userId: 1 }, { unique: true }),

    db.collection('settings').createIndex({ key: 1 }, { unique: true })
    ,
    db.collection('rate_limits').createIndex({ key: 1 }, { unique: true }),
    db.collection('rate_limits').createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
  ];

  await Promise.allSettled(tasks);
};

module.exports = {
  ensureGatewayIndexes
};
