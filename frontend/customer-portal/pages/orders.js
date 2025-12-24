import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <title>Order History | B2B E-Commerce Platform</title>
        <meta name="description" content="Your order history" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to see your order history.</p>
            <div className="mt-6">
              <Link href="/marketplace" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Order #{order.orderNumber}
                        </p>
                        <div className="ml-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mr-6">
                          <p className="text-sm text-gray-500">
                            Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Total: <span className="font-medium">${order.total.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                          View details
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">Items in order:</p>
                      <ul className="mt-1 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}