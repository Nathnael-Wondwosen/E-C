import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { authenticateUser, authenticateWithGoogle, getGoogleAuthConfig } from '../utils/userService';
import { hydrateCustomerSessionFromToken, setCustomerSession } from '../utils/session';
import AuthShell from '../components/auth/AuthShell';
import { AuthAlert, AuthDivider } from '../components/auth/AuthPrimitives';

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
    if (typeof window === 'undefined' || !router.isReady) return;

    const hydrated = hydrateCustomerSessionFromToken();
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (!hydrated && !isLoggedIn) return;

    const userType = String(localStorage.getItem('userType') || '').toLowerCase();
    if (userType === 'seller') {
      router.replace('/dashboard/seller');
      return;
    }
    router.replace('/localmarket');
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setGoogleReady(true);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const wasRegistered = String(router.query?.registered || '') === '1';
    const wasReset = String(router.query?.reset || '') === '1';
    const fromSignupEmail = typeof router.query?.email === 'string' ? router.query.email : '';
    const fromResetEmail = typeof router.query?.email === 'string' ? router.query.email : '';

    if (wasReset) {
      setNotice('Password reset successful. Please sign in with your new password.');
      if (fromResetEmail && !email) {
        setEmail(fromResetEmail);
      }
      return;
    }

    if (wasRegistered) {
      setNotice('Registration successful. Please sign in with your new account.');
      if (fromSignupEmail && !email) {
        setEmail(fromSignupEmail);
      }
    }
  }, [router.isReady, router.query?.registered, router.query?.reset, router.query?.email, email]);

  const handleAuthSuccess = useCallback((result, fallbackEmail = '') => {
    setCustomerSession({
      user: result.user,
      token: result.token,
      fallbackEmail,
    });

    const redirectDestination = localStorage.getItem('redirectAfterLogin');
    if (redirectDestination) {
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectDestination);
      return;
    }

    const resolvedUserType =
      result?.user?.userType ||
      result?.user?.role ||
      (Array.isArray(result?.user?.roles) && result.user.roles.length ? result.user.roles[0] : '') ||
      result?.user?.profile?.userType ||
      'buyer';
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

  useEffect(() => {
    if (!googleClientId || !googleReady || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    try {
      if (
        !googleInitRef.current.initialized ||
        googleInitRef.current.clientId !== googleClientId ||
        window.__customerPortalGoogleInitClientId !== googleClientId
      ) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });
        googleInitRef.current = { initialized: true, clientId: googleClientId };
        window.__customerPortalGoogleInitClientId = googleClientId;
      }

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
    } catch (err) {
      console.error('Google button initialization failed:', err);
      setGoogleWarning('Google sign-in is unavailable for this environment. Check the OAuth client authorized origins if the problem continues.');
    }
  }, [googleClientId, googleReady, handleGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
    <>
      <Head>
        <title>Login | Customer Portal</title>
        <meta name="description" content="Login to your customer portal account" />
      </Head>
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
          onReady={() => setGoogleReady(true)}
        />
      ) : null}

      <AuthShell
        badge="Member Sign In"
        title="Sign In"
        description="Step back into the marketplace through a polished entry flow that matches the platform's premium tone."
        panelBadge="Editorial Commerce"
        panelTitle="The gateway into a warmer, brand-led marketplace experience."
        panelDescription="Sign in should feel like the same flagship platform as the homepage: premium, confident, and clear, with enough restraint to stay useful."
        highlights={[
          'Buyer and seller journeys start from the same branded access point.',
          'Secure sign-in flow with a calmer visual rhythm and stronger hierarchy.',
          'A responsive layout designed to feel intentional on mobile and desktop.'
        ]}
        metrics={[
          { label: 'Access Mode', value: 'Secure' },
          { label: 'Brand Tone', value: 'Premium' }
        ]}
        centered
        hidePanelOnMobile
        footer={(
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Sign up
            </Link>
          </>
        )}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          {notice ? <AuthAlert tone="success">{notice}</AuthAlert> : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--auth-icon)]">
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
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input h-[50px] rounded-[1.1rem] pl-10 text-[15px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--auth-icon)]">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input h-[50px] rounded-[1.1rem] pl-10 text-[15px]"
              />
            </div>
          </div>

          {error ? <AuthAlert>{error}</AuthAlert> : null}

          <div className="flex items-center justify-between gap-3 text-sm">
            <label htmlFor="remember-me" className="flex items-center gap-2 text-[var(--auth-muted)]">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-[#D8CCB7] bg-white text-[#A8823E] focus:ring-[#C8A96B] dark:border-[#324153] dark:bg-[#101922]"
              />
              Remember me
            </label>

            <Link href="/forgot-password" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="auth-primary-button h-[50px] rounded-[1.15rem] text-[1.05rem]">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {googleClientId ? (
            <div className="pt-1">
              <AuthDivider>or continue with</AuthDivider>
              <div className="mt-3 flex justify-center">
                <div id="google-signin-button" />
              </div>
              {googleWarning ? <p className="mt-2 text-center text-xs text-amber-700">{googleWarning}</p> : null}
            </div>
          ) : (
            <AuthAlert tone="warning">
              Google sign-in is not configured yet. Set `GOOGLE_CLIENT_ID` on the API gateway or `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in customer portal env.
            </AuthAlert>
          )}
        </form>
      </AuthShell>
    </>
  );
}
