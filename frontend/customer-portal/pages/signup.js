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
import { AuthAlert, AuthDivider, AuthField, AuthInput } from '../components/auth/AuthPrimitives';

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
        size="wide"
      >
        <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-[var(--auth-label)]">
                  Role
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {['buyer', 'seller'].map((type) => {
                    const selected = form.userType === type;

                    return (
                      <label
                        key={type}
                        className={`cursor-pointer rounded-2xl border px-4 py-3 transition-all ${
                          selected
                            ? 'border-[#C8A96B] bg-[#FFF4DF] shadow-[0_14px_30px_rgba(168,130,62,0.10)] dark:border-[#C8A96B]/60 dark:bg-[#C8A96B]/10'
                            : 'border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] hover:border-[#D1AE73] dark:hover:border-[#6B5330]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="userType"
                            value={type}
                            checked={selected}
                            onChange={(e) => setField('userType', e.target.value)}
                            className="h-4 w-4 border-[#D8CCB7] text-[#A8823E] focus:ring-[#C8A96B] dark:border-[#324153] dark:bg-[#101922]"
                          />
                          <span className="text-sm font-medium capitalize text-[var(--auth-heading)]">
                            {type}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AuthField label="Full Name" htmlFor="name">
                    <AuthInput
                      id="name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </AuthField>
                </div>

                <AuthField label="Email Address" htmlFor="email">
                  <AuthInput
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </AuthField>

                <AuthField label="Phone Number" htmlFor="phone">
                  <AuthInput
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    required
                  />
                </AuthField>
              </div>

              {sellerMode ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField label="Company Name" htmlFor="companyName">
                    <AuthInput
                      id="companyName"
                      value={form.companyName}
                      onChange={(e) => setField('companyName', e.target.value)}
                      placeholder="Enter your company name"
                      autoComplete="organization"
                      required
                    />
                  </AuthField>

                  <AuthField label="Business Type" htmlFor="businessType">
                    <AuthInput
                      id="businessType"
                      value={form.businessType}
                      onChange={(e) => setField('businessType', e.target.value)}
                      placeholder="Business type"
                      autoComplete="organization-title"
                    />
                  </AuthField>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <AuthField label="Password" htmlFor="password">
                  <AuthInput
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />
                </AuthField>

                <AuthField label="Confirm Password" htmlFor="confirmPassword">
                  <AuthInput
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </AuthField>
              </div>

              {error ? <AuthAlert>{error}</AuthAlert> : null}

              <button type="submit" disabled={loading} className="auth-primary-button">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {googleClientId ? (
                <div className="pt-1">
                  <AuthDivider>or sign up with Google</AuthDivider>

                  <div
                    ref={googleButtonContainerRef}
                    className={`mt-4 flex justify-center ${googleLoading ? 'opacity-70' : ''}`}
                  >
                    <div id="google-signup-button" />
                  </div>

                  {googleWarning ? (
                    <p className="mt-2 text-center text-xs leading-6 text-amber-700">
                      {googleWarning}
                    </p>
                  ) : null}
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
