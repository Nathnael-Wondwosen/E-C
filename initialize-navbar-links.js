const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0";
const DB_NAME = "ecommerce_platform";

// Mock navbar links data
const mockNavbarLinks = [
  { id: 1, title: 'Home', url: '/', type: 'internal', enabled: true, order: 1 },
  { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
  { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
  { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
  { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
  { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 },
  { id: 7, title: 'External Link', url: 'https://example.com', type: 'external', enabled: false, order: 7 }
];

async function initializeNavbarLinks() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('navbar_links');
    
    // Check if collection already has data
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log('Navbar links collection already has data. Skipping initialization.');
      return;
    }
    
    console.log('Initializing navbar links collection...');
    
    // Insert mock data
    const result = await collection.insertMany(mockNavbarLinks);
    console.log(`Successfully inserted ${result.insertedCount} navbar links`);
    
  } catch (error) {
    console.error('Error initializing navbar links:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the initialization
initializeNavbarLinks();