const { MongoClient } = require('mongodb');

const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0";
const DB_NAME = "ecommerce_platform";

async function addSampleBanner() {
  let client;
  
  try {
    client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('banners');
    
    const sampleBanner = {
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
      imageUrl: "/placeholder-banner-1.jpg",
      cta: "Shop Now",
      link: "/deals",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(sampleBanner);
    console.log('Sample banner added with ID:', result.insertedId);
    
  } catch (error) {
    console.error('Error adding sample banner:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

addSampleBanner();