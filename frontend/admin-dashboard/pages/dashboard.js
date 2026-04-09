import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import { getDashboardSummary, getRequestMetrics } from '../utils/mongoService';
import AdminScopeSwitcher from '../components/AdminScopeSwitcher';
import { DEFAULT_ADMIN_SCOPE, getAdminScopeById } from '../config/adminScopes';
import { getStoredAdminScope, setStoredAdminScope } from '../utils/adminScopeService';
import { getScopeApiConfig } from '../services/adminScopeApiMap';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    ordersToday: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ routes: [] });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [activeScope, setActiveScope] = useState(DEFAULT_ADMIN_SCOPE);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      const initialScope = router.query.scope || getStoredAdminScope() || DEFAULT_ADMIN_SCOPE;
      setActiveScope(initialScope);
      setStoredAdminScope(initialScope);
      loadData();
    }
  }, [router, router.query.scope]);

  const handleScopeChange = (scopeId) => {
    setActiveScope(scopeId);
    setStoredAdminScope(scopeId);
    router.push(`/admin/${scopeId}`);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const summary = await getDashboardSummary();
      setStats(summary.stats);
      setRecentActivity(summary.recentActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      setMetricsLoading(true);
      const payload = await getRequestMetrics();
      setMetrics(payload || { routes: [] });
    } catch (error) {
      setMetrics({ routes: [] });
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) return;
    loadMetrics();
    const timer = setInterval(loadMetrics, 15000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const scopeConfig = getAdminScopeById(activeScope);
  const scopeApiConfig = getScopeApiConfig(activeScope);
  const routes = metrics.routes || [];
  const topSlowRoutes = [...routes].sort((a, b) => (b.p95Ms || 0) - (a.p95Ms || 0)).slice(0, 5);
  const topErrorRoutes = [...routes]
    .map((r) => ({
      ...r,
      errorRate: r.count > 0 ? (r.errors / r.count) * 100 : 0
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);
  const alertRoutes = routes
    .map((r) => ({
      ...r,
      errorRate: r.count > 0 ? (r.errors / r.count) * 100 : 0
    }))
    .filter((r) => (r.p95Ms || 0) > 500 || r.errorRate > 2)
    .sort((a, b) => (b.p95Ms || 0) - (a.p95Ms || 0))
    .slice(0, 6);

  return (
    <AdminLayout title={`${scopeConfig.name} Dashboard`}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Active context: <span className="font-semibold">{scopeConfig.name}</span> ({scopeConfig.source})
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scopeConfig.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data Source: <span className="font-semibold">{scopeApiConfig.source}</span>
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
          <AdminScopeSwitcher activeScope={activeScope} onChange={handleScopeChange} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Products</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.products}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Categories</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.categories}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Orders Today</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.ordersToday}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Users</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeUsers}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <li key={activity.id}>
                    <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-full p-2">
                            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{activity.title}</p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <span>{activity.description}</span>
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-gray-200">
                                  Type <span className="font-medium capitalize">{activity.type || 'update'}</span>
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <span>{activity.time ? new Date(activity.time).toLocaleString() : 'Recently'}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Live API Metrics</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {metricsLoading ? 'Refreshing...' : 'Auto-refresh 15s'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Count</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Errors</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P95</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P99</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(metrics.routes || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          No route metrics available yet.
                        </td>
                      </tr>
                    ) : (
                      metrics.routes
                        .slice(0, 12)
                        .map((row) => (
                          <tr key={row.route}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.route}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.count}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.errors}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.p95Ms} ms</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.p99Ms} ms</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Slow Routes (P95)</h3>
              </div>
              <div className="p-4 space-y-3">
                {topSlowRoutes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No route latency data yet.</p>
                ) : (
                  topSlowRoutes.map((route) => {
                    const width = Math.min(100, Math.round(((route.p95Ms || 0) / Math.max(1, topSlowRoutes[0].p95Ms || 1)) * 100));
                    return (
                      <div key={route.route}>
                        <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                          <span className="truncate max-w-[70%]">{route.route}</span>
                          <span>{route.p95Ms} ms</span>
                        </div>
                        <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                          <div className="h-2 bg-indigo-500 rounded" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Route Error Rates</h3>
              </div>
              <div className="p-4 space-y-3">
                {topErrorRoutes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No route error data yet.</p>
                ) : (
                  topErrorRoutes.map((route) => {
                    const width = Math.max(2, Math.min(100, Math.round(route.errorRate)));
                    return (
                      <div key={route.route}>
                        <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                          <span className="truncate max-w-[70%]">{route.route}</span>
                          <span>{route.errorRate.toFixed(1)}%</span>
                        </div>
                        <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                          <div className="h-2 bg-rose-500 rounded" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Route Alerts</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Alert when P95 &gt; 500ms or error rate &gt; 2%.
                </p>
              </div>
              <div className="p-4">
                {alertRoutes.length === 0 ? (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">No active latency/error alerts.</p>
                ) : (
                  <div className="space-y-2">
                    {alertRoutes.map((route) => (
                      <div key={route.route} className="flex items-center justify-between border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                        <span className="font-medium text-gray-900">{route.route}</span>
                        <span className="text-gray-700">
                          p95: {route.p95Ms} ms | error: {route.errorRate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
