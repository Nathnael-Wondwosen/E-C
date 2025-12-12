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

// Cloudinary Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary using signed upload
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'hero_slides',
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

// File upload endpoint for Appwrite (removed)
// Appwrite upload endpoint removed

// Start Server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});