import { withAdminScopeUrl } from '../scopeApi';
import { requestJson } from '../httpClient';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const ALLOW_MOCK_FALLBACKS = process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS === 'true';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const normalizeEntityId = (entity) => {
  if (!entity || typeof entity !== 'object') {
    return { id: '' };
  }

  return {
    ...entity,
    id: `${entity?._id || entity?.id || ''}`
  };
};

export const unwrapCollectionPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const normalizeSummaryMap = (value) => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce((acc, [key, count]) => {
    if (!key) {
      return acc;
    }

    acc[String(key).toLowerCase()] = Number(count || 0);
    return acc;
  }, {});
};

export const normalizeAdminUser = (user) => {
  const normalized = normalizeEntityId(user);
  const role = String(
    normalized.role ||
    normalized.userType ||
    (Array.isArray(normalized.roles) ? normalized.roles[0] : '') ||
    'buyer'
  ).toLowerCase();
  const status = String(
    normalized.status ||
    (normalized.isActive === false ? 'inactive' : 'active')
  ).toLowerCase();
  const profileName = normalized.profile?.name || normalized.profile?.displayName || '';
  const phone = normalized.phone || normalized.profile?.phone || '';
  const source = normalized.source || normalized.authProvider || (normalized.userType ? 'gateway' : 'identity');

  return {
    ...normalized,
    name: normalized.name || normalized.displayName || profileName || '',
    email: normalized.email || '',
    phone: `${phone || ''}`,
    role,
    status,
    source
  };
};

export const normalizeMutableEntityPayload = (entity) => {
  const normalized = normalizeEntityId(entity);
  return {
    ...normalized,
    id: `${normalized.id || ''}`
  };
};

export const sanitizeMutableEntityInput = (entity) => {
  if (!entity || typeof entity !== 'object') {
    return {};
  }

  const { id, _id, createdAt, updatedAt, ...rest } = entity;
  return rest;
};

export const normalizeEntityDeleteResult = (payload) => {
  if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
    return payload;
  }

  return { success: true };
};

export const scopedUrl = (path) => withAdminScopeUrl(`${API_BASE_URL}${path}`);

export const requestMutation = async (url, { method, body, message, retries = 0 } = {}) => {
  const { ok, payload, message: responseMessage } = await requestJson(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    retries,
  });

  if (!ok) {
    throw new Error(responseMessage || message || 'Request failed');
  }

  return payload?.item || payload?.data || payload;
};
