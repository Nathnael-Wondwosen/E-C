import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { getUserWishlist, addToWishlist, removeFromWishlist, addToCart, getProductsByIds } from '../utils/userService';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      // Store the current page as the redirect destination
      localStorage.setItem('redirectAfterLogin', '/wishlist');
      // Dispatch login status change event to update header
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));
      router.push('/login');
      return;
    }

    loadWishlist();
  }, [router]);

  const loadWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      
      setLoading(true);
      const wishlistData = await getUserWishlist(userId);
      
      // Transform wishlist data to match the expected format
      if (wishlistData.items && Array.isArray(wishlistData.items)) {
        // Get product IDs to fetch details
        const productIds = wishlistData.items;
        
        // Fetch product details
        const products = await getProductsByIds(productIds);
        
        // Map products for wishlist
        const wishlistItemsWithDetails = products.map(product => ({
          id: product.id,
          productId: product.id,
          name: product.name || `Product ${product.id}`,
          price: product.price || 0,
          image: (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/100x100',
          seller: product.seller || 'Seller Name'
        }));
        
        setWishlistItems(wishlistItemsWithDetails);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to empty wishlist
      setWishlistItems([]);
    } finally {
      setLoading(false);
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
      await removeFromWishlist(userId, itemId);
      
      // Update local state
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const addToCartFromWishlist = async (item) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }
    
    try {
      // Add item to cart in backend
      await addToCart(userId, item.productId);
      
      // Show success message
      alert(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Wishlist | B2B E-Commerce Platform</title>
        <meta name="description" content="Your wishlist" />
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-2 text-gray-600">Your saved items that you're interested in purchasing</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-none flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">You haven't added any items to your wishlist yet. Start browsing products to save items for later.</p>
            <Link href="/marketplace" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-none shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 transition-all duration-300">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white bg-opacity-80 backdrop-blur-sm rounded-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
                <div className="p-5">
                  <div className="flex justify-center mb-4">
                    <div className="w-full h-48 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden border border-gray-200">
                      <img
                        className="w-full h-full object-contain p-2"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 h-12">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Sold by: {item.seller}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remove from wishlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => addToCartFromWishlist(item)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 px-4 rounded-none text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Add to Cart
                    </button>
                    <Link href={item.productId ? `/products/${item.productId}` : '/marketplace'} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-none text-sm font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                      View Details
                    </Link>
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