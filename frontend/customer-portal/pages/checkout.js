import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadCheckoutData();
  }, [router]);

  const loadCheckoutData = async () => {
    // For now, using mock data since we don't have a full cart API
    // In a real implementation, we would fetch from the API
    const mockCartItems = [
      {
        id: 1,
        productId: 101,
        name: 'Wireless Headphones',
        price: 99.99,
        quantity: 2,
        image: 'https://via.placeholder.com/100x100',
        seller: 'Tech Store'
      },
      {
        id: 2,
        productId: 102,
        name: 'Smart Watch',
        price: 199.99,
        quantity: 1,
        image: 'https://via.placeholder.com/100x100',
        seller: 'Gadget World'
      }
    ];

    // Get user info from localStorage
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userTypeName = localStorage.getItem('userType');
    
    setUser({
      id: userId,
      email: userEmail,
      userType: userTypeName
    });

    setCartItems(mockCartItems);

    // Set default shipping info from user profile if available
    setShippingInfo({
      fullName: 'John Doe',
      address: '123 Main St',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      country: 'Ethiopia',
      phone: '+251-912-345-678'
    });

    setLoading(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real implementation, this would process the order
    // and create it in the database
    console.log('Processing order with:', {
      shippingInfo,
      paymentMethod,
      items: cartItems,
      total: calculateTotal()
    });
    
    // Simulate API call
    setTimeout(() => {
      alert('Order placed successfully!');
      // Clear cart and redirect to order confirmation
      router.push('/orders');
    }, 1000);
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
        <title>Checkout | B2B E-Commerce Platform</title>
        <meta name="description" content="Complete your purchase" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-16">
                          <img
                            className="w-full h-full object-cover rounded-md"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">Sold by: {item.seller}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
                    <p>${calculateTotal().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Shipping</p>
                    <p>$0.00</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Tax</p>
                    <p>${(calculateTotal() * 0.15).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                    <p>Total</p>
                    <p>${(calculateTotal() * 1.15).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Checkout</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Shipping Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Shipping Information</h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                          ZIP / Postal Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Payment Method</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="credit-card"
                          name="payment-method"
                          type="radio"
                          value="credit-card"
                          checked={paymentMethod === 'credit-card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                          Credit Card
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="paypal"
                          name="payment-method"
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                          PayPal
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="bank-transfer"
                          name="payment-method"
                          type="radio"
                          value="bank-transfer"
                          checked={paymentMethod === 'bank-transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="bank-transfer" className="ml-3 block text-sm font-medium text-gray-700">
                          Bank Transfer
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Place Order
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>
                      By placing your order, you agree to our{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}