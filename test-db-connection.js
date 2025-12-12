// Test script to verify database connection and CRUD operations
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.rcuwrqi.mongodb.net/?appName=Cluster0";
const DB_NAME = "ecommerce_platform";

async function testDatabaseConnection() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(DB_NAME);
    
    // Test categories collection
    console.log('\n--- Testing Categories Collection ---');
    const categoriesCollection = db.collection('categories');
    
    // Insert a test category
    const testCategory = {
      name: 'Test Category',
      icon: '🧪',
      description: 'Test category for verification',
      parentId: null,
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting test category...');
    const insertResult = await categoriesCollection.insertOne(testCategory);
    console.log('✅ Category inserted with ID:', insertResult.insertedId);
    
    // Retrieve the inserted category
    console.log('Retrieving test category...');
    const retrievedCategory = await categoriesCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Category retrieved:', retrievedCategory.name);
    
    // Update the category
    console.log('Updating test category...');
    const updateResult = await categoriesCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { description: 'Updated test category', updatedAt: new Date() } }
    );
    console.log('✅ Category updated, matched count:', updateResult.matchedCount);
    
    // Delete the category
    console.log('Deleting test category...');
    const deleteResult = await categoriesCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Category deleted, deleted count:', deleteResult.deletedCount);
    
    // Test products collection
    console.log('\n--- Testing Products Collection ---');
    const productsCollection = db.collection('products');
    
    // Insert a test product
    const testProduct = {
      name: 'Test Product',
      description: 'Test product for verification',
      price: 29.99,
      category: 'Test Category',
      stock: 100,
      sku: 'TEST-PRODUCT-001',
      images: [],
      isFeatured: true,
      isHotDeal: false,
      isPremium: true,
      discountPercentage: 10,
      tags: ['test', 'verification'],
      specifications: { weight: '1kg', color: 'Blue' },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting test product...');
    const productInsertResult = await productsCollection.insertOne(testProduct);
    console.log('✅ Product inserted with ID:', productInsertResult.insertedId);
    
    // Retrieve the inserted product
    console.log('Retrieving test product...');
    const retrievedProduct = await productsCollection.findOne({ _id: productInsertResult.insertedId });
    console.log('✅ Product retrieved:', retrievedProduct.name);
    
    // Update the product
    console.log('Updating test product...');
    const productUpdateResult = await productsCollection.updateOne(
      { _id: productInsertResult.insertedId },
      { $set: { price: 39.99, updatedAt: new Date() } }
    );
    console.log('✅ Product updated, matched count:', productUpdateResult.matchedCount);
    
    // Delete the product
    console.log('Deleting test product...');
    const productDeleteResult = await productsCollection.deleteOne({ _id: productInsertResult.insertedId });
    console.log('✅ Product deleted, deleted count:', productDeleteResult.deletedCount);
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the test
testDatabaseConnection();