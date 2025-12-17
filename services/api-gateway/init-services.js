const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('ecommerce_platform');
    
    console.log('Creating services collection...');
    
    // Insert sample data
    const services = [
      { 
        id: 1, 
        title: 'Product Sourcing', 
        description: 'Find and source quality products from verified suppliers worldwide', 
        icon: '🔍', 
        isActive: true, 
        order: 1, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 2, 
        title: 'Logistics', 
        description: 'End-to-end shipping and logistics solutions for international trade', 
        icon: '🚚', 
        isActive: true, 
        order: 2, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 3, 
        title: 'Payment Solutions', 
        description: 'Secure and reliable payment processing for B2B transactions', 
        icon: '💳', 
        isActive: true, 
        order: 3, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 4, 
        title: 'Market Analysis', 
        description: 'Comprehensive market research and competitive intelligence', 
        icon: '📊', 
        isActive: true, 
        order: 4, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ];
    
    const result = await db.collection('services').insertMany(services);
    console.log(`Successfully inserted ${result.insertedCount} services`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();