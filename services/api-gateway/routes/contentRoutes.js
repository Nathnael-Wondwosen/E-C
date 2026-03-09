const registerContentRoutes = ({
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
    findDocumentByFlexibleId
  } = helpers;

  // Hero Slides Routes
  app.get('/api/hero-slides', async (req, res) => {
    try {
      console.log('Fetching active hero slides');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      console.log('Collection accessed, fetching active slides');
      const slides = await collection
        .find(buildScopedQuery(resolveRequestedScope(req), { isActive: true }))
        .toArray();
      console.log('Active slides fetched successfully:', slides.length);
      res.json(slides);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      res.status(500).json({ error: 'Failed to fetch hero slides' });
    }
  });

  app.get('/api/hero-slides/all', async (req, res) => {
    try {
      console.log('Fetching all hero slides');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      console.log('Collection accessed, fetching slides');
      const slides = await collection.find(buildScopedQuery(resolveRequestedScope(req), {})).toArray();
      console.log('Slides fetched successfully:', slides.length);
      res.json(slides);
    } catch (error) {
      console.error('Error fetching all hero slides:', error);
      res.status(500).json({ error: 'Failed to fetch hero slides' });
    }
  });

  app.post('/api/hero-slides', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      const slideData = applyMarketScopeToDocument(req, {
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(slideData);
      const newSlide = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(newSlide);
    } catch (error) {
      console.error('Error creating hero slide:', error);
      res.status(500).json({ error: 'Failed to create hero slide' });
    }
  });

  app.put('/api/hero-slides/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      const slideId = req.params.id;
      const { _id, id, createdAt, ...updateData } = req.body;

      let updateFilter;
      let slide;
      try {
        updateFilter = { _id: new ObjectId(slideId) };
        slide = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', slideId);
        updateFilter = { _id: slideId };
        slide = await collection.findOne(updateFilter);
      }

      if (!slide) {
        updateFilter = { id: slideId };
        slide = await collection.findOne(updateFilter);
      }

      if (!slide) {
        return res.status(404).json({ error: 'Slide not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, slide, 'Slide')) {
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
        return res.status(404).json({ error: 'Slide not found' });
      }

      const updatedSlide = await collection.findOne(updateFilter);
      res.json(updatedSlide);
    } catch (error) {
      console.error('Error updating hero slide:', error);
      res.status(500).json({ error: 'Failed to update hero slide' });
    }
  });

  app.delete('/api/hero-slides/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      const slideId = req.params.id;
      const { document: slide, lookupFilter } = await findDocumentByFlexibleId(collection, slideId);
      if (!slide || !lookupFilter) {
        return res.status(404).json({ error: 'Slide not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, slide, 'Slide')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      res.json({ message: 'Slide deleted successfully' });
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      res.status(500).json({ error: 'Failed to delete hero slide' });
    }
  });

  app.patch('/api/hero-slides/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('hero_slides');
      const slideId = req.params.id;

      let slide;
      try {
        slide = await collection.findOne({ _id: new ObjectId(slideId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', slideId);
        slide = await collection.findOne({ _id: slideId });
      }

      if (!slide) {
        slide = await collection.findOne({ id: slideId });
      }
      if (!slide) {
        return res.status(404).json({ error: 'Slide not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, slide, 'Slide')) {
        return;
      }

      const newStatus = !slide.isActive;
      let updateFilter;
      if (slide._id instanceof ObjectId) {
        updateFilter = { _id: slide._id };
      } else if (slide.id) {
        updateFilter = { id: slide.id };
      } else {
        updateFilter = { _id: slide._id };
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

      const updatedSlide = await collection.findOne(updateFilter);
      res.json(updatedSlide);
    } catch (error) {
      console.error('Error toggling hero slide status:', error);
      res.status(500).json({ error: 'Failed to toggle hero slide status' });
    }
  });

  // Special Offers Routes
  app.get('/api/special-offers', async (req, res) => {
    try {
      console.log('Fetching all special offers');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      console.log('Collection accessed, fetching special offers');
      const offers = await collection.find(buildScopedQuery(resolveRequestedScope(req), {})).toArray();
      console.log('Special offers fetched successfully:', offers.length);
      res.json(offers);
    } catch (error) {
      console.error('Error fetching special offers:', error);
      res.status(500).json({ error: 'Failed to fetch special offers' });
    }
  });

  app.get('/api/special-offers/active', async (req, res) => {
    try {
      console.log('Fetching active special offers');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      console.log('Collection accessed, fetching active special offers');
      const offers = await collection
        .find(buildScopedQuery(resolveRequestedScope(req), { isActive: true }))
        .toArray();
      console.log('Active special offers fetched successfully:', offers.length);
      res.json(offers);
    } catch (error) {
      console.error('Error fetching active special offers:', error);
      res.status(500).json({ error: 'Failed to fetch active special offers' });
    }
  });

  app.post('/api/special-offers', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      const offerData = applyMarketScopeToDocument(req, {
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(offerData);
      const newOffer = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(newOffer);
    } catch (error) {
      console.error('Error creating special offer:', error);
      res.status(500).json({ error: 'Failed to create special offer' });
    }
  });

  app.put('/api/special-offers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      const offerId = req.params.id;
      const { _id, id, createdAt, ...updateData } = req.body;

      let updateFilter;
      let offer;
      try {
        updateFilter = { _id: new ObjectId(offerId) };
        offer = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', offerId);
        updateFilter = { _id: offerId };
        offer = await collection.findOne(updateFilter);
      }

      if (!offer) {
        updateFilter = { id: offerId };
        offer = await collection.findOne(updateFilter);
      }

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, offer, 'Offer')) {
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
        return res.status(404).json({ error: 'Offer not found' });
      }

      const updatedOffer = await collection.findOne(updateFilter);
      res.json(updatedOffer);
    } catch (error) {
      console.error('Error updating special offer:', error);
      res.status(500).json({ error: 'Failed to update special offer' });
    }
  });

  app.delete('/api/special-offers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      const offerId = req.params.id;
      const { document: offer, lookupFilter } = await findDocumentByFlexibleId(collection, offerId);
      if (!offer || !lookupFilter) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, offer, 'Offer')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
      console.error('Error deleting special offer:', error);
      res.status(500).json({ error: 'Failed to delete special offer' });
    }
  });

  app.patch('/api/special-offers/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('special_offers');
      const offerId = req.params.id;

      let offer;
      try {
        offer = await collection.findOne({ _id: new ObjectId(offerId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', offerId);
        offer = await collection.findOne({ _id: offerId });
      }

      if (!offer) {
        offer = await collection.findOne({ id: offerId });
      }
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, offer, 'Offer')) {
        return;
      }

      const newStatus = !offer.isActive;
      let updateFilter;
      if (offer._id instanceof ObjectId) {
        updateFilter = { _id: offer._id };
      } else if (offer.id) {
        updateFilter = { id: offer.id };
      } else {
        updateFilter = { _id: offer._id };
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

      const updatedOffer = await collection.findOne(updateFilter);
      res.json(updatedOffer);
    } catch (error) {
      console.error('Error toggling special offer status:', error);
      res.status(500).json({ error: 'Failed to toggle special offer status' });
    }
  });

  // Banners Routes
  app.get('/api/banners', async (req, res) => {
    try {
      console.log('Fetching all banners');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      console.log('Collection accessed, fetching banners');
      const banners = await collection.find(buildScopedQuery(resolveRequestedScope(req), {})).toArray();
      console.log('Banners fetched successfully:', banners.length);
      res.json(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ error: 'Failed to fetch banners' });
    }
  });

  app.get('/api/banners/active', async (req, res) => {
    try {
      console.log('Fetching active banners');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      console.log('Collection accessed, fetching active banners');
      const banners = await collection
        .find(buildScopedQuery(resolveRequestedScope(req), { isActive: true }))
        .toArray();
      console.log('Active banners fetched successfully:', banners.length);
      res.json(banners);
    } catch (error) {
      console.error('Error fetching active banners:', error);
      res.status(500).json({ error: 'Failed to fetch active banners' });
    }
  });

  app.post('/api/banners', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      const bannerData = applyMarketScopeToDocument(req, {
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(bannerData);
      const newBanner = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(newBanner);
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({ error: 'Failed to create banner' });
    }
  });

  app.put('/api/banners/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      const bannerId = req.params.id;
      const { _id, id, createdAt, ...updateData } = req.body;

      let updateFilter;
      let banner;
      try {
        updateFilter = { _id: new ObjectId(bannerId) };
        banner = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', bannerId);
        updateFilter = { _id: bannerId };
        banner = await collection.findOne(updateFilter);
      }

      if (!banner) {
        updateFilter = { id: bannerId };
        banner = await collection.findOne(updateFilter);
      }

      if (!banner) {
        return res.status(404).json({ error: 'Banner not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, banner, 'Banner')) {
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
        return res.status(404).json({ error: 'Banner not found' });
      }

      const updatedBanner = await collection.findOne(updateFilter);
      res.json(updatedBanner);
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({ error: 'Failed to update banner' });
    }
  });

  app.delete('/api/banners/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      const bannerId = req.params.id;
      const { document: banner, lookupFilter } = await findDocumentByFlexibleId(collection, bannerId);
      if (!banner || !lookupFilter) {
        return res.status(404).json({ error: 'Banner not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, banner, 'Banner')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({ error: 'Failed to delete banner' });
    }
  });

  app.patch('/api/banners/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('banners');
      const bannerId = req.params.id;

      let banner;
      try {
        banner = await collection.findOne({ _id: new ObjectId(bannerId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', bannerId);
        banner = await collection.findOne({ _id: bannerId });
      }

      if (!banner) {
        banner = await collection.findOne({ id: bannerId });
      }
      if (!banner) {
        return res.status(404).json({ error: 'Banner not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, banner, 'Banner')) {
        return;
      }

      const newStatus = !banner.isActive;
      let updateFilter;
      if (banner._id instanceof ObjectId) {
        updateFilter = { _id: banner._id };
      } else if (banner.id) {
        updateFilter = { id: banner.id };
      } else {
        updateFilter = { _id: banner._id };
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

      const updatedBanner = await collection.findOne(updateFilter);
      res.json(updatedBanner);
    } catch (error) {
      console.error('Error toggling banner status:', error);
      res.status(500).json({ error: 'Failed to toggle banner status' });
    }
  });

  // News and Blog Posts Routes
  app.get('/api/news-blog-posts', async (req, res) => {
    try {
      console.log('Fetching all news and blog posts');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      console.log('Collection accessed, fetching news and blog posts');
      const posts = await collection.find(buildScopedQuery(resolveRequestedScope(req), {})).toArray();
      console.log('News and blog posts fetched successfully:', posts.length);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching news and blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch news and blog posts' });
    }
  });

  app.get('/api/news-blog-posts/active', async (req, res) => {
    try {
      console.log('Fetching active news and blog posts');
      const db = getDb();
      if (!db) {
        console.log('Database connection not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      console.log('Collection accessed, fetching active news and blog posts');
      const posts = await collection
        .find(buildScopedQuery(resolveRequestedScope(req), { isActive: true }))
        .toArray();
      console.log('Active news and blog posts fetched successfully:', posts.length);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching active news and blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch active news and blog posts' });
    }
  });

  app.post('/api/news-blog-posts', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      const postData = applyMarketScopeToDocument(req, {
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await collection.insertOne(postData);
      const newPost = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating news/blog post:', error);
      res.status(500).json({ error: 'Failed to create news/blog post' });
    }
  });

  app.put('/api/news-blog-posts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      const postId = req.params.id;
      const { _id, id, createdAt, ...updateData } = req.body;

      let updateFilter;
      let post;
      try {
        updateFilter = { _id: new ObjectId(postId) };
        post = await collection.findOne(updateFilter);
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', postId);
        updateFilter = { _id: postId };
        post = await collection.findOne(updateFilter);
      }

      if (!post) {
        updateFilter = { id: postId };
        post = await collection.findOne(updateFilter);
      }

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, post, 'Post')) {
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
        return res.status(404).json({ error: 'Post not found' });
      }

      const updatedPost = await collection.findOne(updateFilter);
      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating news/blog post:', error);
      res.status(500).json({ error: 'Failed to update news/blog post' });
    }
  });

  app.delete('/api/news-blog-posts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      const postId = req.params.id;
      const { document: post, lookupFilter } = await findDocumentByFlexibleId(collection, postId);
      if (!post || !lookupFilter) {
        return res.status(404).json({ error: 'Post not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, post, 'Post')) {
        return;
      }

      await collection.deleteOne(lookupFilter);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting news/blog post:', error);
      res.status(500).json({ error: 'Failed to delete news/blog post' });
    }
  });

  app.patch('/api/news-blog-posts/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const collection = db.collection('news_blog_posts');
      const postId = req.params.id;

      let post;
      try {
        post = await collection.findOne({ _id: new ObjectId(postId) });
      } catch (objectIdError) {
        console.log('ObjectId conversion failed, trying string ID:', postId);
        post = await collection.findOne({ _id: postId });
      }

      if (!post) {
        post = await collection.findOne({ id: postId });
      }
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      if (!ensureDocumentScopeAccess(req, res, post, 'Post')) {
        return;
      }

      const newStatus = !post.isActive;
      let updateFilter;
      if (post._id instanceof ObjectId) {
        updateFilter = { _id: post._id };
      } else if (post.id) {
        updateFilter = { id: post.id };
      } else {
        updateFilter = { _id: post._id };
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

      const updatedPost = await collection.findOne(updateFilter);
      res.json(updatedPost);
    } catch (error) {
      console.error('Error toggling post status:', error);
      res.status(500).json({ error: 'Failed to toggle post status' });
    }
  });
};

module.exports = registerContentRoutes;
