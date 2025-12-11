import Head from 'next/head';

export default function MinimalTailwindTest() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <Head>
        <title>Minimal Tailwind Test</title>
      </Head>
      
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-600 mb-4">If you see styled elements, Tailwind is working.</p>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-800 font-medium">This should have a green background</p>
        </div>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
          Styled Button
        </button>
      </div>
    </div>
  );
}