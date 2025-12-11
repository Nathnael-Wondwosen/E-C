// Test the image URL processing in the browser environment
console.log('Testing image URL processing...');

// Test data from the API
const slides = [
  {
    "_id": "69394c8276a99feb81fc6631",
    "title": "Test Update",
    "subtitle": "Testing the fix",
    "imageUrl": "https://example.com/test.jpg",
    "ctaText": "Test Button",
    "ctaLink": "/test",
    "createdAt": "2025-12-10T10:33:38.044Z",
    "updatedAt": "2025-12-10T11:22:21.975Z"
  },
  {
    "_id": "69396b13ef40d3ef50f6538b",
    "title": "Second title",
    "subtitle": "Staffing Made Simple",
    "imageUrl": "69396b1382adb5fc3afb",
    "ctaText": "Click Me",
    "ctaLink": "/test",
    "createdAt": "2025-12-10T12:44:03.297Z",
    "updatedAt": "2025-12-11T07:11:43.657Z",
    "isActive": true
  },
  {
    "_id": "693a68f31fd86e19db1eda4f",
    "title": "Welcome To Our site",
    "subtitle": "Connect with suppliers worldwide",
    "imageUrl": "https://www.freepik.com/free-psd/cosmic-leaf-glittering-autumn-masterpiece_408654923.htm#fromView=search&page=1&position=2&uuid=e26088e5-c62d-47b2-9d94-cc875652b671&query=transparent+image",
    "ctaText": "Click Me",
    "ctaLink": "/marketplace",
    "createdAt": "2025-12-11T06:47:15.163Z",
    "updatedAt": "2025-12-11T07:11:40.196Z",
    "isActive": true
  }
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

// Process each slide
slides.forEach((slide, index) => {
  console.log(`\nProcessing slide ${index + 1}: ${slide.title}`);
  console.log(`Original image URL: ${slide.imageUrl}`);
  const processedUrl = getImageUrl(slide.imageUrl);
  console.log(`Processed image URL: ${processedUrl}`);
});