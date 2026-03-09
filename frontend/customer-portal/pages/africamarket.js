import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AfricaMarketRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/markets/africa');
  }, [router]);

  return null;
}
