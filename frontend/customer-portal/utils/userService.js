import { requestJson } from './httpClient';
const ALLOW_MOCK_FALLBACKS = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS === 'true';

const getAuthHeaders = (extraHeaders = {}) => {
  if (typeof window === 'undefined') {
    return extraHeaders;
  }
  const token = localStorage.getItem('userToken');
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const isAuthError = (status, message = '') =>
  status === 401 || /invalid or expired token|missing authorization token|unauthorized/i.test(String(message));

const handleSessionExpired = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userType');
  localStorage.removeItem('userId');
  localStorage.removeItem('userToken');
  window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  window.dispatchEvent(new CustomEvent('sessionExpired'));
};

const strictError = (message) => ({
  success: false,
  message,
});

export const authenticateUser = async (email, password, userType = 'buyer') => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType }),
    });
    if (!ok) return strictError(message);
    return { success: true, user: payload.user, token: payload.token };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) return strictError('Authentication service unavailable');
    if (email === 'user@example.com' && password === 'password123') {
      return {
        success: true,
        user: { id: 1, email, name: 'John Doe', userType, isActive: true },
        token: 'mock-jwt-token',
      };
    }
    return strictError('Invalid email or password');
  }
};

export const createUser = async (userData) => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!ok) return strictError(message);
    return { success: true, user: payload.user, token: payload.token };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) return strictError('Registration service unavailable');
    return {
      success: true,
      user: {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        userType: userData.userType || 'buyer',
        isActive: true,
        profile: userData.profile || {},
      },
      token: 'mock-jwt-token',
    };
  }
};

export const authenticateWithGoogle = async (credential, userType = 'buyer') => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, userType }),
    });
    if (!ok) return strictError(message);
    return { success: true, user: payload.user, token: payload.token };
  } catch {
    return strictError('Google authentication failed');
  }
};

export const getGoogleAuthConfig = async () => {
  try {
    const { ok, payload } = await requestJson('/api/auth/google/config');
    if (!ok) return { configured: false, clientId: '' };
    return {
      configured: Boolean(payload?.configured && payload?.clientId),
      clientId: payload?.clientId || '',
    };
  } catch {
    return { configured: false, clientId: '' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!ok) return strictError(message);
    return {
      success: true,
      message: payload.message || 'Password reset request submitted',
      resetToken: payload.resetToken || '',
      expiresAt: payload.expiresAt || '',
    };
  } catch {
    return strictError('Failed to start password reset');
  }
};

export const validatePasswordResetToken = async (token) => {
  try {
    const { ok, payload, message } = await requestJson(
      `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
    );
    if (!ok) return strictError(message);
    return { success: true, message: payload.message || 'Token is valid' };
  } catch {
    return strictError('Failed to validate reset token');
  }
};

export const resetPasswordWithToken = async (token, password) => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!ok) return strictError(message);
    return { success: true, message: payload.message || 'Password reset successfully' };
  } catch {
    return strictError('Failed to reset password');
  }
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/change-password', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!ok) return strictError(message);
    return { success: true, message: payload.message || 'Password changed successfully' };
  } catch {
    return strictError('Failed to change password');
  }
};

export const getUserProfile = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return {
        id: String(userId || ''),
        email: '',
        name: '',
        userType: 'buyer',
        isActive: false,
        profile: {}
      };
    }
    throw new Error(message);
  }
  return { ...payload, id: payload._id || payload.id };
};

export const updateUserProfile = async (userId, profileData) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(profileData),
  });
  if (!ok) return strictError(message);
  return {
    success: true,
    user: { ...payload, id: payload._id || payload.id },
  };
};

export const getUserCart = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/cart`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { items: [], total: 0, count: 0 };
    }
    throw new Error(message);
  }
  return payload;
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!ok) return strictError(message);
  return payload;
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ quantity }),
  });
  if (!ok) return strictError(message);
  return payload;
};

export const removeFromCart = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!ok) return strictError(message);
  return payload;
};

export const getUserWishlist = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/wishlist`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { items: [] };
    }
    throw new Error(message);
  }
  return payload;
};

export const addToWishlist = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId }),
  });
  if (!ok) return strictError(message);
  return payload;
};

export const removeFromWishlist = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!ok) return strictError(message);
  return payload;
};

export const getUserOrders = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/orders`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { orders: [] };
    }
    throw new Error(message);
  }
  return payload;
};

export const getUserInquiryInbox = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/inquiries/inbox`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { inquiries: [] };
    }
    throw new Error(message);
  }
  return payload;
};

export const getUserInquirySent = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/inquiries/sent`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { inquiries: [] };
    }
    throw new Error(message);
  }
  return payload;
};

export const updateUserInquiryStatus = async (userId, inquiryId, status) => {
  const { ok, payload, message, status: responseStatus } = await requestJson(
    `/api/users/${userId}/inquiries/${encodeURIComponent(inquiryId)}/status`,
    {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    }
  );
  if (!ok) {
    if (isAuthError(responseStatus, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message);
  }
  return {
    success: true,
    message: payload?.message || 'Inquiry status updated',
    inquiry: payload?.inquiry || null,
  };
};

export const submitProductInquiry = async ({ productId, supplierId, quantity = 1, message = '' }) => {
  const { ok, payload, message: responseMessage, status } = await requestJson('/api/product-inquiries', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId, supplierId, quantity, message }),
  });
  if (!ok) {
    if (isAuthError(status, responseMessage)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(responseMessage);
  }
  return {
    success: true,
    message: payload?.message || 'Inquiry sent',
    inquiry: payload?.inquiry || null,
  };
};

export const getProductById = async (productId) => {
  const { ok, payload, message } = await requestJson(`/api/products/${productId}`);
  if (!ok) throw new Error(message);
  const product = payload;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    product.image = product.images[0];
  } else if (product.image) {
    product.images = [product.image];
  }
  return product;
};

export const getProductsByIds = async (productIds) => Promise.all(productIds.map((id) => getProductById(id)));

export default {
  authenticateUser,
  createUser,
  authenticateWithGoogle,
  getGoogleAuthConfig,
  requestPasswordReset,
  validatePasswordResetToken,
  resetPasswordWithToken,
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserOrders,
  getUserInquiryInbox,
  getUserInquirySent,
  updateUserInquiryStatus,
  submitProductInquiry,
  getProductById,
  getProductsByIds,
};
