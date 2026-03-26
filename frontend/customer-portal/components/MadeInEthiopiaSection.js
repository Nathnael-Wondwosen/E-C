import Link from 'next/link';

// Sample Ethiopian products for demo
const sampleEthiopianProducts = [
  { id: 1, name: 'Traditional Coffee Beans', description: 'Premium organic coffee from Ethiopian highlands', price: '$24.99', origin: 'Ethiopia' },
  { id: 2, name: 'Handwoven Basket', description: 'Authentic Ethiopian craftsmanship', price: '$45.00', origin: 'Ethiopia' },
  { id: 3, name: 'Leather Bag', description: 'Genuine Ethiopian leather', price: '$89.99', origin: 'Ethiopia' },
  { id: 4, name: 'Spice Mix (Berbere)', description: 'Traditional Ethiopian spice blend', price: '$12.99', origin: 'Ethiopia' },
  { id: 5, name: 'Cotton Scarf', description: 'Handmade Ethiopian textile', price: '$35.00', origin: 'Ethiopia' },
  { id: 6, name: 'Wooden Craft', description: 'Carved by local artisans', price: '$55.00', origin: 'Ethiopia' },
];

const isMadeInEthiopia = (product) => {
  const origin = `${product?.origin || product?.countryOfOrigin || product?.country || product?.manufacturedIn || ''}`.toLowerCase();
  return Boolean(product?.isMadeInEthiopia) || origin.includes('ethiopia');
};

export default function MadeInEthiopiaSection({ products = [] }) {
  // Use provided products or fall back to sample data
  const all = Array.isArray(products) && products.length > 0 ? products : sampleEthiopianProducts;
  const ethiopian = all.filter(isMadeInEthiopia).slice(0, 6);
  const items = ethiopian.length > 0 ? ethiopian : all.slice(0, 6);

  return (
    <section className="py-10 bg-gradient-to-r from-emerald-50 via-yellow-50 to-red-50 border-y border-emerald-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Origin</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Made in Ethiopia</h2>
          </div>
          <Link href="/marketplace" className="text-emerald-700 font-medium hover:text-emerald-800 transition-colors duration-200">Explore Catalog →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div key={item.id || item._id || index} className="bg-white border border-emerald-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{item.name || 'Product'}</h3>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 whitespace-nowrap rounded">ET Origin</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description || 'Locally produced goods designed for regional and global buyers.'}</p>
              <p className="text-sm font-bold text-gray-900 mt-3">{typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price || '$0.00'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
