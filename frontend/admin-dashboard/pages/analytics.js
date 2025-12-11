import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      // Simulate loading data
      setTimeout(() => setLoading(false), 1000);
    }
  }, [router]);

  // Mock data for charts
  const salesData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 139 },
    { month: 'Mar', revenue: 2000, orders: 980 },
    { month: 'Apr', revenue: 2780, orders: 390 },
    { month: 'May', revenue: 1890, orders: 480 },
    { month: 'Jun', revenue: 2390, orders: 380 },
    { month: 'Jul', revenue: 3490, orders: 430 },
  ];

  const topProducts = [
    { id: 1, name: 'Smartphone X Pro', sales: 1240, revenue: 248000 },
    { id: 2, name: 'Bluetooth Headphones', sales: 980, revenue: 49000 },
    { id: 3, name: 'Office Desk Chair', sales: 760, revenue: 68400 },
    { id: 4, name: 'Stainless Steel Cookware', sales: 650, revenue: 84500 },
    { id: 5, name: 'Fitness Tracker Watch', sales: 540, revenue: 21600 },
  ];

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Analytics Dashboard
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Revenue Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Revenue</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">$24,800</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Card */}
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
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Orders</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">1,240</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customers Card */}
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
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Customers</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">842</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-none">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Conversion Rate</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">3.2%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="mt-5 sm:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 shadow rounded-none p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Overview</h2>
                <div className="h-80">
                  <div className="flex items-end h-64 space-x-2">
                    {salesData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                          style={{ height: `${(data.revenue / 4000) * 100}%` }}
                        ></div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{data.month}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">${data.revenue / 1000}k</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="mt-5 sm:col-span-2 bg-white dark:bg-gray-800 shadow rounded-none p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Selling Products</h2>
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topProducts.map((product) => (
                      <li key={product.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {product.sales} sold
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ${product.revenue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}