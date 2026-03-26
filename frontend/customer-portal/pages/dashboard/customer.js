import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/header/Header';
import { getProducts } from '../../utils/heroDataService';
import {
  addToCart,
  addToWishlist,
  getUserCart,
  getUserOrders,
  getUserProfile,
  getUserWishlist,
  removeFromWishlist
} from '../../utils/userService';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [hotDeals, setHotDeals] = useState([]);
  const [hotDealsMessage, setHotDealsMessage] = useState('');
  const [dealActionState, setDealActionState] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'buyer') {
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

      // Load user data
      const [userOrders, userWishlist, userCart] = await Promise.all([
        getUserOrders(userId),
        getUserWishlist(userId),
        getUserCart(userId)
      ]);

      setOrders(userOrders.orders || []);
      setWishlist(userWishlist.items || []);
      setCart(userCart);

      // Load hot deals from product data, fallback to defaults
      const fetchedProducts = await getProducts();
      const regularProducts = (fetchedProducts || []).filter((product) => product.productType !== 'B2B');
      const convertedProducts = regularProducts.map((product) => ({
        ...product,
        id: product._id || product.id,
      }));

      const resolvedHotDeals = convertedProducts
        .filter((product) => product.isHotDeal || (product.discountPercentage && Number(product.discountPercentage) >= 10))
        .slice(0, 6)
        .map((product, index) => {
          const discountValue = Number(product.discountPercentage || 0);
          const basePrice = Number(product.price || 0);
          const effectiveDiscount = discountValue > 0 ? discountValue : 15;
          const originalPrice = basePrice > 0 ? basePrice : Number(product.originalPrice || 0) || 0;
          const finalPrice = originalPrice > 0
            ? Number((originalPrice * (100 - effectiveDiscount) / 100).toFixed(2))
            : 0;
          return {
            ...product,
            id: String(product.id || product.sku || `deal-${index + 1}`),
            name: product.name || 'Featured Deal',
            price: finalPrice || originalPrice || 0,
            originalPrice: originalPrice || finalPrice || 0,
            discount: Math.round(effectiveDiscount),
          };
        });

      if (resolvedHotDeals.length > 0) {
        setHotDeals(resolvedHotDeals);
      } else {
        setHotDeals([
          { id: 'local-1', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, discount: 31, image: null },
          { id: 'local-2', name: 'Smart Fitness Watch', price: 149.99, originalPrice: 199.99, discount: 25, image: null },
          { id: 'local-3', name: 'Portable Power Bank', price: 39.99, originalPrice: 59.99, discount: 33, image: null },
          { id: 'local-4', name: '4K Ultra HD Camera', price: 299.99, originalPrice: 399.99, discount: 25, image: null },
        ]);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('userLoggedIn');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const isDealWishlisted = (dealId) => {
    return wishlist.some((item) => String(item.productId || item.id || item._id) === String(dealId));
  };

  const setDealLoading = (dealId, key, value) => {
    setDealActionState((prev) => ({
      ...prev,
      [dealId]: {
        ...(prev[dealId] || {}),
        [key]: value,
      },
    }));
  };

  const getDealImage = (deal) => {
    if (deal.image) return deal.image;
    if (Array.isArray(deal.images) && deal.images.length > 0) return deal.images[0];
    return '';
  };

  const getDealDetailsHref = (dealId) => {
    return String(dealId).startsWith('local-') ? '/marketplace' : `/products/${encodeURIComponent(String(dealId))}`;
  };

  const handleAddDealToCart = async (deal) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    setDealLoading(deal.id, 'cartLoading', true);
    setHotDealsMessage('');
    const result = await addToCart(userId, deal.id, 1);
    setDealLoading(deal.id, 'cartLoading', false);

    if (!result?.success) {
      setHotDealsMessage(result?.message || 'Failed to add item to cart.');
      return;
    }

    const updatedCart = await getUserCart(userId);
    setCart(updatedCart || { items: [], total: 0, count: 0 });
    setHotDealsMessage(`${deal.name} added to cart.`);
  };

  const handleToggleDealWishlist = async (deal) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const alreadyWishlisted = isDealWishlisted(deal.id);
    setDealLoading(deal.id, 'wishlistLoading', true);
    setHotDealsMessage('');

    const result = alreadyWishlisted
      ? await removeFromWishlist(userId, deal.id)
      : await addToWishlist(userId, deal.id);

    setDealLoading(deal.id, 'wishlistLoading', false);
    if (!result?.success) {
      setHotDealsMessage(result?.message || 'Failed to update wishlist.');
      return;
    }

    const updatedWishlist = await getUserWishlist(userId);
    setWishlist(updatedWishlist?.items || []);
    setHotDealsMessage(alreadyWishlisted ? `${deal.name} removed from wishlist.` : `${deal.name} added to wishlist.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Customer Dashboard | B2B E-Commerce Platform</title>
        <meta name="description" content="Your customer dashboard" />
      </Head>

      <main>
        <Header 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          categories={[]}
        />

        {/* Dashboard Header */}
        <section className="relative mb-8">
          <div className="container mx-auto px-4">
            <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-indigo-50 shadow-sm">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <div>
                  <p className="mb-2 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                    Customer Dashboard
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                    Welcome back, <span className="text-cyan-700">{user?.profile?.name || user?.name || 'Valued Customer'}</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">
                    Continue shopping, track your orders, and manage your account from one place.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/marketplace" className="inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Marketplace
                    </Link>
                    <Link href="/orders" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Orders
                    </Link>
                    <Link href="/inquiries" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3V8a2 2 0 012-2z" />
                      </svg>
                      My Inquiries
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:min-w-[240px]">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Your Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Orders</span>
                      <span className="font-semibold text-slate-900">{orders.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Wishlist</span>
                      <span className="font-semibold text-slate-900">{wishlist.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Cart Items</span>
                      <span className="font-semibold text-slate-900">{cart.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Main Content and Sidebar Layout */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Quick Stats */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Cart Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Cart</h3>
                      <p className="text-2xl font-semibold text-gray-700">{cart.count}</p>
                      <p className="text-sm text-gray-500">${cart.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/cart" className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                      View cart
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Wishlist Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Wishlist</h3>
                      <p className="text-2xl font-semibold text-gray-700">{wishlist.length}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/wishlist" className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                      View wishlist
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Orders Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                      <p className="text-2xl font-semibold text-gray-700">{orders.length}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      View orders
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                      <p className="text-2xl font-semibold text-gray-700">Active</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/profile" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                      Manage profile
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Link href="/marketplace" className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-100 hover:to-blue-200 hover:shadow-sm">
                      <svg className="mx-auto h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className="mt-3 text-base font-medium text-gray-900">Browse Products</h3>
                    </Link>
                    <Link href="/wishlist" className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:from-red-100 hover:to-red-200 hover:shadow-sm">
                      <svg className="mx-auto h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="mt-3 text-base font-medium text-gray-900">Wishlist</h3>
                    </Link>
                    <Link href="/cart" className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:from-green-100 hover:to-green-200 hover:shadow-sm">
                      <svg className="mx-auto h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="mt-3 text-base font-medium text-gray-900">Shopping Cart</h3>
                    </Link>
                    <Link href="/orders" className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:from-yellow-100 hover:to-yellow-200 hover:shadow-sm">
                      <svg className="mx-auto h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-3 text-base font-medium text-gray-900">Order History</h3>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                </div>
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-2 text-gray-500">Get started by browsing our marketplace.</p>
                      <div className="mt-6">
                        <Link href="/marketplace" className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-700">
                          Browse Marketplace
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.slice(0, 3).map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${order.total?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 flex items-center">
                                  View
                                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hot Deals Sidebar */}
            <div className="w-full flex-shrink-0 lg:w-96">
              <div className="sticky top-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Hot Deals
                  </h2>
                </div>
                <div className="p-6">
                  {hotDealsMessage && (
                    <div className="mb-4 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700">
                      {hotDealsMessage}
                    </div>
                  )}
                  <div className="space-y-4">
                    {hotDeals.map((deal) => (
                      <div key={deal.id} className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        <Link href={getDealDetailsHref(deal.id)} className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {getDealImage(deal) ? (
                            <img
                              src={getDealImage(deal)}
                              alt={deal.name}
                              className="h-28 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-28 w-full items-center justify-center border border-dashed border-slate-300 bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </Link>
                        <Link href={getDealDetailsHref(deal.id)} className="mt-3 block text-base font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                          {deal.name}
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-900">${deal.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</p>
                          </div>
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            {deal.discount}% OFF
                          </span>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button
                            type="button"
                            disabled={Boolean(dealActionState[deal.id]?.cartLoading)}
                            onClick={() => handleAddDealToCart(deal)}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition-all duration-200 ${
                              dealActionState[deal.id]?.cartLoading
                                ? 'cursor-not-allowed bg-slate-400'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                            }`}
                          >
                            {dealActionState[deal.id]?.cartLoading ? 'Adding...' : 'Add to Cart'}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(dealActionState[deal.id]?.wishlistLoading)}
                            onClick={() => handleToggleDealWishlist(deal)}
                            className={`rounded-lg p-2 transition-colors duration-200 ${
                              isDealWishlisted(deal.id)
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${dealActionState[deal.id]?.wishlistLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                            aria-label={isDealWishlisted(deal.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                        <Link
                          href={getDealDetailsHref(deal.id)}
                          className="mt-2 inline-flex items-center text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                        >
                          View details
                          <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/marketplace"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      View More Deals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <img 
                  src="/TE-logo.png" 
                  alt="TradeEthiopia Logo" 
                  className="h-10 w-auto mr-3"
                />
                TradeEthiopia
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">Global B2B marketplace connecting buyers and suppliers worldwide. Trusted by millions of businesses.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/submit-rfq" className="hover:text-white transition">Submit RFQ</Link></li>
                <li><Link href="/browse-products" className="hover:text-white transition">Browse Products</Link></li>
                <li><Link href="/trade-services" className="hover:text-white transition">Trade Services</Link></li>
                <li><Link href="/logistics" className="hover:text-white transition">Logistics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/join" className="hover:text-white transition">Join TradeEthiopia</Link></li>
                <li><Link href="/supplier-membership" className="hover:text-white transition">Supplier Membership</Link></li>
                <li><Link href="/learning-center" className="hover:text-white transition">Learning Center</Link></li>
                <li><Link href="/partner-program" className="hover:text-white transition">Partner Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help-center" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/contact-us" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link href="/report-abuse" className="hover:text-white transition">Report Abuse</Link></li>
                <li><Link href="/submit-complaint" className="hover:text-white transition">Submit a Complaint</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} TradeEthiopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
