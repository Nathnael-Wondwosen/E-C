import Link from 'next/link';
import { useState, useEffect } from 'react';

const NewsBlogSection = ({ 
  industryNews, 
  businessInsights, 
  partners,
  currentNewsIndex, 
  setCurrentNewsIndex, 
  currentBlogIndex, 
  setCurrentBlogIndex 
}) => {
  // Combine both news and blog items into a single array with unique IDs
  const combinedItems = [
    ...industryNews.map((item, index) => ({ ...item, type: 'news', uniqueId: `news-${item._id || index}` })),
    ...businessInsights.map((item, index) => ({ ...item, type: 'blog', uniqueId: `blog-${item._id || index}` }))
  ];

  // Advanced Card Component with modern design - enhanced to match other sections
  const AdvancedCard = ({ item, index }) => {
    // Use the actual image URL from the item or fallback to a unique placeholder
    const imageUrl = item.imageUrl || item.imageFile?.url || `/placeholder-news-blog-${(index % 6) + 1}.jpg`;
    
    return (
      <div className="bg-white rounded-none shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-100 hover:border-blue-200 group h-full flex flex-col">
        {/* Image section with overlay */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              // Fallback to generic placeholder if specific one fails
              e.target.src = "/placeholder-news-blog.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            {item.type === 'news' ? (
              <span className="inline-block bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-none shadow-md">
                {item.category || 'News'}
              </span>
            ) : (
              <span className="inline-block bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-none shadow-md">
                Blog
              </span>
            )}
          </div>
          
          {/* Floating date badge */}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md">
            {item.date || 'Recent'}
          </div>
        </div>
        
        {/* Content section */}
        <div className="flex-grow p-5 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-2">
            {item.excerpt}
          </p>
          
          {/* Meta info */}
          <div className="pt-3 border-t border-gray-100 mt-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-none bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                  {item.author ? item.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="text-gray-700 text-xs font-medium">{item.author || 'Anonymous'}</p>
                  <p className="text-gray-500 text-xs">{item.date || 'Recent'}</p>
                </div>
              </div>
              
              <Link href={item.type === 'news' ? '/news' : '/blog'} className={`${item.type === 'news' ? 'text-blue-600' : 'text-purple-600'} text-xs font-semibold flex items-center group/read hover:underline`}>
                {item.type === 'news' ? 'Read More' : 'Read Article'}
                <svg className="w-3 h-3 ml-1 transform group-hover/read:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tags moved to outside the content section, below the card footer */}
        {item.type === 'blog' && item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="px-5 pb-4">
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <span key={`${item.uniqueId}-tag-${tagIndex}`} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-none hover:bg-blue-100 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Simple Carousel Component for News/Blog Cards
  const NewsBlogCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(1);
    
    // Determine how many items to show based on screen size
    useEffect(() => {
      const updateItemsPerView = () => {
        if (window.innerWidth >= 1280) {
          setItemsPerView(4);
        } else if (window.innerWidth >= 1024) {
          setItemsPerView(3);
        } else if (window.innerWidth >= 768) {
          setItemsPerView(2);
        } else {
          setItemsPerView(1);
        }
      };
      
      updateItemsPerView();
      window.addEventListener('resize', updateItemsPerView);
      return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);
    
    // Calculate visible items
    const visibleItems = combinedItems.slice(currentIndex, currentIndex + itemsPerView);
    
    // Handle next
    const next = () => {
      if (currentIndex + itemsPerView < combinedItems.length) {
        setCurrentIndex(currentIndex + 1);
      }
    };
    
    // Handle previous
    const prev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
    
    // Auto-rotate
    useEffect(() => {
      const interval = setInterval(() => {
        if (currentIndex + itemsPerView < combinedItems.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }, [currentIndex, itemsPerView]);
    
    return (
      <div className="mb-12">
        <div className="flex justify-center items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 relative inline-block">
            <span className="relative z-10">Latest News & Insights</span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-none"></span>
          </h3>
        </div>
        
        <div className="relative">
          {/* Navigation Arrows */}
          <button 
            onClick={prev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button 
            onClick={next}
            disabled={currentIndex + itemsPerView >= combinedItems.length}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${(currentIndex + itemsPerView >= combinedItems.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          {/* Carousel Container */}
          <div className="overflow-hidden px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleItems.map((item, index) => (
                <AdvancedCard key={item.uniqueId} item={item} index={index} />
              ))}
            </div>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {combinedItems.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index >= currentIndex && index < currentIndex + itemsPerView
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Simple Carousel for Partners Logos
  const PartnersCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [logosPerView, setLogosPerView] = useState(2);
    
    // Filter to only show active partners
    const activePartners = partners.filter(partner => partner.isActive);
    
    // Determine how many logos to show based on screen size
    useEffect(() => {
      const updateLogosPerView = () => {
        if (window.innerWidth >= 1280) {
          setLogosPerView(6);
        } else if (window.innerWidth >= 1024) {
          setLogosPerView(5);
        } else if (window.innerWidth >= 768) {
          setLogosPerView(3);
        } else {
          setLogosPerView(2);
        }
      };
      
      updateLogosPerView();
      window.addEventListener('resize', updateLogosPerView);
      return () => window.removeEventListener('resize', updateLogosPerView);
    }, []);
    
    // Calculate visible logos
    const visibleLogos = activePartners.slice(currentIndex, currentIndex + logosPerView);
    
    // Handle next
    const next = () => {
      if (currentIndex + logosPerView < activePartners.length) {
        setCurrentIndex(currentIndex + 1);
      }
    };
    
    // Handle previous
    const prev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
    
    // Auto-rotate
    useEffect(() => {
      const interval = setInterval(() => {
        if (currentIndex + logosPerView < activePartners.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 4000);
      
      return () => clearInterval(interval);
    }, [currentIndex, logosPerView, activePartners.length]);
    
    // Don't show partners section if there are no active partners
    if (activePartners.length === 0) {
      return null;
    }
    
    return (
      <div className="py-12 bg-gray-50 rounded-none">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-800 relative inline-block">
              <span className="relative z-10">Our Trusted Partners</span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-none"></span>
            </h3>
            <p className="text-gray-600 mt-3">We collaborate with industry leaders to deliver exceptional service</p>
          </div>
          
          <div className="relative">
            {/* Navigation Arrows */}
            <button 
              onClick={prev}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              onClick={next}
              disabled={currentIndex + logosPerView >= activePartners.length}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${(currentIndex + logosPerView >= activePartners.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            {/* Carousel Container */}
            <div className="overflow-hidden px-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {visibleLogos.map((partner) => (
                  <div 
                    key={partner.id} 
                    className="flex items-center justify-center bg-white border border-gray-200 rounded-none p-5 h-24 transition-all duration-300 hover:shadow-lg"
                  >
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="max-h-14 max-w-full object-contain transition-all duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {activePartners.map((_, index) => (
                <button
                  key={`logo-dot-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index >= currentIndex && index < currentIndex + logosPerView
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <NewsBlogCarousel />
        <PartnersCarousel />
      </div>
    </section>
  );
};

export default NewsBlogSection;