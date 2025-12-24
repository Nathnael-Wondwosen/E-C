import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { getUserCart, addToCart, removeFromCart, getProductsByIds } from '../utils/userService';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      // Store the current page as the redirect destination
      localStorage.setItem('redirectAfterLogin', '/cart');
      // Dispatch login status change event to update header
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));
      router.push('/login');
      return;
    }

    loadCart();
  }, [router]);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      
      setLoading(true);
      const cartData = await getUserCart(userId);
      
      // Transform cart data to match the expected format
      if (cartData.items && Array.isArray(cartData.items)) {
        // Get product IDs to fetch details
        const productIds = cartData.items.map(item => item.productId);
        
        // Fetch product details
        const products = await getProductsByIds(productIds);
        
        // Map products with cart quantities
        const cartItemsWithDetails = cartData.items.map((cartItem, index) => {
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
        
        setCartItems(cartItemsWithDetails);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to empty cart
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }
    
    try {
      // Update quantity in the backend
      await addToCart(userId, itemId, newQuantity);
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Reload cart to ensure consistency
      loadCart();
    }
  };

  const removeItem = async (itemId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }
    
    try {
      // Remove item from backend
      await removeFromCart(userId, itemId);
      
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // In a real implementation, this would redirect to checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Shopping Cart | B2B E-Commerce Platform</title>
        <meta name="description" content="Your shopping cart" />
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">Review and manage items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-none flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">Looks like you haven't added anything to your cart yet. Start shopping to begin your collection.</p>
            <Link href="/marketplace" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Cart Items ({cartItems.length})</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex">
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            className="w-full h-full object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-6 flex-1 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Sold by: {item.seller}</p>
                            <p className="mt-2 text-lg font-semibold text-gray-900">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-700 font-medium">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors duration-200"
                                  disabled={item.quantity <= 1}
                                >
                                  <span className="text-lg">-</span>
                                </button>
                                <span className="w-12 h-10 flex items-center justify-center text-gray-900 font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                                >
                                  <span className="text-lg">+</span>
                                </button>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                              Remove
                            </button>
                          </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg p-6 sticky top-8 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    onClick={handleCheckout}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-none shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-600 text-sm">
                    or{' '}
                    <Link href="/marketplace" className="text-blue-600 font-medium hover:text-blue-700">
                      Continue Shopping
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}