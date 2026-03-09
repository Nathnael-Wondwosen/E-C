import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function B2BMarketRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/markets/b2b');
  }, [router]);

  return null;
}
