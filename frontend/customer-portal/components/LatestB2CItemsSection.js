import Link from 'next/link';
import { useRef } from 'react';

const inferScope = (product, index) => {
  const origin = `${product?.origin || product?.countryOfOrigin || product?.country || product?.region || ''}`.toLowerCase();
  const scope = `${product?.marketScope || ''}`.toLowerCase();

  if (scope === 'local' || scope === 'africa' || scope === 'global') return scope;
  if (origin.includes('ethiopia')) return 'local';
  if (origin.includes('africa') || origin.includes('kenya') || origin.includes('nigeria') || origin.includes('ghana') || origin.includes('rwanda')) return 'africa';

  return index % 3 === 0 ? 'local' : index % 3 === 1 ? 'africa' : 'global';
};

export default function LatestB2CItemsSection({ products = [], selectedScope = 'local' }) {
  const scrollRef = useRef(null);
  const regular = Array.isArray(products) ? products.filter((p) => p.productType !== 'B2B') : [];

  const scoped = regular.filter((product, index) => inferScope(product, index) === selectedScope);

  const latest = scoped
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  const fallback = regular.slice(0, 8);
  const items = latest.length ? latest : fallback;
  const sectionTitle = selectedScope === 'local' ? 'Local Picks' : selectedScope === 'africa' ? 'Africa Picks' : 'Global Picks';

  const scrollByCards = (direction) => {
    if (!scrollRef.current) return;
    const amount = Math.round(scrollRef.current.clientWidth * 0.75);
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Marketplace Scope</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Latest B2C Items</h2>
            <p className="text-sm text-gray-500 mt-1">{sectionTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollByCards('left')}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollByCards('right')}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link href="/marketplace" className="ml-1 text-blue-700 font-medium">View All</Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((product, index) => (
            <div
              key={product.id || product._id || index}
              className="snap-start shrink-0 w-[48%] sm:w-[31%] lg:w-[24%] bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-40 bg-gray-100 mb-3 overflow-hidden rounded-lg">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] uppercase tracking-wide text-blue-700">{selectedScope}</p>
                {product.discountPercentage ? (
                  <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.name || 'Item'}</h3>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-base font-bold text-gray-900">
                  {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price || '$0.00'}
                </p>
                <button className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors" aria-label="Add to cart">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
