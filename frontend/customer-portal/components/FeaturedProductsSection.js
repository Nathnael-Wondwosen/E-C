import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Sample product data for demo purposes
const sampleProducts = [
  { id: 1, name: 'Premium Wireless Headphones', price: '$89.99', moq: '10 pcs', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'], category: 'Electronics' },
  { id: 2, name: 'Smart Watch Pro', price: '$149.99', moq: '5 pcs', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'], category: 'Electronics' },
  { id: 3, name: 'Organic Cotton T-Shirt', price: '$24.99', moq: '50 pcs', images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop'], category: 'Fashion' },
  { id: 4, name: 'Professional Camera Lens', price: '$599.99', moq: '2 pcs', images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500&h=500&fit=crop'], category: 'Electronics' },
  { id: 5, name: 'Artisan Coffee Beans', price: '$18.99', moq: '20 pcs', images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop'], category: 'Food' },
  { id: 6, name: 'Leather Wallet', price: '$45.99', moq: '15 pcs', images: ['https://images.unsplash.com/photo-1627123424574-18bd0538e388?w=500&h=500&fit=crop'], category: 'Accessories' },
];

export default function FeaturedProductsSection({ loadingProducts, fallbackFeaturedProducts, premiumProducts }) {
  // Use provided products or fall back to sample data
  const productsToDisplay = (premiumProducts && premiumProducts.length > 0) 
    ? premiumProducts 
    : (loadingProducts ? fallbackFeaturedProducts : sampleProducts);

  // Product card component with proper image handling
  const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border border-gray-100">
        {/* Product Image with Fallback */}
        {product.images && product.images.length > 0 && !imageError ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={500}
            height={500}
            sizes="(min-width: 1024px) 16vw, (min-width: 768px) 24vw, 50vw"
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bg-gray-100 w-full h-48 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="p-3">
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-sm">{product.name}</h3>
          <p className="text-blue-600 font-bold text-base">{product.price}</p>
          <p className="text-gray-500 text-xs mt-1">MOQ: {product.moq || '1 pc'}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
