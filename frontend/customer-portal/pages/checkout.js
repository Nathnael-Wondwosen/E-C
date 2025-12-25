import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { getUserCart, getProductsByIds, getUserProfile } from '../utils/userService';

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
  const [error, setError] = useState(null);
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
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      // Fetch user profile to get shipping info
      const userProfile = await getUserProfile(userId);
      setUser({
        id: userId,
        email: localStorage.getItem('userEmail'),
        userType: localStorage.getItem('userType')
      });

      // Fetch user's cart
      const cartData = await getUserCart(userId);
      
      // Transform cart data to match the expected format
      let cartItemsWithDetails = [];
      if (cartData.items && Array.isArray(cartData.items)) {
        // Get product IDs to fetch details
        const productIds = cartData.items.map(item => item.productId);
        
        // Fetch product details
        const products = await getProductsByIds(productIds);
        
        // Map products with cart quantities
        cartItemsWithDetails = cartData.items.map((cartItem, index) => {
          const product = products.find(p => p.id === cartItem.productId);
          return {
            id: cartItem.productId,
            productId: cartItem.productId,
            name: product?.name || `Product ${cartItem.productId}`,
            price: product?.price || 0,
            quantity: cartItem.quantity || 1,
            image: (product?.images && product?.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/100x100',
            seller: product?.seller || 'Seller Name'
          };
        });
      }

      setCartItems(cartItemsWithDetails);

      // Set default shipping info from user profile if available
      setShippingInfo({
        fullName: userProfile?.profile?.name || userProfile?.name || '',
        address: userProfile?.profile?.address || '',
        city: userProfile?.profile?.city || '',
        state: userProfile?.profile?.state || '',
        zipCode: userProfile?.profile?.zipCode || '',
        country: userProfile?.profile?.country || 'Ethiopia',
        phone: userProfile?.profile?.phone || ''
      });
    } catch (err) {
      console.error('Error loading checkout data:', err);
      setError(err.message);
      // Fallback to empty cart
      setCartItems([]);
    } finally {
      setLoading(false);
    }
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
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Prepare order data
      const orderData = {
        items: cartItems,
        shippingInfo,
        paymentMethod,
        total: calculateTotal() * 1.15, // Include tax
        subtotal: calculateTotal(),
        tax: calculateTotal() * 0.15
      };
      
      // Call API to create order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
      
      const result = await response.json();
      
      console.log('Order placed successfully:', result.order);
      
      // Redirect to order confirmation
      router.push('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
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
        <title>Checkout | B2B E-Commerce Platform</title>
        <meta name="description" content="Complete your purchase" />
      </Head>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-none flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">Looks like you haven't added anything to your cart yet. Start shopping to begin your collection.</p>
            <Link href="/marketplace" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 transition-all duration-300">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-900 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-white">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-4 flex items-center">
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-none overflow-hidden">
                          <img
                            className="w-full h-full object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-600">Sold by: {item.seller}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-700">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-700">Shipping</span>
                      <span className="text-sm font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-700">Tax</span>
                      <span className="text-sm font-medium text-gray-900">${(calculateTotal() * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 mt-3 border-t border-gray-300">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(calculateTotal() * 1.15).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg p-6 sticky top-8 border border-gray-200">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-800 to-blue-900 border-b border-gray-200 mb-6">
                  <h2 className="text-lg font-semibold text-white">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Shipping Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={shippingInfo.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={shippingInfo.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white bg-opacity-50"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 border-2 border-blue-200 rounded-none bg-blue-50 bg-opacity-30">
                        <input
                          id="credit-card"
                          name="payment-method"
                          type="radio"
                          value="credit-card"
                          checked={paymentMethod === 'credit-card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="credit-card" className="ml-2 block text-sm font-medium text-gray-700">
                          Credit Card
                        </label>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-none hover:border-red-300 transition-colors duration-200">
                        <input
                          id="paypal"
                          name="payment-method"
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="paypal" className="ml-2 block text-sm font-medium text-gray-700">
                          PayPal
                        </label>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-none hover:border-red-300 transition-colors duration-200">
                        <input
                          id="bank-transfer"
                          name="payment-method"
                          type="radio"
                          value="bank-transfer"
                          checked={paymentMethod === 'bank-transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="bank-transfer" className="ml-2 block text-sm font-medium text-gray-700">
                          Bank Transfer
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 border border-transparent rounded-none shadow-sm text-base font-medium text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                    >
                      Complete Order
                    </button>
                  </div>

                  <div className="pt-4 text-center text-xs text-gray-500">
                    <p className="mb-2">
                      By placing your order, you agree to our{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-red-600 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-red-600 font-medium">
                        Privacy Policy
                      </Link>.
                    </p>
                    <div className="flex justify-center space-x-3 mt-3">
                      <div className="w-10 h-6 bg-gray-200 rounded-none flex items-center justify-center">
                        <span className="text-xs font-bold">VISA</span>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-none flex items-center justify-center">
                        <span className="text-xs font-bold">MC</span>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-none flex items-center justify-center">
                        <span className="text-xs font-bold">PP</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}