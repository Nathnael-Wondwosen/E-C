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

const fallbackOffers = [
  {
    id: '1',
    title: 'Flash Sale - 24 Hours Only',
    subtitle: 'Up to 70% off on selected electronics',
    description: "Limited time offer on our best selling electronics. Don't miss out on these amazing deals!",
    imageUrl: '/images/flash-sale.jpg',
    discount: '70%',
    expiryDate: '2025-12-15',
    isActive: true
  },
  {
    id: '2',
    title: 'Buy 1 Get 1 Free',
    subtitle: 'On all clothing items this week',
    description: 'Take advantage of our BOGO offer on all clothing items. Perfect opportunity to refresh your wardrobe!',
    imageUrl: '/images/bogo.jpg',
    discount: '50%',
    expiryDate: '2025-12-20',
    isActive: true
  },
  {
    id: '3',
    title: 'Free Gift with Purchase',
    subtitle: 'Free gift on orders over $150',
    description: 'Spend $150 or more and receive a free premium gift. Limited quantities available while supplies last.',
    imageUrl: '/images/free-gift.jpg',
    discount: 'Free',
    expiryDate: '2025-12-25',
    isActive: false
  }
];

export const getSpecialOffers = async () => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl('/api/special-offers'), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch special offers');
    return unwrapCollectionPayload(payload).map(normalizeEntityId);
  } catch (error) {
    console.error('Error fetching special offers:', error);
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch special offers from API');
    }
    return fallbackOffers;
  }
};

export const createSpecialOffer = async (offerData) => {
  try {
    const offer = await requestMutation(scopedUrl('/api/special-offers'), {
      method: 'POST',
      body: offerData,
      message: 'Failed to create special offer',
    });
    return normalizeMutableEntityPayload(offer);
  } catch (error) {
    console.error('Error creating special offer:', error);
    throw error;
  }
};

export const updateSpecialOffer = async (id, offerData) => {
  try {
    const offerId = typeof id === 'object' ? id.toString() : id;
    const offer = await requestMutation(scopedUrl(`/api/special-offers/${offerId}`), {
      method: 'PUT',
      body: sanitizeMutableEntityInput(offerData),
      message: 'Failed to update special offer',
    });
    return normalizeMutableEntityPayload(offer);
  } catch (error) {
    console.error('Error updating special offer:', error);
    throw error;
  }
};

export const deleteSpecialOffer = async (id) => {
  try {
    const offerId = typeof id === 'object' ? id.toString() : id;
    const payload = await requestMutation(scopedUrl(`/api/special-offers/${offerId}`), {
      method: 'DELETE',
      message: 'Failed to delete special offer',
    });
    return normalizeEntityDeleteResult(payload);
  } catch (error) {
    console.error('Error deleting special offer:', error);
    throw error;
  }
};

export const toggleSpecialOfferStatus = async (id) => {
  try {
    const offerId = typeof id === 'object' ? id.toString() : id;
    const offer = await requestMutation(scopedUrl(`/api/special-offers/${offerId}/toggle`), {
      method: 'PATCH',
      message: 'Failed to toggle special offer status',
    });
    return normalizeMutableEntityPayload(offer);
  } catch (error) {
    console.error('Error toggling special offer status:', error);
    throw error;
  }
};
