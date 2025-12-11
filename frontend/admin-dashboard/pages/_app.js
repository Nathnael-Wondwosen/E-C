import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Simple auth check for protected routes
    const publicRoutes = ['/login', '/tailwind-test', '/simple-login-test', '/test-login', '/minimal-test'];
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    // Skip auth check for public routes
    if (publicRoutes.includes(router.pathname)) {
      return;
    }
    
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;