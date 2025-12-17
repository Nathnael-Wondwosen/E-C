export default function TrendingProductsSection({ loadingProducts, fallbackRandomProducts, randomProducts }) {
  // Create unique keys for each product instance
  const createUniqueKey = (product, index, suffix) => {
    return `${product.id || index}-${suffix}`;
  };

  return (
    <section className="py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Sliding Text Containers - Floating Cards */}
        <div className="space-y-4">
          {/* First Row - Slides Left with Floating Effect */}
          <div className="flex animate-slide-left whitespace-nowrap">
            {[...(loadingProducts ? fallbackRandomProducts : randomProducts), ...(loadingProducts ? fallbackRandomProducts : randomProducts)].map((product, index) => (
              <div key={createUniqueKey(product, index, 'left')} className="inline-flex items-center mx-3">
                <div className="bg-white rounded-none shadow-lg px-4 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-blue-200">
                  <h3 className="text-gray-700 text-sm md:text-base tracking-normal">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* Second Row - Slides Right with Floating Effect */}
          <div className="flex animate-slide-right whitespace-nowrap">
            {[...(loadingProducts ? fallbackRandomProducts : randomProducts), ...(loadingProducts ? fallbackRandomProducts : randomProducts)].map((product, index) => (
              <div key={createUniqueKey(product, index, 'right')} className="inline-flex items-center mx-3">
                <div className="bg-white rounded-none shadow-lg px-4 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-blue-200">
                  <h3 className="text-gray-700 text-sm md:text-base tracking-normal">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}