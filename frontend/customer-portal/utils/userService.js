import { requestJson } from './httpClient';
import { clearCustomerSession, hydrateCustomerSessionFromToken } from './session';
const ALLOW_MOCK_FALLBACKS = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS === 'true';

const unwrapUserPayload = (payload = {}) => payload?.user || payload;

const normalizeResolvedUserType = (user = {}, fallback = 'buyer') =>
  user?.userType ||
  user?.role ||
  (Array.isArray(user?.roles) && user.roles.length ? user.roles[0] : '') ||
  user?.profile?.userType ||
  fallback ||
  'buyer';

const normalizeUserRecord = (payload = {}, fallbackUserType = 'buyer') => {
  const user = unwrapUserPayload(payload);
  return {
    ...user,
    id: user?._id || user?.id,
    _id: user?._id || user?.id,
    userType: normalizeResolvedUserType(user, fallbackUserType),
  };
};

const extractAuthToken = (payload = {}) =>
  payload?.token ||
  payload?.authToken ||
  payload?.accessToken ||
  payload?.jwt ||
  payload?.data?.token ||
  payload?.data?.authToken ||
  payload?.user?.token ||
  '';

const getAuthHeaders = (extraHeaders = {}) => {
  if (typeof window === 'undefined') {
    return extraHeaders;
  }
  hydrateCustomerSessionFromToken();
  const token = localStorage.getItem('userToken');
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const isAuthError = (status) => status === 401;
const isNetworkUnavailable = (status, message = '') =>
  status === 0 || String(message).toLowerCase().includes('network error');

const handleSessionExpired = () => {
  if (typeof window === 'undefined') return;
  if (window.__customerSessionExpiredDispatched) return;
  window.__customerSessionExpiredDispatched = true;
  clearCustomerSession({ preserveRedirect: true });
  window.dispatchEvent(new CustomEvent('sessionExpired'));
  setTimeout(() => {
    window.__customerSessionExpiredDispatched = false;
  }, 1000);
};

const strictError = (message) => ({
  success: false,
  message,
});

const normalizeOrderItem = (item = {}) => ({
  ...item,
  quantity: item.quantity || item.qty || 1,
  price: Number(item.price ?? item.unitPrice ?? 0),
  name: item.name || item.title || 'Product',
});

const normalizeProductPreview = (product = {}, fallbackId = '') => {
  const id = String(product?._id || product?.id || fallbackId || '');
  const images = Array.isArray(product?.images)
    ? product.images.filter((value) => typeof value === 'string' && value.trim())
    : product?.image
      ? [product.image]
      : [];

  return {
    ...product,
    id,
    _id: id,
    images,
    image: images[0] || product?.image || '',
    name: product?.name || product?.title || `Product ${id || ''}`.trim() || 'Product',
    price: Number(product?.price ?? product?.unitPrice ?? 0),
    seller:
      product?.seller ||
      product?.sellerName ||
      product?.supplierName ||
      product?.companyName ||
      'Seller Name',
  };
};

const normalizeCartItem = (item = {}) => {
  const productId = String(item?.productId || item?.id || item?.product?.id || item?.product?._id || '');
  const product = item?.product ? normalizeProductPreview(item.product, productId) : null;
  const quantity = Number(item?.quantity || 1);
  const price = Number(product?.price ?? item?.price ?? 0);

  return {
    ...item,
    id: productId,
    productId,
    quantity,
    price,
    name: product?.name || item?.name || `Product ${productId}`.trim() || 'Product',
    image: product?.image || '',
    seller: product?.seller || item?.seller || 'Seller Name',
    product,
  };
};

const normalizeWishlistItem = (item = {}) => {
  const productId = String(item?.productId || item?.id || item?.product?.id || item?.product?._id || '');
  const product = item?.product ? normalizeProductPreview(item.product, productId) : null;

  return {
    ...item,
    id: productId,
    productId,
    name: product?.name || item?.name || `Product ${productId}`.trim() || 'Product',
    price: Number(product?.price ?? item?.price ?? 0),
    image: product?.image || '',
    seller: product?.seller || item?.seller || 'Seller Name',
    product,
  };
};

const normalizeCartPayload = (payload = {}, fallbackUserId = '') => {
  const items = Array.isArray(payload?.items) ? payload.items.map(normalizeCartItem) : [];
  return {
    ...payload,
    userId: String(payload?.userId || fallbackUserId || ''),
    items,
    count: Number(payload?.count ?? items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)),
    total: Number(
      payload?.total ??
      items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0)
    ),
  };
};

