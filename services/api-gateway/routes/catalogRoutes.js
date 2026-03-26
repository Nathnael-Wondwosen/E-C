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
  const { authenticateToken, requireAdmin } = middleware;
  const {
    resolveRequestedScope,
    buildScopedQuery,
    applyMarketScopeToDocument,
    ensureDocumentScopeAccess,
    findDocumentByFlexibleId,
    sendOptimizedJson
  } = helpers;

  const transformProduct = (product) => ({
    ...product,
    id: (product._id || product.id)?.toString?.() || product.id,
    isFeatured: !!product.isFeatured,
    isHotDeal: !!product.isHotDeal,
    isPremium: !!product.isPremium,
    discountPercentage: product.discountPercentage ? Number(product.discountPercentage) : null,
    images: Array.isArray(product.images) ? product.images : [],
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
  });
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
        const items = rows.slice(0, cursorPagination.limit).map(transformProduct);
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
        const items = products.map(transformProduct);
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
      const items = products.map(transformProduct);
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
