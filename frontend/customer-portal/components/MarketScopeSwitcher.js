import { useMemo, useRef } from 'react';

const labels = [
  { id: 'local', name: 'Local', subtitle: 'Ethiopia first' },
  { id: 'africa', name: 'Africa', subtitle: 'Regional trade' },
  { id: 'global', name: 'Global', subtitle: 'Worldwide catalog' },
  { id: 'china', name: 'China', subtitle: 'Factory direct' },
  { id: 'b2b', name: 'B2B', subtitle: 'Bulk procurement' },
];

const scopeMockData = {
  local: {
    items: 1240,
    eta: '1-3 days',
    categories: ['Coffee', 'Textiles', 'Leather', 'Spices'],
  },
  africa: {
    items: 3820,
    eta: '4-9 days',
    categories: ['Agriculture', 'Minerals', 'Packaging', 'Beauty'],
  },
  global: {
    items: 12870,
    eta: '7-14 days',
    categories: ['Electronics', 'Machinery', 'Industrial', 'Home'],
  },
  china: {
    items: 9150,
    eta: '8-15 days',
    categories: ['Manufacturing', 'Components', 'Packaging', 'Tools'],
  },
  b2b: {
    items: 4020,
    eta: '3-10 days',
    categories: ['Wholesale', 'Raw Materials', 'Equipment', 'Distribution'],
  },
};

const mockProductsByScope = {
  local: [
    { id: 'l1', name: 'Sidamo Coffee Beans', price: 18.5, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80' },
    { id: 'l2', name: 'Handwoven Shema', price: 35.0, image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80' },
    { id: 'l3', name: 'Leather Handbag', price: 42.0, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' },
    { id: 'l4', name: 'Ethiopian Spices Set', price: 12.9, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80' },
    { id: 'l5', name: 'Injera Pan', price: 27.9, image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80' },
  ],
  africa: [
    { id: 'a1', name: 'Cocoa Powder Premium', price: 21.0, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80' },
    { id: 'a2', name: 'Organic Shea Butter', price: 15.5, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80' },
    { id: 'a3', name: 'Cashew Nuts Bulk', price: 24.2, image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80' },
    { id: 'a4', name: 'Cotton Fabric Rolls', price: 39.0, image: 'https://images.unsplash.com/photo-1459183885421-5cc683b8dbba?auto=format&fit=crop&w=800&q=80' },
    { id: 'a5', name: 'African Tea Blend', price: 13.8, image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=800&q=80' },
  ],
  global: [
    { id: 'g1', name: 'Wireless Earbuds Pro', price: 49.9, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80' },
    { id: 'g2', name: 'Smart Home Camera', price: 59.0, image: 'https://images.unsplash.com/photo-1558002038-1055e2e28ed1?auto=format&fit=crop&w=800&q=80' },
    { id: 'g3', name: 'Industrial Drill Kit', price: 119.0, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80' },
    { id: 'g4', name: 'Portable Solar Panel', price: 89.5, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80' },
    { id: 'g5', name: 'Packaging Starter Set', price: 34.9, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
  ],
  china: [
    { id: 'c1', name: 'CNC Controller Board', price: 65.0, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
    { id: 'c2', name: 'Industrial Sensor Pack', price: 32.0, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  ],
  b2b: [
    { id: 'b1', name: 'Wholesale Grain Bundle', price: 1200.0, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
    { id: 'b2', name: 'Business Office Bundle', price: 980.0, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  ],
};

const currency = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function MarketScopeSwitcher({ selectedScope = 'local', onChange, counts = {}, productsByScope = {} }) {
  const railRef = useRef(null);
  const hasLiveCounts =
    (counts.local || 0) + (counts.africa || 0) + (counts.global || 0) + (counts.china || 0) + (counts.b2b || 0) > 0;
  const resolvedCounts = hasLiveCounts
    ? counts
    : {
        local: scopeMockData.local.items,
        africa: scopeMockData.africa.items,
        global: scopeMockData.global.items,
        china: scopeMockData.china.items,
        b2b: scopeMockData.b2b.items,
      };

  const activeMeta = scopeMockData[selectedScope] || scopeMockData.local;
  const activeProducts = useMemo(() => {
    const live = productsByScope[selectedScope] || [];
    return live.length > 0 ? live : (mockProductsByScope[selectedScope] || []);
  }, [productsByScope, selectedScope]);

  const scrollCards = (direction) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="py-6 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">Marketplace Scope</p>
            <h3 className="text-xl font-bold text-gray-900">Local / Africa / Global Switcher</h3>
            {!hasLiveCounts && (
              <p className="text-xs text-amber-700 mt-1">Sample marketplace data is shown temporarily.</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full md:w-auto">
            {labels.map((item) => {
              const active = selectedScope === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className={`px-3 py-2 border text-left transition-all duration-300 ${
                    active
                      ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>{item.subtitle}</p>
                  <p className={`text-xs mt-1 font-semibold ${active ? 'text-white' : 'text-blue-700'}`}>{resolvedCounts[item.id] || 0} items</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Estimated Delivery</p>
            <p className="text-lg font-bold text-gray-900">{activeMeta.eta}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Top Sample Categories</p>
            <div className="flex flex-wrap gap-2">
              {activeMeta.categories.map((name) => (
                <span key={name} className="px-2.5 py-1 text-xs bg-white border border-gray-200 text-gray-700">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Trending In {labels.find((x) => x.id === selectedScope)?.name}</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCards(-1)}
                className="h-8 w-8 inline-flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                aria-label="Scroll left"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollCards(1)}
                className="h-8 w-8 inline-flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                aria-label="Scroll right"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={railRef} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
            {activeProducts.map((product, idx) => (
              <article key={product.id || `${selectedScope}-${idx}`} className="min-w-[220px] max-w-[220px] bg-white border border-gray-200 snap-start hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{labels.find((x) => x.id === selectedScope)?.name}</p>
                  <h5 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.name}</h5>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-blue-700">{currency(product.price)}</p>
                    <p className="text-[11px] text-gray-500">MOQ 10+</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
