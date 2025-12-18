import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

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

  /* --------------------------- NEWS / BLOG CAROUSEL --------------------------- */

  const NewsBlogCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1280px)': { slidesToShow: 4 },
        '(min-width: 1024px)': { slidesToShow: 3 },
        '(min-width: 768px)': { slidesToShow: 2 },
        '(max-width: 767px)': { slidesToShow: 1 }
      }
    });

    const autoplay = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);

    const startAutoplay = useCallback(() => {
      stopAutoplay();
      autoplay.current = setInterval(() => {
        if (emblaApi) emblaApi.scrollNext();
      }, 5000);
    }, [emblaApi]);

    const stopAutoplay = useCallback(() => {
      if (autoplay.current) {
        clearInterval(autoplay.current);
        autoplay.current = null;
      }
    }, []);

    const toggleAutoplay = useCallback(() => {
      if (isPlaying) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
      setIsPlaying(!isPlaying);
    }, [isPlaying, startAutoplay, stopAutoplay]);

    useEffect(() => {
      if (emblaApi) {
        startAutoplay();
        
        const container = emblaApi.containerNode();
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
        
        return () => {
          stopAutoplay();
          container.removeEventListener('mouseenter', stopAutoplay);
          container.removeEventListener('mouseleave', startAutoplay);
        };
      }
    }, [emblaApi, startAutoplay, stopAutoplay]);

    return (
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Latest News & Insights
        </h2>

        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {combinedItems.map((item, i) => (
              <div key={item.uniqueId} className="flex-[0_0_auto] min-w-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-3">
                <AdvancedCard item={item} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  /* ------------------------------ PARTNERS CAROUSEL ----------------------------- */

  const PartnersCarousel = () => {
    const activePartners = partners.filter(p => p.isActive);
    
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1280px)': { slidesToShow: 6 },
        '(min-width: 1024px)': { slidesToShow: 5 },
        '(min-width: 768px)': { slidesToShow: 3 },
        '(max-width: 767px)': { slidesToShow: 2 }
      }
    });

    const autoplay = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);

    const startAutoplay = useCallback(() => {
      stopAutoplay();
      autoplay.current = setInterval(() => {
        if (emblaApi) emblaApi.scrollNext();
      }, 4000);
    }, [emblaApi]);

    const stopAutoplay = useCallback(() => {
      if (autoplay.current) {
        clearInterval(autoplay.current);
        autoplay.current = null;
      }
    }, []);

    const toggleAutoplay = useCallback(() => {
      if (isPlaying) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
      setIsPlaying(!isPlaying);
    }, [isPlaying, startAutoplay, stopAutoplay]);

    useEffect(() => {
      if (emblaApi) {
        startAutoplay();
        
        const container = emblaApi.containerNode();
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
        
        return () => {
          stopAutoplay();
          container.removeEventListener('mouseenter', stopAutoplay);
          container.removeEventListener('mouseleave', startAutoplay);
        };
      }
    }, [emblaApi, startAutoplay, stopAutoplay]);

    if (!activePartners.length) return null;

    return (
      <section className="py-16 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-10">
          Our Trusted Partners
        </h3>

        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {activePartners.map(p => (
              <div key={p.id} className="flex-[0_0_auto] min-w-0 w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6 px-4">
                <div className="h-24 bg-white border flex items-center justify-center hover:shadow-xl">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-14 grayscale hover:grayscale-0 transition"
                  />
                </div>
              </div>
            ))}
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

export default NewsBlogSection;
