import { useState } from 'react';
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

              {/* Product Image */}
              <div className="relative h-40 overflow-hidden" style={{
                height: '10rem',
                overflow: 'hidden'
              }}>
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
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
                
                {/* Quick Actions */}
                <div className="absolute top-2 right-10 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                
                <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                
                {renderRating(product.rating)}
                
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openQuickView(product)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1"
                  >
                    Quick View
                  </button>
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
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
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
                </div>

                {/* Product Info */}
                <div className="md:w-3/4 p-3">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                      
                      <p className="text-sm text-gray-500 mb-1">
                        {product.description || 'No description available'}
                      </p>
                      
                      {renderRating(product.rating)}
                    </div>
                    
                    <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end">
                      <div className="mb-2">
                        <span className="font-bold text-gray-800 text-lg">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openQuickView(product)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-none hover:bg-blue-700 text-sm"
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