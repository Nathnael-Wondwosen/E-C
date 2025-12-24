import { useState } from 'react';
import Link from 'next/link';
import ProductComparison from './ProductComparison';
import QuickViewModal from './QuickViewModal';

export default function ProductGrid({ products = [], loading, onFilterChange, currentSort }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProducts, setSelectedProducts] = useState([]); // For comparison
  const [showComparison, setShowComparison] = useState(false); // Show comparison modal
  const [quickViewProduct, setQuickViewProduct] = useState(null); // Quick view product
  const [wishlist, setWishlist] = useState(new Set()); // Wishlist items

  // Toggle product selection for comparison
  const toggleProductSelection = (product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      // Limit to 4 products for comparison
      if (selectedProducts.length < 4) {
        setSelectedProducts([...selectedProducts, product]);
      }
    }
  };

  // Check if a product is selected for comparison
  const isProductSelected = (productId) => {
    return selectedProducts.some(p => p.id === productId);
  };

  // Clear all selected products
  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Toggle wishlist status
  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  // Open quick view modal
  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  // Close quick view modal
  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render star ratings
  const renderRating = (rating) => {
    if (!rating) return <span className="text-gray-400">No ratings</span>;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle and Selection Controls - More compact */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-none ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            title="Grid View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 012-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-none ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            title="List View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Sorting Options - Moved here for compactness */}
          <div className="ml-4 flex items-center">
            <label htmlFor="sortBy" className="mr-2 text-sm text-gray-600">Sort by:</label>
            <select 
              id="sortBy"
              value={currentSort || 'name'}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="text-sm border border-gray-300 rounded-none p-1 bg-white"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">
              {selectedProducts.length} selected
            </span>
            <button
              onClick={() => setShowComparison(true)}
              className="px-2 py-1 bg-blue-600 text-white rounded-none hover:bg-blue-700 text-sm"
            >
              Compare
            </button>
            <button
              onClick={clearSelection}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-none hover:bg-gray-300 text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Product Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div 
              key={product.id} 
              className={`bg-white rounded-none shadow-lg border-0 overflow-hidden relative group ${
                isProductSelected(product.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                borderRadius: '0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '0'
              }}
            >
              {/* Selection Indicator */}
              {isProductSelected(product.id) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Seller/Buyer Tag - Positioned at top right */}
              <div className="absolute top-2 left-2 z-10">
                <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-md ${product.postAs === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {product.postAs === 'buyer' ? 'BUYER' : 'SELLER'}
                </span>
              </div>

              {/* Product Image */}
              <Link href={`/b2b-marketplace/${product.id}`}>
                <div className="relative h-40 overflow-hidden cursor-pointer" style={{
                  height: '10rem',
                  overflow: 'hidden'
                }}>
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
                
                {/* Discount Badge */}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-none">
                    {product.discountPercentage}% OFF
                  </div>
                )}
                
                {/* Hot/Premium Badges - Attractive and Advanced Display */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {product.isHotDeal && (
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-3 animate-pulse">
                      HOT
                    </div>
                  )}
                  {product.isPremium && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform -rotate-3">
                      PREMIUM
                    </div>
                  )}
                  {product.isNew && (
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      NEW
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 md:group-hover:opacity-100 md:right-10">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${wishlist.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                      viewBox="0 0 20 20" 
                      fill={wishlist.has(product.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                    >
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => toggleProductSelection(product)}
                    className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              
              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-bold text-gray-900 mb-2 truncate text-lg">{product.name}</h3>
                
                <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                
                {/* B2B Information - Enhanced Display */}
                <div className="mb-4 text-xs space-y-2">
                  {/* Quantity and Unit */}
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-gray-700">Qty: {product.quantity || product.stock || 0} {product.unit || 'units'}</span>
                  </div>
                  
                  {/* Quality Grade */}
                  {product.qualityGrade && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">Grade: {product.qualityGrade}</span>
                    </div>
                  )}
                  
                  {product.phone && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{product.phone}</span>
                    </div>
                  )}
                  

                  
                  {/* MOQ and Lead Time */}
                  {product.moq && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span className="text-gray-700">MOQ: {product.moq}</span>
                    </div>
                  )}
                  

                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* Contact and Quick View Buttons - Side by side */}
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <button
                      onClick={() => openQuickView(product)}
                      className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-sm"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => openQuickView(product)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-all shadow-sm"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {products.map(product => (
            <div 
              key={product.id} 
              className={`bg-white rounded-none shadow-lg border-0 overflow-hidden relative group ${
                isProductSelected(product.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                borderRadius: '0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '0'
              }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Product Image */}
                <div className="md:w-1/4 relative h-32 md:h-auto">
                  <Link href={`/b2b-marketplace/${product.id}`} className="block w-full h-full">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  
                  {/* Discount Badge */}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-none">
                      {product.discountPercentage}% OFF
                    </div>
                  )}
                  
                  {/* New Badge */}
                  {product.isNew && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-none">
                      NEW
                    </div>
                  )}
                  
                  {/* Seller/Buyer Tag */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-md ${product.postAs === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {product.postAs === 'buyer' ? 'BUYER' : 'SELLER'}
                    </span>
                  </div>
                </div>
                
                <div className="md:w-3/4 p-3">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.name}</h3>
                      
                      <p className="text-sm text-gray-500 mb-1">
                        {product.description || 'No description available'}
                      </p>
                      
                      {/* B2B Information - Enhanced Display */}
                      <div className="mb-4 text-xs space-y-2">
                        {/* Quantity and Unit */}
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-gray-700">Qty: {product.quantity || product.stock || 0} {product.unit || 'units'}</span>
                        </div>
                        
                        {/* Quality Grade */}
                        {product.qualityGrade && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">Grade: {product.qualityGrade}</span>
                          </div>
                        )}
                        
                        {/* Contact Information */}
                        {product.phone && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{product.phone}</span>
                          </div>
                        )}
                        

                        
                        {/* MOQ and Lead Time */}
                        {product.moq && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <span className="text-gray-700">MOQ: {product.moq}</span>
                          </div>
                        )}
                        

                      </div>
                      

                    </div>
                    
                    <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end">
                      <div className="mb-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                        <button
                          onClick={() => openQuickView(product)}
                          className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-sm mb-2 md:mb-0"
                        >
                          Contact
                        </button>
                        <button
                          onClick={() => openQuickView(product)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-all shadow-sm mb-2 md:mb-0"
                        >
                          Quick View
                        </button>
                        
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`p-1.5 rounded-none ${
                            wishlist.has(product.id) 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill={wishlist.has(product.id) ? "currentColor" : "none"}
                            stroke="currentColor"
                          >
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => toggleProductSelection(product)}
                          className={`p-1.5 rounded-none ${
                            isProductSelected(product.id) 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}

      {/* Modals */}
      {showComparison && (
        <ProductComparison 
          products={selectedProducts} 
          onClose={() => setShowComparison(false)} 
        />
      )}
      
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={closeQuickView} 
        />
      )}
    </div>
  );
}