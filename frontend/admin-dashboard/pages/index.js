import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Head>
        <title>B2B E-Commerce Admin Dashboard</title>
        <meta name="description" content="Admin Dashboard for B2B E-Commerce Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
