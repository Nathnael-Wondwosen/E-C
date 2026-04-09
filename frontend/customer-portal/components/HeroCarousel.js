import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const scopeConfig = {
  local: {
    label: 'Ethiopia',
    badge: 'Local First',
    quickTerms: ['Addis coffee', 'Shema', 'Leather', 'Spices', 'Handmade'],
    overlay: 'from-emerald-950/88 via-emerald-800/52 to-transparent',
    glow: 'shadow-[0_0_90px_rgba(251,191,36,0.18)]',
    textShadow: 'drop-shadow-[0_6px_22px_rgba(16,185,129,0.28)]',
    title: 'Welcome to TradeEthiopia Marketplace',
    subtitle: 'Buy and sell across Ethiopia with trusted local suppliers and faster fulfillment.',
    sampleImages: [
      'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=80',
    ],
  },
  africa: {
    label: 'Africa',
    badge: 'Regional Trade',
    quickTerms: ['Cocoa', 'Cashew', 'Cotton', 'Shea', 'Tea'],
    overlay: 'from-slate-950/94 via-blue-950/80 to-cyan-900/62',
    glow: 'shadow-[0_0_90px_rgba(245,158,11,0.16)]',
    textShadow: 'drop-shadow-[0_6px_22px_rgba(234,179,8,0.25)]',
    sampleImages: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=2200&q=80',
    ],
  },
  global: {
    label: 'Global',
    badge: 'Worldwide',
    quickTerms: ['Electronics', 'Packaging', 'Machinery', 'Textiles', 'Solar'],
    overlay: 'from-slate-950/93 via-indigo-950/78 to-sky-900/60',
    glow: 'shadow-[0_0_100px_rgba(59,130,246,0.2)]',
    textShadow: 'drop-shadow-[0_6px_24px_rgba(99,102,241,0.32)]',
    sampleImages: [
      'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=80',
      'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=2200&q=80',
    ],
  },
};

const marketFallbackSlides = {
  local: [
    { title: 'Made in Ethiopia, Ready to Scale', subtitle: 'Source local quality products with trusted domestic suppliers.', ctaText: 'Explore Ethiopia', ctaLink: '/localmarket' },
    { title: 'Support Local Producers', subtitle: 'Discover coffee, textiles, leather, and craft products from Ethiopia.', ctaText: 'Browse Local', ctaLink: '/localmarket' },
    { title: 'Faster Local Fulfillment', subtitle: 'Reduce lead time with suppliers built for Ethiopian demand.', ctaText: 'Find Suppliers', ctaLink: '/localmarket' },
  ],
  africa: [
    { title: 'Trade Across Africa', subtitle: 'Connect with regional suppliers and buyers across African markets.', ctaText: 'Explore Africa', ctaLink: '/markets/africa' },
    { title: 'Regional Supply Power', subtitle: 'Source agricultural, industrial, and consumer goods with speed.', ctaText: 'Browse Africa', ctaLink: '/markets/africa' },
    { title: 'Grow Beyond Borders', subtitle: 'Scale your business through strong regional trade routes.', ctaText: 'Start Regional Trade', ctaLink: '/markets/africa' },
  ],
  global: [
    { title: 'Go Global With Confidence', subtitle: 'Access worldwide products, suppliers, and export opportunities.', ctaText: 'Explore Global', ctaLink: '/marketplace' },
    { title: 'International Buyer Reach', subtitle: 'Expand your market access with global-ready product sourcing.', ctaText: 'Find Global Products', ctaLink: '/marketplace' },
    { title: 'Worldwide Commerce Network', subtitle: 'Trade smarter through a modern multi-market commerce gateway.', ctaText: 'Start Global Trade', ctaLink: '/marketplace' },
  ],
};

