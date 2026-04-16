import '../styles/globals.css';
import { useEffect } from 'react';
import { hydrateCustomerSessionFromToken } from '../utils/session';

const CUSTOMER_PORTAL_THEME_KEY = 'customerPortalThemePreference';

function MyApp ({ Component, pageProps }) {
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
      const override = String(localStorage.getItem(CUSTOMER_PORTAL_THEME_KEY) || 'system').trim().toLowerCase();
      const resolvedTheme = override === 'dark' || override === 'light'
        ? override
        : (mediaQuery.matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    };

    applyTheme();

    const handleThemePreferenceChanged = () => applyTheme();
    window.addEventListener('customerPortalThemePreferenceChanged', handleThemePreferenceChanged);
    window.addEventListener('storage', handleThemePreferenceChanged);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => {
        mediaQuery.removeEventListener('change', applyTheme);
        window.removeEventListener('customerPortalThemePreferenceChanged', handleThemePreferenceChanged);
        window.removeEventListener('storage', handleThemePreferenceChanged);
      };
    }

    mediaQuery.addListener(applyTheme);
    return () => {
      mediaQuery.removeListener(applyTheme);
      window.removeEventListener('customerPortalThemePreferenceChanged', handleThemePreferenceChanged);
      window.removeEventListener('storage', handleThemePreferenceChanged);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
