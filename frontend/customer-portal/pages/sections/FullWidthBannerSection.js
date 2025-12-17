import { useEffect } from 'react';
import Link from 'next/link';

export default function FullWidthBannerSection({ bannerSlides, currentBannerIndex, setCurrentBannerIndex }) {
  // Auto-advance banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  // Handle banner navigation
  const scrollBanners = (direction) => {
    if (direction === 'left') {
      setCurrentBannerIndex(prev => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
    } else {
      setCurrentBannerIndex(prev => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <section className="py-0 px-0 w-full">
      <div className="w-full">
        {/* Full Width Banner Container - No container restrictions */}
        <div className="w-full">
          {/* Full Width Banner Container - No container restrictions */}
          <div className="relative w-full overflow-hidden rounded-none shadow-2xl">
            {/* Banner Sliding Container */}
            <div className="relative h-64 md:h-80 lg:h-96 w-full">
              <div 
                className="absolute inset-0 transition-transform duration-700 ease-in-out flex w-full"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {/* Render banner slides */}
                {bannerSlides.map((slide, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-full h-full relative"
                  >
                    {/* Background image */}
                    <img 
                      src={slide.imageUrl || slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
                    />
                    
                    {/* Overlay for better readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-24">
                      <div className="max-w-3xl text-white">
                        <h2 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h2>
                        <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                        {/* Enhanced CTA button to match hero section style */}
                        <Link href={slide.link}>
                          <button className="group relative overflow-hidden bg-gradient-to-r from-amber-500/30 to-orange-600/30 border border-amber-400/40 text-amber-50 backdrop-blur-md px-5 py-2.5 text-sm md:text-base md:px-6 md:py-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:from-amber-400/50 hover:to-orange-500/50 hover:border-amber-300/50 hover:text-white rounded-sm hover:-translate-y-0.5">
                            {/* Subtle hover effect */}
                            <span className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                            {/* Button text */}
                            <span className="relative z-10 flex items-center">
                              {slide.cta}
                              <svg className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                              </svg>
                            </span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

              {/* Navigation Arrows */}
              <button 
                onClick={() => scrollBanners('left')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition z-20"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button 
                onClick={() => scrollBanners('right')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition z-20"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Banner Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {bannerSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentBannerIndex === index ? 'bg-white scale-125' : 'bg-white bg-opacity-50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}