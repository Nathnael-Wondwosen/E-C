const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    // Create a simple text file to upload
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('filename', 'test-file.txt');
    
    // Upload to API
    const response = await fetch('http://localhost:3000/api/upload/product-image', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    // Clean up
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('Upload test failed:', error);
  }
}

testUpload();