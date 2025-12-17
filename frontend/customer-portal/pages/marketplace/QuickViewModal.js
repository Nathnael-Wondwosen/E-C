import { useState } from 'react';

export default function QuickViewModal({ product, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Product Images */}
        <div className="md:w-1/2 p-6">
          <div className="h-80 mb-4">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed w-full h-full rounded flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 flex-shrink-0 border-2 rounded-md overflow-hidden ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="md:w-1/2 p-6 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-gray-600 mt-1">{product.category}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {product.rating && (
            <div className="flex items-center mt-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'stroke-current'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm ml-2">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-800">
              ${product.price.toFixed(2)}
              {product.discountPercentage && (
                <span className="text-xl text-gray-500 line-through ml-2">
                  ${(product.price * 100 / (100 - product.discountPercentage)).toFixed(2)}
                </span>
              )}
            </p>
            {product.discountPercentage && (
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded-full mt-2 inline-block">
                Save {product.discountPercentage}%
              </span>
            )}
          </div>
          
          <p className="text-gray-700 mt-4 flex-1">
            {product.description}
          </p>
          
          <div className="mt-6">
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium">
                Add to Cart
              </button>
              <button className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition font-medium">
                Wishlist
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>In stock and ready to ship</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}