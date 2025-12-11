import Head from 'next/head';

export default function MinimalTest() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <Head>
        <title>Minimal Test</title>
      </Head>
      
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Heading</h1>
        <p className="text-gray-600 mb-4">This is a test paragraph.</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );
}