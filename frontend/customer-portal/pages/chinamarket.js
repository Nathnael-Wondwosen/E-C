import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ChinaMarketRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/markets/china');
  }, [router]);

  return null;
}