const normalizeWishlistPayload = (payload = {}, fallbackUserId = '') => {
  const items = Array.isArray(payload?.items) ? payload.items.map(normalizeWishlistItem) : [];
  return {
    ...payload,
    userId: String(payload?.userId || fallbackUserId || ''),
    items,
    totalItems: Number(payload?.totalItems ?? items.length),
  };
};

const PREVIEW_CATALOG_KEY = 'previewProductCatalog';
const getPreviewWishlistKey = (userId) => `previewWishlist:${String(userId || 'guest')}`;
const getPreviewCartKey = (userId) => `previewCart:${String(userId || 'guest')}`;

const readLocalJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore local storage write errors.
  }
};

const normalizePreviewPrice = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const numeric = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizePreviewProduct = (product = {}) => {
  const id = String(product?.id || product?._id || '');
  return {
    id,
    productId: id,
    name: product?.name || product?.title || 'Product',
    price: normalizePreviewPrice(product?.priceValue ?? product?.price),
    image: product?.image || product?.images?.[0] || '',
    seller:
      product?.seller ||
      product?.supplier ||
      product?.supplierName ||
      product?.companyName ||
      'Marketplace seller',
    isPreview: true,
  };
};

export const cachePreviewProducts = (products = []) => {
  if (typeof window === 'undefined') return;
  const catalog = readLocalJson(PREVIEW_CATALOG_KEY, {});
  const nextCatalog = { ...catalog };

  products.forEach((product) => {
    const normalized = normalizePreviewProduct(product);
    if (!normalized.id) return;
    nextCatalog[normalized.id] = normalized;
  });

  writeLocalJson(PREVIEW_CATALOG_KEY, nextCatalog);
};

export const getPreviewProductById = (productId) => {
  const id = String(productId || '');
  if (!id) return null;
  const catalog = readLocalJson(PREVIEW_CATALOG_KEY, {});
  return catalog?.[id] || null;
};

export const getPreviewWishlist = (userId) => {
  const items = readLocalJson(getPreviewWishlistKey(userId), []);
  return Array.isArray(items) ? items : [];
};

export const addPreviewToWishlist = (userId, product) => {
  const normalized = normalizePreviewProduct(product);
  if (!normalized.id) return strictError('Invalid preview product');

  const items = getPreviewWishlist(userId);
  if (!items.some((item) => String(item.productId || item.id) === normalized.id)) {
    items.push(normalized);
    writeLocalJson(getPreviewWishlistKey(userId), items);
  }

  return { success: true, items, isPreview: true };
};

export const removePreviewFromWishlist = (userId, productId) => {
  const id = String(productId || '');
  const items = getPreviewWishlist(userId).filter((item) => String(item.productId || item.id) !== id);
  writeLocalJson(getPreviewWishlistKey(userId), items);
  return { success: true, items, isPreview: true };
};

export const getPreviewCart = (userId) => {
  const items = readLocalJson(getPreviewCartKey(userId), []);
  return Array.isArray(items) ? items : [];
};

