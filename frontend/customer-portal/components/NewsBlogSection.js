import Link from 'next/link';
import { useState, useEffect } from 'react';

const NewsBlogSection = ({
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
      <div className="bg-white shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.target.src = '/placeholder-news-blog.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-600">
              {item.type === 'news' ? 'NEWS' : 'BLOG'}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-3">
            {item.excerpt}
          </p>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              <span className="font-medium">{item.author || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">{new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString()}</span>
              <Link
                href={item.type === 'news' ? '/news' : '/blog'}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 flex items-center"
              >
                Read more
                <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* --------------------------- SCROLLABLE NEWS / BLOG DISPLAY --------------------------- */

  const NewsBlogDisplay = () => {
    return (
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Latest News & Insights
        </h2>

        <div className="relative">
          <div className="flex overflow-x-auto pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex space-x-6 w-full">
              {combinedItems.map((item, i) => (
                <div key={item.uniqueId} className="flex-shrink-0 w-64 sm:w-72">
                  <AdvancedCard item={item} index={i} />
                </div>
              ))}
              {/* Add padding to prevent last item from being cut off */}
              <div className="flex-shrink-0 w-12"></div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  /* ------------------------------ PARTNERS STATIC DISPLAY ----------------------------- */

  const PartnersDisplay = () => {
    const activePartners = partners.filter(p => p.isActive);
    
    if (!activePartners.length) return null;

    return (
      <section className="py-16 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-10">
          Our Trusted Partners
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {activePartners.map(p => (
            <div key={p.id} className="flex items-center justify-center p-6 bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-14 grayscale group-hover:grayscale-0 transition-all duration-500 object-contain"
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <NewsBlogDisplay />
        <PartnersDisplay />
      </div>
    </section>
  );
};

export default NewsBlogSection;
