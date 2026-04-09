import { requestJson } from '../httpClient';
import { scopedUrl } from './core';

export const getDashboardSummary = async () => {
  const { ok, payload, message } = await requestJson(scopedUrl('/api/admin/dashboard/summary'), { retries: 1 });
  if (!ok) throw new Error(message || 'Failed to fetch dashboard summary');

  return {
    stats: payload?.stats || {
      products: 0,
      categories: 0,
      ordersToday: 0,
      activeUsers: 0
    },
    recentActivity: Array.isArray(payload?.recentActivity) ? payload.recentActivity : []
  };
};
