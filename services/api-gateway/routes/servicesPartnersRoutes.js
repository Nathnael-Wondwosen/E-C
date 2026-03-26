const {
  buildRequestCacheKey,
  getCachedResponse,
  setCachedResponse,
  invalidateCacheByPrefixes
} = require('../helpers/cacheHelpers');

const registerServicesPartnersRoutes = ({
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

  const resolveByFlexibleOrNumericId = async (collection, entityId) => {
    const numericEntityId = parseInt(entityId);
    if (!isNaN(numericEntityId)) {
      const numericMatch = await collection.findOne({ id: numericEntityId });
      if (numericMatch) {
        return { document: numericMatch, lookupFilter: { id: numericEntityId } };
      }
    }

    return findDocumentByFlexibleId(collection, entityId);
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

  // Services Routes
  app.get('/api/services', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const query = buildScopedQuery(resolveRequestedScope(req), { isActive: true });
      const cacheKey = buildRequestCacheKey(req, 'services-active');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }
      const pagination = parsePagination(req);
      if (pagination) {
        const [services, total] = await Promise.all([
          collection.find(query).sort({ order: 1, _id: -1 }).skip(pagination.skip).limit(pagination.limit).toArray(),
          collection.countDocuments(query)
        ]);
        const payload = {
          items: services.map(normalizeEntityId),
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const services = await collection.find(query).sort({ order: 1 }).toArray();
      const payload = services.map(normalizeEntityId);
      await setCachedResponse(cacheKey, payload, 10_000);
      return sendOptimizedJson(req, res, payload);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.get('/api/services/all', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const query = buildScopedQuery(resolveRequestedScope(req), {});
      const cacheKey = buildRequestCacheKey(req, 'services-all');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }
      const pagination = parsePagination(req);
      if (pagination) {
        const [services, total] = await Promise.all([
          collection.find(query).sort({ order: 1, _id: -1 }).skip(pagination.skip).limit(pagination.limit).toArray(),
          collection.countDocuments(query)
        ]);
        const payload = {
          items: services.map(normalizeEntityId),
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const services = await collection.find(query).sort({ order: 1 }).toArray();
      const payload = services.map(normalizeEntityId);
      await setCachedResponse(cacheKey, payload, 10_000);
      return sendOptimizedJson(req, res, payload);
    } catch (error) {
      console.error('Error fetching all services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.post('/api/services', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const newService = applyMarketScopeToDocument(req, {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });

      const result = await collection.insertOne(newService);
      const insertedService = await collection.findOne({ _id: result.insertedId });
      await invalidateCacheByPrefixes(['services-active', 'services-all']);
      res.status(201).json(normalizeEntityId(insertedService));
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  app.put('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const serviceId = req.params.id;
      const { document: service, lookupFilter } = await resolveByFlexibleOrNumericId(collection, serviceId);

      if (!service || !lookupFilter) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, service, 'Service')) {
        return;
      }

      const { _id, ...updateData } = req.body;
      const result = await collection.updateOne(
        lookupFilter,
        {
          $set: {
            ...applyMarketScopeToDocument(req, updateData),
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const updatedService = await collection.findOne(lookupFilter);
      await invalidateCacheByPrefixes(['services-active', 'services-all']);
      res.json(normalizeEntityId(updatedService));
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  app.delete('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const serviceId = req.params.id;
      const { document: service, lookupFilter } = await findDocumentByFlexibleId(collection, serviceId);
      if (!service || !lookupFilter) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, service, 'Service')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      await invalidateCacheByPrefixes(['services-active', 'services-all']);
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  app.patch('/api/services/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('services');
      const serviceId = req.params.id;

      let service;
      try {
        service = await collection.findOne({ _id: new ObjectId(serviceId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', serviceId);
        service = await collection.findOne({ _id: serviceId });
      }

      if (!service) {
        service = await collection.findOne({ id: serviceId });
      }

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, service, 'Service')) {
        return;
      }

      const newStatus = !service.isActive;
      let updateFilter;
      if (service._id instanceof ObjectId) {
        updateFilter = { _id: service._id };
      } else if (service.id) {
        updateFilter = { id: service.id };
      } else {
        updateFilter = { _id: service._id };
      }

      await collection.updateOne(
        updateFilter,
        {
          $set: {
            isActive: newStatus,
            updatedAt: new Date()
          }
        }
      );

      const updatedService = await collection.findOne(updateFilter);
      await invalidateCacheByPrefixes(['services-active', 'services-all']);
      res.json(normalizeEntityId(updatedService));
    } catch (error) {
      console.error('Error toggling service status:', error);
      res.status(500).json({ error: 'Failed to toggle service status' });
    }
  });

  // Partners API Routes
  app.get('/api/partners', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const query = buildScopedQuery(resolveRequestedScope(req), {});
      const cacheKey = buildRequestCacheKey(req, 'partners-all');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }
      const pagination = parsePagination(req);
      if (pagination) {
        const [partners, total] = await Promise.all([
          collection.find(query).sort({ order: 1, _id: -1 }).skip(pagination.skip).limit(pagination.limit).toArray(),
          collection.countDocuments(query)
        ]);
        const payload = {
          items: partners.map(normalizeEntityId),
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const partners = await collection.find(query).sort({ order: 1 }).toArray();
      const payload = partners.map(normalizeEntityId);
      await setCachedResponse(cacheKey, payload, 10_000);
      return sendOptimizedJson(req, res, payload);
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  });

  app.get('/api/partners/active', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const query = buildScopedQuery(resolveRequestedScope(req), { isActive: true });
      const cacheKey = buildRequestCacheKey(req, 'partners-active');
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        return sendOptimizedJson(req, res, cached);
      }
      const pagination = parsePagination(req);
      if (pagination) {
        const [partners, total] = await Promise.all([
          collection.find(query).sort({ order: 1, _id: -1 }).skip(pagination.skip).limit(pagination.limit).toArray(),
          collection.countDocuments(query)
        ]);
        const payload = {
          items: partners.map(normalizeEntityId),
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit))
        };
        await setCachedResponse(cacheKey, payload, 10_000);
        return sendOptimizedJson(req, res, payload);
      }

      const partners = await collection.find(query).sort({ order: 1 }).toArray();
      const payload = partners.map(normalizeEntityId);
      await setCachedResponse(cacheKey, payload, 10_000);
      return sendOptimizedJson(req, res, payload);
    } catch (error) {
      console.error('Error fetching active partners:', error);
      res.status(500).json({ error: 'Failed to fetch active partners' });
    }
  });

  app.post('/api/partners', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const newPartner = applyMarketScopeToDocument(req, {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(newPartner);
      const insertedPartner = await collection.findOne({ _id: result.insertedId });
      await invalidateCacheByPrefixes(['partners-all', 'partners-active']);
      res.status(201).json(normalizeEntityId(insertedPartner));
    } catch (error) {
      console.error('Error creating partner:', error);
      res.status(500).json({ error: 'Failed to create partner' });
    }
  });

  app.put('/api/partners/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const partnerId = req.params.id;
      const { document: partner, lookupFilter } = await resolveByFlexibleOrNumericId(collection, partnerId);

      if (!partner || !lookupFilter) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, partner, 'Partner')) {
        return;
      }

      const { _id, ...updateData } = req.body;
      const result = await collection.updateOne(
        lookupFilter,
        {
          $set: {
            ...applyMarketScopeToDocument(req, updateData),
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      const updatedPartner = await collection.findOne(lookupFilter);
      await invalidateCacheByPrefixes(['partners-all', 'partners-active']);
      res.json(normalizeEntityId(updatedPartner));
    } catch (error) {
      console.error('Error updating partner:', error);
      res.status(500).json({ error: 'Failed to update partner' });
    }
  });

  app.delete('/api/partners/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const partnerId = req.params.id;

      const { document: partner, lookupFilter } = await findDocumentByFlexibleId(collection, partnerId);
      if (!partner || !lookupFilter) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, partner, 'Partner')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      await invalidateCacheByPrefixes(['partners-all', 'partners-active']);
      res.json({ message: 'Partner deleted successfully' });
    } catch (error) {
      console.error('Error deleting partner:', error);
      res.status(500).json({ error: 'Failed to delete partner' });
    }
  });

  app.patch('/api/partners/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('partners');
      const partnerId = req.params.id;

      let partner;
      try {
        partner = await collection.findOne({ _id: new ObjectId(partnerId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', partnerId);
        partner = await collection.findOne({ _id: partnerId });
      }

      if (!partner) {
        partner = await collection.findOne({ id: partnerId });
      }

      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      if (!ensureDocumentScopeAccess(req, res, partner, 'Partner')) {
        return;
      }

      const newStatus = !partner.isActive;
      let updateFilter;
      if (partner._id instanceof ObjectId) {
        updateFilter = { _id: partner._id };
      } else if (partner.id) {
        updateFilter = { id: partner.id };
      } else {
        updateFilter = { _id: partner._id };
      }

      await collection.updateOne(
        updateFilter,
        {
          $set: {
            isActive: newStatus,
            updatedAt: new Date()
          }
        }
      );

      const updatedPartner = await collection.findOne(updateFilter);
      await invalidateCacheByPrefixes(['partners-all', 'partners-active']);
      res.json(normalizeEntityId(updatedPartner));
    } catch (error) {
      console.error('Error toggling partner status:', error);
      res.status(500).json({ error: 'Failed to toggle partner status' });
    }
  });
};

module.exports = registerServicesPartnersRoutes;
