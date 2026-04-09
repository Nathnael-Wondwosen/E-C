import { requestJson } from '../httpClient';
import {
  ALLOW_MOCK_FALLBACKS,
  delay,
  normalizeEntityId,
  requestMutation,
  scopedUrl,
  unwrapCollectionPayload
} from './core';

export const getProducts = async () => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl('/api/products'), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch products');
    return unwrapCollectionPayload(payload).map(normalizeEntityId);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch products from API');
    }
    console.warn('Failed to fetch products from API, using mock data:', error);
  }

  await delay(500);
  return [
    { id: 1, name: 'Smartphone X Pro', price: 299.99, category: 'Electronics', stock: 150, sku: 'PHONE-XPRO-001', description: 'Latest smartphone with advanced features' },
    { id: 2, name: 'Bluetooth Headphones', price: 49.99, category: 'Electronics', stock: 300, sku: 'HEADPHONES-BT-002', description: 'Wireless headphones with noise cancellation' },
    { id: 3, name: 'Office Desk Chair', price: 89.99, category: 'Furniture', stock: 75, sku: 'CHAIR-OFFICE-003', description: 'Ergonomic office chair for comfort' },
    { id: 4, name: 'Stainless Steel Cookware', price: 129.99, category: 'Home & Kitchen', stock: 120, sku: 'COOKWARE-SS-004', description: 'Professional grade stainless steel cookware set' },
    { id: 5, name: 'Fitness Tracker Watch', price: 39.99, category: 'Wearables', stock: 200, sku: 'WATCH-FIT-005', description: 'Track your fitness goals with this smartwatch' },
    { id: 6, name: 'Gaming Laptop', price: 1299.99, category: 'Electronics', stock: 25, sku: 'LAPTOP-GAME-006', description: 'High-performance gaming laptop' },
    { id: 7, name: 'Coffee Maker', price: 79.99, category: 'Home & Kitchen', stock: 90, sku: 'COFFEE-MAKER-007', description: 'Automatic drip coffee maker' },
    { id: 8, name: 'Running Shoes', price: 59.99, category: 'Sports', stock: 180, sku: 'SHOES-RUN-008', description: 'Lightweight running shoes for athletes' }
  ];
};

export const getProductById = async (id) => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl(`/api/products/${id}`), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch product');
    return normalizeEntityId(payload);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch product from API');
    }
    console.warn('Failed to fetch product from API, using mock data:', error);
  }

  await delay(300);
  const products = await getProducts();
  return products.find((product) => product.id === parseInt(id, 10) || product.id === id);
};

export const createProduct = async (productData) => {
  try {
    const product = await requestMutation(scopedUrl('/api/products'), {
      method: 'POST',
      body: productData,
      message: 'Failed to create product',
    });
    return normalizeEntityId(product);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to create product via API, using mock data:', error);
  }

  await delay(500);
  return {
    id: Date.now(),
    ...productData
  };
};

export const updateProduct = async (id, productData) => {
  try {
    const product = await requestMutation(scopedUrl(`/api/products/${id}`), {
      method: 'PUT',
      body: productData,
      message: 'Failed to update product',
    });
    return normalizeEntityId(product);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to update product via API, using mock data:', error);
  }

  await delay(500);
  return {
    id: typeof id === 'string' ? id : parseInt(id, 10),
    ...productData
  };
};

export const deleteProduct = async (id) => {
  try {
    await requestMutation(scopedUrl(`/api/products/${id}`), {
      method: 'DELETE',
      message: 'Failed to delete product',
    });
    return { success: true };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to delete product via API, using mock data:', error);
  }

  await delay(500);
  return { success: true };
};
