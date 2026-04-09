import '../styles/globals.css';
import { useEffect } from 'react';
import { hydrateCustomerSessionFromToken } from '../utils/session';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    hydrateCustomerSessionFromToken();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
