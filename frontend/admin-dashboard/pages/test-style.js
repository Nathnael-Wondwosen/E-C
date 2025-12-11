import Head from 'next/head';

export default function TestStyle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Head>
        <title>Test Style Page</title>
      </Head>
      
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Tailwind CSS Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800 font-medium">If you see this styled correctly, Tailwind is working!</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
            <span className="text-green-800 font-medium">Styled Button</span>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
              Hover Me
            </button>
          </div>
          
          <div className="p-3 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 text-sm">
              This page tests if Tailwind CSS is properly configured and working in your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}