import '../styles/globals.css';
import { useEffect } from 'react';
import { hydrateCustomerSessionFromToken } from '../utils/session';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    hydrateCustomerSessionFromToken();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      document.documentElement.classList.remove('dark');
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    };

    applyTheme();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }

    mediaQuery.addListener(applyTheme);
    return () => mediaQuery.removeListener(applyTheme);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
