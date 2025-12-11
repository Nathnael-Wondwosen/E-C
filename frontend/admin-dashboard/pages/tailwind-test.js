import Head from 'next/head';

export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
      <Head>
        <title>Tailwind CSS Test</title>
      </Head>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Tailwind CSS Working</h2>
        <p className="text-gray-600 text-center">If you can see styled elements, Tailwind is working correctly.</p>
        
        <div className="mt-6 space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">This should have a blue background</p>
          </div>
          
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition">
            This should be a styled button
          </button>
        </div>
      </div>
    </div>
  );
}