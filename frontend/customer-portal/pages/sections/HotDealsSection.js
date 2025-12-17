import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HotDealsSection({ displayedHotDeals, currentDealIndex, setCurrentDealIndex }) {
  // Auto-advance deals
  useEffect(() => {
    const interval = setInterval(() => {
      scrollDeals('right');
    }, 4000);
    return () => clearInterval(interval);
  }, [displayedHotDeals.length]);

  // Handle horizontal scrolling for deals
  const scrollDeals = (direction) => {
    const container = document.getElementById('deals-container');
    if (container) {
      const scrollAmount = 320; // Adjusted for minimized card width
      if (direction === 'left') {
        setCurrentDealIndex(prev => (prev === 0 ? displayedHotDeals.length - 1 : prev - 1));
      } else {
        setCurrentDealIndex(prev => (prev === displayedHotDeals.length - 1 ? 0 : prev + 1));
      }
    }
  };

  // Deal card component with proper image handling
  const DealCard = ({ deal, variant }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <div 
        key={`${variant}-${deal.id}`} 
        className={`flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition snap-start mx-2 ${variant === 'first' ? 'first:ml-4' : variant === 'last' ? 'last:mr-4' : ''}`}
      >
        <div className="relative">
          {/* Product Image with Fallback */}
          {deal.images && deal.images.length > 0 && !imageError ? (
            <img 
              src={deal.images[0]} 
              alt={deal.name}
              className="w-full h-44 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-44 flex items-center justify-center">
              <span className="text-gray-500">Product Image</span>
            </div>
          )}
          
          {/* Premium Badge */}
          {deal.isPremium && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              PREMIUM
            </div>
          )}
          
          {/* Hot Badge */}
          {deal.isHot && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              HOT
            </div>
          )}
          
          {/* Discount Badge */}
          {deal.discount && (
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {deal.discount}
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{deal.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-800 font-bold">{deal.discountedPrice}</span>
              <span className="text-gray-500 line-through text-xs">{deal.originalPrice}</span>
            </div>
            <button className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-0">
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Hot Deals</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scrollDeals('left')}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={() => scrollDeals('right')}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            <Link href="/deals" className="ml-2 text-blue-600 hover:underline flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Horizontal Scroll Container - Infinite Loop */}
        <div 
          id="deals-container"
          className="flex overflow-x-hidden pb-6 snap-mandatory snap-x w-full"
        >
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentDealIndex * 320}px)` }}>
            {/* Duplicate first set of cards for infinite loop effect */}
            {displayedHotDeals.map((deal) => (
              <DealCard key={`first-${deal.id}`} deal={deal} variant="first" />
            ))}
            
            {/* Original set of cards */}
            {displayedHotDeals.map((deal) => (
              <DealCard key={`original-${deal.id}`} deal={deal} variant="original" />
            ))}
            
            {/* Duplicate last set of cards for infinite loop effect */}
            {displayedHotDeals.map((deal) => (
              <DealCard key={`last-${deal.id}`} deal={deal} variant="last" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}