import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { DEFAULT_ADMIN_SCOPE } from '../config/adminScopes';
import { isPathAllowedForScope } from '../config/adminScopePermissions';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const clearAdminSession = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminScope');
    localStorage.removeItem('adminUser');
  };

  useEffect(() => {
    const publicRoutes = ['/login'];
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminToken = localStorage.getItem('adminToken');
    const storedScope = localStorage.getItem('adminScope') || DEFAULT_ADMIN_SCOPE;

    const isScopedRoute =
      router.pathname === '/admin/[scope]' || router.pathname === '/admin/[scope]/[[...slug]]';

    if (isScopedRoute && router.query.scope) {
      localStorage.setItem('adminScope', router.query.scope);
    }
    
    if (publicRoutes.includes(router.pathname)) {
      return;
    }
    
    if (!isLoggedIn || !adminToken) {
      clearAdminSession();
      router.replace('/login');
      return;
    }

    if (!isScopedRoute) {
      const routePath = router.pathname === '/' ? '/dashboard' : router.pathname;
      const activeScope = router.query.scope || storedScope || DEFAULT_ADMIN_SCOPE;
      if (!isPathAllowedForScope(activeScope, routePath)) {
        router.replace(`/admin/${activeScope}`);
      }
    }
  }, [router.pathname, router.query.scope]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.__adminFetchPatched) {
      return;
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const request = typeof input === 'string' ? input : input.url;
      const isApiCall =
        request.startsWith('/api/') ||
        request.startsWith(`${API_BASE_URL}/api/`) ||
        request.startsWith('http://localhost:3000/api/');
      const isAuthApiCall = request.includes('/api/auth/');

      try {
        if (!isApiCall) {
          return await originalFetch(input, init);
        }
        if (isAuthApiCall) {
          return await originalFetch(input, init);
        }

        const token = localStorage.getItem('adminToken');
        if (!token) {
          clearAdminSession();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return new Response(
            JSON.stringify({ error: 'Session expired. Please log in again.' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await originalFetch(input, { ...init, headers });
        if (response.status === 401 || response.status === 403) {
          clearAdminSession();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return response;
      } catch (error) {
        if (!isApiCall) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            error: 'Unable to reach API Gateway at http://localhost:3000. Start backend services and try again.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    };

    window.__adminFetchPatched = true;
  }, [API_BASE_URL]);

  return <Component {...pageProps} />;
}

export default MyApp;
