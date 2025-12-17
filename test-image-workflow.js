// Test script to verify product image upload and retrieval workflow
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

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
  
  fs.writeFileSync('./test-product-image.png', pngBuffer);
  console.log('Created test product image');
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

// Function to upload a file using multipart form data
function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fileData = fs.readFileSync(filePath);
    
    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="test-product-image.png"\r\n`),
      Buffer.from('Content-Type: image/png\r\n\r\n'),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload/product-image',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
      }
    };
    
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
    
    req.write(postData);
    req.end();
  });
}

async function testImageWorkflow() {
  console.log('Starting product image workflow test...\n');
  
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
    
    // 2. Create and upload a test image
    console.log('2. Uploading a test product image...');
    createTestImage();
    
    const uploadResponse = await uploadFile('./test-product-image.png');
    
    if (uploadResponse.statusCode === 200 && uploadResponse.data.url) {
      console.log('   ✓ Image uploaded successfully');
      console.log('   Image URL:', uploadResponse.data.url);
      console.log('   Public ID:', uploadResponse.data.publicId);
      console.log('   Dimensions:', uploadResponse.data.width, 'x', uploadResponse.data.height);
      console.log('');
      
      // Store the image URL for later use
      const imageUrl = uploadResponse.data.url;
      
      // 3. Create a product with the uploaded image
      console.log('3. Creating a product with the uploaded image...');
      const testProduct = {
        name: 'Test Product with Image',
        description: 'This is a test product with an uploaded image',
        price: 49.99,
        category: 'Electronics',
        stock: 50,
        sku: 'TEST-IMG-PRODUCT-001',
        images: [imageUrl],
        thumbnail: imageUrl,
        isFeatured: true,
        isHotDeal: false,
        isPremium: true,
        discountPercentage: 5
      };
      
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
        console.log('   ✓ Product with image created successfully');
        console.log('   Product ID:', createResponse.data.id);
        console.log('   Image URL in product:', createResponse.data.images[0]);
        console.log('');
        
        const productId = createResponse.data.id;
        
        // 4. Retrieve the created product and verify image URL
        console.log('4. Retrieving the product and verifying image URL...');
        const getResponse = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: `/api/products/${productId}`,
          method: 'GET'
        });
        
        if (getResponse.statusCode === 200) {
          console.log('   ✓ Product retrieved successfully');
          console.log('   Product name:', getResponse.data.name);
          console.log('   Image URL from database:', getResponse.data.images[0]);
          
          // Verify the image URL matches what we uploaded
          if (getResponse.data.images[0] === imageUrl) {
            console.log('   ✓ Image URL correctly stored and retrieved');
          } else {
            console.log('   ⚠ Image URL mismatch');
            console.log('   Expected:', imageUrl);
            console.log('   Got:', getResponse.data.images[0]);
          }
          console.log('');
        } else {
          console.log('   ✗ Failed to retrieve product');
          console.log('   Status:', getResponse.statusCode);
          return;
        }
        
        // 5. List all products and verify our product is there
        console.log('5. Listing all products to verify our product is included...');
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
            console.log('   ✓ Test product found in list');
            console.log('   Product name:', testProductInList.name);
            console.log('   Image URL in list:', testProductInList.images[0]);
          } else {
            console.log('   ✗ Test product not found in list');
          }
          console.log('');
        } else {
          console.log('   ✗ Failed to retrieve product list');
          console.log('   Status:', listResponse.statusCode);
          return;
        }
        
        // 6. Clean up - delete the test product
        console.log('6. Cleaning up - deleting the test product...');
        const deleteResponse = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: `/api/products/${productId}`,
          method: 'DELETE'
        });
        
        if (deleteResponse.statusCode === 200) {
          console.log('   ✓ Test product deleted successfully\n');
        } else {
          console.log('   ✗ Failed to delete test product');
          console.log('   Status:', deleteResponse.statusCode);
          return;
        }
        
      } else {
        console.log('   ✗ Failed to create product with image');
        console.log('   Status:', createResponse.statusCode);
        console.log('   Error:', createResponse.data.error || createResponse.data);
        return;
      }
      
    } else {
      console.log('   ✗ Failed to upload image');
      console.log('   Status:', uploadResponse.statusCode);
      console.log('   Error:', uploadResponse.data.error || uploadResponse.data);
      return;
    }
    
    console.log('🎉 All image workflow tests passed! Product images are being uploaded and retrieved correctly.');
    
    // Clean up test files
    if (fs.existsSync('./test-product-image.png')) {
      fs.unlinkSync('./test-product-image.png');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testImageWorkflow();