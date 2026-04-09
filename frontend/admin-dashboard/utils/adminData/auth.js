import { normalizeAdminUser, requestMutation, scopedUrl } from './core';

export const authenticateAdmin = async (username, password) => {
  const payload = await requestMutation(scopedUrl('/api/auth/admin/login'), {
    method: 'POST',
    body: { username, password },
    message: 'Invalid username or password'
  });

  return {
    success: true,
    user: normalizeAdminUser({
      ...(payload?.user || {}),
      role: payload?.user?.role || payload?.user?.userType || 'admin',
      status: 'active',
      source: 'admin-auth'
    }),
    token: payload?.token || ''
  };
};
