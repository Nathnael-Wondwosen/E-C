import Head from 'next/head';
import Link from 'next/link';

export default function MarketplaceTest() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Marketplace Test | TradeEthiopia</title>
        <meta name="description" content="Test page for marketplace functionality" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Marketplace Test</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Marketplace Page</h2>
          <p className="text-gray-600 mb-6">
            This is a test page to verify the marketplace functionality is working correctly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Filtering System</h3>
              <p className="text-gray-700">
                Advanced filtering sidebar with multiple filter options including category, price range, and stock status.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Product Display</h3>
              <p className="text-gray-700">
                Flexible grid and list view options for browsing products with detailed information.
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Sorting Options</h3>
              <p className="text-gray-700">
                Multiple sorting options including price, rating, and alphabetical ordering.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <Link href="/marketplace" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Go to Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}