export const addPreviewToCart = (userId, product, quantity = 1) => {
  const normalized = normalizePreviewProduct(product);
  if (!normalized.id) return strictError('Invalid preview product');

  const nextQuantity = Math.max(1, Number(quantity || 1));
  const items = getPreviewCart(userId);
  const existingIndex = items.findIndex((item) => String(item.productId || item.id) === normalized.id);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: Number(items[existingIndex].quantity || 0) + nextQuantity,
      isPreview: true,
    };
  } else {
    items.push({
      ...normalized,
      quantity: nextQuantity,
      isPreview: true,
    });
  }

  writeLocalJson(getPreviewCartKey(userId), items);
  return { success: true, items, isPreview: true };
};

export const updatePreviewCartItemQuantity = (userId, productId, quantity) => {
  const id = String(productId || '');
  const nextQuantity = Number(quantity || 0);
  const current = getPreviewCart(userId);

  if (nextQuantity <= 0) {
    const items = current.filter((item) => String(item.productId || item.id) !== id);
    writeLocalJson(getPreviewCartKey(userId), items);
    return { success: true, items, isPreview: true };
  }

  const items = current.map((item) =>
    String(item.productId || item.id) === id
      ? { ...item, quantity: Math.max(1, nextQuantity), isPreview: true }
      : item
  );
  writeLocalJson(getPreviewCartKey(userId), items);
  return { success: true, items, isPreview: true };
};

export const removePreviewFromCart = (userId, productId) => {
  const id = String(productId || '');
  const items = getPreviewCart(userId).filter((item) => String(item.productId || item.id) !== id);
  writeLocalJson(getPreviewCartKey(userId), items);
  return { success: true, items, isPreview: true };
};

const normalizeOrder = (order = {}) => {
  const id = order._id || order.id || '';
  const createdAt = order.createdAt || order.date || order.updatedAt || null;
  return {
    ...order,
    id: String(id),
    createdAt,
    date: createdAt,
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
    total: Number(order.total ?? 0),
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    shipping: Number(order.shipping ?? 0),
  };
};

export const authenticateUser = async (email, password, userType = '') => {
  try {
    const requestBody = {
      email,
      password,
      ...(userType ? { userType } : {}),
    };
    const { ok, payload, message } = await requestJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!ok) return strictError(message);
    return {
      success: true,
      user: normalizeUserRecord(payload, userType || 'buyer'),
      token: extractAuthToken(payload),
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACKS) return strictError('Authentication service unavailable');
    if (email === 'user@example.com' && password === 'password123') {
      return {
        success: true,
        user: { id: 1, email, name: 'John Doe', userType: userType || 'buyer', isActive: true },
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
    return {
      success: true,
      user: normalizeUserRecord(payload, userData.userType || 'buyer'),
      token: extractAuthToken(payload),
    };
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

export const authenticateWithGoogle = async (credential, userType = '') => {
  try {
    const { ok, payload, message } = await requestJson('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, userType }),
    });
    if (!ok) return strictError(message);
    return {
      success: true,
      user: normalizeUserRecord(payload, userType || 'buyer'),
      token: extractAuthToken(payload),
    };
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
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return strictError('Email is required');
  }

  try {
    const { ok, payload, message } = await requestJson('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
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
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) {
    return strictError('Reset token is required');
  }

  try {
    const { ok, payload, message } = await requestJson(
      `/api/auth/reset-password/validate?token=${encodeURIComponent(normalizedToken)}`
    );
    if (!ok) return strictError(message);
    return { success: true, message: payload.message || 'Token is valid' };
  } catch {
    return strictError('Failed to validate reset token');
  }
};

export const resetPasswordWithToken = async (token, password) => {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) {
    return strictError('Reset token is required');
  }
  if (String(password || '').length < 6) {
    return strictError('Password must be at least 6 characters');
  }

  try {
    const { ok, payload, message } = await requestJson('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: normalizedToken, password }),
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
  return normalizeUserRecord(payload);
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
    user: normalizeUserRecord(payload, profileData?.userType || profileData?.profile?.userType || 'buyer'),
  };
};

export const getUserCart = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/cart`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { items: [], total: 0, count: 0, userId: String(userId || '') };
    }
    if (isNetworkUnavailable(status, message)) {
      return { items: [], total: 0, count: 0, userId: String(userId || '') };
    }
    throw new Error(message);
  }
  return normalizeCartPayload(payload, userId);
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!ok) return strictError(message);
  return payload?.success === false
    ? payload
    : {
        ...payload,
        ...(payload?.items ? normalizeCartPayload(payload, userId) : {})
      };
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ quantity }),
  });
  if (!ok) return strictError(message);
  return payload?.success === false
    ? payload
    : {
        ...payload,
        ...(payload?.items ? normalizeCartPayload(payload, userId) : {})
      };
};

export const removeFromCart = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/cart/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!ok) return strictError(message);
  return payload?.success === false
    ? payload
    : {
        ...payload,
        ...(payload?.items ? normalizeCartPayload(payload, userId) : {})
      };
};

export const getUserWishlist = async (userId) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/wishlist`, {
    headers: getAuthHeaders(),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return { items: [], totalItems: 0, userId: String(userId || '') };
    }
    if (isNetworkUnavailable(status, message)) {
      return { items: [], totalItems: 0, userId: String(userId || '') };
    }
    throw new Error(message);
  }
  return normalizeWishlistPayload(payload, userId);
};

export const addToWishlist = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId }),
  });
  if (!ok) return strictError(message);
  return payload?.success === false
    ? payload
    : {
        ...payload,
        ...(payload?.items ? normalizeWishlistPayload(payload, userId) : {})
      };
};

