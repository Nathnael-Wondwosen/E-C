import { useState } from 'react';

export default function ProductComparison({ products = [], onClose }) {
  // Features to compare
  const features = [
    { key: 'price', label: 'Price', format: (value) => `$${value.toFixed(2)}` },
    { key: 'rating', label: 'Rating', format: (value) => value || 'N/A' },
    { key: 'inStock', label: 'In Stock', format: (value) => value ? 'Yes' : 'No' },
    { key: 'discountPercentage', label: 'Discount', format: (value) => value ? `${value}%` : 'None' },
    { key: 'category', label: 'Category', format: (value) => value || 'N/A' },
    { key: 'isNew', label: 'New Arrival', format: (value) => value ? 'Yes' : 'No' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Product Comparison</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Comparison Table */}
        <div className="overflow-auto flex-grow">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-gray-500 font-normal">Features</th>
                {products.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-center min-w-[200px]">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 mb-2">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed w-full h-full rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-center">{product.name}</h3>
                      <p className="text-gray-600 text-sm mt-1 text-center">{product.category}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.key} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b`}>
                  <td className="px-4 py-3 font-medium text-gray-700">{feature.label}</td>
                  {products.map((product) => (
                    <td key={`${product.id}-${feature.key}`} className="px-4 py-3 text-center">
                      {feature.format(product[feature.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}