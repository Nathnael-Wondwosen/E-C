// Shared Cloudinary service for frontend image handling
// Used by both admin dashboard and customer portal

// Upload image to Cloudinary directly from the browser
export async function uploadImageToCloudinary(file) {
  try {
    // Validate file input
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    // Log file information for debugging
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Please upload a JPEG, PNG, GIF, WebP, or AVIF image.`);
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File size ${file.size} bytes exceeds 5MB limit`);
    }
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Check if we have a valid upload preset
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    if (!uploadPreset) {
      throw new Error('No upload preset configured for Cloudinary');
    }
    
    formData.append('upload_preset', uploadPreset); // Default unsigned upload preset
    
    // Log upload configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dx8odgao0';
    console.log('Cloudinary upload configuration:', {
      cloudName,
      uploadPreset
    });
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = `. Error details: ${errorText}`;
      } catch (e) {
        errorDetails = `. Could not retrieve error details.`;
      }
      throw new Error(`Upload failed with status ${response.status}${errorDetails}`);
    }
    
    const data = await response.json();
    
    // Validate response contains secure_url
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no URL was returned');
    }
    
    console.log('Successfully uploaded image to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

// Get image URL for display - handles both direct URLs and Cloudinary URLs
export function getCloudinaryImageUrl(imageUrl, width = 1920, height = 1080) {
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
      // For Next.js frontend apps, we rely on the env variables configured in next.config.js
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dx8odgao0';
      return `https://res.cloudinary.com/${cloudName}/image/upload/${imageUrl}`;
    } catch (error) {
      console.warn('Could not construct Cloudinary URL from identifier:', imageUrl);
    }
  }
  
  // Default fallback
  return '/placeholder-carousel.jpg';
}

export default {
  uploadImageToCloudinary,
  getCloudinaryImageUrl
};