export const removeFromWishlist = async (userId, productId) => {
  const { ok, payload, message } = await requestJson(`/api/users/${userId}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!ok) return strictError(message);
  return payload?.success === false
    ? payload
    : {
        ...payload,
        ...(payload?.items ? normalizeWishlistPayload(payload, userId) : {})
      };
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
  return {
    ...payload,
    orders: Array.isArray(payload.orders) ? payload.orders.map(normalizeOrder) : [],
  };
};

export const getUserOrderById = async (userId, orderId) => {
  const { ok, payload, message, status } = await requestJson(
    `/api/users/${userId}/orders/${encodeURIComponent(orderId)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return null;
    }
    throw new Error(message);
  }
  return normalizeOrder(payload);
};

export const createUserOrder = async (userId, orderData) => {
  const { ok, payload, message, status } = await requestJson(`/api/users/${userId}/orders`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(orderData),
  });
  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message);
  }
  return {
    success: true,
    order: normalizeOrder(payload?.order || {}),
  };
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

export const replyToProductInquiry = async (inquiryId, message) => {
  const normalizedInquiryId = String(inquiryId || '').trim();
  const normalizedMessage = String(message || '').trim();
  if (!normalizedInquiryId || !normalizedMessage) {
    return strictError('Inquiry and message are required');
  }

  const { ok, payload, message: responseMessage, status } = await requestJson(
    `/api/product-inquiries/${encodeURIComponent(normalizedInquiryId)}/messages`,
    {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message: normalizedMessage }),
    }
  );

  if (!ok) {
    if (isAuthError(status, responseMessage)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(responseMessage);
  }

  return {
    success: true,
    message: payload?.message || 'Reply sent',
    inquiry: payload?.inquiry || null,
  };
};

export const markInquiryAsRead = async (inquiryId) => {
  const normalizedInquiryId = String(inquiryId || '').trim();
  if (!normalizedInquiryId) return strictError('Inquiry is required');

  const { ok, payload, message, status } = await requestJson(
    `/api/product-inquiries/${encodeURIComponent(normalizedInquiryId)}/read`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  );

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to mark inquiry as read');
  }

  return {
    success: true,
    message: payload?.message || 'Inquiry marked as read',
    inquiry: payload?.inquiry || null
  };
};

