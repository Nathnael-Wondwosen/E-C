import Link from 'next/link';

const tiles = [
  {
    title: 'Local Market',
    description: 'Bulk sourcing, verified suppliers, and negotiated pricing.',
    href: '/localmarket',
    badge: 'Trade',
    external: false,
  },
  {
    title: 'B2C Marketplace',
    description: 'Retail-ready catalog for direct customer purchases.',
    href: '/marketplace',
    badge: 'Retail',
    external: false,
  },
  {
    title: 'Supplier Services',
    description: 'Onboarding, quality checks, and logistics support tools.',
    href: '/e-commerce',
    badge: 'Services',
    external: false,
  },
  {
    title: 'Insights & Blog',
    description: 'Market trends, trade intelligence, and buyer behavior insights.',
    href: '/blog',
    badge: 'Insights',
    external: false,
  },
  {
    title: 'Trade Events',
    description: 'Showcases, fairs, and regional business networking events.',
    href: '/expo',
    badge: 'Events',
    external: false,
  },
  {
    title: 'Global Gateway',
    description: 'Open routes for global partners and external ecosystem sites.',
    href: 'https://www.ubuy.co.za/',
    badge: 'External',
    external: true,
  },
];

export default function EcosystemRoutingTiles() {
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-700 font-semibold">Gateway</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ecosystem Routing Tiles</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tiles.map((tile) => {
            const content = (
              <div className="h-full border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{tile.title}</h3>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1">{tile.badge}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tile.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-blue-700">
                  Open Route
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            );

            if (tile.external) {
              return (
                <a key={tile.title} href={tile.href} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              );
            }

            return (
              <Link key={tile.title} href={tile.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
