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

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: [
    'http://localhost:3005',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://e-c-customer-portal.vercel.app',
    'https://main.d2d4u2028bdnmp.amplifyapp.com', // Current Amplify deployment
    'https://*.vercel.app', // Vercel deployments
    'https://*.vercel.com', // Vercel deployments
    process.env.CORS_ORIGIN // Allow custom origin from environment
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

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
          unique_filename: true
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

    // Debug log to see what data is received
    console.log('=== UPLOAD REQUEST ===');
    console.log('Body:', req.body);
    console.log('Filename param:', req.body.filename);

    // Get filename from form data if provided
    const filename = req.body.filename;
    
    // Upload to Cloudinary with product-specific settings
    const result = await new Promise((resolve, reject) => {
      const options = {
        folder: 'products',
        use_filename: true,
        unique_filename: true,
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
          { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
        ]
      };
      
      // If filename is provided, use it
      if (filename) {
        options.filename = filename.split('.')[0]; // Remove extension for Cloudinary
        console.log('Using custom filename:', options.filename);
      } else {
        console.log('Using default filename generation');
      }
      
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result.secure_url);
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
      product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'
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
      thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : '',
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
      thumbnail: typeof req.body.thumbnail === 'string' ? req.body.thumbnail : undefined,
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

// Bulk delete products endpoint
app.delete('/api/products/bulk', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    const collection = db.collection('products');
    
    // Build query to delete multiple products by their IDs
    const objectIds = ids.map(id => new ObjectId(id));
    const result = await collection.deleteMany({
      $or: [
        { _id: { $in: objectIds } },
        { id: { $in: ids } }
      ]
    });
    
    res.json({ 
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

// File upload endpoint for Appwrite (removed)
// Appwrite upload endpoint removed

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { email, password, userType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const collection = db.collection('users');
    
    // Find user by email
    const user = await collection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // In a real implementation, you would hash and verify the password
    // For now, we'll just check if the password matches (not secure for production)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is not active' });
    }
    
    // Generate a simple token (in production, use JWT)
    const token = `token_${Date.now()}_${user._id}`;
    
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        userType: user.userType || 'buyer',
        isActive: user.isActive
      },
      token: token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const { name, email, password, phone, userType, profile } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    const collection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password, // In production, hash the password
      phone,
      userType: userType || 'buyer',
      profile: profile || {
        name,
        email: email.toLowerCase(),
        phone,
        userType: userType || 'buyer'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newUser);
    const createdUser = await collection.findOne({ _id: result.insertedId });
    
    // Generate a simple token (in production, use JWT)
    const token = `token_${Date.now()}_${createdUser._id}`;
    
    res.status(201).json({
      success: true,
      user: {
        id: createdUser._id.toString(),
        email: createdUser.email,
        name: createdUser.name,
        userType: createdUser.userType,
        isActive: createdUser.isActive
      },
      token: token
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get User Profile
app.get('/api/users/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const collection = db.collection('users');
    
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      userType: user.userType,
      isActive: user.isActive,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update User Profile
app.put('/api/users/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const updateData = req.body;
    
    const collection = db.collection('users');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });
    
    res.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.userType,
        isActive: updatedUser.isActive,
        profile: updatedUser.profile,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get User Cart
app.get('/api/users/:id/cart', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const collection = db.collection('carts');
    
    let cart = await collection.findOne({ userId: userId });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = {
        userId: userId,
        items: [],
        total: 0,
        count: 0
      };
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.status(500).json({ error: 'Failed to fetch user cart' });
  }
});

// Add to User Cart
app.post('/api/users/:id/cart', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const collection = db.collection('carts');
    
    // Find existing cart or create new one
    let cart = await collection.findOne({ userId: userId });
    
    if (!cart) {
      // Create new cart
      cart = {
        userId: userId,
        items: [{
          productId,
          quantity: quantity || 1
        }],
        total: 0,
        count: quantity || 1
      };
      
      await collection.insertOne(cart);
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity || 1;
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity: quantity || 1
        });
      }
      
      cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      await collection.updateOne(
        { userId: userId },
        { $set: cart }
      );
    }
    
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Remove from User Cart
app.delete('/api/users/:id/cart/:productId', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const productId = req.params.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const collection = db.collection('carts');
    
    // Find existing cart
    let cart = await collection.findOne({ userId: userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Filter out the item to remove
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    // Recalculate count
    cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update the cart in database
    await collection.updateOne(
      { userId: userId },
      { $set: cart }
    );
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Get User Wishlist
app.get('/api/users/:id/wishlist', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const collection = db.collection('wishlists');
    
    let wishlist = await collection.findOne({ userId: userId });
    
    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      wishlist = {
        userId: userId,
        items: []
      };
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch user wishlist' });
  }
});

// Add to User Wishlist
app.post('/api/users/:id/wishlist', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const collection = db.collection('wishlists');
    
    // Find existing wishlist or create new one
    let wishlist = await collection.findOne({ userId: userId });
    
    if (!wishlist) {
      // Create new wishlist
      wishlist = {
        userId: userId,
        items: [productId]
      };
      
      await collection.insertOne(wishlist);
    } else {
      // Check if product already in wishlist
      if (!wishlist.items.includes(productId)) {
        wishlist.items.push(productId);
        
        await collection.updateOne(
          { userId: userId },
          { $set: { items: wishlist.items } }
        );
      }
    }
    
    res.json({ success: true, message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove from User Wishlist
app.delete('/api/users/:id/wishlist/:productId', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const productId = req.params.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const collection = db.collection('wishlists');
    
    // Find existing wishlist
    let wishlist = await collection.findOne({ userId: userId });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    
    // Filter out the item to remove
    wishlist.items = wishlist.items.filter(item => item !== productId);
    
    // Update the wishlist in database
    await collection.updateOne(
      { userId: userId },
      { $set: { items: wishlist.items } }
    );
    
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Get User Orders
app.get('/api/users/:id/orders', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const collection = db.collection('orders');
    
    const orders = await collection.find({ userId: userId }).sort({ createdAt: -1 }).toArray();
    
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Get User Order by ID
app.get('/api/users/:id/orders/:orderId', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const orderId = req.params.orderId;
    
    const collection = db.collection('orders');
    
    // Try to find the order by userId and orderId
    let order;
    try {
      order = await collection.findOne({ 
        userId: userId, 
        _id: new ObjectId(orderId) 
      });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      order = await collection.findOne({ 
        userId: userId, 
        _id: orderId 
      });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      id: order._id.toString(),
      userId: order.userId,
      orderNumber: order.orderNumber,
      items: order.items,
      shippingInfo: order.shippingInfo,
      paymentMethod: order.paymentMethod,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create User Order
app.post('/api/users/:id/orders', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const userId = req.params.id;
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }
    
    if (!orderData.shippingInfo) {
      return res.status(400).json({ error: 'Shipping information is required' });
    }
    
    if (orderData.total === undefined) {
      return res.status(400).json({ error: 'Order total is required' });
    }
    
    const collection = db.collection('orders');
    
    // Create order object
    const newOrder = {
      userId: userId,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate unique order number
      items: orderData.items,
      shippingInfo: orderData.shippingInfo,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      total: orderData.total,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the new order
    const result = await collection.insertOne(newOrder);
    
    // Clear user's cart after order is placed
    const cartCollection = db.collection('carts');
    await cartCollection.updateOne(
      { userId: userId },
      { $set: { items: [], count: 0 } },
      { upsert: true }
    );
    
    res.status(201).json({
      success: true,
      order: {
        id: result.insertedId.toString(),
        ...newOrder
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Special Offers Routes
app.get('/api/special-offers', async (req, res) => {
  try {
    console.log('Fetching all special offers');
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    console.log('Collection accessed, fetching special offers');
    const offers = await collection.find({}).toArray();
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    console.log('Collection accessed, fetching active special offers');
    const offers = await collection.find({ isActive: true }).toArray();
    console.log('Active special offers fetched successfully:', offers.length);
    res.json(offers);
  } catch (error) {
    console.error('Error fetching active special offers:', error);
    res.status(500).json({ error: 'Failed to fetch active special offers' });
  }
});

app.post('/api/special-offers', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    const offerData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Default to active if not specified
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(offerData);
    const newOffer = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Error creating special offer:', error);
    res.status(500).json({ error: 'Failed to create special offer' });
  }
});

app.put('/api/special-offers/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    const offerId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let offer;
    try {
      updateFilter = { _id: new ObjectId(offerId) };
      offer = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', offerId);
      updateFilter = { _id: offerId };
      offer = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!offer) {
      updateFilter = { id: offerId };
      offer = await collection.findOne(updateFilter);
    }
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
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
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    const updatedOffer = await collection.findOne(updateFilter);
    res.json(updatedOffer);
  } catch (error) {
    console.error('Error updating special offer:', error);
    res.status(500).json({ error: 'Failed to update special offer' });
  }
});

app.delete('/api/special-offers/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    const offerId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(offerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', offerId);
      result = await collection.deleteOne({ _id: offerId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: offerId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting special offer:', error);
    res.status(500).json({ error: 'Failed to delete special offer' });
  }
});

app.patch('/api/special-offers/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('special_offers');
    const offerId = req.params.id;
    
    // First, get the current offer to check its status
    let offer;
    try {
      offer = await collection.findOne({ _id: new ObjectId(offerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', offerId);
      offer = await collection.findOne({ _id: offerId });
    }
    
    // If still not found, try with id field
    if (!offer) {
      offer = await collection.findOne({ id: offerId });
    }
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !offer.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (offer._id instanceof ObjectId) {
      updateFilter = { _id: offer._id };
    } else if (offer.id) {
      updateFilter = { id: offer.id };
    } else {
      updateFilter = { _id: offer._id };
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
    
    // Find the updated offer using the same ID format
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    console.log('Collection accessed, fetching banners');
    const banners = await collection.find({}).toArray();
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    console.log('Collection accessed, fetching active banners');
    const banners = await collection.find({ isActive: true }).toArray();
    console.log('Active banners fetched successfully:', banners.length);
    res.json(banners);
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({ error: 'Failed to fetch active banners' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    const bannerData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Default to active if not specified
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(bannerData);
    const newBanner = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    const bannerId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let banner;
    try {
      updateFilter = { _id: new ObjectId(bannerId) };
      banner = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', bannerId);
      updateFilter = { _id: bannerId };
      banner = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!banner) {
      updateFilter = { id: bannerId };
      banner = await collection.findOne(updateFilter);
    }
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
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
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    const updatedBanner = await collection.findOne(updateFilter);
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    const bannerId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(bannerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', bannerId);
      result = await collection.deleteOne({ _id: bannerId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: bannerId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

app.patch('/api/banners/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('banners');
    const bannerId = req.params.id;
    
    // First, get the current banner to check its status
    let banner;
    try {
      banner = await collection.findOne({ _id: new ObjectId(bannerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', bannerId);
      banner = await collection.findOne({ _id: bannerId });
    }
    
    // If still not found, try with id field
    if (!banner) {
      banner = await collection.findOne({ id: bannerId });
    }
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !banner.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (banner._id instanceof ObjectId) {
      updateFilter = { _id: banner._id };
    } else if (banner.id) {
      updateFilter = { id: banner.id };
    } else {
      updateFilter = { _id: banner._id };
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
    
    // Find the updated banner using the same ID format
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    console.log('Collection accessed, fetching news and blog posts');
    const posts = await collection.find({}).toArray();
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
    if (!db) {
      console.log('Database connection not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    console.log('Collection accessed, fetching active news and blog posts');
    const posts = await collection.find({ isActive: true }).toArray();
    console.log('Active news and blog posts fetched successfully:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching active news and blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch active news and blog posts' });
  }
});

app.post('/api/news-blog-posts', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    const postData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Default to active if not specified
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(postData);
    const newPost = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating news/blog post:', error);
    res.status(500).json({ error: 'Failed to create news/blog post' });
  }
});

app.put('/api/news-blog-posts/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    const postId = req.params.id;
    
    // Remove immutable fields from the update data
    const { _id, id, createdAt, ...updateData } = req.body;
    
    // Try to find and update by ObjectId first
    let updateFilter;
    let post;
    try {
      updateFilter = { _id: new ObjectId(postId) };
      post = await collection.findOne(updateFilter);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', postId);
      updateFilter = { _id: postId };
      post = await collection.findOne(updateFilter);
    }
    
    // If still not found, try with id field
    if (!post) {
      updateFilter = { id: postId };
      post = await collection.findOne(updateFilter);
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
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
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const updatedPost = await collection.findOne(updateFilter);
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating news/blog post:', error);
    res.status(500).json({ error: 'Failed to update news/blog post' });
  }
});

app.delete('/api/news-blog-posts/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    const postId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(postId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', postId);
      result = await collection.deleteOne({ _id: postId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: postId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting news/blog post:', error);
    res.status(500).json({ error: 'Failed to delete news/blog post' });
  }
});

app.patch('/api/news-blog-posts/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('news_blog_posts');
    const postId = req.params.id;
    
    // First, get the current post to check its status
    let post;
    try {
      post = await collection.findOne({ _id: new ObjectId(postId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', postId);
      post = await collection.findOne({ _id: postId });
    }
    
    // If still not found, try with id field
    if (!post) {
      post = await collection.findOne({ id: postId });
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !post.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (post._id instanceof ObjectId) {
      updateFilter = { _id: post._id };
    } else if (post.id) {
      updateFilter = { id: post.id };
    } else {
      updateFilter = { _id: post._id };
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
    
    // Find the updated post using the same ID format
    const updatedPost = await collection.findOne(updateFilter);
    res.json(updatedPost);
  } catch (error) {
    console.error('Error toggling post status:', error);
    res.status(500).json({ error: 'Failed to toggle post status' });
  }
});

// Navbar Management Routes
app.get('/api/navbar-links', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('navbar_links');
    const links = await collection.find({}).sort({ order: 1 }).toArray();
    res.json(links);
  } catch (error) {
    console.error('Error fetching navbar links:', error);
    res.status(500).json({ error: 'Failed to fetch navbar links' });
  }
});

app.post('/api/navbar-links', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('navbar_links');
    const newLink = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newLink);
    const insertedLink = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(insertedLink);
  } catch (error) {
    console.error('Error creating navbar link:', error);
    res.status(500).json({ error: 'Failed to create navbar link' });
  }
});

app.put('/api/navbar-links/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('navbar_links');
    const linkId = req.params.id;
    
    // First, try to find the link to understand what type of ID we're dealing with
    let link;
    let updateFilter;
    
    // Try to parse linkId as a number first (our custom ID field)
    const numericLinkId = parseInt(linkId);
    if (!isNaN(numericLinkId)) {
      // Try to find by our custom id field first
      link = await collection.findOne({ id: numericLinkId });
      if (link) {
        updateFilter = { id: numericLinkId };
      }
    }
    
    // If not found by custom id, try ObjectId
    if (!link) {
      try {
        link = await collection.findOne({ _id: new ObjectId(linkId) });
        if (link) {
          updateFilter = { _id: new ObjectId(linkId) };
        }
      } catch (objectIdError) {
        // If ObjectId conversion fails, try as string _id
        link = await collection.findOne({ _id: linkId });
        if (link) {
          updateFilter = { _id: linkId };
        }
      }
    }
    
    // If still not found, return 404
    if (!link || !updateFilter) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Remove immutable fields from the update data
    const { _id, ...updateData } = req.body;
    
    // Perform the update
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
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Find and return the updated link
    const updatedLink = await collection.findOne(updateFilter);
    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating navbar link:', error);
    res.status(500).json({ error: 'Failed to update navbar link' });
  }
});

app.delete('/api/navbar-links/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('navbar_links');
    const linkId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(linkId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', linkId);
      result = await collection.deleteOne({ _id: linkId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: linkId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting navbar link:', error);
    res.status(500).json({ error: 'Failed to delete navbar link' });
  }
});

app.patch('/api/navbar-links/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('navbar_links');
    const linkId = req.params.id;
    
    // First, get the current link to check its status
    let link;
    try {
      link = await collection.findOne({ _id: new ObjectId(linkId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', linkId);
      link = await collection.findOne({ _id: linkId });
    }
    
    // If still not found, try with id field
    if (!link) {
      link = await collection.findOne({ id: linkId });
    }
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Toggle the enabled status
    const newStatus = !link.enabled;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (link._id instanceof ObjectId) {
      updateFilter = { _id: link._id };
    } else if (link.id) {
      updateFilter = { id: link.id };
    } else {
      updateFilter = { _id: link._id };
    }
    
    const result = await collection.updateOne(
      updateFilter,
      { 
        $set: { 
          enabled: newStatus,
          updatedAt: new Date()
        }
      }
    );
    
    // Find the updated link using the same ID format
    const updatedLink = await collection.findOne(updateFilter);
    res.json(updatedLink);
  } catch (error) {
    console.error('Error toggling link status:', error);
    res.status(500).json({ error: 'Failed to toggle link status' });
  }
});

// Services Routes
app.get('/api/services', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const services = await collection.find({ isActive: true }).sort({ order: 1 }).toArray();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/services/all', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const services = await collection.find({}).sort({ order: 1 }).toArray();
    res.json(services);
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const newService = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    const result = await collection.insertOne(newService);
    const insertedService = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(insertedService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const serviceId = req.params.id;
    
    // First, try to find the service to understand what type of ID we're dealing with
    let service;
    let updateFilter;
    
    // Try to parse serviceId as a number first (our custom ID field)
    const numericServiceId = parseInt(serviceId);
    if (!isNaN(numericServiceId)) {
      // Try to find by our custom id field first
      service = await collection.findOne({ id: numericServiceId });
      if (service) {
        updateFilter = { id: numericServiceId };
      }
    }
    
    // If not found by custom id, try ObjectId
    if (!service) {
      try {
        service = await collection.findOne({ _id: new ObjectId(serviceId) });
        if (service) {
          updateFilter = { _id: new ObjectId(serviceId) };
        }
      } catch (objectIdError) {
        // If ObjectId conversion fails, try as string _id
        service = await collection.findOne({ _id: serviceId });
        if (service) {
          updateFilter = { _id: serviceId };
        }
      }
    }
    
    // If still not found, return 404
    if (!service || !updateFilter) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Remove immutable fields from the update data
    const { _id, ...updateData } = req.body;
    
    // Perform the update
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
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Find and return the updated service
    const updatedService = await collection.findOne(updateFilter);
    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const serviceId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(serviceId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', serviceId);
      result = await collection.deleteOne({ _id: serviceId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: serviceId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

app.patch('/api/services/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('services');
    const serviceId = req.params.id;
    
    // First, get the current service to check its status
    let service;
    try {
      service = await collection.findOne({ _id: new ObjectId(serviceId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', serviceId);
      service = await collection.findOne({ _id: serviceId });
    }
    
    // If still not found, try with id field
    if (!service) {
      service = await collection.findOne({ id: serviceId });
    }
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !service.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (service._id instanceof ObjectId) {
      updateFilter = { _id: service._id };
    } else if (service.id) {
      updateFilter = { id: service.id };
    } else {
      updateFilter = { _id: service._id };
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
    
    // Find the updated service using the same ID format
    const updatedService = await collection.findOne(updateFilter);
    res.json(updatedService);
  } catch (error) {
    console.error('Error toggling service status:', error);
    res.status(500).json({ error: 'Failed to toggle service status' });
  }
});

// Partners API Routes
// GET all partners
app.get('/api/partners', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const partners = await collection.find({}).sort({ order: 1 }).toArray();
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// GET active partners
app.get('/api/partners/active', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const partners = await collection.find({ isActive: true }).sort({ order: 1 }).toArray();
    res.json(partners);
  } catch (error) {
    console.error('Error fetching active partners:', error);
    res.status(500).json({ error: 'Failed to fetch active partners' });
  }
});

// POST create a new partner
app.post('/api/partners', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const newPartner = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newPartner);
    const insertedPartner = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(insertedPartner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

// PUT update a partner
app.put('/api/partners/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const partnerId = req.params.id;
    
    // First, try to find the partner to understand what type of ID we're dealing with
    let partner;
    let updateFilter;
    
    // Try to parse partnerId as a number first (our custom ID field)
    const numericPartnerId = parseInt(partnerId);
    if (!isNaN(numericPartnerId)) {
      // Try to find by our custom id field first
      partner = await collection.findOne({ id: numericPartnerId });
      if (partner) {
        updateFilter = { id: numericPartnerId };
      }
    }
    
    // If not found by custom id, try ObjectId
    if (!partner) {
      try {
        partner = await collection.findOne({ _id: new ObjectId(partnerId) });
        if (partner) {
          updateFilter = { _id: new ObjectId(partnerId) };
        }
      } catch (objectIdError) {
        // If ObjectId conversion fails, try as string _id
        partner = await collection.findOne({ _id: partnerId });
        if (partner) {
          updateFilter = { _id: partnerId };
        }
      }
    }
    
    // If still not found, return 404
    if (!partner || !updateFilter) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    // Remove immutable fields from the update data
    const { _id, ...updateData } = req.body;
    
    // Perform the update
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
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    // Find and return the updated partner
    const updatedPartner = await collection.findOne(updateFilter);
    res.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// DELETE a partner
app.delete('/api/partners/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const partnerId = req.params.id;
    
    // Try to find and delete by ObjectId first
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(partnerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', partnerId);
      result = await collection.deleteOne({ _id: partnerId });
    }
    
    // If still not found, try with id field
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ id: partnerId });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// PATCH toggle partner status
app.patch('/api/partners/:id/toggle', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    const collection = db.collection('partners');
    const partnerId = req.params.id;
    
    // First, get the current partner to check its status
    let partner;
    try {
      partner = await collection.findOne({ _id: new ObjectId(partnerId) });
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', partnerId);
      partner = await collection.findOne({ _id: partnerId });
    }
    
    // If still not found, try with id field
    if (!partner) {
      partner = await collection.findOne({ id: partnerId });
    }
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    // Toggle the isActive status
    const newStatus = !partner.isActive;
    
    // Update using the same ID format that was found
    let updateFilter;
    if (partner._id instanceof ObjectId) {
      updateFilter = { _id: partner._id };
    } else if (partner.id) {
      updateFilter = { id: partner.id };
    } else {
      updateFilter = { _id: partner._id };
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
    
    // Find the updated partner using the same ID format
    const updatedPartner = await collection.findOne(updateFilter);
    res.json(updatedPartner);
  } catch (error) {
    console.error('Error toggling partner status:', error);
    res.status(500).json({ error: 'Failed to toggle partner status' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
