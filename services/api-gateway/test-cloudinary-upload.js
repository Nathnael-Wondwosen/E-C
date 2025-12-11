// Manually load environment variables from the .env file
const fs = require('fs');
const path = require('path');

// Read the .env file - correct path
const envPath = path.resolve(__dirname, '../../.env');
console.log('Looking for .env file at:', envPath);

const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/['"]/g, ''); // Remove quotes if present
    }
  }
});

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from environment variables or defaults
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME || 'dx8odgao0',
  api_key: envVars.CLOUDINARY_API_KEY || '275218777972917',
  api_secret: envVars.CLOUDINARY_API_SECRET || 'SYU3kCIEAtBvdQVZb1ssf5wv5yM' // Updated API secret
});

// Test upload function
async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    console.log('Cloudinary config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      api_secret: cloudinary.config().api_secret ? '***SECRET***' : 'NOT SET'
    });
    
    // Create a simple PNG-like buffer with valid PNG header
    // This creates a 1x1 transparent PNG image
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
    
    // Upload to Cloudinary with minimal options
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          filename: 'test-image.png'
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
      uploadStream.end(pngBuffer);
    });
    
    console.log('Test completed successfully!');
    console.log('Secure URL:', result.secure_url);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload();