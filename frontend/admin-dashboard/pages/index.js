import Head from 'next/head';

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>B2B E-Commerce Admin Dashboard</title>
        <meta name="description" content="Admin Dashboard for B2B E-Commerce Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Products</h2>
            <p className="mb-4">Manage your product catalog, inventory, and pricing.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Products
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Orders</h2>
            <p className="mb-4">View and process customer orders.</p>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              View Orders
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Customers</h2>
            <p className="mb-4">Manage customer accounts and permissions.</p>
            <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
              Manage Customers
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} B2B E-Commerce Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}