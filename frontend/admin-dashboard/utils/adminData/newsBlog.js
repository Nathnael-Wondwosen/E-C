import { requestForm, requestJson } from '../httpClient';
import { normalizeEntityDeleteResult, normalizeEntityId, requestMutation, sanitizeMutableEntityInput, scopedUrl } from './core';

export const getNewsBlogPosts = async () => {
  const { ok, payload, message } = await requestJson(scopedUrl('/api/news-blog-posts'), { retries: 1 });
  if (!ok) {
    throw new Error(message || 'Failed to fetch posts');
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalizeEntityId);
};

export const uploadAdminImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { ok, payload, message } = await requestForm(scopedUrl('/api/upload'), {
    method: 'POST',
    body: formData
  });

  if (!ok) {
    throw new Error(message || 'Upload failed');
  }

  if (!payload?.url) {
    throw new Error('Upload succeeded but no URL was returned');
  }

  return payload.url;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', file.name);

  const { ok, payload, message } = await requestForm(scopedUrl('/api/upload/product-image'), {
    method: 'POST',
    body: formData
  });

  if (!ok) {
    throw new Error(message || 'Failed to upload image');
  }

  return payload || {};
};

export const createNewsBlogPost = async (postData) => {
  const post = await requestMutation(scopedUrl('/api/news-blog-posts'), {
    method: 'POST',
    body: postData,
    message: 'Failed to create post'
  });

  return normalizeEntityId(post);
};

export const updateNewsBlogPost = async (id, postData) => {
  const post = await requestMutation(scopedUrl(`/api/news-blog-posts/${id}`), {
    method: 'PUT',
    body: sanitizeMutableEntityInput(postData),
    message: 'Failed to update post'
  });

  return normalizeEntityId(post);
};

export const deleteNewsBlogPost = async (id) => {
  const payload = await requestMutation(scopedUrl(`/api/news-blog-posts/${id}`), {
    method: 'DELETE',
    message: 'Failed to delete post'
  });

  return normalizeEntityDeleteResult(payload);
};

export const toggleNewsBlogPostStatus = async (id) => {
  const post = await requestMutation(scopedUrl(`/api/news-blog-posts/${id}/toggle`), {
    method: 'PATCH',
    message: 'Failed to toggle post status'
  });

  return normalizeEntityId(post);
};
