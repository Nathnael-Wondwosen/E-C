import { requestJson } from '../httpClient';
import {
  ALLOW_MOCK_FALLBACKS,
  delay,
  normalizeEntityId,
  requestMutation,
  scopedUrl,
  unwrapCollectionPayload
} from './core';

export const getCategories = async () => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl('/api/categories'), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch categories');
    return unwrapCollectionPayload(payload).map(normalizeEntityId);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch categories from API');
    }
    console.warn('Failed to fetch categories from API, using mock data:', error);
  }

  await delay(500);
  return [
    { id: 1, name: 'Electronics', icon: 'ðŸ”Œ', description: 'Electronic devices and gadgets', count: 12000, parentId: null },
    { id: 2, name: 'Fashion', icon: 'ðŸ‘•', description: 'Clothing and accessories', count: 8500, parentId: null },
    { id: 3, name: 'Home & Garden', icon: 'ðŸ ', description: 'Home improvement and garden supplies', count: 7200, parentId: null },
    { id: 4, name: 'Sports', icon: 'âš½', description: 'Sports equipment and apparel', count: 5600, parentId: null },
    { id: 5, name: 'Furniture', icon: 'ðŸª‘', description: 'Home and office furniture', count: 3200, parentId: 3 },
    { id: 6, name: 'Kitchen Appliances', icon: 'ðŸ³', description: 'Cooking and kitchen appliances', count: 2800, parentId: 3 },
    { id: 7, name: 'Smartphones', icon: 'ðŸ“±', description: 'Mobile phones and accessories', count: 4500, parentId: 1 },
    { id: 8, name: 'Laptops', icon: 'ðŸ’»', description: 'Computers and laptops', count: 2300, parentId: 1 }
  ];
};

export const getCategoryById = async (id) => {
  try {
    const { ok, payload, message } = await requestJson(scopedUrl(`/api/categories/${id}`), { retries: 1 });
    if (!ok) throw new Error(message || 'Failed to fetch category');
    return normalizeEntityId(payload);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw new Error('Failed to fetch category from API');
    }
    console.warn('Failed to fetch category from API, using mock data:', error);
  }

  await delay(300);
  const categories = await getCategories();
  return categories.find((category) => category.id === parseInt(id, 10) || category.id === id);
};

export const createCategory = async (categoryData) => {
  try {
    const category = await requestMutation(scopedUrl('/api/categories'), {
      method: 'POST',
      body: categoryData,
      message: 'Failed to create category',
    });
    return normalizeEntityId(category);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to create category via API, using mock data:', error);
  }

  await delay(500);
  return {
    id: Date.now(),
    ...categoryData
  };
};

export const updateCategory = async (id, categoryData) => {
  try {
    const category = await requestMutation(scopedUrl(`/api/categories/${id}`), {
      method: 'PUT',
      body: categoryData,
      message: 'Failed to update category',
    });
    return normalizeEntityId(category);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to update category via API, using mock data:', error);
  }

  await delay(500);
  return {
    id: typeof id === 'string' ? id : parseInt(id, 10),
    ...categoryData
  };
};

export const deleteCategory = async (id) => {
  try {
    await requestMutation(scopedUrl(`/api/categories/${id}`), {
      method: 'DELETE',
      message: 'Failed to delete category',
    });
    return { success: true };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) {
      throw error;
    }
    console.warn('Failed to delete category via API, using mock data:', error);
  }

  await delay(500);
  return { success: true };
};
