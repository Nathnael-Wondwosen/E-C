const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS || 7000);
const DEFAULT_RETRIES = Number(process.env.NEXT_PUBLIC_HTTP_RETRIES || 1);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maybeRedirectToAdminLogin = (status, payload = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const message = String(payload?.error || payload?.message || '').toLowerCase();
  const isUnauthorized =
    status === 401 ||
    status === 403 ||
    message.includes('missing authorization token') ||
    message.includes('unauthorized') ||
    message.includes('invalid token');

  if (!isUnauthorized) {
    return;
  }

  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminScope');
  localStorage.removeItem('adminUser');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const requestJson = async (
  urlPath,
  {
    method = 'GET',
    headers,
    body,
    retries = DEFAULT_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}
) => {
  const normalizedMethod = method.toUpperCase();
  const targetUrl = urlPath.startsWith('http') ? urlPath : `${API_BASE_URL}${urlPath}`;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const authHeaders = new Headers(headers || {});
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token && !authHeaders.has('Authorization')) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetchWithTimeout(
        targetUrl,
        { method: normalizedMethod, headers: authHeaders, body },
        timeoutMs
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        maybeRedirectToAdminLogin(response.status, payload);
        const message = payload.error || payload.message || `Request failed (${response.status})`;
        const retryable = normalizedMethod === 'GET' && response.status >= 500 && attempt < retries;
        if (retryable) {
          attempt += 1;
          await sleep(200 * attempt);
          continue;
        }
        return { ok: false, status: response.status, payload, message };
      }
      return { ok: true, status: response.status, payload, message: '' };
    } catch (error) {
      const retryable = normalizedMethod === 'GET' && attempt < retries;
      if (retryable) {
        attempt += 1;
        await sleep(200 * attempt);
        continue;
      }
      return { ok: false, status: 0, payload: {}, message: 'Network error' };
    }
  }

  return { ok: false, status: 0, payload: {}, message: 'Request failed' };
};

export const requestForm = async (
  urlPath,
  {
    method = 'POST',
    headers,
    body,
    retries = 0,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}
) => {
  const normalizedMethod = method.toUpperCase();
  const targetUrl = urlPath.startsWith('http') ? urlPath : `${API_BASE_URL}${urlPath}`;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const authHeaders = new Headers(headers || {});
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token && !authHeaders.has('Authorization')) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetchWithTimeout(
        targetUrl,
        { method: normalizedMethod, headers: authHeaders, body },
        timeoutMs
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        maybeRedirectToAdminLogin(response.status, payload);
        const message = payload.error || payload.message || `Request failed (${response.status})`;
        const retryable = normalizedMethod === 'GET' && response.status >= 500 && attempt < retries;
        if (retryable) {
          attempt += 1;
          await sleep(200 * attempt);
          continue;
        }
        return { ok: false, status: response.status, payload, message };
      }
      return { ok: true, status: response.status, payload, message: '' };
    } catch (error) {
      const retryable = normalizedMethod === 'GET' && attempt < retries;
      if (retryable) {
        attempt += 1;
        await sleep(200 * attempt);
        continue;
      }
      return { ok: false, status: 0, payload: {}, message: 'Network error' };
    }
  }

  return { ok: false, status: 0, payload: {}, message: 'Request failed' };
};
