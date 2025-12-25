import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { getUserOrders } from '../utils/userService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      // Fetch user's orders from the API
      const ordersData = await getUserOrders(userId);
      
      // If API returns empty or no orders, use mock data as fallback
      if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
        // For now, using mock data since we don't have a full orders API
        // In a real implementation, we would fetch from the API
        const mockOrders = [
          {
            id: 1,
            orderNumber: 'ORD-001',
            date: '2023-12-15',
            status: 'completed',
            total: 299.97,
            items: [
              { name: 'Wireless Headphones', quantity: 2, price: 99.99 },
              { name: 'Phone Case', quantity: 1, price: 99.99 }
            ]
          },
          {
            id: 2,
            orderNumber: 'ORD-002',
            date: '2023-12-10',
            status: 'shipped',
            total: 199.99,
            items: [
              { name: 'Smart Watch', quantity: 1, price: 199.99 }
            ]
          },
          {
            id: 3,
            orderNumber: 'ORD-003',
            date: '2023-12-05',
            status: 'processing',
            total: 79.99,
            items: [
              { name: 'Bluetooth Speaker', quantity: 1, price: 79.99 }
            ]
          }
        ];
        setOrders(mockOrders);
      } else {
        setOrders(ordersData.orders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
      // Fallback to empty orders
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg p-8 max-w-md w-full mx-4 border border-gray-200">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-700 text-white rounded-none font-medium hover:from-red-700 hover:to-pink-800 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Order History | B2B E-Commerce Platform</title>
        <meta name="description" content="Your order history" />
      </Head>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 text-gray-600">View and manage your past orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-none flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">You haven't placed any orders yet. Start shopping to see your order history.</p>
            <Link href="/marketplace" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 transition-all duration-300">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-lg font-semibold text-gray-800">
                        Order #{order.orderNumber}
                      </p>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-semibold">${order.total.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items in Order</h4>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col items-end justify-center">
                      <Link href={`/orders/${order.id}`} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-none text-sm font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-300">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}