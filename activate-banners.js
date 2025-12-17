const { MongoClient, ObjectId } = require('mongodb');

async function activateAllBanners() {
  const uri = "mongodb://localhost:27017"; // Adjust if your MongoDB URI is different
  const dbName = "b2b_ecommerce";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(dbName);
    const collection = db.collection('banners');
    
    // Update all banners to set isActive to true
    const result = await collection.updateMany(
      {}, // Match all documents
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} banners`);
    
    // Verify the updates
    const activeBanners = await collection.find({ isActive: true }).toArray();
    console.log(`Total active banners now: ${activeBanners.length}`);
    
  } catch (error) {
    console.error("Error activating banners:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

activateAllBanners();