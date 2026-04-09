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
import { withAdminScopeUrl } from './scopeApi';
import { requestForm, requestJson } from './httpClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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
    console.log('Uploading hero image:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    const { ok, payload, message } = await requestForm(withAdminScopeUrl(`${API_BASE_URL}/api/upload`), {
      method: 'POST',
      body: formData
    });

    if (!ok) {
      throw new Error(message || 'Upload failed');
    }

    if (!payload.url) {
      throw new Error('Upload succeeded but no URL was returned');
    }

    console.log('Successfully uploaded hero image:', payload.url);
    return payload.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Get global background image
export async function getGlobalBackgroundImage() {
  try {
    const { ok, payload, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/global-background-image`), {
      retries: 1
    });
    if (!ok) {
      throw new Error(message || 'Failed to fetch global background image');
    }
    return payload.imageUrl || '';
  } catch (error) {
    console.error('Error fetching global background image:', error);
    return '';
  }
}

// Save global background image
export async function saveGlobalBackgroundImage(imageUrl) {
  try {
    const { ok, payload, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/global-background-image`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!ok) {
      throw new Error(message || 'Failed to save global background image');
    }

    return payload.imageUrl;
  } catch (error) {
    console.error('Error saving global background image:', error);
    throw error;
  }
}
