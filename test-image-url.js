// Test script to verify image URL handling
const testUrls = [
  '', // Empty URL
  null, // Null URL
  undefined, // Undefined URL
  'https://example.com/image.jpg', // Direct HTTPS URL
  'http://example.com/image.jpg', // Direct HTTP URL
  '/local-image.jpg', // Local path
  'sample-cloudinary-id', // Cloudinary ID
  'https://res.cloudinary.com/dx8odgao0/image/upload/sample-cloudinary-id' // Full Cloudinary URL
];

// Mock the getCloudinaryImageUrl function
function getCloudinaryImageUrl(imageUrl, width = 1920, height = 1080) {
  if (!imageUrl) return '/placeholder-carousel.jpg';
  
  // If it's a direct URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a local path, return as-is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's already a Cloudinary URL, return as-is
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // For any other case, try to construct a Cloudinary URL if it looks like a file ID
  // This handles cases where we might have stored just a file ID from previous implementations
  if (imageUrl.length > 0 && !imageUrl.includes(' ') && !imageUrl.includes('\\')) {
    try {
      // If it looks like a simple identifier, construct a Cloudinary URL
      return `https://res.cloudinary.com/dx8odgao0/image/upload/${imageUrl}`;
    } catch (error) {
      console.warn('Could not construct Cloudinary URL from identifier:', imageUrl);
    }
  }
  
  // Default fallback
  return '/placeholder-carousel.jpg';
}

// Test function
function getImageUrl(imageUrl) {
  // Log the image URL for debugging
  console.log('Processing image URL:', imageUrl);
  
  // Handle null/undefined/empty URLs
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('Empty image URL, returning placeholder');
    return '/placeholder-carousel.jpg';
  }
  
  // If it's already a full HTTP/HTTPS URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('Direct URL detected, returning as-is');
    return imageUrl;
  }
  
  // If it's a local path, return as-is
  if (imageUrl.startsWith('/')) {
    console.log('Local path detected, returning as-is');
    return imageUrl;
  }
  
  // For Cloudinary file IDs or other identifiers, use the Cloudinary service
  try {
    const result = getCloudinaryImageUrl(imageUrl);
    console.log('Cloudinary URL processed:', result);
    return result;
  } catch (error) {
    console.error('Error processing Cloudinary URL:', error);
    return '/placeholder-carousel.jpg';
  }
}

// Run tests
console.log('Testing image URL handling:');
testUrls.forEach((url, index) => {
  console.log(`\nTest ${index + 1}:`, url);
  const result = getImageUrl(url);
  console.log('Result:', result);
});