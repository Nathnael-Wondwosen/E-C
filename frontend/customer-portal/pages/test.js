import Head from 'next/head';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>Test Page</title>
        <meta name="description" content="Test page for Tailwind CSS" />
      </Head>

      <main className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Tailwind CSS Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Red Alert</p>
            <p>If you see red background, Tailwind is working!</p>
          </div>
          
          <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p className="font-bold">Green Success</p>
            <p>If you see green background, Tailwind is working!</p>
          </div>
          
          <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
            <p className="font-bold">Blue Info</p>
            <p>If you see blue background, Tailwind is working!</p>
          </div>
          
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Purple Button
          </button>
        </div>
      </main>
    </div>
  );
}