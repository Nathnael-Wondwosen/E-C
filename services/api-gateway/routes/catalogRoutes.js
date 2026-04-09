const {
  buildRequestCacheKey,
  getCachedResponse,
  setCachedResponse,
  invalidateCacheByPrefixes
} = require('../helpers/cacheHelpers');

const registerCatalogRoutes = ({
  app,
  getDb,
  middleware,
  helpers,
  ObjectId
}) => {
  const { authenticateToken, requireAdmin, requireSellerOrAdmin } = middleware;
  const {
    resolveRequestedScope,
    buildScopedQuery,
    applyMarketScopeToDocument,
    ensureDocumentScopeAccess,
    findDocumentByFlexibleId,
    sendOptimizedJson
  } = helpers;

  const transformProduct = (product) => {
    const normalizedImages = Array.isArray(product?.images)
      ? product.images.filter((url) => typeof url === 'string' && url.trim())
      : [];
    const fallbackImage = typeof product?.image === 'string' && product.image.trim()
      ? product.image.trim()
      : typeof product?.thumbnail === 'string' && product.thumbnail.trim()
        ? product.thumbnail.trim()
        : '';
    const images = normalizedImages.length ? normalizedImages : (fallbackImage ? [fallbackImage] : []);

    return {
      ...product,
      id: (product._id || product.id)?.toString?.() || product.id,
      isFeatured: !!product.isFeatured,
      isHotDeal: !!product.isHotDeal,
      isPremium: !!product.isPremium,
      isMadeInEthiopia: normalizeBoolean(product?.isMadeInEthiopia, false),
      isNewArrival: normalizeBoolean(product?.isNewArrival, isRecentArrivalDate(product?.createdAt)),
      discountPercentage: product.discountPercentage ? Number(product.discountPercentage) : null,
      images,
      image: typeof product?.image === 'string' && product.image.trim() ? product.image.trim() : images[0] || '',
      thumbnail:
        typeof product?.thumbnail === 'string' && product.thumbnail.trim()
          ? product.thumbnail.trim()
          : images[0] || '',
      stock: Number(product.stock) || 0,
      price: Number(product.price) || 0,
      hasOwnerMapping: Boolean(
        String(
          product?.supplierId ||
          product?.companyId ||
          product?.ownerId ||
          product?.sellerId ||
          product?.createdBy ||
          ''
        ).trim()
      )
    };
  };
  const dedupeProducts = (products = []) => {
    const seen = new Set();
    const output = [];

    for (const raw of Array.isArray(products) ? products : []) {
      const product = transformProduct(raw);
      const idKey = String(product?.id || '').trim();
      const fallbackKey = [
        String(product?.name || '').trim().toLowerCase(),
        String(Number(product?.price || 0)),
        String(product?.supplierId || product?.sellerId || product?.companyId || product?.createdBy || '').trim(),
        String(product?.marketScope || product?.scope || '').trim().toLowerCase()
      ].join('|');
      const dedupeKey = idKey || fallbackKey;
      if (!dedupeKey || seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      output.push(product);
    }

    return output;
  };
  const findUserByFlexibleId = async (collection, id) => {
    if (!id) return null;
    const normalizedId = String(id).trim();
    if (!normalizedId) return null;

    const filters = [{ id: normalizedId }];
    if (ObjectId.isValid(normalizedId)) {
      filters.unshift({ _id: new ObjectId(normalizedId) });
    } else {
      filters.unshift({ _id: normalizedId });
    }

    return collection.findOne({ $or: filters });
  };
  const findProductByFlexibleId = async (collection, id) => {
    if (!id) return null;
    const normalizedId = String(id).trim();
    if (!normalizedId) return null;

    const filters = [{ id: normalizedId }];
    if (ObjectId.isValid(normalizedId)) {
      filters.unshift({ _id: new ObjectId(normalizedId) });
    } else {
      filters.unshift({ _id: normalizedId });
    }

    return collection.findOne({ $or: filters });
  };
  const buildProductIdCandidates = (product, fallbackId = '') => {
    const candidates = new Set();
    const normalizedFallback = String(fallbackId || '').trim();
    if (normalizedFallback) candidates.add(normalizedFallback);
    const objectIdValue = product?._id?.toString?.() || product?._id || '';
    if (objectIdValue) candidates.add(String(objectIdValue));
    if (product?.id) candidates.add(String(product.id));
    return [...candidates];
  };
  const normalizeRating = (rating) => {
    const value = Number(rating);
    if (!Number.isFinite(value)) return 0;
    const rounded = Math.round(value);
    if (rounded < 1 || rounded > 5) return 0;
    return rounded;
  };
  const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    const normalized = String(value || '').toLowerCase();
    return ['1', 'true', 'yes', 'verified', 'active'].includes(normalized);
  };
  const normalizePublicSupplierProfile = ({ user, productCount = 0 }) => {
    const profile = user?.profile && typeof user.profile === 'object' ? user.profile : {};
    const normalizedId = String(user?._id?.toString?.() || user?.id || '');
    const resolvedRole =
      user?.userType ||
      user?.role ||
      (Array.isArray(user?.roles) && user.roles.length ? user.roles[0] : '') ||
      profile?.userType ||
      '';

    const resolvedName =
      profile?.name ||
      user?.name ||
      user?.displayName ||
      user?.username ||
      '';

    const resolvedCompany =
      profile?.companyName ||
      user?.companyName ||
      profile?.businessName ||
      user?.businessName ||
      '';

    return {
      id: normalizedId,
      role: resolvedRole || '',
      name: resolvedName,
      companyName: resolvedCompany,
      businessType: profile?.businessType || user?.businessType || '',
      country: profile?.country || user?.country || profile?.location || user?.location || '',
      city: profile?.city || user?.city || '',
      locationAddress: profile?.locationAddress || user?.locationAddress || '',
      locationLat: profile?.locationLat ?? user?.locationLat ?? null,
      locationLng: profile?.locationLng ?? user?.locationLng ?? null,
      description: profile?.description || user?.description || '',
      website: profile?.website || user?.website || '',
      phone: profile?.phone || user?.phone || '',
      contactEmail: profile?.publicEmail || user?.supportEmail || '',
      isVerified: toBoolean(profile?.isVerified || user?.isVerified || user?.verified),
      joinedAt: user?.createdAt || null,
      responseHours: Number(profile?.responseHours || user?.responseHours || 0) || 0,
      totalListings: Number(productCount || 0),
    };
  };
  const normalizeEntityId = (doc) => ({
    ...doc,
    id: (doc?._id || doc?.id)?.toString?.() || doc?.id
  });
  const parsePagination = (req) => {
    const hasPaginationInput = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPaginationInput) return null;

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  };
  const parseCursorPagination = (req) => {
    const hasCursorInput = req.query.cursor !== undefined || req.query.limit !== undefined;
    if (!hasCursorInput) return null;
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const cursor = typeof req.query.cursor === 'string' && req.query.cursor.trim() ? req.query.cursor.trim() : '';
    return { limit, cursor };
  };
  const VALID_SELLER_POST_SCOPES = new Set(['local', 'global', 'africa', 'china', 'b2b']);
  const normalizeSellerPostScope = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return 'local';
    return VALID_SELLER_POST_SCOPES.has(normalized) ? normalized : 'local';
  };
  const normalizeDiscountPercentage = (value) => {
    if (value === undefined || value === null || value === '') return 0;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return Number.NaN;
    return Math.max(0, Math.min(90, parsed));
  };
  const normalizeBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return Boolean(fallback);
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return Boolean(fallback);
  };
  const isRecentArrivalDate = (value, maxDays = 21) => {
    const timestamp = new Date(value || 0).getTime();
    if (!Number.isFinite(timestamp) || timestamp <= 0) return false;
    const ageMs = Date.now() - timestamp;
    return ageMs >= 0 && ageMs <= maxDays * 24 * 60 * 60 * 1000;
  };

  const extractOwnerMapping = (source = {}) => ({
    supplierId: String(source?.supplierId || '').trim(),
    companyId: String(source?.companyId || '').trim(),
    ownerId: String(source?.ownerId || '').trim(),
    sellerId: String(source?.sellerId || '').trim(),
    createdBy: String(source?.createdBy || '').trim()
  });

  const hasOwnerMapping = (source = {}) => {
    const owner = extractOwnerMapping(source);
    return Boolean(owner.supplierId || owner.companyId || owner.ownerId || owner.sellerId || owner.createdBy);
  };
  const buildSellerOwnershipQuery = (sellerUserId) => ({
    $or: [
      { supplierId: sellerUserId },
      { companyId: sellerUserId },
      { ownerId: sellerUserId },
      { sellerId: sellerUserId },
      { createdBy: sellerUserId }
    ]
  });

  app.get('/api/admin/dashboard/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const requestedScope = resolveRequestedScope(req);
      const scopedCatalogQuery = buildScopedQuery(requestedScope, {});
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        productsCount,
        categoriesCount,
        ordersToday,
        activeLegacyUsers,
        activeIdentityUsers,
        recentProducts,
        recentCategories,
        recentOrders
      ] = await Promise.all([
        db.collection('products').countDocuments(scopedCatalogQuery),
        db.collection('categories').countDocuments(scopedCatalogQuery),
        db.collection('orders').countDocuments({ createdAt: { $gte: startOfToday } }),
        db.collection('users').countDocuments({ isActive: { $ne: false } }),
        db.collection('identityusers').countDocuments({ status: { $ne: 'inactive' } }),
        db.collection('products')
          .find(scopedCatalogQuery, {
            projection: { _id: 1, name: 1, stock: 1, updatedAt: 1, createdAt: 1 }
          })
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(4)
          .toArray(),
        db.collection('categories')
          .find(scopedCatalogQuery, {
            projection: { _id: 1, name: 1, updatedAt: 1, createdAt: 1 }
          })
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(3)
          .toArray(),
        db.collection('orders')
          .find({}, {
            projection: { _id: 1, orderNumber: 1, total: 1, createdAt: 1, updatedAt: 1, status: 1 }
          })
          .sort({ createdAt: -1, updatedAt: -1 })
          .limit(4)
          .toArray()
      ]);

      const toTimestamp = (value) => new Date(value || 0).getTime() || 0;
      const recentActivity = [
        ...recentProducts.map((item) => ({
          id: `product:${item._id?.toString?.() || item.id || ''}`,
          type: 'product',
          title: `Product updated: ${item.name || 'Untitled product'}`,
          description: `Stock level: ${Number(item.stock || 0)} units`,
          time: item.updatedAt || item.createdAt || null
        })),
        ...recentCategories.map((item) => ({
          id: `category:${item._id?.toString?.() || item.id || ''}`,
          type: 'category',
          title: `Category updated: ${item.name || 'Untitled category'}`,
          description: 'Catalog structure changed',
          time: item.updatedAt || item.createdAt || null
        })),
        ...recentOrders.map((item) => ({
          id: `order:${item._id?.toString?.() || item.id || ''}`,
          type: 'order',
          title: `Order placed: ${item.orderNumber || 'New order'}`,
          description: `Status: ${item.status || 'processing'} | Total: $${Number(item.total || 0).toFixed(2)}`,
          time: item.createdAt || item.updatedAt || null
        }))
      ]
        .sort((a, b) => toTimestamp(b.time) - toTimestamp(a.time))
        .slice(0, 8);

      return res.json({
        stats: {
          products: productsCount,
          categories: categoriesCount,
          ordersToday,
          activeUsers: activeLegacyUsers + activeIdentityUsers
        },
        recentActivity
      });
    } catch (error) {
      console.error('Error building admin dashboard summary:', error);
      return res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
  });

  // Categories Routes
  app.get('/api/categories', async (req, res) => {
    try {
      console.log('Fetching all categories');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('categories');
      const query = buildScopedQuery(resolveRequestedScope(req), {});
      const cursorPagination = parseCursorPagination(req);
      const pagination = parsePagination(req);
      const cacheKey = buildRequestCacheKey(req, 'categories');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }

      if (cursorPagination) {
        const cursorFilter = { ...query };
        if (cursorPagination.cursor && ObjectId.isValid(cursorPagination.cursor)) {
          cursorFilter._id = { $lt: new ObjectId(cursorPagination.cursor) };
        }
        const rows = await collection
          .find(cursorFilter)
          .sort({ _id: -1 })
          .limit(cursorPagination.limit + 1)
          .toArray();

        const hasMore = rows.length > cursorPagination.limit;
        const items = rows.slice(0, cursorPagination.limit).map(normalizeEntityId);
        const payload = {
          items,
          nextCursor: hasMore ? items[items.length - 1]?.id || null : null,
          limit: cursorPagination.limit
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      if (pagination) {
        const [categories, total] = await Promise.all([
          collection
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .skip(pagination.skip)
            .limit(pagination.limit)
            .toArray(),
          collection.countDocuments(query)
        ]);
        const items = categories.map(normalizeEntityId);
        console.log('Categories fetched successfully:', items.length);
        const payload = {
          items,
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const categories = await collection.find(query).toArray();
      const items = categories.map(normalizeEntityId);
      console.log('Categories fetched successfully:', items.length);
      await setCachedResponse(cacheKey, items, 10_000);
      return sendOptimizedJson(req, res, items);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      console.log('Fetching category by ID:', req.params.id);
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('categories');
      const categoryId = req.params.id;

      let category;
      try {
        category = await collection.findOne({ _id: new ObjectId(categoryId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', categoryId);
        category = await collection.findOne({ _id: categoryId });
      }

      if (!category) {
        category = await collection.findOne({ id: categoryId });
      }

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, category, 'Category')) {
        return;
      }

      res.json(normalizeEntityId(category));
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  });

  app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('categories');
      const categoryData = applyMarketScopeToDocument(req, {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(categoryData);
      const newCategory = await collection.findOne({ _id: result.insertedId });
      await invalidateCacheByPrefixes(['categories']);
      res.status(201).json(normalizeEntityId(newCategory));
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('categories');
      const categoryId = req.params.id;
      const { _id, id, createdAt, ...updateData } = req.body;

      let updateFilter;
      let category;
      try {
        updateFilter = { _id: new ObjectId(categoryId) };
        category = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', categoryId);
        updateFilter = { _id: categoryId };
        category = await collection.findOne(updateFilter);
      }

      if (!category) {
        updateFilter = { id: categoryId };
        category = await collection.findOne(updateFilter);
      }

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, category, 'Category')) {
        return;
      }

      const result = await collection.updateOne(
        updateFilter,
        {
          $set: {
            ...applyMarketScopeToDocument(req, updateData),
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const updatedCategory = await collection.findOne(updateFilter);
      await invalidateCacheByPrefixes(['categories']);
      res.json(normalizeEntityId(updatedCategory));
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('categories');
      const categoryId = req.params.id;
      const { document: category, lookupFilter } = await findDocumentByFlexibleId(collection, categoryId);
      if (!category || !lookupFilter) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, category, 'Category')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      await invalidateCacheByPrefixes(['categories']);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Global Background Image Routes
  app.get('/api/global-background-image', async (req, res) => {
    try {
      console.log('Fetching global background image');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('settings');
      const setting = await collection.findOne({ key: 'globalBackgroundImage' });

      if (!setting) {
        return res.json({ imageUrl: '' });
      }

      res.json({ imageUrl: setting.value });
    } catch (error) {
      console.error('Error fetching global background image:', error);
      res.status(500).json({ error: 'Failed to fetch global background image' });
    }
  });

  app.post('/api/global-background-image', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('Saving global background image');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { imageUrl } = req.body;
      const collection = db.collection('settings');
      await collection.updateOne(
        { key: 'globalBackgroundImage' },
        {
          $set: {
            key: 'globalBackgroundImage',
            value: imageUrl,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      res.json({ imageUrl });
    } catch (error) {
      console.error('Error saving global background image:', error);
      res.status(500).json({ error: 'Failed to save global background image' });
    }
  });

  // Product Routes
  app.get('/api/products', async (req, res) => {
    try {
      console.log('Fetching all products');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('products');
      console.log('Collection accessed, fetching products');
      const query = buildScopedQuery(resolveRequestedScope(req), {});
      const cursorPagination = parseCursorPagination(req);
      const pagination = parsePagination(req);
      const cacheKey = buildRequestCacheKey(req, 'products');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }

      if (cursorPagination) {
        const cursorFilter = { ...query };
        if (cursorPagination.cursor && ObjectId.isValid(cursorPagination.cursor)) {
          cursorFilter._id = { $lt: new ObjectId(cursorPagination.cursor) };
        }

        const rows = await collection
          .find(cursorFilter)
          .sort({ _id: -1 })
          .limit(cursorPagination.limit + 1)
          .toArray();
        const hasMore = rows.length > cursorPagination.limit;
        const items = dedupeProducts(rows.slice(0, cursorPagination.limit));
        const payload = {
          items,
          nextCursor: hasMore ? items[items.length - 1]?.id || null : null,
          limit: cursorPagination.limit
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      if (pagination) {
        const [products, total] = await Promise.all([
          collection
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .skip(pagination.skip)
            .limit(pagination.limit)
            .toArray(),
          collection.countDocuments(query)
        ]);
        const items = dedupeProducts(products);
        console.log('Products fetched successfully:', items.length);
        const payload = {
          items,
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const products = await collection.find(query).toArray();
      const items = dedupeProducts(products);
      console.log('Products fetched successfully:', items.length);
      await setCachedResponse(cacheKey, items, 10_000);
      return sendOptimizedJson(req, res, items);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      console.log('Fetching product by ID:', req.params.id);
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('products');
      let product;

      try {
        product = await collection.findOne({ _id: new ObjectId(req.params.id) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', req.params.id);
        product = await collection.findOne({ _id: req.params.id });
      }

      if (!product) {
        product = await collection.findOne({ id: req.params.id });
      }
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, product, 'Product')) {
        return;
      }

      res.json(transformProduct(product));
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const productsCollection = db.collection('products');
      const reviewsCollection = db.collection('product_reviews');
      const product = await findProductByFlexibleId(productsCollection, req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const productIdCandidates = buildProductIdCandidates(product, req.params.id);
      const rows = await reviewsCollection
        .find({ productId: { $in: productIdCandidates } })
        .sort({ createdAt: -1, _id: -1 })
        .limit(200)
        .toArray();

      const reviews = rows.map((row) => ({
        id: String(row?._id?.toString?.() || row?.id || ''),
        productId: String(row?.productId || ''),
        userId: String(row?.userId || ''),
        userName: String(row?.userName || '').trim() || 'Anonymous Buyer',
        rating: normalizeRating(row?.rating),
        comment: String(row?.comment || '').trim(),
        createdAt: row?.createdAt || null,
        updatedAt: row?.updatedAt || null
      }));

      const validRatings = reviews.map((item) => item.rating).filter((value) => value > 0);
      const totalReviews = reviews.length;
      const averageRating = validRatings.length
        ? Number((validRatings.reduce((sum, value) => sum + value, 0) / validRatings.length).toFixed(2))
        : 0;

      return res.json({
        reviews,
        summary: {
          totalReviews,
          averageRating
        }
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch product reviews' });
    }
  });

  app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const reviewerId = String(req.auth?.sub || '').trim();
      if (!reviewerId) {
        return res.status(401).json({ error: 'Invalid user session' });
      }

      const rating = normalizeRating(req.body?.rating);
      const comment = String(req.body?.comment || '').trim();
      if (!rating) {
        return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
      }
      if (!comment) {
        return res.status(400).json({ error: 'comment is required' });
      }
      if (comment.length > 1200) {
        return res.status(400).json({ error: 'comment is too long (max 1200 characters)' });
      }

      const productsCollection = db.collection('products');
      const reviewsCollection = db.collection('product_reviews');
      const usersCollection = db.collection('users');
      const identityUsersCollection = db.collection('identityusers');

      const product = await findProductByFlexibleId(productsCollection, req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, product, 'Product')) {
        return;
      }

      const reviewer =
        (await findUserByFlexibleId(usersCollection, reviewerId)) ||
        (await findUserByFlexibleId(identityUsersCollection, reviewerId));
      const reviewerName =
        String(
          reviewer?.profile?.name ||
          reviewer?.name ||
          reviewer?.displayName ||
          reviewer?.username ||
          'Anonymous Buyer'
        ).trim() || 'Anonymous Buyer';

      const canonicalProductId = String(product?._id?.toString?.() || product?.id || req.params.id);
      const now = new Date();
      const existing = await reviewsCollection.findOne({ productId: canonicalProductId, userId: reviewerId });

      if (existing) {
        await reviewsCollection.updateOne(
          { _id: existing._id },
          {
            $set: {
              rating,
              comment,
              userName: reviewerName,
              updatedAt: now
            }
          }
        );
      } else {
        await reviewsCollection.insertOne({
          productId: canonicalProductId,
          userId: reviewerId,
          userName: reviewerName,
          rating,
          comment,
          createdAt: now,
          updatedAt: now
        });
      }

      const reviewRows = await reviewsCollection.find({ productId: canonicalProductId }).toArray();
      const ratings = reviewRows.map((item) => normalizeRating(item?.rating)).filter((value) => value > 0);
      const reviewCount = reviewRows.length;
      const averageRating = ratings.length
        ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(2))
        : 0;

      await productsCollection.updateOne(
        { _id: product._id },
        {
          $set: {
            rating: averageRating,
            reviewCount,
            updatedAt: now
          }
        }
      );
      await invalidateCacheByPrefixes(['products']);

      const storedReview = await reviewsCollection.findOne({ productId: canonicalProductId, userId: reviewerId });
      return res.status(existing ? 200 : 201).json({
        success: true,
        message: existing ? 'Review updated successfully' : 'Review submitted successfully',
        review: {
          id: String(storedReview?._id?.toString?.() || ''),
          productId: canonicalProductId,
          userId: reviewerId,
          userName: reviewerName,
          rating,
          comment,
          createdAt: storedReview?.createdAt || now,
          updatedAt: storedReview?.updatedAt || now
        },
        summary: {
          averageRating,
          totalReviews: reviewCount
        }
      });
    } catch (error) {
      console.error('Error creating product review:', error);
      return res.status(500).json({ error: 'Failed to submit product review' });
    }
  });

  app.get('/api/suppliers/:id/profile', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const supplierId = String(req.params.id || '').trim();
      if (!supplierId) {
        return res.status(400).json({ error: 'Supplier ID is required' });
      }

      const usersCollection = db.collection('users');
      const identityUsersCollection = db.collection('identityusers');
      const productsCollection = db.collection('products');

      const user =
        (await findUserByFlexibleId(usersCollection, supplierId)) ||
        (await findUserByFlexibleId(identityUsersCollection, supplierId));

      if (!user) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      const productIdCandidates = [supplierId];
      if (user?._id) {
        productIdCandidates.push(String(user._id));
      }
      if (user?.id) {
        productIdCandidates.push(String(user.id));
      }

      const uniqueCandidates = [...new Set(productIdCandidates.filter(Boolean))];
      const productCount = await productsCollection.countDocuments({
        $or: [
          { supplierId: { $in: uniqueCandidates } },
          { companyId: { $in: uniqueCandidates } },
          { ownerId: { $in: uniqueCandidates } },
          { sellerId: { $in: uniqueCandidates } },
          { createdBy: { $in: uniqueCandidates } },
        ],
      });

      return res.json(normalizePublicSupplierProfile({ user, productCount }));
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
      return res.status(500).json({ error: 'Failed to fetch supplier profile' });
    }
  });

  app.get('/api/products/ownership/audit', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('products');
      const query = buildScopedQuery(resolveRequestedScope(req), {});
      const rows = await collection
        .find(query, {
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
        })
        .toArray();

      const missing = rows
        .filter((row) => !hasOwnerMapping(row))
        .map((row) => ({
          id: (row._id || row.id)?.toString?.() || row.id,
          name: row.name || '',
          supplierId: row.supplierId || '',
          companyId: row.companyId || '',
          ownerId: row.ownerId || '',
          sellerId: row.sellerId || '',
          createdBy: row.createdBy || ''
        }));

      return res.json({
        totalProducts: rows.length,
        missingOwnerCount: missing.length,
        ownerCoveragePercent: rows.length ? Math.round(((rows.length - missing.length) / rows.length) * 100) : 100,
        missingOwnerProducts: missing
      });
    } catch (error) {
      console.error('Error running product ownership audit:', error);
      return res.status(500).json({ error: 'Failed to audit product ownership' });
    }
  });

  app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      if (!hasOwnerMapping(req.body || {})) {
        return res.status(400).json({
          error: 'Product owner is required. Provide supplierId or companyId (ownerId/sellerId/createdBy also supported).'
        });
      }

      const ownerMapping = extractOwnerMapping(req.body || {});

      const productData = applyMarketScopeToDocument(req, {
        ...req.body,
        name: String(req.body.name || ''),
        description: String(req.body.description || ''),
        countryOfOrigin: String(req.body.countryOfOrigin || ''),
        isMadeInEthiopia: normalizeBoolean(req.body.isMadeInEthiopia, false),
        isNewArrival: normalizeBoolean(req.body.isNewArrival, false),
        price: Number(req.body.price) || 0,
        category: String(req.body.category || ''),
        stock: Number(req.body.stock) || 0,
        sku: String(req.body.sku || ''),
        images: Array.isArray(req.body.images) ? req.body.images.filter((url) => typeof url === 'string') : [],
        thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : '',
        isFeatured: Boolean(req.body.isFeatured),
        isHotDeal: Boolean(req.body.isHotDeal),
        isPremium: Boolean(req.body.isPremium),
        discountPercentage: req.body.discountPercentage ? Number(req.body.discountPercentage) : null,
        tags: Array.isArray(req.body.tags) ? req.body.tags.filter((tag) => typeof tag === 'string') : [],
        specifications: req.body.specifications && typeof req.body.specifications === 'object' ? req.body.specifications : {},
        ...ownerMapping,
        variants: Array.isArray(req.body.variants)
          ? req.body.variants.map((variant) => ({
              ...variant,
              name: String(variant.name || ''),
              price: Number(variant.price) || 0,
              stock: Number(variant.stock) || 0,
              sku: String(variant.sku || ''),
              images: Array.isArray(variant.images) ? variant.images.filter((url) => typeof url === 'string') : []
            }))
          : [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const collection = db.collection('products');
      const result = await collection.insertOne(productData);
      const newProduct = await collection.findOne({ _id: result.insertedId });
      await invalidateCacheByPrefixes(['products']);
      res.status(201).json(transformProduct(newProduct));
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.post('/api/seller/products', authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const sellerUserId = String(req.auth?.sub || '').trim();
      if (!sellerUserId) {
        return res.status(401).json({ error: 'Invalid seller session' });
      }

      const requestedScope = normalizeSellerPostScope(req.body?.marketScope || req.body?.scope);
      const normalizedDiscountPercentage = normalizeDiscountPercentage(req.body?.discountPercentage);
      const ownerMapping = {
        supplierId: sellerUserId,
        companyId: sellerUserId,
        ownerId: sellerUserId,
        sellerId: sellerUserId,
        createdBy: sellerUserId
      };

      const productData = applyMarketScopeToDocument(req, {
        ...req.body,
        marketScope: requestedScope,
        scope: requestedScope,
        name: String(req.body?.name || '').trim(),
        description: String(req.body?.description || '').trim(),
        countryOfOrigin: String(req.body?.countryOfOrigin || '').trim(),
        isMadeInEthiopia: normalizeBoolean(req.body?.isMadeInEthiopia, false),
        isNewArrival: normalizeBoolean(req.body?.isNewArrival, true),
        price: Number(req.body?.price) || 0,
        category: String(req.body?.category || '').trim(),
        stock: Number(req.body?.stock) || 0,
        sku: String(req.body?.sku || '').trim(),
        images: Array.isArray(req.body?.images) ? req.body.images.filter((url) => typeof url === 'string' && url.trim()) : [],
        image: typeof req.body?.image === 'string' ? req.body.image.trim() : '',
        thumbnail: typeof req.body?.thumbnail === 'string' ? req.body.thumbnail.trim() : '',
        isFeatured: false,
        isHotDeal: false,
        isPremium: false,
        discountPercentage: normalizedDiscountPercentage,
        tags: Array.isArray(req.body?.tags) ? req.body.tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
        specifications: req.body?.specifications && typeof req.body.specifications === 'object' ? req.body.specifications : {},
        ...ownerMapping,
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (!productData.name) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      if (!productData.category) {
        return res.status(400).json({ error: 'Category is required' });
      }
      if (!Number.isFinite(productData.price) || productData.price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
      }
      if (!Number.isFinite(productData.stock) || productData.stock < 0) {
        return res.status(400).json({ error: 'Valid stock is required' });
      }
      if (!Number.isFinite(productData.discountPercentage) || productData.discountPercentage < 0 || productData.discountPercentage > 90) {
        return res.status(400).json({ error: 'Discount must be between 0 and 90' });
      }
      if (!productData.thumbnail) {
        productData.thumbnail = productData.image || productData.images?.[0] || '';
      }
      if (!productData.image) {
        productData.image = productData.images?.[0] || productData.thumbnail || '';
      }
      if (!Array.isArray(productData.images) || productData.images.length === 0) {
        productData.images = productData.image ? [productData.image] : [];
      }

      const collection = db.collection('products');
      const result = await collection.insertOne(productData);
      const newProduct = await collection.findOne({ _id: result.insertedId });
      await invalidateCacheByPrefixes(['products']);

      res.status(201).json({
        success: true,
        message: 'Product posted successfully',
        product: transformProduct(newProduct)
      });
    } catch (error) {
      console.error('Error creating seller product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.get('/api/seller/products', authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const sellerUserId = String(req.auth?.sub || '').trim();
      if (!sellerUserId) {
        return res.status(401).json({ error: 'Invalid seller session' });
      }

      const pagination = parsePagination(req) || { page: 1, limit: 20, skip: 0 };
      const q = String(req.query?.q || '').trim();
      const scope = String(req.query?.scope || '').trim().toLowerCase();
      const scopeQuery = scope ? buildScopedQuery(scope, {}) : {};
      const ownershipQuery = buildSellerOwnershipQuery(sellerUserId);
      const searchQuery = q
        ? {
            $or: [
              { name: { $regex: q, $options: 'i' } },
              { category: { $regex: q, $options: 'i' } },
              { sku: { $regex: q, $options: 'i' } }
            ]
          }
        : null;

      const queryClauses = [scopeQuery, ownershipQuery];
      if (searchQuery) queryClauses.push(searchQuery);
      const query = queryClauses.length === 1 ? queryClauses[0] : { $and: queryClauses };

      const collection = db.collection('products');
      const [items, total] = await Promise.all([
        collection
          .find(query)
          .sort({ updatedAt: -1, createdAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .toArray(),
        collection.countDocuments(query)
      ]);

      res.json({
        success: true,
        items: items.map(transformProduct),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        }
      });
    } catch (error) {
      console.error('Error loading seller products:', error);
      res.status(500).json({ error: 'Failed to load seller products' });
    }
  });

  app.get('/api/seller/products/:id', authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const sellerUserId = String(req.auth?.sub || '').trim();
      if (!sellerUserId) {
        return res.status(401).json({ error: 'Invalid seller session' });
      }

      const collection = db.collection('products');
      const { document: product } = await findDocumentByFlexibleId(collection, req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const ownerValues = extractOwnerMapping(product);
      const ownerMatch = Object.values(ownerValues).some((value) => value && value === sellerUserId);
      const isAdmin = String(req.auth?.role || req.auth?.userType || '').toLowerCase() === 'admin';
      if (!ownerMatch && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: this product does not belong to your seller account' });
      }

      res.json({ success: true, product: transformProduct(product) });
    } catch (error) {
      console.error('Error loading seller product:', error);
      res.status(500).json({ error: 'Failed to load seller product' });
    }
  });

  app.put('/api/seller/products/:id', authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const sellerUserId = String(req.auth?.sub || '').trim();
      if (!sellerUserId) {
        return res.status(401).json({ error: 'Invalid seller session' });
      }

      const collection = db.collection('products');
      const { document: product, lookupFilter } = await findDocumentByFlexibleId(collection, req.params.id);
      if (!product || !lookupFilter) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const ownerValues = extractOwnerMapping(product);
      const ownerMatch = Object.values(ownerValues).some((value) => value && value === sellerUserId);
      const isAdmin = String(req.auth?.role || req.auth?.userType || '').toLowerCase() === 'admin';
      if (!ownerMatch && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: this product does not belong to your seller account' });
      }

      const requestedScope = normalizeSellerPostScope(req.body?.marketScope || req.body?.scope || product?.scope);
      const normalizedDiscountPercentage =
        req.body?.discountPercentage !== undefined
          ? normalizeDiscountPercentage(req.body?.discountPercentage)
          : undefined;
      const updateData = {
        name: req.body?.name !== undefined ? String(req.body.name || '').trim() : undefined,
        description: req.body?.description !== undefined ? String(req.body.description || '').trim() : undefined,
        countryOfOrigin: req.body?.countryOfOrigin !== undefined ? String(req.body.countryOfOrigin || '').trim() : undefined,
        isMadeInEthiopia: req.body?.isMadeInEthiopia !== undefined ? normalizeBoolean(req.body?.isMadeInEthiopia, false) : undefined,
        isNewArrival: req.body?.isNewArrival !== undefined ? normalizeBoolean(req.body?.isNewArrival, false) : undefined,
        price: req.body?.price !== undefined ? Number(req.body.price) : undefined,
        category: req.body?.category !== undefined ? String(req.body.category || '').trim() : undefined,
        stock: req.body?.stock !== undefined ? Number(req.body.stock) : undefined,
        sku: req.body?.sku !== undefined ? String(req.body.sku || '').trim() : undefined,
        images: Array.isArray(req.body?.images)
          ? req.body.images.filter((url) => typeof url === 'string' && url.trim())
          : undefined,
        image: req.body?.image !== undefined ? String(req.body.image || '').trim() : undefined,
        thumbnail: req.body?.thumbnail !== undefined ? String(req.body.thumbnail || '').trim() : undefined,
        tags: Array.isArray(req.body?.tags)
          ? req.body.tags.filter((tag) => typeof tag === 'string' && tag.trim())
          : undefined,
        discountPercentage: normalizedDiscountPercentage,
        marketScope: requestedScope,
        scope: requestedScope,
        updatedAt: new Date()
      };

      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

      if (updateData.name !== undefined && !updateData.name) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      if (updateData.category !== undefined && !updateData.category) {
        return res.status(400).json({ error: 'Category is required' });
      }
      if (updateData.price !== undefined && (!Number.isFinite(updateData.price) || updateData.price <= 0)) {
        return res.status(400).json({ error: 'Valid price is required' });
      }
      if (updateData.stock !== undefined && (!Number.isFinite(updateData.stock) || updateData.stock < 0)) {
        return res.status(400).json({ error: 'Valid stock is required' });
      }
      if (
        updateData.discountPercentage !== undefined &&
        (!Number.isFinite(updateData.discountPercentage) || updateData.discountPercentage < 0 || updateData.discountPercentage > 90)
      ) {
        return res.status(400).json({ error: 'Discount must be between 0 and 90' });
      }
      if (!updateData.thumbnail) {
        updateData.thumbnail = updateData.image || updateData.images?.[0] || product?.thumbnail || product?.image || product?.images?.[0] || '';
      }
      if (!updateData.image) {
        updateData.image = updateData.images?.[0] || updateData.thumbnail || product?.image || product?.images?.[0] || '';
      }
      if (!Array.isArray(updateData.images) || updateData.images.length === 0) {
        updateData.images = updateData.image ? [updateData.image] : (Array.isArray(product?.images) ? product.images : []);
      }

      const result = await collection.updateOne(lookupFilter, { $set: applyMarketScopeToDocument(req, updateData) });
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updatedProduct = await collection.findOne(lookupFilter);
      await invalidateCacheByPrefixes(['products']);
      res.json({ success: true, message: 'Product updated successfully', product: transformProduct(updatedProduct) });
    } catch (error) {
      console.error('Error updating seller product:', error);
      res.status(500).json({ error: 'Failed to update seller product' });
    }
  });

  app.delete('/api/seller/products/:id', authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const sellerUserId = String(req.auth?.sub || '').trim();
      if (!sellerUserId) {
        return res.status(401).json({ error: 'Invalid seller session' });
      }

      const collection = db.collection('products');
      const { document: product, lookupFilter } = await findDocumentByFlexibleId(collection, req.params.id);
      if (!product || !lookupFilter) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const ownerValues = extractOwnerMapping(product);
      const ownerMatch = Object.values(ownerValues).some((value) => value && value === sellerUserId);
      const isAdmin = String(req.auth?.role || req.auth?.userType || '').toLowerCase() === 'admin';
      if (!ownerMatch && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: this product does not belong to your seller account' });
      }

      await collection.deleteOne(lookupFilter);
      await invalidateCacheByPrefixes(['products']);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting seller product:', error);
      res.status(500).json({ error: 'Failed to delete seller product' });
    }
  });

  app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('products');
      const productId = req.params.id;

      const updateData = {
        ...req.body,
        name: req.body.name ? String(req.body.name) : undefined,
        description: req.body.description ? String(req.body.description) : undefined,
        countryOfOrigin: req.body.countryOfOrigin !== undefined ? String(req.body.countryOfOrigin || '') : undefined,
        isMadeInEthiopia: req.body.isMadeInEthiopia !== undefined ? normalizeBoolean(req.body.isMadeInEthiopia, false) : undefined,
        isNewArrival: req.body.isNewArrival !== undefined ? normalizeBoolean(req.body.isNewArrival, false) : undefined,
        price: req.body.price ? Number(req.body.price) : undefined,
        category: req.body.category ? String(req.body.category) : undefined,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
        sku: req.body.sku ? String(req.body.sku) : undefined,
        images: Array.isArray(req.body.images) ? req.body.images.filter((url) => typeof url === 'string') : undefined,
        thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : undefined,
        isFeatured: req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : undefined,
        isHotDeal: req.body.isHotDeal !== undefined ? Boolean(req.body.isHotDeal) : undefined,
        isPremium: req.body.isPremium !== undefined ? Boolean(req.body.isPremium) : undefined,
        discountPercentage:
          req.body.discountPercentage !== undefined
            ? req.body.discountPercentage
              ? Number(req.body.discountPercentage)
              : null
            : undefined,
        tags: Array.isArray(req.body.tags) ? req.body.tags.filter((tag) => typeof tag === 'string') : undefined,
        specifications:
          req.body.specifications && typeof req.body.specifications === 'object' ? req.body.specifications : undefined,
        variants: Array.isArray(req.body.variants)
          ? req.body.variants.map((variant) => ({
              ...variant,
              name: String(variant.name || ''),
              price: Number(variant.price) || 0,
              stock: Number(variant.stock) || 0,
              sku: String(variant.sku || ''),
              images: Array.isArray(variant.images) ? variant.images.filter((url) => typeof url === 'string') : []
            }))
          : undefined,
        updatedAt: new Date()
      };

      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

      let updateFilter;
      let product;
      try {
        updateFilter = { _id: new ObjectId(productId) };
        product = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', productId);
        updateFilter = { _id: productId };
        product = await collection.findOne(updateFilter);
      }

      if (!product) {
        updateFilter = { id: productId };
        product = await collection.findOne(updateFilter);
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, product, 'Product')) {
        return;
      }

      const mergedForOwnership = {
        ...product,
        ...updateData
      };
      if (!hasOwnerMapping(mergedForOwnership)) {
        return res.status(400).json({
          error: 'Product owner is required. Provide supplierId or companyId (ownerId/sellerId/createdBy also supported).'
        });
      }

      const result = await collection.updateOne(updateFilter, { $set: applyMarketScopeToDocument(req, updateData) });
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updatedProduct = await collection.findOne(updateFilter);
      await invalidateCacheByPrefixes(['products']);
      res.json(transformProduct(updatedProduct));
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('products');
      const productId = req.params.id;
      const { document: product, lookupFilter } = await findDocumentByFlexibleId(collection, productId);
      if (!product || !lookupFilter) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, product, 'Product')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      await invalidateCacheByPrefixes(['products']);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.delete('/api/products/bulk', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Product IDs array is required' });
      }

      const collection = db.collection('products');
      const objectIds = ids.map((id) => new ObjectId(id));
      const result = await collection.deleteMany(
        buildScopedQuery(resolveRequestedScope(req), {
          $or: [{ _id: { $in: objectIds } }, { id: { $in: ids } }]
        })
      );
      await invalidateCacheByPrefixes(['products']);

      res.json({
        message: `${result.deletedCount} products deleted successfully`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error deleting products:', error);
      res.status(500).json({ error: 'Failed to delete products' });
    }
  });
};

module.exports = registerCatalogRoutes;