export default function HeroCarousel({ carouselSlides = [], currentSlide, setCurrentSlide }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [scope, setScope] = useState('global');
  const [isAnimating, setIsAnimating] = useState(false);

  const getScopeFromSlide = (slide, index) => {
    const source = `${slide?.marketScope || slide?.scope || ''}`.toLowerCase();
    if (source === 'local' || source === 'africa' || source === 'global') return source;
    return index % 3 === 0 ? 'local' : index % 3 === 1 ? 'africa' : 'global';
  };

  const currentSlideData = carouselSlides[currentSlide] || {};
  const slideScope = getScopeFromSlide(currentSlideData, currentSlide);
  const activeScope = scope || slideScope;
  const scopeMeta = scopeConfig[activeScope] || scopeConfig.global;
  const scopedSlides = useMemo(() => {
    const filtered = (carouselSlides || []).filter((slide, index) => getScopeFromSlide(slide, index) === activeScope);
    if (filtered.length > 0) return filtered;
    return marketFallbackSlides[activeScope] || marketFallbackSlides.global;
  }, [carouselSlides, activeScope]);
  const activeSlide = scopedSlides[currentSlide] || scopedSlides[0] || marketFallbackSlides.global[0];
  const selectedBackgroundImage = scopeMeta.sampleImages[currentSlide % scopeMeta.sampleImages.length];
  const heroTitle = activeScope === 'local' ? scopeMeta.title : activeSlide?.title;
  const heroSubtitle = activeScope === 'local' ? scopeMeta.subtitle : activeSlide?.subtitle;

  useEffect(() => {
    if (scopedSlides.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === scopedSlides.length - 1 ? 0 : prev + 1));
    }, 6200);
    return () => clearInterval(interval);
  }, [scopedSlides.length, setCurrentSlide]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [activeScope, setCurrentSlide]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 420);
    return () => clearTimeout(timer);
  }, [currentSlide, activeScope]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category !== 'all') params.set('category', category);
    if (scope) params.set('scope', scope);

    const qs = params.toString();
    router.push(`/marketplace${qs ? `?${qs}` : ''}`);
  };

  const runQuickSearch = (term) => {
    const params = new URLSearchParams();
    params.set('search', term);
    params.set('scope', activeScope);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <section className="relative h-[24rem] md:h-[30rem] lg:h-[34rem] overflow-hidden">
      <style jsx>{`
        .hero-enter {
          opacity: 0;
          transform: translateY(14px);
          animation: heroFadeUp 0.42s ease-out forwards;
        }
        @keyframes heroFadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${selectedBackgroundImage}')` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(2,6,23,0.74) 24%, rgba(2,6,23,0.44) 50%, rgba(2,6,23,0.18) 72%, rgba(255,255,255,0.08) 100%)',
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${scopeMeta.overlay} transition-all duration-500`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.16),transparent_35%)]" />
      </div>

      <div className="container mx-auto px-3 md:px-4 h-full relative z-10 flex items-center">
        <div className={`w-full max-w-4xl pl-1 md:pl-3 pr-0 md:pr-12 text-white ${scopeMeta.textShadow} ${isAnimating ? 'hero-enter' : ''}`}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-cyan-200">Front Page Gateway</p>
            <span className="px-2 py-0.5 text-[10px] border border-white/25 bg-white/10 uppercase tracking-wide">{scopeMeta.badge}</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-[2.6rem] font-bold leading-tight max-w-3xl">
            {heroTitle || 'Trade Fast. Sell Global.'}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-100 max-w-2xl leading-relaxed">
            {heroSubtitle || `Built for ${scopeMeta.label} growth. Move faster with trusted trade routes.`}
          </p>

          <div className={`mt-4 flex flex-wrap items-center gap-2 ${scopeMeta.glow}`}>
            <span className="px-2 py-1 text-[11px] bg-white/10 border border-white/20 text-cyan-100">10k+ Verified Suppliers</span>
            <span className="px-2 py-1 text-[11px] bg-white/10 border border-white/20 text-cyan-100">120k+ Products</span>
            <span className="px-2 py-1 text-[11px] bg-white/10 border border-white/20 text-cyan-100">{scopeMeta.label} Focus</span>
          </div>

          <div className="mt-3 inline-flex border border-white/25 bg-white/10">
            {['local', 'africa', 'global'].map((item) => {
              const active = activeScope === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setScope(item)}
                  className={`h-8 px-3 text-xs uppercase tracking-wide transition-colors ${
                    active ? 'bg-white text-slate-900 font-semibold' : 'text-slate-100 hover:bg-white/15'
                  }`}
                >
                  {scopeConfig[item].label}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSearch}
            className={`mt-8 border border-white/30 p-3 md:p-4 rounded-xl ${scopeMeta.glow}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_170px_150px_140px] gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products or suppliers"
                className="h-11 px-4 text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 px-3 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home</option>
                <option value="beauty">Beauty</option>
                <option value="industrial">Industrial</option>
              </select>

              <select
                value={activeScope}
                onChange={(e) => setScope(e.target.value)}
                className="h-11 px-3 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">Local</option>
                <option value="africa">Africa</option>
                <option value="global">Global</option>
              </select>

              <button
                type="submit"
                className="h-11 px-5 rounded-lg bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-semibold hover:from-blue-800 hover:to-cyan-700 transition-colors"
              >
                Find
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={activeSlide?.ctaLink || '/marketplace'} className="px-4 py-2 border border-cyan-200/40 text-cyan-100 hover:bg-cyan-400/20 text-sm font-semibold rounded-lg transition-colors">
              {activeSlide?.ctaText || activeSlide?.cta || 'Start Now'}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-200">{scopeMeta.label}:</span>
              {scopeMeta.quickTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => runQuickSearch(term)}
                  className="px-2.5 py-1 text-xs rounded-full border border-cyan-200/40 text-cyan-100 hover:bg-cyan-400/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute right-4 bottom-4 z-20 items-center gap-2">
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? scopedSlides.length - 1 : prev - 1))}
          className="h-9 w-9 items-center justify-center inline-flex border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev === scopedSlides.length - 1 ? 0 : prev + 1))}
          className="h-9 w-9 items-center justify-center inline-flex border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Next slide"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {scopedSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-cyan-300' : 'w-2.5 bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}
