const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const https = require('https');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MongoDB connection
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0";
const DB_NAME = "ecommerce_platform";
let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Middleware to handle raw buffer uploads
// Appwrite upload middleware removed

// Import Cloudinary SDK
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dx8odgao0',
  api_key: process.env.CLOUDINARY_API_KEY || '275218777972917',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'SYU3kCIEAtBvdQVZb1ssf5wv5yM'
});

// Cloudinary Upload Route for general files
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary using signed upload
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'general_uploads',
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Pipe the file buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Return the secure URL
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// Cloudinary Upload Route specifically for product images
app.post('/api/upload/product-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary with product-specific settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          use_filename: true,
          unique_filename: false,
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
            { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Pipe the file buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Return the secure URL and additional metadata
    res.json({ 
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ error: 'Failed to upload product image to Cloudinary' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gateway is running!',
    services: {
      user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      order: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
      payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
      search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3005',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'
    }
  });
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway' });
});

// Hero Slides Routes
app.get('/api/hero-slides', async (req, res) => {
  try {
    console.log('Fetching active hero slides');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    console.log('Collection accessed, fetching active slides');
    const slides = await collection.find({ isActive: true }).toArray();
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    console.log('Collection accessed, fetching slides');
    const slides = await collection.find({}).toArray();
    console.log('Slides fetched successfully:', slides.length);
    res.json(slides);
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

app.post('/api/hero-slides', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    const slideData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Default to active if not specified
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(slideData);
    const newSlide = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newSlide);
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ error: 'Failed to create hero slide' });
  }
});

