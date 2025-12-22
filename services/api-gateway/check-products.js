const { MongoClient } = require('mongodb');

// Use the same MongoDB URI as in server.js
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0";
const DB_NAME = "ecommerce_platform";

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db(DB_NAME);
    const products = await db.collection('products').find({}).limit(5).toArray();
    
    console.log('\nSample products:');
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log('ID:', product._id);
      console.log('Name:', product.name);
      console.log('Images:', product.images);
      console.log('Thumbnail:', product.thumbnail);
    });
    
    await client.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();