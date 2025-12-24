import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getUserProfile, getUserOrders, getUserWishlist, getUserCart } from '../../utils/userService';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'seller') {
      router.push('/login');
      return;
    }

    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      // Load user profile
      const userProfile = await getUserProfile(userId);
      setUser(userProfile);

    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('userLoggedIn');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Seller Dashboard | B2B E-Commerce Platform</title>
        <meta name="description" content="Your seller dashboard" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">Seller Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user?.profile?.name || user?.name || 'Seller'}
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Products Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <p className="text-2xl font-semibold text-gray-700">0</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Manage products →
              </Link>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                <p className="text-2xl font-semibold text-gray-700">0</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View orders →
              </Link>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
                <p className="text-2xl font-semibold text-gray-700">$0</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View analytics →
              </Link>
            </div>
          </div>

          {/* Settlement Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settlements</h3>
                <p className="text-2xl font-semibold text-gray-700">$0</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/settlements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View settlements →
              </Link>
            </div>
          </div>
        </div>

        {/* Settlement Summary */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Settlement Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Settlements</h3>
                <p className="text-2xl font-semibold text-yellow-600 mt-1">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">Amount awaiting settlement</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                <p className="text-2xl font-semibold text-green-600 mt-1">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">Settled this month</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Available to Withdraw</h3>
                <p className="text-2xl font-semibold text-blue-600 mt-1">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">Ready for withdrawal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Seller Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/products/add" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Add Product</h3>
                <p className="mt-2 text-sm text-gray-500">List a new product for sale</p>
              </Link>
              
              <Link href="/products" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Products</h3>
                <p className="mt-2 text-sm text-gray-500">View and edit your products</p>
              </Link>
              
              <Link href="/orders" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Order Management</h3>
                <p className="mt-2 text-sm text-gray-500">Process and track orders</p>
              </Link>
              
              <Link href="/analytics" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h4m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Analytics</h3>
                <p className="mt-2 text-sm text-gray-500">View sales and performance</p>
              </Link>
              
              <Link href="/shop" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">My Shop</h3>
                <p className="mt-2 text-sm text-gray-500">View your shop page</p>
              </Link>
              
              <Link href="/settlements" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Settlements</h3>
                <p className="mt-2 text-sm text-gray-500">View your settlements</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Shop Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Company Name</h3>
                <p className="text-gray-600">
                  {user?.profile?.companyName || 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Business Type</h3>
                <p className="text-gray-600">
                  {user?.profile?.businessType || 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">
                  {user?.profile?.email || user?.email || 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">
                  {user?.profile?.phone || 'Not set'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/profile" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}