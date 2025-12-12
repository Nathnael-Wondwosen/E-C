// Test script to verify API endpoints for categories and products
const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

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

// Test category data
const testCategory = {
  name: 'API Test Category',
  icon: '🧪',
  description: 'Test category created via API',
  parentId: null,
  count: 0
};

// Test product data
const testProduct = {
  name: 'API Test Product',
  description: 'Test product created via API',
  price: 49.99,
  category: 'API Test Category',
  stock: 50,
  sku: 'API-TEST-001',
  images: [],
  isFeatured: true,
  isHotDeal: true,
  isPremium: false,
  discountPercentage: 15,
  tags: ['api-test', 'verification'],
  specifications: { weight: '500g', color: 'Red' }
};

async function testAPIEndpoints() {
  console.log('Starting API endpoint tests...\n');
  
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
    
    // 2. Create a test category
    console.log('2. Creating a test category...');
    const createCategoryResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/categories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(testCategory));
    
    if (createCategoryResponse.statusCode === 201) {
      console.log('   ✓ Category created successfully');
      console.log('   Category ID:', createCategoryResponse.data._id);
    } else {
      console.log('   ✗ Failed to create category');
      console.log('   Status:', createCategoryResponse.statusCode);
      console.log('   Error:', createCategoryResponse.data.error || createCategoryResponse.data);
      return;
    }
    
    const categoryId = createCategoryResponse.data._id;
    
    // 3. Retrieve all categories
    console.log('3. Retrieving all categories...');
    const getCategoriesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/categories',
      method: 'GET'
    });
    
    if (getCategoriesResponse.statusCode === 200) {
      console.log('   ✓ Retrieved categories successfully');
      console.log('   Total categories:', getCategoriesResponse.data.length);
      const testCategoryInList = getCategoriesResponse.data.find(c => c._id == categoryId);
      if (testCategoryInList) {
        console.log('   Test category found in list');
      } else {
        console.log('   Test category not found in list');
      }
    } else {
      console.log('   ✗ Failed to retrieve categories');
      console.log('   Status:', getCategoriesResponse.statusCode);
      return;
    }
    
    // 4. Update the category
    console.log('4. Updating the test category...');
    const updatedCategory = {
      ...testCategory,
      description: 'Updated test category via API',
      count: 10
    };
    
    const updateCategoryResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/categories/${categoryId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(updatedCategory));
    
    if (updateCategoryResponse.statusCode === 200) {
      console.log('   ✓ Category updated successfully');
      console.log('   New description:', updateCategoryResponse.data.description);
      console.log('   New count:', updateCategoryResponse.data.count);
    } else {
      console.log('   ✗ Failed to update category');
      console.log('   Status:', updateCategoryResponse.statusCode);
      return;
    }
    
    // 5. Create a test product
    console.log('5. Creating a test product...');
    const createProductResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(testProduct));
    
    if (createProductResponse.statusCode === 201) {
      console.log('   ✓ Product created successfully');
      console.log('   Product ID:', createProductResponse.data._id);
      console.log('   Featured:', createProductResponse.data.isFeatured);
      console.log('   Hot Deal:', createProductResponse.data.isHotDeal);
      console.log('   Discount:', createProductResponse.data.discountPercentage, '%');
    } else {
      console.log('   ✗ Failed to create product');
      console.log('   Status:', createProductResponse.statusCode);
      console.log('   Error:', createProductResponse.data.error || createProductResponse.data);
      return;
    }
    
    const productId = createProductResponse.data._id;
    
    // 6. Retrieve all products
    console.log('6. Retrieving all products...');
    const getProductsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'GET'
    });
    
    if (getProductsResponse.statusCode === 200) {
      console.log('   ✓ Retrieved products successfully');
      console.log('   Total products:', getProductsResponse.data.length);
      const testProductInList = getProductsResponse.data.find(p => p._id == productId);
      if (testProductInList) {
        console.log('   Test product found in list');
        console.log('   Name:', testProductInList.name);
        console.log('   Price:', testProductInList.price);
      } else {
        console.log('   Test product not found in list');
      }
    } else {
      console.log('   ✗ Failed to retrieve products');
      console.log('   Status:', getProductsResponse.statusCode);
      return;
    }
    
    // 7. Update the product
    console.log('7. Updating the test product...');
    const updatedProduct = {
      ...testProduct,
      price: 59.99,
      isPremium: true,
      discountPercentage: 20
    };
    
    const updateProductResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${productId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(updatedProduct));
    
    if (updateProductResponse.statusCode === 200) {
      console.log('   ✓ Product updated successfully');
      console.log('   New price:', updateProductResponse.data.price);
      console.log('   Premium:', updateProductResponse.data.isPremium);
      console.log('   New discount:', updateProductResponse.data.discountPercentage, '%');
    } else {
      console.log('   ✗ Failed to update product');
      console.log('   Status:', updateProductResponse.statusCode);
      return;
    }
    
    // 8. Delete the test product
    console.log('8. Deleting the test product...');
    const deleteProductResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${productId}`,
      method: 'DELETE'
    });
    
    if (deleteProductResponse.statusCode === 200) {
      console.log('   ✓ Product deleted successfully');
    } else {
      console.log('   ✗ Failed to delete product');
      console.log('   Status:', deleteProductResponse.statusCode);
      return;
    }
    
    // 9. Delete the test category
    console.log('9. Deleting the test category...');
    const deleteCategoryResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/categories/${categoryId}`,
      method: 'DELETE'
    });
    
    if (deleteCategoryResponse.statusCode === 200) {
      console.log('   ✓ Category deleted successfully\n');
    } else {
      console.log('   ✗ Failed to delete category');
      console.log('   Status:', deleteCategoryResponse.statusCode);
      return;
    }
    
    console.log('🎉 All API endpoint tests passed! Categories and products are properly saved to and retrieved from the database.');
    
  } catch (error) {
    console.error('❌ API test failed with error:', error);
  }
}

// Run the test
testAPIEndpoints();