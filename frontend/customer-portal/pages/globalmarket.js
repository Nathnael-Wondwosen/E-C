import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GlobalMarketRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/marketplace');
  }, [router]);

  return null;
}
