import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const NewsBlogSectionCarousel = ({
  industryNews,
  businessInsights,
  partners
}) => {
  const combinedItems = [
    ...industryNews.map((item, i) => ({
      ...item,
      type: 'news',
      uniqueId: `news-${item._id || i}`,
    })),
    ...businessInsights.map((item, i) => ({
      ...item,
      type: 'blog',
      uniqueId: `blog-${item._id || i}`,
    })),
  ];

  /* -------------------------------- CARD -------------------------------- */

  const AdvancedCard = ({ item, index }) => {
    const imageUrl =
      item.imageUrl ||
      item.imageFile?.url ||
      `/placeholder-news-blog-${(index % 6) + 1}.jpg`;

    return (
      <div className="bg-white shadow-xl border border-gray-100 hover:border-blue-200 transition hover:shadow-2xl h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={(e) => (e.target.src = '/placeholder-news-blog.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg line-clamp-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-grow">
            {item.excerpt}
          </p>

          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {item.author || 'Anonymous'}
            </span>
            <Link
              href={item.type === 'news' ? '/news' : '/blog'}
              className="text-blue-600 font-semibold"
            >
              Read →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  /* --------------------------- CAROUSEL FUNCTIONALITY --------------------------- */

  // Create carousel using vanilla JavaScript after component mounts
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      // Initialize carousel functionality
      const initCarousel = (containerId) => {
        const container = document.querySelector(`#${containerId}`);
        if (!container) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse events for drag scrolling
        container.addEventListener('mousedown', (e) => {
          isDown = true;
          startX = e.pageX - container.offsetLeft;
          scrollLeft = container.scrollLeft;
          container.classList.add('grabbing');
        });
        
        container.addEventListener('mouseleave', () => {
          isDown = false;
          container.classList.remove('grabbing');
        });
        
        container.addEventListener('mouseup', () => {
          isDown = false;
          container.classList.remove('grabbing');
        });
        
        container.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - container.offsetLeft;
          const walk = (x - startX) * 2; //scroll-fast
          container.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
          isDown = true;
          startX = e.touches[0].pageX - container.offsetLeft;
          scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('touchend', () => {
          isDown = false;
        });
        
        container.addEventListener('touchmove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.touches[0].pageX - container.offsetLeft;
          const walk = (x - startX) * 2; //scroll-fast
          container.scrollLeft = scrollLeft - walk;
        });
      };

      // Initialize both carousels
      initCarousel('news-blog-carousel');
      initCarousel('partners-carousel');
    }
  }, []);

  /* --------------------------- CAROUSEL DISPLAY --------------------------- */

  const NewsBlogCarousel = () => {
    return (
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Latest News & Insights
        </h2>

        <div 
          id="news-blog-carousel"
          className="relative overflow-x-auto pb-6 hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-6">
            {combinedItems.map((item, i) => (
              <div 
                key={item.uniqueId} 
                className="flex-shrink-0 w-72 md:w-80"
              >
                <AdvancedCard item={item} index={i} />
              </div>
            ))}
            {/* Add empty space to prevent gap at the end */}
            <div className="flex-shrink-0 w-12"></div>
          </div>
        </div>
      </section>
    );
  };

  const PartnersCarousel = () => {
    const activePartners = partners.filter(p => p.isActive);
    
    if (!activePartners.length) return null;

    return (
      <section className="py-16 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-10">
          Our Trusted Partners
        </h3>

        <div 
          id="partners-carousel"
          className="relative overflow-x-auto pb-6 hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-6">
            {activePartners.map(p => (
              <div 
                key={p.id} 
                className="flex-shrink-0 w-48"
              >
                <div className="h-24 bg-white border flex items-center justify-center hover:shadow-xl p-4">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-14 grayscale hover:grayscale-0 transition"
                  />
                </div>
              </div>
            ))}
            {/* Add empty space to prevent gap at the end */}
            <div className="flex-shrink-0 w-12"></div>
          </div>
        </div>
      </section>
    );
  };

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <NewsBlogCarousel />
        <PartnersCarousel />
      </div>
    </section>
  );
};

export default NewsBlogSectionCarousel;