// Hero Data service for customer portal
// This service fetches hero carousel data from the MongoDB database via API

import { getCloudinaryImageUrl } from './cloudinaryService';
import { requestJson } from './httpClient';

// Cache for hero slides to improve performance
let heroSlidesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for global background image
let globalBackgroundImageCache = null;
let globalBackgroundImageTimestamp = null;
const GLOBAL_BACKGROUND_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cache for services
let servicesCache = null;
let servicesCacheTimestamp = null;
const SERVICES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for special offers
let specialOffersCache = null;
let specialOffersCacheTimestamp = null;
const SPECIAL_OFFERS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for categories
let categoriesCache = null;
let categoriesCacheTimestamp = null;
const CATEGORIES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for products
let productsCache = null;
let productsCacheTimestamp = null;
const PRODUCTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch hero slides from API
export async function getHeroSlides() {
  // Check if we have valid cached data
  const now = Date.now();
  if (heroSlidesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return heroSlidesCache;
  }

  try {
    const { ok, payload } = await requestJson('/api/hero-slides', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch hero slides');
    const slides = payload;
    
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
export function getCloudinaryImageUrlFromFileId(fileId, width = 1920, height = 1080) {
  return getCloudinaryImageUrl(fileId, width, height);
}

// Fetch services from API
export async function getServices() {
  // Check if we have valid cached data
  const now = Date.now();
  if (servicesCache && servicesCacheTimestamp && (now - servicesCacheTimestamp) < SERVICES_CACHE_DURATION) {
    return servicesCache;
  }

  try {
    const { ok, payload } = await requestJson('/api/services', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch services');
    const services = payload.items || payload;
    
    // Update cache
    servicesCache = services;
    servicesCacheTimestamp = now;
    
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return cached data if available, otherwise return empty array
    return servicesCache || [];
  }
}
// Fetch categories from API
export async function getCategories() {
  // Check if we have valid cached data
  const now = Date.now();
  if (categoriesCache && categoriesCacheTimestamp && (now - categoriesCacheTimestamp) < CATEGORIES_CACHE_DURATION) {
    return categoriesCache;
  }

  try {
    const { ok, payload } = await requestJson('/api/categories', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch categories');
    const categories = payload.items || payload;
    
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

export async function getCategoriesPage(page = 1, limit = 30) {
  try {
    const { ok, payload } = await requestJson(`/api/categories?page=${page}&limit=${limit}`, { retries: 1 });
    if (!ok) {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length, page: 1, limit: payload.length || limit, totalPages: 1 };
    }
    return {
      items: payload.items || [],
      total: payload.total || 0,
      page: payload.page || page,
      limit: payload.limit || limit,
      totalPages: payload.totalPages || 1
    };
  } catch (error) {
    return { items: [], total: 0, page, limit, totalPages: 1 };
  }
}

// Fetch products from API
export async function getProducts() {
  // Check if we have valid cached data
  const now = Date.now();
  if (productsCache && productsCacheTimestamp && (now - productsCacheTimestamp) < PRODUCTS_CACHE_DURATION) {
    return productsCache;
  }

  try {
    const { ok, payload } = await requestJson('/api/products', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch products');
    const products = payload.items || payload;
    
    // Update cache
    productsCache = products;
    productsCacheTimestamp = now;
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return cached data if available, otherwise return empty array
    return productsCache || [];
  }
}

export async function getProductsPage(page = 1, limit = 24) {
  try {
    const { ok, payload } = await requestJson(`/api/products?page=${page}&limit=${limit}`, { retries: 1 });
    if (!ok) {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length, page: 1, limit: payload.length || limit, totalPages: 1 };
    }
    return {
      items: payload.items || [],
      total: payload.total || 0,
      page: payload.page || page,
      limit: payload.limit || limit,
      totalPages: payload.totalPages || 1
    };
  } catch (error) {
    return { items: [], total: 0, page, limit, totalPages: 1 };
  }
}

// Fetch special offers from API
export async function getSpecialOffers() {
  // Check if we have valid cached data
  const now = Date.now();
  if (specialOffersCache && specialOffersCacheTimestamp && (now - specialOffersCacheTimestamp) < SPECIAL_OFFERS_CACHE_DURATION) {
    return specialOffersCache;
  }

  try {
    const { ok, payload } = await requestJson('/api/special-offers/active', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch special offers');
    const offers = payload.items || payload;
    
    // Update cache
    specialOffersCache = offers;
    specialOffersCacheTimestamp = now;
    
    return offers;
  } catch (error) {
    console.error('Error fetching special offers:', error);
    // Return cached data if available, otherwise return empty array
    return specialOffersCache || [];
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
    const { ok, payload } = await requestJson('/api/global-background-image', { retries: 1 });
    if (!ok) throw new Error('Failed to fetch global background image');
    const data = payload;
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