export const subscribeToInquiryUpdates = (userId, { mode = '', onSnapshot, onError } = {}) => {
  if (typeof window === 'undefined') return () => {};
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) return () => {};

  const controller = new AbortController();
  const normalizedMode = mode === 'inbox' || mode === 'sent' ? mode : '';
  const endpoint = normalizedMode
    ? `/api/users/${encodeURIComponent(normalizedUserId)}/inquiries/stream?mode=${encodeURIComponent(normalizedMode)}`
    : `/api/users/${encodeURIComponent(normalizedUserId)}/inquiries/stream`;

  const parseSseChunk = (rawBlock) => {
    const lines = String(rawBlock || '').split('\n');
    let event = 'message';
    const dataLines = [];

    for (const line of lines) {
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('event:')) {
        event = line.slice(6).trim() || 'message';
        continue;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (!dataLines.length) return null;
    const payloadText = dataLines.join('\n');
    try {
      return { event, payload: JSON.parse(payloadText) };
    } catch {
      return { event, payload: { raw: payloadText } };
    }
  };

  const start = async () => {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders({
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache'
        }),
        signal: controller.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`Inquiry stream unavailable (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.indexOf('\n\n');
        while (separatorIndex >= 0) {
          const rawBlock = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          const parsed = parseSseChunk(rawBlock);
          if (parsed?.event === 'snapshot' && typeof onSnapshot === 'function') {
            onSnapshot(parsed.payload || {});
          } else if (parsed?.event === 'error' && typeof onError === 'function') {
            onError(parsed.payload || {});
          }
          separatorIndex = buffer.indexOf('\n\n');
        }
      }
    } catch (error) {
      if (!controller.signal.aborted && typeof onError === 'function') {
        onError({ message: error?.message || 'stream_failed' });
      }
    }
  };

  start();
  return () => controller.abort();
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

export const getProductReviews = async (productId) => {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return { success: false, reviews: [], summary: { totalReviews: 0, averageRating: 0 } };

  const { ok, payload, message } = await requestJson(`/api/products/${encodeURIComponent(normalizedId)}/reviews`, {
    retries: 1
  });
  if (!ok) return strictError(message || 'Failed to load product reviews');
  return {
    success: true,
    reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
    summary: payload?.summary || { totalReviews: 0, averageRating: 0 }
  };
};

export const submitProductReview = async (productId, { rating, comment }) => {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return strictError('Product ID is required');
  const normalizedComment = String(comment || '').trim();
  const normalizedRating = Number(rating || 0);
  if (!normalizedComment) return strictError('Comment is required');
  if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    return strictError('Rating must be between 1 and 5');
  }

  const { ok, payload, message, status } = await requestJson(`/api/products/${encodeURIComponent(normalizedId)}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rating: Math.round(normalizedRating), comment: normalizedComment })
  });

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to submit review');
  }

  return {
    success: true,
    message: payload?.message || 'Review submitted',
    review: payload?.review || null,
    summary: payload?.summary || null
  };
};

export const createSellerProduct = async (productData) => {
  try {
    const { ok, payload, message, status } = await requestJson('/api/seller/products', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData || {}),
    });

    if (!ok) {
      if (isAuthError(status, message)) {
        handleSessionExpired();
        return strictError('Session expired. Please sign in again.');
      }
      return strictError(message || 'Failed to create product');
    }

    return {
      success: true,
      message: payload?.message || 'Product posted successfully',
      product: payload?.product || payload || null,
    };
  } catch {
    return strictError('Failed to create product');
  }
};

