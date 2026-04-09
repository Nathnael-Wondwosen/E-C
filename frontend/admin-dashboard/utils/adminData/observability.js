import { requestJson } from '../httpClient';
import { API_BASE_URL } from './core';

export const getRequestMetrics = async () => {
  const { ok, payload, message } = await requestJson(`${API_BASE_URL}/metrics`, { retries: 1 });
  if (!ok) {
    throw new Error(message || 'Failed to load metrics');
  }

  return payload || { routes: [] };
};

export const getRequestLogs = async ({ limit = 200, requestId = '' } = {}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    ...(requestId ? { requestId } : {})
  });

  const { ok, payload, message } = await requestJson(`${API_BASE_URL}/logs/requests?${params.toString()}`, { retries: 1 });
  if (!ok) {
    throw new Error(message || 'Failed to load logs');
  }

  return Array.isArray(payload?.items) ? payload.items : [];
};
