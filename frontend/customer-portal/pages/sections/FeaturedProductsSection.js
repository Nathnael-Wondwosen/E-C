import Link from 'next/link';
import { useState } from 'react';

export default function FeaturedProductsSection({ loadingProducts, fallbackFeaturedProducts, premiumProducts }) {
  // Product card component with proper image handling
  const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <div className="bg-white rounded-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        {/* Product Image with Fallback */}
        {product.images && product.images.length > 0 && !imageError ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-40 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-none w-full h-40 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{product.name}</h3>
          <p className="text-blue-600 font-bold">{product.price}</p>
          <p className="text-gray-500 text-xs">MOQ: {product.moq || '1 pc'}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Premium Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(loadingProducts ? fallbackFeaturedProducts : premiumProducts).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}