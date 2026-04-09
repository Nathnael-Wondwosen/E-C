const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS || 7000);
const DEFAULT_RETRIES = Number(process.env.NEXT_PUBLIC_HTTP_RETRIES || 1);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  path,
  {
    method = 'GET',
    headers,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES
  } = {}
) => {
  const normalizedMethod = method.toUpperCase();
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, { method: normalizedMethod, headers, body }, timeoutMs);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = payload.error || payload.message || `Request failed (${response.status})`;
        const retryable = normalizedMethod === 'GET' && response.status >= 500 && attempt < retries;
        if (retryable) {
          attempt += 1;
          await sleep(200 * attempt);
          continue;
        }
        return { ok: false, payload, message, status: response.status };
      }

      return { ok: true, payload, message: '', status: response.status };
    } catch (error) {
      const retryable = normalizedMethod === 'GET' && attempt < retries;
      if (retryable) {
        attempt += 1;
        await sleep(200 * attempt);
        continue;
      }
      return {
        ok: false,
        payload: {},
        message: `Network error. API gateway unavailable at ${API_BASE_URL}`,
        status: 0
      };
    }
  }

  return { ok: false, payload: {}, message: 'Request failed', status: 0 };
};
