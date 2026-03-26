// Sample trending products for demo
const sampleTrendingProducts = [
  { id: 1, name: 'Wireless Earbuds Pro' },
  { id: 2, name: 'Smart Home Hub' },
  { id: 3, name: 'Fitness Tracker Band' },
  { id: 4, name: 'Portable Charger 20000mAh' },
  { id: 5, name: 'Bluetooth Speaker' },
];

export default function TrendingProductsSection({ loadingProducts, fallbackRandomProducts, randomProducts }) {
  // Use provided products or fall back to sample data
  const productsToDisplay = (randomProducts && randomProducts.length > 0) 
    ? randomProducts 
    : (loadingProducts ? fallbackRandomProducts : sampleTrendingProducts);

  // Create unique keys for each product instance
  const createUniqueKey = (product, index, suffix) => {
    return `${product.id || index}-${suffix}`;
  };

  return (
    <section className="py-8 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        {/* Sliding Text Containers */}
        <div className="space-y-6">
          {/* First Row - Slides Left */}
          <div className="flex animate-slide-left whitespace-nowrap">
            {[...productsToDisplay, ...productsToDisplay].map((product, index) => (
              <div key={createUniqueKey(product, index, 'left')} className="inline-flex items-center mx-3">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-sm px-5 py-3 transform transition-all duration-200 hover:scale-105 border border-blue-100">
                  <h3 className="text-gray-700 text-sm md:text-base font-medium">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second Row - Slides Right */}
          <div className="flex animate-slide-right whitespace-nowrap">
            {[...productsToDisplay, ...productsToDisplay].map((product, index) => (
              <div key={createUniqueKey(product, index, 'right')} className="inline-flex items-center mx-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm px-5 py-3 transform transition-all duration-200 hover:scale-105 border border-purple-100">
                  <h3 className="text-gray-700 text-sm md:text-base font-medium">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