export const getSellerProducts = async ({ page = 1, limit = 20, query = '' } = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(Math.max(1, Number(page) || 1)));
  params.set('limit', String(Math.min(100, Math.max(1, Number(limit) || 20))));
  if (String(query || '').trim()) params.set('q', String(query).trim());

  const { ok, payload, message, status } = await requestJson(`/api/seller/products?${params.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to load seller products');
  }

  return {
    success: true,
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination || null
  };
};

export const getSellerProductById = async (productId) => {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return strictError('Product ID is required');

  const { ok, payload, message, status } = await requestJson(`/api/seller/products/${encodeURIComponent(normalizedId)}`, {
    headers: getAuthHeaders()
  });

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to load seller product');
  }

  return {
    success: true,
    product: payload?.product || payload || null
  };
};

export const updateSellerProduct = async (productId, productData) => {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return strictError('Product ID is required');

  const { ok, payload, message, status } = await requestJson(`/api/seller/products/${encodeURIComponent(normalizedId)}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(productData || {})
  });

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to update product');
  }

  return {
    success: true,
    message: payload?.message || 'Product updated successfully',
    product: payload?.product || payload || null
  };
};

export const deleteSellerProduct = async (productId) => {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return strictError('Product ID is required');

  const { ok, payload, message, status } = await requestJson(`/api/seller/products/${encodeURIComponent(normalizedId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!ok) {
    if (isAuthError(status, message)) {
      handleSessionExpired();
      return strictError('Session expired. Please sign in again.');
    }
    return strictError(message || 'Failed to delete product');
  }

  return {
    success: true,
    message: payload?.message || 'Product deleted successfully'
  };
};

export const uploadSellerProductImage = async (file) => {
  if (!file) return strictError('No image selected');
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file?.name || 'product-image');

    const { ok, payload, message, status } = await requestJson('/api/upload/product-image', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
      retries: 0
    });

    if (!ok) {
      if (isAuthError(status, message)) {
        handleSessionExpired();
        return strictError('Session expired. Please sign in again.');
      }
      const normalizedError = String(message || payload?.error || 'Failed to upload product image');
      return strictError(normalizedError);
    }

    const url = String(payload?.url || '').trim();
    if (!url) {
      return strictError('Upload completed but no image URL was returned');
    }

    return {
      success: true,
      uploaded: true,
      verified: true,
      url,
      previewUrl: url,
      viewUrl: url,
      image: payload || {},
    };
  } catch (error) {
    console.error('uploadSellerProductImage failed:', error);
    return strictError('Failed to upload product image');
  }
};

export const getMarketplaceCategories = async (scope = '') => {
  const normalizedScope = String(scope || '').trim().toLowerCase();
  const query = normalizedScope ? `?scope=${encodeURIComponent(normalizedScope)}` : '';
  const { ok, payload, message } = await requestJson(`/api/categories${query}`, { retries: 1 });
  if (!ok) return strictError(message || 'Failed to load categories');

  const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
  const names = [...new Set(
    rows
      .map((row) => String(row?.name || '').trim())
      .filter(Boolean)
  )];

  return {
    success: true,
    categories: names.map((name) => ({ value: name, label: name })),
  };
};

export const getPublicSupplierProfile = async (supplierId) => {
  const normalizedId = String(supplierId || '').trim();
  if (!normalizedId) return null;

  const { ok, payload } = await requestJson(`/api/suppliers/${encodeURIComponent(normalizedId)}/profile`);
  if (!ok) return null;
  return payload || null;
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
  getUserOrderById,
  createUserOrder,
  getUserInquiryInbox,
  getUserInquirySent,
  updateUserInquiryStatus,
  submitProductInquiry,
  replyToProductInquiry,
  markInquiryAsRead,
  subscribeToInquiryUpdates,
  getProductById,
  getProductReviews,
  submitProductReview,
  createSellerProduct,
  getSellerProducts,
  getSellerProductById,
  updateSellerProduct,
  deleteSellerProduct,
  uploadSellerProductImage,
  getMarketplaceCategories,
  getPublicSupplierProfile,
  getProductsByIds,
  cachePreviewProducts,
  getPreviewProductById,
  getPreviewWishlist,
  addPreviewToWishlist,
  removePreviewFromWishlist,
  getPreviewCart,
  addPreviewToCart,
  updatePreviewCartItemQuantity,
  removePreviewFromCart,
};
