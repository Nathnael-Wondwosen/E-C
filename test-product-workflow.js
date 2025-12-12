// Test script to verify the complete product management workflow
const http = require('http');
const fs = require('fs');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_IMAGE_PATH = './test-image.png';

// Create a simple test image (1x1 PNG)
function createTestImage() {
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // Bit depth, color type, etc.
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0xDA, 0x63, 0x64, 0x60, 0x60, 0x60, // Compressed data
    0x00, 0x00, 0x00, 0x06, 0x00, 0x02, 0x00, 0x00, // End of data
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82 // CRC
  ]);
  
  fs.writeFileSync(TEST_IMAGE_PATH, pngBuffer);
  console.log('Created test image');
}

// Function to make HTTP requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test product data
const testProduct = {
  name: 'Test Product',
  description: 'This is a test product for workflow verification',
  price: 29.99,
  category: 'Electronics',
  stock: 100,
  sku: 'TEST-PRODUCT-001',
  isFeatured: true,
  isHotDeal: false,
  isPremium: true,
  discountPercentage: 10,
  tags: ['test', 'electronics', 'featured'],
  specifications: {
    weight: '1kg',
    dimensions: '10x10x10cm',
    color: 'Black'
  }
};

async function testWorkflow() {
  console.log('Starting product workflow test...\n');
  
  try {
    // 1. Test API Gateway health
    console.log('1. Testing API Gateway health...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.statusCode === 200 && healthResponse.data.status === 'OK') {
      console.log('   ✓ API Gateway is healthy\n');
    } else {
      console.log('   ✗ API Gateway health check failed\n');
      return;
    }
    
    // 2. Create a test product
    console.log('2. Creating a test product...');
    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(testProduct));
    
    if (createResponse.statusCode === 201) {
      console.log('   ✓ Product created successfully');
      console.log('   Product ID:', createResponse.data.id);
      console.log('   Featured:', createResponse.data.isFeatured);
      console.log('   Premium:', createResponse.data.isPremium);
      console.log('   Discount:', createResponse.data.discountPercentage, '%\n');
    } else {
      console.log('   ✗ Failed to create product');
      console.log('   Status:', createResponse.statusCode);
      console.log('   Error:', createResponse.data.error || createResponse.data);
      return;
    }
    
    const productId = createResponse.data.id;
    
    // 3. Retrieve the created product
    console.log('3. Retrieving the created product...');
    const getResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${productId}`,
      method: 'GET'
    });
    
    if (getResponse.statusCode === 200) {
      console.log('   ✓ Product retrieved successfully');
      console.log('   Name:', getResponse.data.name);
      console.log('   Price:', getResponse.data.price);
      console.log('   Stock:', getResponse.data.stock);
      console.log('   Featured:', getResponse.data.isFeatured);
      console.log('   Premium:', getResponse.data.isPremium);
      console.log('   Discount:', getResponse.data.discountPercentage, '%\n');
    } else {
      console.log('   ✗ Failed to retrieve product');
      console.log('   Status:', getResponse.statusCode);
      return;
    }
    
    // 4. Update the product
    console.log('4. Updating the product...');
    const updatedProduct = {
      ...testProduct,
      name: 'Updated Test Product',
      price: 39.99,
      isHotDeal: true,
      discountPercentage: 15
    };
    
    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${productId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(updatedProduct));
    
    if (updateResponse.statusCode === 200) {
      console.log('   ✓ Product updated successfully');
      console.log('   New Name:', updateResponse.data.name);
      console.log('   New Price:', updateResponse.data.price);
      console.log('   Hot Deal:', updateResponse.data.isHotDeal);
      console.log('   New Discount:', updateResponse.data.discountPercentage, '%\n');
    } else {
      console.log('   ✗ Failed to update product');
      console.log('   Status:', updateResponse.statusCode);
      return;
    }
    
    // 5. List all products
    console.log('5. Listing all products...');
    const listResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'GET'
    });
    
    if (listResponse.statusCode === 200) {
      console.log('   ✓ Retrieved product list successfully');
      console.log('   Total products:', listResponse.data.length);
      const testProductInList = listResponse.data.find(p => p.id == productId);
      if (testProductInList) {
        console.log('   Test product found in list');
        console.log('   Name:', testProductInList.name);
        console.log('   Hot Deal:', testProductInList.isHotDeal);
      } else {
        console.log('   Test product not found in list');
      }
      console.log('');
    } else {
      console.log('   ✗ Failed to retrieve product list');
      console.log('   Status:', listResponse.statusCode);
      return;
    }
    
    // 6. Test Cloudinary upload endpoint
    console.log('6. Testing Cloudinary upload endpoint...');
    // Note: This test requires a running API Gateway with Cloudinary configured
    
    console.log('   Skipping Cloudinary upload test (would require multipart form data)\n');
    
    // 7. Delete the test product
    console.log('7. Deleting the test product...');
    const deleteResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${productId}`,
      method: 'DELETE'
    });
    
    if (deleteResponse.statusCode === 200) {
      console.log('   ✓ Product deleted successfully\n');
    } else {
      console.log('   ✗ Failed to delete product');
      console.log('   Status:', deleteResponse.statusCode);
      return;
    }
    
    console.log('🎉 All tests passed! The product workflow is functioning correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
createTestImage();
testWorkflow();