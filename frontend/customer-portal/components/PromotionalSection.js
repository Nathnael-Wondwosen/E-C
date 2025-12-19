import { useState, useEffect } from 'react';

export default function PromotionalSection({ promoBanners, currentPromoIndex, setCurrentPromoIndex }) {
  // Auto-advance promotional banners
  useEffect(() => {
    const interval = setInterval(() => {
      if (promoBanners.length > 1) {
        setCurrentPromoIndex(prev => (prev === promoBanners.length - 1 ? 0 : prev + 1));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [promoBanners.length]);

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Special Offers & Events</h2>
        <div className="bg-white rounded-none shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Enhanced Content Card - Left Side with Attractive Design */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="max-w-lg">
                <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-none mb-5 tracking-wide">
                  FEATURED OFFER
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {promoBanners[currentPromoIndex].title}
                </h3>
                <p className="text-lg text-blue-600 font-semibold mb-4">
                  {promoBanners[currentPromoIndex].subtitle}
                </p>
                <p className="text-gray-700 mb-7 leading-relaxed">
                  {promoBanners[currentPromoIndex].description}
                </p>
                {/* Enhanced Button with Semi-Transparent Realistic Style */}
                <button className="px-7 py-3.5 rounded-none font-semibold text-blue-700 bg-white bg-opacity-80 border border-blue-200 hover:bg-opacity-100 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                  {promoBanners[currentPromoIndex].cta}
                </button>
                
                {/* Enhanced Promo Indicators */}
                <div className="flex mt-10 space-x-2.5">
                  {promoBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPromoIndex(index)}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${index === currentPromoIndex ? 'bg-blue-600 w-6' : 'bg-blue-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sliding Images - Right Side */}
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div className="absolute inset-0 overflow-hidden">
                {promoBanners.map((banner, index) => (
                  <div 
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentPromoIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {banner.image ? (
                      <img 
                        src={banner.image} 
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        style={{ boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)' }}
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-r ${banner.bgColor} flex items-center justify-center`}>
                        <div className="bg-white bg-opacity-20 border-2 border-dashed border-white border-opacity-30 w-4/5 h-4/5 rounded-none flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Promotional Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}