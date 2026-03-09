import Head from 'next/head';
import Link from 'next/link';

export default function MarketLandingPage({ market, products = [] }) {
  return (
    <>
      <Head>
        <title>{`${market.name} | TradeEthiopia`}</title>
        <meta name="description" content={market.description} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <section className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <p className="text-xs uppercase tracking-widest text-blue-300">{market.heroTag}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">{market.name}</h1>
            <p className="text-sm md:text-base text-gray-300 mt-2 max-w-3xl">{market.description}</p>
            <div className="mt-4">
              <Link href="/e-commerce" className="text-sm text-blue-300 hover:text-blue-200">
                Back to E-commerce Gateway
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <span className="text-sm text-gray-600">{products.length} items</span>
          </div>
          {products.length === 0 ? (
            <div className="bg-white border border-gray-200 p-6 text-sm text-gray-600">
              No products are currently categorized for this market scope.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <article key={product.id} className="bg-white border border-gray-200 p-4">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-40 object-cover bg-gray-100"
                  />
                  <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="mt-1 text-sm text-blue-700 font-medium">{product.price}</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{product.description || 'No description'}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
