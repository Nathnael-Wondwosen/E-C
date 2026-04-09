import { requestJson } from '../httpClient';
import {
  normalizeAdminUser,
  normalizeSummaryMap,
  requestMutation,
  scopedUrl,
  unwrapCollectionPayload
} from './core';

export const getAdminUsersPage = async ({ search = '', role = '', status = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const { ok, payload, message } = await requestJson(scopedUrl(`/api/admin/users?${params.toString()}`), { retries: 1 });
  if (!ok) throw new Error(message || 'Failed to fetch users');

  return {
    items: unwrapCollectionPayload(payload).map(normalizeAdminUser),
    total: payload.total || 0,
    page: payload.page || page,
    limit: payload.limit || limit,
    totalPages: payload.totalPages || 1,
    summary: {
      roles: normalizeSummaryMap(payload?.summary?.roles),
      statuses: normalizeSummaryMap(payload?.summary?.statuses)
    }
  };
};

export const updateAdminUserAccount = async (id, updates) => {
  const user = await requestMutation(scopedUrl(`/api/admin/users/${id}`), {
    method: 'PUT',
    body: updates || {},
    message: 'Failed to update user',
  });
  return normalizeAdminUser(user);
};

export const deleteAdminUserAccount = async (id) => requestMutation(scopedUrl(`/api/admin/users/${id}`), {
  method: 'DELETE',
  message: 'Failed to delete user'
});
