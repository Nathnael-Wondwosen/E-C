// Hero Data service for customer portal
// This service fetches hero carousel data from the MongoDB database via API

import { getCloudinaryImageUrl } from './cloudinaryService';

const API_BASE_URL = 'http://localhost:3000'; // API Gateway

// Cache for hero slides to improve performance
let heroSlidesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for global background image
let globalBackgroundImageCache = null;
let globalBackgroundImageTimestamp = null;
const GLOBAL_BACKGROUND_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cache for categories
let categoriesCache = null;
let categoriesCacheTimestamp = null;
const CATEGORIES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch hero slides from API
export async function getHeroSlides() {
  // Check if we have valid cached data
  const now = Date.now();
  if (heroSlidesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return heroSlidesCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/hero-slides`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const slides = await response.json();
    
    // Update cache
    heroSlidesCache = slides;
    cacheTimestamp = now;
    
    return slides;
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    // Return cached data if available, otherwise return empty array
    return heroSlidesCache || [];
  }
}

// Get cached hero slides or fetch if cache is expired
export async function getCachedHeroSlides() {
  return await getHeroSlides();
}

// Convert file ID to image URL using Cloudinary
export function getAppwriteImageUrl(fileId, width = 1920, height = 1080) {
  return getCloudinaryImageUrl(fileId, width, height);
}

// Fetch categories from API
export async function getCategories() {
  // Check if we have valid cached data
  const now = Date.now();
  if (categoriesCache && categoriesCacheTimestamp && (now - categoriesCacheTimestamp) < CATEGORIES_CACHE_DURATION) {
    return categoriesCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    
    // Update cache
    categoriesCache = categories;
    categoriesCacheTimestamp = now;
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return cached data if available, otherwise return empty array
    return categoriesCache || [];
  }
}

// Fetch global background image from API
export async function getGlobalBackgroundImage() {
  // Check if we have valid cached data
  const now = Date.now();
  if (globalBackgroundImageCache && globalBackgroundImageTimestamp && (now - globalBackgroundImageTimestamp) < GLOBAL_BACKGROUND_CACHE_DURATION) {
    return globalBackgroundImageCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/global-background-image`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const imageUrl = data.imageUrl || '/hero-background.jpg';
    
    // Update cache
    globalBackgroundImageCache = imageUrl;
    globalBackgroundImageTimestamp = now;
    
    return imageUrl;
  } catch (error) {
    console.error('Error fetching global background image:', error);
    // Return cached data if available, otherwise return default
    return globalBackgroundImageCache || '/hero-background.jpg';
  }
}