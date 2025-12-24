import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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
    // For now, using mock data since we don't have a full orders API
    // In a real implementation, we would fetch from the API
    const mockOrder = {
      id: id,
      orderNumber: `ORD-${id}`,
      date: '2023-12-15',
      status: 'completed',
      total: 299.97,
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        zipCode: '1000',
        country: 'Ethiopia',
        phone: '+251-912-345-678'
      },
      items: [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          quantity: 2, 
          price: 99.99,
          image: 'https://via.placeholder.com/100x100',
          seller: 'Tech Store'
        },
        { 
          id: 2, 
          name: 'Phone Case', 
          quantity: 1, 
          price: 99.99,
          image: 'https://via.placeholder.com/100x100',
          seller: 'Tech Store'
        }
      ],
      paymentMethod: 'Credit Card',
      orderDate: '2023-12-15T10:30:00Z'
    };

    setOrder(mockOrder);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Order not found</h2>
          <Link href="/orders" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Order #{order.orderNumber} | B2B E-Commerce Platform</title>
        <meta name="description" content="Order details" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <Link href="/orders" className="text-blue-600 hover:text-blue-800">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Information</h3>
                <p className="mt-1 text-sm text-gray-500">Order details and status</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <ul className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex">
                        <div className="flex-shrink-0 w-16 h-16">
                          <img
                            className="w-full h-full object-cover rounded-md"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">Sold by: {item.seller}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Shipping</p>
                    <p>$0.00</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Tax</p>
                    <p>${(order.total * 0.15).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                    <p>Total</p>
                    <p>${(order.total * 1.15).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Details</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Number</p>
                    <p className="text-sm text-gray-900">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-900">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.country}</p>
                  <p className="text-sm text-gray-500 mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h4>
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
                      Track Order
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
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