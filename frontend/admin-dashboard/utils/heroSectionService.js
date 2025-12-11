// Hero Section service utility for admin dashboard
// This service manages the hero carousel content using MongoDB

import { 
  getHeroSlides, 
  getAllHeroSlides, 
  createHeroSlide, 
  updateHeroSlide, 
  deleteHeroSlide, 
  toggleHeroSlideStatus 
} from './mongoService';

const API_BASE_URL = 'http://localhost:3000'; // API Gateway

// Export all the functions from mongoService
export {
  getHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus
};

// Upload image through API Gateway to Cloudinary
export async function uploadHeroImage(file) {
  try {
    // Log file information for debugging
    console.log('Uploading hero image:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload file through API Gateway
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}. Error details: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Validate response contains URL
    if (!data.url) {
      throw new Error('Upload succeeded but no URL was returned');
    }
    
    console.log('Successfully uploaded hero image:', data.url);
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Get global background image
export async function getGlobalBackgroundImage() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/global-background-image`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.imageUrl || '';
  } catch (error) {
    console.error('Error fetching global background image:', error);
    return '';
  }
}

// Save global background image
export async function saveGlobalBackgroundImage(imageUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/global-background-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error saving global background image:', error);
    throw error;
  }
}