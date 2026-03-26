import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { authenticateUser, authenticateWithGoogle, getGoogleAuthConfig } from '../utils/userService';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleWarning, setGoogleWarning] = useState('');
  const [resolvedGoogleClientId, setResolvedGoogleClientId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
  const googleInitRef = useRef({ initialized: false, clientId: '' });
  const router = useRouter();
  const googleClientId = resolvedGoogleClientId;

  useEffect(() => {
    if (!router.isReady) return;
    const wasRegistered = String(router.query?.registered || '') === '1';
    const fromSignupEmail = typeof router.query?.email === 'string' ? router.query.email : '';
    if (wasRegistered) {
      setNotice('Registration successful. Please sign in with your new account.');
      if (fromSignupEmail && !email) {
        setEmail(fromSignupEmail);
      }
    }
  }, [router.isReady, router.query?.registered, router.query?.email, email]);

  useEffect(() => {
    if (googleClientId) return;

    let mounted = true;
    getGoogleAuthConfig().then((config) => {
      if (!mounted) return;
      if (config.configured && config.clientId) {
        setResolvedGoogleClientId(config.clientId);
      }
    });

    return () => {
      mounted = false;
    };
  }, [googleClientId]);

  const handleAuthSuccess = useCallback((result, fallbackEmail = '') => {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', result.user.email || fallbackEmail);
    localStorage.setItem('userType', result.user.userType);
    localStorage.setItem('userId', result.user.id);
    if (result.token) {
      localStorage.setItem('userToken', result.token);
    }

    window.dispatchEvent(new CustomEvent('loginStatusChanged'));

    const redirectDestination = localStorage.getItem('redirectAfterLogin');
    if (redirectDestination) {
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectDestination);
      return;
    }

    const resolvedUserType = result?.user?.userType || result?.user?.role || 'buyer';
    if (resolvedUserType === 'seller') {
      router.push('/dashboard/seller');
    } else {
      router.push('/localmarket');
    }
  }, [router]);

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await authenticateWithGoogle(response.credential);
      if (result.success) {
        handleAuthSuccess(result);
      } else {
        setError(result.message || 'Google sign-in failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  useEffect(() => {
    if (!googleClientId || !googleReady || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    if (
      googleInitRef.current.initialized &&
      googleInitRef.current.clientId === googleClientId &&
      window.__customerPortalGoogleInitClientId === googleClientId
    ) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      googleInitRef.current = { initialized: true, clientId: googleClientId };
      window.__customerPortalGoogleInitClientId = googleClientId;
      setGoogleWarning('');

      const googleButton = document.getElementById('google-signin-button');
      if (googleButton) {
        googleButton.innerHTML = '';
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    } catch (error) {
      console.error('Google button initialization failed:', error);
      setGoogleWarning('Google sign-in is not available for this origin. Add this URL to Google OAuth authorized JavaScript origins.');
    }
  }, [googleClientId, googleReady, handleGoogleCredential]);

  useEffect(() => {
    if (typeof window === 'undefined' || !googleClientId) return;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      setGoogleWarning('If Google shows "origin is not allowed", add this local URL in Google OAuth authorized origins.');
    }
  }, [googleClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate user via API
      const result = await authenticateUser(email, password);
      
      if (result.success) {
        handleAuthSuccess(result, email);
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4 sm:p-6">
      <Head>
        <title>Login | Customer Portal</title>
        <meta name="description" content="Login to your customer portal account" />
      </Head>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}

      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-size:28px_28px] [background-image:linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:p-7">
          <div className="mb-5 text-center">
            <p className="mx-auto mb-2 w-max rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Secure Access
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
            <p className="mt-1 text-sm text-slate-600">Access your account in one step</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {notice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-sm text-emerald-700">
                {notice}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16v12H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-slate-600">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                />
                Remember me
              </label>

              <Link href="/forgot-password" className="font-medium text-cyan-700 hover:text-cyan-800">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white ${
                loading
                  ? 'cursor-not-allowed bg-slate-400'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 shadow-[0_10px_24px_rgba(37,99,235,0.28)] hover:brightness-105'
              } transition`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {googleClientId ? (
              <div className="pt-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500">or continue with</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <div id="google-signin-button" />
                </div>
                {googleWarning ? (
                  <p className="mt-2 text-center text-xs text-amber-700">{googleWarning}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-center text-xs text-amber-700">Google sign-in is not configured yet. Set `GOOGLE_CLIENT_ID` on the API gateway or `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in customer portal env.</p>
            )}
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
