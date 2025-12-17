import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function B2BIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to B2B products page
    router.replace('/b2b/products');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}