import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AccountDropdown from '../components/header/AccountDropdown';

const platformNavLinks = [
  { label: 'Ecommerce', href: '/e-commerce', external: false },
  { label: 'Tesbinn', href: 'https://tesbin.com', external: true },
  { label: 'Enisra', href: 'https://www.ensira.com', external: true },
  { label: 'Tradex', href: 'https://tradex.com', external: true },
  { label: 'Buna Tale', href: 'https://bunatale.com', external: true },
  { label: 'Expo', href: 'https://ethiointernationalexpo.com', external: true },
];

const spotlightStores = [
  {
    title: 'Computer H/W Electronic Store',
    subtitle: 'Tech that keeps you ahead',
    icon: '🖥️',
  },
  {
    title: 'The Warm Edit Store',
    subtitle: 'Feel the warmth, love the style',
    icon: '🧥',
  },
  {
    title: 'Pet Essentials',
    subtitle: 'For the love of pets and joy',
    icon: '🐾',
  },
  {
    title: 'Industrial Tools',
    subtitle: 'Built for strength and precision',
    icon: '🛠️',
  },
];

const heroSlides = [
  {
    title: "Women's Day 2026",
    badge: 'International Event',
    cta: 'Shop Now',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Spring Home Refresh',
    badge: 'Seasonal Picks',
    cta: 'Explore Deals',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Smart Tech Festival',
    badge: 'Electronics Week',
    cta: 'Get Started',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80',
  },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>TradeEthiopia | Modern Marketplace Gateway</title>
        <meta
          name="description"
          content="Modern TradeEthiopia gateway with animated hero carousel, store highlights, and global product discovery."
        />
      </Head>

      <main
        className="min-h-screen text-slate-900"
        style={{
          fontFamily: '"Manrope", "Poppins", "Segoe UI", sans-serif',
          background:
            'radial-gradient(circle at 8% 0%, rgba(30,64,175,0.12) 0%, transparent 28%), radial-gradient(circle at 90% 10%, rgba(251,191,36,0.14) 0%, transparent 26%), #f1f5f9',
        }}
      >
        <div className="h-1 bg-gradient-to-r from-blue-900 via-cyan-500 to-amber-400" />

        <header className="border-b border-slate-300/70 bg-white/90 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto max-w-[1900px] px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/" className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-extrabold text-slate-900 shadow-sm">
                TradeEthiopia
              </Link>
              <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
                {platformNavLinks.map((item) =>
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="shrink-0 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
              <div className="ml-auto flex items-center gap-2">
                <button title="Language" className="h-9 w-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                  🌐
                </button>
                <AccountDropdown
                  buttonClassName="h-9 w-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center"
                  menuClassName="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 shadow-xl z-40"
                  buttonContent={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
                    </svg>
                  }
                />
                <Link
                  href="/cart"
                  title="Cart"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  🛒
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1900px] px-2 py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {spotlightStores.map((store) => (
              <article key={store.title} className="flex items-center gap-3 border border-slate-300 bg-white px-3 py-2 shadow-sm">
                <div className="text-2xl">{store.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[18px] font-bold text-slate-900">{store.title}</h3>
                  <p className="truncate text-base italic text-slate-600">{store.subtitle}</p>
                </div>
                <span className="text-xl text-slate-700">›</span>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1900px] px-2 pb-8">
          <div className="relative overflow-hidden border border-slate-300 bg-white shadow-[0_28px_80px_-35px_rgba(15,23,42,0.6)]">
            <div className="relative h-[74vh] min-h-[500px] max-h-[760px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute inset-0 transition-all duration-700 ${
                    activeSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
                  }`}
                >
                  <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-100/70 via-rose-50/45 to-amber-100/35" />
                </div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="text-center">
                  <p className="inline-flex rounded-full bg-pink-600 px-4 py-1 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
                    {heroSlides[activeSlide].badge}
                  </p>
                  <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-rose-600 tracking-tight">
                    {heroSlides[activeSlide].title}
                  </h1>
                  <p className="mx-auto mt-3 max-w-3xl rounded-xl border border-white/70 bg-white/75 px-5 py-3 text-sm font-medium text-slate-700 shadow-md backdrop-blur">
                    This is the main sample page of our site. It highlights our core marketplace experience with an attractive and modern interface.
                  </p>
                  <button className="mt-5 rounded-lg bg-rose-600 px-6 py-2.5 text-lg font-bold text-white shadow-lg hover:bg-rose-700">
                    {heroSlides[activeSlide].cta}
                  </button>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 w-[95%] max-w-[980px] -translate-x-1/2">
                <div className="overflow-hidden border border-slate-300 bg-white/95 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                    <input
                      type="text"
                      placeholder="Search from 300M+ premium products around the world"
                      className="h-12 flex-1 bg-transparent text-base text-slate-800 outline-none"
                    />
                    <button className="h-11 w-11 rounded-full bg-amber-400 text-white text-xl font-bold hover:bg-amber-500">⌕</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={`${slide.title}-dot`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    activeSlide === index ? 'w-8 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

