const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: 'dx8odgao0',
  api_key: '275218777972917',
  api_secret: '275218777972917'
});

// Test upload function
async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    
    // Create a simple buffer with some test data
    const buffer = Buffer.from('This is a test image content', 'utf8');
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'hero_slides',
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result);
            resolve(result);
          }
        }
      );
      
      // Pipe the buffer to Cloudinary
      uploadStream.end(buffer);
    });
    
    console.log('Test completed successfully!');
    console.log('Secure URL:', result.secure_url);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload();