import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/header/Header';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (id) {
      loadOrderDetails();
    }
  }, [id, router]);

  const loadOrderDetails = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      
      // Fetch specific order directly from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/orders/${id}`);
      
      if (response.ok) {
        const order = await response.json();
        setOrder(order);
      } else {
        // If order not found, set to null to show error
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      // Set to null to show error
      setOrder(null);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Head>
          <title>Order Not Found | B2B E-Commerce Platform</title>
          <meta name="description" content="Order not found" />
        </Head>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-blue-900 rounded-none">
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="mt-2 text-gray-300">View your order information</p>
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-none flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">The order you're looking for doesn't exist or may have been removed.</p>
            <Link href="/orders" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 transition-all duration-300">
              Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Order #{order.orderNumber} | B2B E-Commerce Platform</title>
        <meta name="description" content="Order details" />
      </Head>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-blue-900 rounded-none">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Order #{order.orderNumber}</h1>
              <Link href="/orders" className="text-white hover:text-gray-300">
                ← Back to Orders
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-blue-900 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white">Order Information</h3>
                <p className="mt-1 text-sm text-gray-300">Order details and status</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Order Items</h4>
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {order.items && order.items.map((item, index) => (
                    <li key={index} className="py-4">
                      <div className="flex">
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-none overflow-hidden">
                          <img
                            className="w-full h-full object-cover"
                            src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/100x100'}
                            alt={item.name || item.title || 'Product'}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name || item.title || 'Product'}</h5>
                          <p className="text-xs text-gray-600">Sold by: {item.seller || item.supplier || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity || item.qty || 1}</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">${(item.price || item.unitPrice || 0).toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${((item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Subtotal</p>
                    <p>${(order.subtotal || (order.total - (order.shipping || 0) - (order.tax || 0)) || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Shipping</p>
                    <p className="text-green-600">${(order.shipping || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Tax</p>
                    <p>${(order.tax || (order.total * 0.15) || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <p>Total</p>
                    <p>${(order.total || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Order Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</p>
                    <p className="text-sm text-gray-900">#{order.orderNumber || order.id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</p>
                    <p className="text-sm text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</p>
                    <p className="text-sm text-gray-900">{order.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                    <p className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 mb-4">Shipping Address</h4>
                <div className="bg-gray-50 bg-opacity-50 p-4 rounded-none border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{order.shippingInfo?.fullName || order.shippingInfo?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{order.shippingInfo?.address || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{order.shippingInfo?.city || ''}, {order.shippingInfo?.state || ''} {order.shippingInfo?.zipCode || ''}</p>
                  <p className="text-sm text-gray-600">{order.shippingInfo?.country || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-2">Phone: {order.shippingInfo?.phone || 'N/A'}</p>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Order Actions</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-none text-sm font-medium transition-all duration-300">
                      Track Order
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-none text-sm font-medium transition-all duration-300">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}