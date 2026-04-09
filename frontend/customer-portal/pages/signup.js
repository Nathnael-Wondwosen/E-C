import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import {
  authenticateWithGoogle,
  createUser,
  getGoogleAuthConfig,
  updateUserProfile,
} from '../utils/userService';
import { setCustomerSession } from '../utils/session';
import AuthShell from '../components/auth/AuthShell';
import { AuthAlert, AuthDivider } from '../components/auth/AuthPrimitives';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    companyName: '',
    businessType: '',
  });

  const sellerMode = form.userType === 'seller';
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleWarning, setGoogleWarning] = useState('');
  const [resolvedGoogleClientId, setResolvedGoogleClientId] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  );
  const [error, setError] = useState('');
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);

  const googleInitRef = useRef({ initialized: false, clientId: '' });
  const googleButtonContainerRef = useRef(null);
  const latestFormRef = useRef(form);
  const googleClientId = resolvedGoogleClientId;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setGoogleReady(true);
    }
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    latestFormRef.current = form;
  }, [form]);

  useEffect(() => {
    if (googleClientId) return;

    let mounted = true;

    getGoogleAuthConfig().then((config) => {
      if (!mounted) return;
      if (config?.configured && config?.clientId) {
        setResolvedGoogleClientId(config.clientId);
      }
    });

    return () => {
      mounted = false;
    };
  }, [googleClientId]);

  useEffect(() => {
    const updateGoogleButtonWidth = () => {
      const width = googleButtonContainerRef.current?.offsetWidth || 320;
      setGoogleButtonWidth(Math.max(220, Math.min(Math.floor(width), 420)));
    };

    updateGoogleButtonWidth();
    window.addEventListener('resize', updateGoogleButtonWidth);

    return () => {
      window.removeEventListener('resize', updateGoogleButtonWidth);
    };
  }, []);

  const handleAuthSuccess = useCallback(
    async (result, sourceForm) => {
      const resolvedRole = setCustomerSession({
        user: result?.user,
        token: result?.token,
        fallbackEmail: sourceForm.email.trim(),
        fallbackUserType: sourceForm.userType,
      });

      if (resolvedRole === 'seller' && sourceForm.companyName.trim()) {
        await updateUserProfile(result.user.id, {
          name: sourceForm.name.trim() || result.user.name || '',
          phone: sourceForm.phone.trim(),
          profile: {
            companyName: sourceForm.companyName.trim(),
            businessType: sourceForm.businessType.trim(),
            userType: 'seller',
          },
        });
      }

      if (resolvedRole === 'seller') {
        router.push('/dashboard/seller');
        return;
      }

      router.push('/localmarket');
    },
    [router]
  );

  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setError('Google signup failed. Please try again.');
        return;
      }

      const currentForm = latestFormRef.current;

      if (currentForm.userType === 'seller' && !currentForm.companyName.trim()) {
        setError('For seller signup with Google, please provide company name first.');
        return;
      }

      setError('');
      setGoogleLoading(true);

      try {
        const result = await authenticateWithGoogle(response.credential, currentForm.userType);

        if (!result.success) {
          setError(result.message || 'Google signup failed.');
          return;
        }

        await handleAuthSuccess(result, currentForm);
      } catch (err) {
        console.error('Google signup error:', err);
        setError('Google signup failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  useEffect(() => {
    if (
      !googleClientId ||
      !googleReady ||
      typeof window === 'undefined' ||
      !window.google?.accounts?.id
    ) {
      return;
    }

    try {
      if (
        !googleInitRef.current.initialized ||
        googleInitRef.current.clientId !== googleClientId ||
        window.__customerPortalGoogleSignupInitClientId !== googleClientId
      ) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });

        googleInitRef.current = { initialized: true, clientId: googleClientId };
        window.__customerPortalGoogleSignupInitClientId = googleClientId;
      }

      const googleButton = document.getElementById('google-signup-button');

      if (googleButton) {
        googleButton.innerHTML = '';
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: googleButtonWidth,
          text: 'signup_with',
          shape: 'pill',
        });
      }

      setGoogleWarning('');
    } catch (err) {
      console.error('Google signup button initialization failed:', err);
      setGoogleWarning(
        'Google signup is unavailable for this environment. Check the OAuth client authorized origins if the problem continues.'
      );
    }
  }, [googleButtonWidth, googleClientId, googleReady, handleGoogleCredential]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.userType === 'seller' && !form.companyName.trim()) {
      setError('Company name is required for sellers.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        userType: form.userType,
        profile: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          userType: form.userType,
          ...(form.userType === 'seller'
            ? {
                companyName: form.companyName.trim(),
                businessType: form.businessType.trim(),
              }
            : {}),
        },
      };

      const result = await createUser(payload);

      if (!result.success) {
        setError(result.message || 'Registration failed.');
        return;
      }

      await handleAuthSuccess(result, form);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Sign Up | Customer Portal</title>
        <meta
          name="description"
          content="Create your customer portal account."
        />
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
        badge="Create Membership"
        title="Create Account"
        description="Join the marketplace through a richer onboarding screen that now carries the same premium energy as the platform entrance."
        panelBadge="Marketplace Onboarding"
        panelTitle="A stronger first impression for buyers, sellers, and growing businesses."
        panelDescription="Account creation should feel like the beginning of a branded commerce journey, not a detached form. This layout carries the homepage tone into onboarding without copying it directly."
        highlights={[
          'Role-led signup flow for both buyers and sellers inside one premium shell.',
          'Stronger editorial framing so onboarding feels like part of the main platform.',
          'Responsive composition that keeps the form clear while making the page memorable.'
        ]}
        metrics={[
          { label: 'User Paths', value: 'Buyer + Seller' },
          { label: 'Experience', value: 'Modern' }
        ]}
        footer={(
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Sign in
            </Link>
          </>
        )}
        centered
        hidePanelOnMobile
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="sm:hidden">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DAF8] bg-white/80 text-[#1B2340]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">Role</label>
            <div className="grid grid-cols-2 gap-3">
              {['buyer', 'seller'].map((type) => {
                const selected = form.userType === type;
                return (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-[1rem] border px-3 py-3 transition ${
                      selected
                        ? 'border-[#C8A96B] bg-[#FFF4DF] text-[#1E293B] shadow-[0_10px_26px_rgba(168,130,62,0.12)] dark:border-[#C8A96B]/60 dark:bg-[#C8A96B]/10 dark:text-[#F8F4EA]'
                        : 'border-[#C9D2E3] bg-white/85 text-[#1E293B] hover:border-[#A9B7CE] dark:border-[#324153] dark:bg-[#101922] dark:text-[#F8F4EA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="userType"
                        value={type}
                        checked={selected}
                        onChange={(e) => setField('userType', e.target.value)}
                        className="h-4 w-4 border-[#D8CCB7] text-[#3B82F6] focus:ring-[#60A5FA] dark:border-[#324153] dark:bg-[#101922]"
                      />
                      <span className="text-base font-semibold capitalize">{type}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                required
                className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
                className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
              />
            </div>
          </div>

          {sellerMode ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  placeholder="Company name"
                  autoComplete="organization"
                  required
                  className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
                />
              </div>
              <div>
                <label htmlFor="businessType" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                  Business Type
                </label>
                <input
                  id="businessType"
                  name="businessType"
                  value={form.businessType}
                  onChange={(e) => setField('businessType', e.target.value)}
                  placeholder="Business type"
                  autoComplete="organization-title"
                  className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-[#F2E7CC]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                className="auth-input h-[50px] rounded-[1.1rem] text-[15px]"
              />
            </div>
          </div>

          {error ? <AuthAlert>{error}</AuthAlert> : null}

          <button type="submit" disabled={loading} className="auth-primary-button h-[52px] rounded-[1.15rem] text-[1.05rem]">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {googleClientId ? (
            <div className="pt-1">
              <AuthDivider>or sign up with</AuthDivider>
              <div ref={googleButtonContainerRef} className={`mt-4 flex justify-center ${googleLoading ? 'opacity-70' : ''}`}>
                <div id="google-signup-button" />
              </div>
              {googleWarning ? <p className="mt-2 text-center text-xs leading-6 text-amber-700">{googleWarning}</p> : null}
            </div>
          ) : (
            <AuthAlert tone="warning">
              Google signup is not configured yet. Set `GOOGLE_CLIENT_ID` on the API gateway or `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in customer portal env.
            </AuthAlert>
          )}
        </form>
      </AuthShell>
    </>
  );
}
