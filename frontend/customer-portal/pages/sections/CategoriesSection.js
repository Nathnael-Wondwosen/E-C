import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CategoriesSection({ categories, currentHeroCategoryIndex, setCurrentHeroCategoryIndex }) {
  const categoryContainerRef = useRef(null);

  // Handle hero category navigation
  const scrollHeroCategories = (direction) => {
    setCurrentHeroCategoryIndex(prev => {
      if (direction === 'left') {
        return prev - 1;
      } else {
        return prev + 1;
      }
    });
  };

  // Scroll to specific category
  const scrollToCategory = (index) => {
    setCurrentHeroCategoryIndex(index + categories.length);
  };

  // Sync scroll position with current index
  useEffect(() => {
    if (categoryContainerRef.current) {
      // Calculate actual card width based on screen size
      const cardWidth = window.innerWidth < 640 ? 124 : 
                       window.innerWidth < 768 ? 140 : 
                       window.innerWidth < 1024 ? 176 : 208;
      const gap = 16; // 8px margin on each side
      const scrollPosition = currentHeroCategoryIndex * (cardWidth + gap);
      categoryContainerRef.current.style.transform = `translateX(-${scrollPosition}px)`;
      
      // Infinite loop logic - jump to middle set when reaching edges
      if (currentHeroCategoryIndex <= 0) {
        setTimeout(() => {
          setCurrentHeroCategoryIndex(categories.length);
        }, 500);
      } else if (currentHeroCategoryIndex >= categories.length * 2) {
        setTimeout(() => {
          setCurrentHeroCategoryIndex(categories.length);
        }, 500);
      }
    }
  }, [currentHeroCategoryIndex]);

  // Auto-advance hero categories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroCategoryIndex(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Shop by Category</h2>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => scrollHeroCategories('left')}
              className="p-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 rounded-none shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              onClick={() => scrollHeroCategories('right')}
              className="p-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 rounded-none shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modern Horizontal Category Scrolling */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm p-4">
          <div 
            className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex transition-transform duration-500 ease-in-out min-w-max" ref={categoryContainerRef}>
              {/* Left duplicate set for seamless looping */}
              {categories && categories.map((category, index) => (
                <div 
                  key={`left-${category.id}-${index}`}
                  className="flex-shrink-0 w-24 sm:w-32 md:w-40 mx-1 snap-start"
                >
                  <Link 
                    href={`/categories/${category.id}`}
                    className="block h-full category-card"
                  >
                    <div className="bg-white/90 dark:bg-gray-700/90 p-3 sm:p-4 h-full flex flex-col items-center justify-center text-center rounded-none hover:bg-white dark:hover:bg-gray-600/90 transition-colors duration-200 shadow-sm">
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">{category.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{category.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{category.count.toLocaleString()} items</div>
                    </div>
                  </Link>
                </div>
              ))}                  
              {/* Middle/main set - currently visible */}
              {categories.map((category, index) => (
                <div 
                  key={`middle-${category.id}-${index}`}
                  className="flex-shrink-0 w-24 sm:w-32 md:w-40 mx-1 snap-start"
                >
                  <Link 
                    href={`/categories/${category.id}`}
                    className="block h-full category-card"
                  >
                    <div className="bg-white/90 dark:bg-gray-700/90 p-3 sm:p-4 h-full flex flex-col items-center justify-center text-center rounded-none border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600/90 transition-colors duration-200 shadow-sm">
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">{category.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{category.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{category.count.toLocaleString()} items</div>
                    </div>
                  </Link>
                </div>
              ))}
              
              {/* Right duplicate set for seamless looping */}
              {categories.map((category, index) => (
                <div 
                  key={`right-${category.id}-${index}`}
                  className="flex-shrink-0 w-24 sm:w-32 md:w-40 mx-1 snap-start"
                >
                  <Link 
                    href={`/categories/${category.id}`}
                    className="block h-full category-card"
                  >
                    <div className="bg-white/90 dark:bg-gray-700/90 p-3 sm:p-4 h-full flex flex-col items-center justify-center text-center rounded-none hover:bg-white dark:hover:bg-gray-600/90 transition-colors duration-200 shadow-sm">
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">{category.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{category.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{category.count.toLocaleString()} items</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Category Indicators - Dots for each category */}
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCategory(index)}
              className={`w-2 h-2 transition-colors duration-200 flex-shrink-0 rounded-full ${index === (currentHeroCategoryIndex % categories.length) ? 'bg-gray-700 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}