import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { authenticateWithGoogle, createUser, getGoogleAuthConfig, updateUserProfile } from '../utils/userService';

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
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleWarning, setGoogleWarning] = useState('');
  const [resolvedGoogleClientId, setResolvedGoogleClientId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
  const googleInitRef = useRef({ initialized: false, clientId: '' });
  const [error, setError] = useState('');
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const googleClientId = resolvedGoogleClientId;

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

  const handleAuthSuccess = useCallback(async (result) => {
    const resolvedRole = result?.user?.userType || result?.user?.role || form.userType || 'buyer';

    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', result.user.email || form.email.trim());
    localStorage.setItem('userType', resolvedRole);
    localStorage.setItem('userId', result.user.id);
    if (result.token) {
      localStorage.setItem('userToken', result.token);
    }
    window.dispatchEvent(new CustomEvent('loginStatusChanged'));

    if (resolvedRole === 'seller' && form.companyName.trim()) {
      await updateUserProfile(result.user.id, {
        name: form.name.trim() || result.user.name || '',
        phone: form.phone.trim(),
        profile: {
          companyName: form.companyName.trim(),
          businessType: form.businessType.trim(),
          userType: 'seller'
        }
      });
    }

    if (resolvedRole === 'seller') {
      router.push('/dashboard/seller');
      return;
    }
    router.push('/localmarket');
  }, [form.businessType, form.companyName, form.email, form.name, form.phone, form.userType, router]);

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      setError('Google signup failed. Please try again.');
      return;
    }

    if (form.userType === 'seller' && !form.companyName.trim()) {
      setError('For seller signup with Google, please provide company name first.');
      return;
    }

    setError('');
    setGoogleLoading(true);
    try {
      const result = await authenticateWithGoogle(response.credential, form.userType);
      if (!result.success) {
        setError(result.message || 'Google signup failed.');
        return;
      }
      await handleAuthSuccess(result);
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Google signup failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [form.companyName, form.userType, handleAuthSuccess]);

  useEffect(() => {
    if (!googleClientId || !googleReady || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    if (
      googleInitRef.current.initialized &&
      googleInitRef.current.clientId === googleClientId &&
      window.__customerPortalGoogleSignupInitClientId === googleClientId
    ) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      googleInitRef.current = { initialized: true, clientId: googleClientId };
      window.__customerPortalGoogleSignupInitClientId = googleClientId;
      setGoogleWarning('');

      const googleButton = document.getElementById('google-signup-button');
      if (googleButton) {
        googleButton.innerHTML = '';
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signup_with',
          shape: 'rectangular',
        });
      }
    } catch (err) {
      console.error('Google signup button initialization failed:', err);
      setGoogleWarning('Google signup is not available for this origin. Add this URL to Google OAuth authorized JavaScript origins.');
    }
  }, [googleClientId, googleReady, handleGoogleCredential]);

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

      const email = encodeURIComponent(form.email.trim());
      router.push(`/login?registered=1&email=${email}`);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <Head>
        <title>Sign Up | Customer Portal</title>
      </Head>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}

      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">Register as buyer or seller.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            <label className={`rounded-lg border p-3 text-sm ${form.userType === 'buyer' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200'}`}>
              <input
                type="radio"
                name="userType"
                value="buyer"
                checked={form.userType === 'buyer'}
                onChange={(e) => setField('userType', e.target.value)}
              />
              <span className="ml-2 font-medium">Buyer</span>
            </label>
            <label className={`rounded-lg border p-3 text-sm ${form.userType === 'seller' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200'}`}>
              <input
                type="radio"
                name="userType"
                value="seller"
                checked={form.userType === 'seller'}
                onChange={(e) => setField('userType', e.target.value)}
              />
              <span className="ml-2 font-medium">Seller</span>
            </label>
          </div>

          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="email" placeholder="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} required />

          {form.userType === 'seller' && (
            <>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Company name" value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} required />
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Business type (optional)" value={form.businessType} onChange={(e) => setField('businessType', e.target.value)} />
            </>
          )}

          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="password" placeholder="Password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} required />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : `Create ${form.userType} account`}
          </button>

          {googleClientId ? (
            <div className="pt-1">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-500">or sign up with</span>
                </div>
              </div>
              <div className={`mt-3 flex justify-center ${googleLoading ? 'opacity-70' : ''}`}>
                <div id="google-signup-button" />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                Google signup uses your selected role: <span className="font-semibold">{form.userType}</span>
              </p>
              {googleWarning ? (
                <p className="mt-1 text-center text-xs text-amber-700">{googleWarning}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-center text-xs text-amber-700">
              Google signup is not configured yet. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
            </p>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-cyan-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