app.put('/api/hero-slides/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    const slideId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let slide;
    try {
      updateFilter = { _id: new ObjectId(slideId) };
      slide = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', slideId);
      updateFilter = { _id: slideId };
      slide = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!slide) {
      updateFilter = { id: slideId };
      slide = await collection.findOne(updateFilter);
    }
    
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { 
        $set: { 
          ...updateData,
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

app.delete('/api/hero-slides/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    const slideId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(slideId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', slideId);
      result = await collection.deleteOne({ _id: slideId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: slideId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
});

app.patch('/api/hero-slides/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('hero_slides');
    const slideId = req.params.id;
    
    // First, get the current slide to check its status
    let slide;
    try {
      slide = await collection.findOne({ _id: new ObjectId(slideId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', slideId);
      slide = await collection.findOne({ _id: slideId });
    }
    
    // If still not found, try with id field
    if (!slide) {
      slide = await collection.findOne({ id: slideId });
    }
    
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !slide.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (slide._id instanceof ObjectId) {
      updateFilter = { _id: slide._id };
    } else if (slide.id) {
      updateFilter = { id: slide.id };
    } else {
      updateFilter = { _id: slide._id };
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { 
        $set: { 
          isActive: newStatus,
          updatedAt: new Date()
        }
      }
    );
    
    // Find the updated slide using the same ID format
    const updatedSlide = await collection.findOne(updateFilter);
    res.json(updatedSlide);
  } catch (error) {
    console.error('Error toggling hero slide status:', error);
    res.status(500).json({ error: 'Failed to toggle hero slide status' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching all categories');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categories = await collection.find({}).toArray();
    console.log('Categories fetched successfully:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    console.log('Fetching category by ID:', req.params.id);
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryId = req.params.id;
    
    // Try to find by ObjectId first
    let category;
    try {
      category = await collection.findOne({ _id: new ObjectId(categoryId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', categoryId);
      category = await collection.findOne({ _id: categoryId });
    }
    
    // If still not found, try with id field
    if (!category) {
      category = await collection.findOne({ id: categoryId });
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(categoryData);
    const newCategory = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let category;
    try {
      updateFilter = { _id: new ObjectId(categoryId) };
      category = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', categoryId);
      updateFilter = { _id: categoryId };
      category = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!category) {
      updateFilter = { id: categoryId };
      category = await collection.findOne(updateFilter);
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = await collection.findOne(updateFilter);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(categoryId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', categoryId);
      result = await collection.deleteOne({ _id: categoryId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: categoryId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
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

app.post('/api/global-background-image', async (req, res) => {
  try {
    console.log('Saving global background image');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { imageUrl } = req.body;
    
    const collection = db.collection('settings');
    const result = await collection.updateOne(
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

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching all categories');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    console.log('Collection accessed, fetching categories');
    const categories = await collection.find({}).toArray();
    console.log('Categories fetched successfully:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    console.log('Fetching category by ID:', req.params.id);
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    let category;
    
    try {
      category = await collection.findOne({ _id: new ObjectId(req.params.id) });
    } catch (objectIdError) {
      console.log('ObjectId conversion failed, trying string ID:', req.params.id);
      category = await collection.findOne({ _id: req.params.id });
    }
    
    // If still not found, try with id field
    if (!category) {
      category = await collection.findOne({ id: req.params.id });
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(categoryData);
    const newCategory = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let category;
    try {
      updateFilter = { _id: new ObjectId(categoryId) };
      category = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', categoryId);
      updateFilter = { _id: categoryId };
      category = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!category) {
      updateFilter = { id: categoryId };
      category = await collection.findOne(updateFilter);
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = await collection.findOne(updateFilter);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('categories');
    const categoryId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(categoryId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', categoryId);
      result = await collection.deleteOne({ _id: categoryId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: categoryId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching all products');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('products');
    console.log('Collection accessed, fetching products');
    const products = await collection.find({}).toArray();
    console.log('Products fetched successfully:', products.length);
    
    // Transform products to ensure proper data structure
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id || product.id,
      // Ensure boolean values are properly set
      isFeatured: !!product.isFeatured,
      isHotDeal: !!product.isHotDeal,
      isPremium: !!product.isPremium,
      // Ensure discount percentage is a number or null
      discountPercentage: product.discountPercentage ? Number(product.discountPercentage) : null,
      // Ensure images is an array
      images: Array.isArray(product.images) ? product.images : [],
      // Ensure stock is a number
      stock: Number(product.stock) || 0,
      // Ensure price is a number
      price: Number(product.price) || 0
    }));
    
    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('Fetching product by ID:', req.params.id);
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
    
    // If still not found, try with id field
    if (!product) {
      product = await collection.findOne({ id: req.params.id });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Transform the product before sending response
    const transformedProduct = {
      ...product,
      id: product._id || product.id,
      isFeatured: !!product.isFeatured,
      isHotDeal: !!product.isHotDeal,
      isPremium: !!product.isPremium,
      discountPercentage: product.discountPercentage ? Number(product.discountPercentage) : null,
      images: Array.isArray(product.images) ? product.images : [],
      stock: Number(product.stock) || 0,
      price: Number(product.price) || 0
    };
    
    res.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    // Validate and sanitize product data
    const productData = {
      ...req.body,
      // Ensure proper data types
      name: String(req.body.name || ''),
      description: String(req.body.description || ''),
      price: Number(req.body.price) || 0,
      category: String(req.body.category || ''),
      stock: Number(req.body.stock) || 0,
      sku: String(req.body.sku || ''),
      // Handle images array
      images: Array.isArray(req.body.images) ? req.body.images.filter(url => typeof url === 'string') : [],
      // Handle thumbnail
      thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : (Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images[0] : ''),
      // Handle premium features
      isFeatured: Boolean(req.body.isFeatured),
      isHotDeal: Boolean(req.body.isHotDeal),
      isPremium: Boolean(req.body.isPremium),
      // Handle discount percentage
      discountPercentage: req.body.discountPercentage ? Number(req.body.discountPercentage) : null,
      // Handle tags
      tags: Array.isArray(req.body.tags) ? req.body.tags.filter(tag => typeof tag === 'string') : [],
      // Handle specifications
      specifications: req.body.specifications && typeof req.body.specifications === 'object' ? req.body.specifications : {},
      // Handle variants
      variants: Array.isArray(req.body.variants) ? req.body.variants.map(variant => ({
        ...variant,
        name: String(variant.name || ''),
        price: Number(variant.price) || 0,
        stock: Number(variant.stock) || 0,
        sku: String(variant.sku || ''),
        images: Array.isArray(variant.images) ? variant.images.filter(url => typeof url === 'string') : []
      })) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const collection = db.collection('products');
    const result = await collection.insertOne(productData);
    const newProduct = await collection.findOne({ _id: result.insertedId });
    
    // Transform the product before sending response
    const transformedProduct = {
      ...newProduct,
      id: newProduct._id,
      isFeatured: !!newProduct.isFeatured,
      isHotDeal: !!newProduct.isHotDeal,
      isPremium: !!newProduct.isPremium,
      discountPercentage: newProduct.discountPercentage ? Number(newProduct.discountPercentage) : null,
      images: Array.isArray(newProduct.images) ? newProduct.images : [],
      stock: Number(newProduct.stock) || 0,
      price: Number(newProduct.price) || 0
    };
    
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('products');
    const productId = req.params.id;
    
    // Validate and sanitize update data
    const updateData = {
      ...req.body,
      // Ensure proper data types
      name: req.body.name ? String(req.body.name) : undefined,
      description: req.body.description ? String(req.body.description) : undefined,
      price: req.body.price ? Number(req.body.price) : undefined,
      category: req.body.category ? String(req.body.category) : undefined,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
      sku: req.body.sku ? String(req.body.sku) : undefined,
      // Handle images array
      images: Array.isArray(req.body.images) ? req.body.images.filter(url => typeof url === 'string') : undefined,
      // Handle thumbnail
      thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : (Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images[0] : undefined),
      // Handle premium features
      isFeatured: req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : undefined,
      isHotDeal: req.body.isHotDeal !== undefined ? Boolean(req.body.isHotDeal) : undefined,
      isPremium: req.body.isPremium !== undefined ? Boolean(req.body.isPremium) : undefined,
      // Handle discount percentage
      discountPercentage: req.body.discountPercentage !== undefined ? (req.body.discountPercentage ? Number(req.body.discountPercentage) : null) : undefined,
      // Handle tags
      tags: Array.isArray(req.body.tags) ? req.body.tags.filter(tag => typeof tag === 'string') : undefined,
      // Handle specifications
      specifications: req.body.specifications && typeof req.body.specifications === 'object' ? req.body.specifications : undefined,
      // Handle variants
      variants: Array.isArray(req.body.variants) ? req.body.variants.map(variant => ({
        ...variant,
        name: String(variant.name || ''),
        price: Number(variant.price) || 0,
        stock: Number(variant.stock) || 0,
        sku: String(variant.sku || ''),
        images: Array.isArray(variant.images) ? variant.images.filter(url => typeof url === 'string') : []
      })) : undefined,
      updatedAt: new Date()
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let product;
    try {
      updateFilter = { _id: new ObjectId(productId) };
      product = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', productId);
      updateFilter = { _id: productId };
      product = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!product) {
      updateFilter = { id: productId };
      product = await collection.findOne(updateFilter);
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = await collection.findOne(updateFilter);
    
    // Transform the product before sending response
    const transformedProduct = {
      ...updatedProduct,
      id: updatedProduct._id,
      isFeatured: !!updatedProduct.isFeatured,
      isHotDeal: !!updatedProduct.isHotDeal,
      isPremium: !!updatedProduct.isPremium,
      discountPercentage: updatedProduct.discountPercentage ? Number(updatedProduct.discountPercentage) : null,
      images: Array.isArray(updatedProduct.images) ? updatedProduct.images : [],
      stock: Number(updatedProduct.stock) || 0,
      price: Number(updatedProduct.price) || 0
    };
    
    res.json(transformedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('products');
    const productId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(productId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', productId);
      result = await collection.deleteOne({ _id: productId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: productId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// File upload endpoint for Appwrite (removed)
// Appwrite upload endpoint removed

// Start Server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});