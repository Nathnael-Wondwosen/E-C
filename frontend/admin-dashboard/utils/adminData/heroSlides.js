import { requestJson } from '../httpClient';
import {
  ALLOW_MOCK_FALLBACKS,
  normalizeEntityDeleteResult,
  normalizeEntityId,
  normalizeMutableEntityPayload,
  requestMutation,
  sanitizeMutableEntityInput,
  scopedUrl,
  unwrapCollectionPayload
} from './core';

const fallbackSlides = [
  {
    id: '1',
    title: 'Global Trade Solutions',
    subtitle: 'Connect with suppliers worldwide',
    imageUrl: '/placeholder-carousel.jpg',
    ctaText: 'Explore Marketplace',
    ctaLink: '/marketplace',
    isActive: true
  },
  {
    id: '2',
    title: 'Wholesale Excellence',
    subtitle: 'Bulk orders with competitive pricing',
    imageUrl: '/placeholder-carousel.jpg',
    ctaText: 'View Products',
    ctaLink: '/products',
    isActive: true
  },
  {
    id: '3',
    title: 'Verified Suppliers',
    subtitle: 'Trusted partners for your business',
    imageUrl: '/placeholder-carousel.jpg',
    ctaText: 'Find Suppliers',
    ctaLink: '/suppliers',
    isActive: true
  }
];

export const getHeroSlides = async () => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl('/api/hero-slides'), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch hero slides');
    return unwrapCollectionPayload(payload).map(normalizeEntityId);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch hero slides from API');
    }
    return fallbackSlides;
  }
};

export const getAllHeroSlides = async () => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl('/api/hero-slides/all'), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch hero slides');
    return unwrapCollectionPayload(payload).map(normalizeEntityId);
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch hero slides from API');
    }
    return fallbackSlides;
  }
};

export const createHeroSlide = async (slideData) => {
  try {
    const slide = await requestMutation(scopedUrl('/api/hero-slides'), {
      method: 'POST',
      body: slideData,
      message: 'Failed to create hero slide',
    });
    return normalizeMutableEntityPayload(slide);
  } catch (error) {
    console.error('Error creating hero slide:', error);
    throw error;
  }
};

export const updateHeroSlide = async (id, slideData) => {
  try {
    const slideId = typeof id === 'object' ? id.toString() : id;
    const slide = await requestMutation(scopedUrl(`/api/hero-slides/${slideId}`), {
      method: 'PUT',
      body: sanitizeMutableEntityInput(slideData),
      message: 'Failed to update hero slide',
    });
    return normalizeMutableEntityPayload(slide);
  } catch (error) {
    console.error('Error updating hero slide:', error);
    throw error;
  }
};

export const deleteHeroSlide = async (id) => {
  try {
    const slideId = typeof id === 'object' ? id.toString() : id;
    const payload = await requestMutation(scopedUrl(`/api/hero-slides/${slideId}`), {
      method: 'DELETE',
      message: 'Failed to delete hero slide',
    });
    return normalizeEntityDeleteResult(payload);
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    throw error;
  }
};

export const toggleHeroSlideStatus = async (id) => {
  try {
    const slideId = typeof id === 'object' ? id.toString() : id;
    const slide = await requestMutation(scopedUrl(`/api/hero-slides/${slideId}/toggle`), {
      method: 'PATCH',
      message: 'Failed to toggle hero slide status',
    });
    return normalizeMutableEntityPayload(slide);
  } catch (error) {
    console.error('Error toggling hero slide status:', error);
    throw error;
  }
};
