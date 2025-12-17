import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel({ carouselSlides, globalBackgroundImage, currentSlide, setCurrentSlide }) {
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length, currentSlide]);

  return (
    <section className="relative h-56 md:h-[24rem] lg:h-[28rem] overflow-hidden transition-all duration-700 ease-in-out">
      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-150%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromRight {
          0% {
            transform: translateX(150%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100%) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInFromBottom {
          0% {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in-left {
          animation: slideInFromLeft 0.7s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInFromRight 0.7s ease-out forwards;
        }
        
        .animate-slide-in-top {
          animation: slideInFromTop 0.7s ease-out forwards;
        }
        
        .animate-slide-in-bottom {
          animation: slideInFromBottom 0.7s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.7s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      
      {/* Background image that stays static */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${globalBackgroundImage}')`
        }}
      >
        {/* Smooth modern gradient overlay with subtle depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900/70 to-indigo-900/60"></div>
        
        {/* Secondary overlay for smoother transition and depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-indigo-900/10"></div>
      </div>
      
      {/* Animated text content */}
      <div className="container mx-auto px-4 md:px-6 flex flex-col justify-center md:justify-center pt-6 pb-12 md:pb-16 relative z-10 h-full">
        <div className="text-white md:text-left text-center max-w-2xl md:max-w-3xl pl-0 md:pl-8">
          {/* Title with sliding animation */}
          <div className="overflow-hidden">
            <h2 className="text-xl md:text-3xl lg:text-5xl font-extrabold mb-2 md:mb-4 leading-tight tracking-tight transition-all duration-1000 ease-out transform translate-y-0 opacity-100 animate-slide-in-left">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent inline-block transition-all duration-700 ease-in-out drop-shadow-lg">
                {carouselSlides[currentSlide]?.title || 'Default Title'}
              </span>
            </h2>
          </div>
          
          {/* Decorative line with fade animation */}
          <div className="my-3 md:my-6 flex justify-center md:justify-start transition-all duration-500 ease-in-out opacity-100 animate-fade-in">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 rounded-full transition-all duration-500 ease-in-out shadow-sm"></div>
          </div>
          
          {/* Subtitle with sliding animation */}
          <div className="overflow-hidden">
            <p className="text-xs md:text-base lg:text-lg mb-3 md:mb-4 text-blue-50 font-light leading-relaxed transition-all duration-1000 ease-out transform translate-y-0 opacity-100 animate-slide-in-right">
              {carouselSlides[currentSlide]?.subtitle || 'Default Subtitle'}
            </p>
          </div>
          
          {/* Button with fade and scale animation */}
          <div className="flex justify-center md:justify-start transition-all duration-700 ease-out opacity-100 transform translate-y-0 animate-slide-in-bottom mt-3 md:mt-4">
            <Link href={carouselSlides[currentSlide]?.ctaLink || '#'}>
              <button className="group relative overflow-hidden bg-gradient-to-r from-amber-500/30 to-orange-600/30 border border-amber-400/40 text-amber-50 backdrop-blur-md px-4 py-2 text-sm md:text-base md:px-5 md:py-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg hover:from-amber-400/50 hover:to-orange-500/50 hover:border-amber-300/50 hover:text-white rounded-sm hover:-translate-y-0.5">
                {/* Subtle hover effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                {/* Button text */}
                <span className="relative z-10 flex items-center">
                  {carouselSlides[currentSlide]?.ctaText || carouselSlides[currentSlide]?.cta || 'Learn More'}
                  <svg className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>          
      {/* Enhanced Carousel Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 w-6 md:w-8' 
                : 'bg-white/50 hover:bg-white/80'
            }`}>
          </button>
        ))}
      </div>
    </section>
  );
}