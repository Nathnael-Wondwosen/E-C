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

function FieldShell({
  label,
  hint,
  children,
  labelClassName = 'text-slate-700',
  hintClassName = 'text-slate-400',
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className={`block text-[13px] font-medium ${labelClassName}`}>{label}</label>
        {hint ? <span className={`text-[11px] ${hintClassName}`}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  hint = '',
  inputClassName = '',
  labelClassName,
  hintClassName,
}) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      labelClassName={labelClassName}
      hintClassName={hintClassName}
    >
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${inputClassName}`}
      />
    </FieldShell>
  );
}

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
  const [resolvedGoogleClientId, setResolvedGoogleClientId] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  );
  const [error, setError] = useState('');
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const googleInitRef = useRef({ initialized: false, clientId: '' });
  const googleButtonContainerRef = useRef(null);
  const latestFormRef = useRef(form);
  const googleClientId = resolvedGoogleClientId;
  const theme = isDarkMode
    ? {
        shell: 'bg-slate-950 text-white',
        bg:
          'bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]',
        leftGlow:
          'bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_38%_40%,rgba(165,243,252,0.12),transparent_18%),radial-gradient(circle_at_68%_72%,rgba(129,140,248,0.14),transparent_24%),linear-gradient(145deg,rgba(103,232,249,0.05),rgba(129,140,248,0.06))]',
        pill: 'border-white/20 bg-white/10 text-white/90',
        formPanel:
          'border-slate-800/80 bg-slate-900/88 shadow-[0_28px_70px_rgba(0,0,0,0.38)] before:absolute before:inset-[1px] before:rounded-[1.28rem] before:border before:border-white/6 before:content-[""]',
        formGlow: 'bg-[linear-gradient(180deg,rgba(165,243,252,0.08),transparent)]',
        label: 'border-cyan-500/20 bg-cyan-400/10 text-cyan-200',
        title: 'text-white',
        text: 'text-slate-300',
        roleActive:
          'border-cyan-400/70 bg-cyan-400/10 shadow-[0_10px_22px_rgba(34,211,238,0.12)]',
        roleIdle: 'border-slate-700/80 bg-slate-800/45 hover:border-slate-600 hover:bg-slate-800/60',
        roleTitle: 'text-white',
        card: 'border-slate-700 bg-slate-800/70',
        dividerBg: 'bg-slate-900',
        dividerText: 'text-slate-400',
        helper: 'text-slate-400',
        footer: 'text-slate-300',
        fieldLabel: 'text-slate-200',
        fieldHint: 'text-slate-400',
        input:
          'border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-400 hover:border-cyan-500/55 hover:bg-slate-800 focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.18)]',
      }
    : {
        shell: 'bg-[#eef7ff] text-slate-900',
        bg:
          'bg-[radial-gradient(circle_at_20%_18%,rgba(125,211,252,0.36),transparent_20%),radial-gradient(circle_at_82%_18%,rgba(196,181,253,0.3),transparent_24%),radial-gradient(circle_at_18%_82%,rgba(167,243,208,0.22),transparent_20%),radial-gradient(circle_at_80%_82%,rgba(216,180,254,0.24),transparent_22%),linear-gradient(180deg,rgba(59,130,246,0.9),rgba(14,165,233,0.92))]',
        leftGlow:
          'bg-[radial-gradient(circle_at_14%_16%,rgba(255,255,255,0.36),transparent_18%),radial-gradient(circle_at_84%_20%,rgba(255,255,255,0.24),transparent_18%),radial-gradient(circle_at_24%_80%,rgba(255,255,255,0.18),transparent_18%),radial-gradient(circle_at_78%_78%,rgba(255,255,255,0.16),transparent_18%)]',
        pill: 'border-white/35 bg-white/18 text-white',
        formPanel:
          'border-white/35 bg-white/18 shadow-[0_30px_90px_rgba(15,23,42,0.16)] before:absolute before:inset-[1px] before:rounded-[1.28rem] before:border before:border-white/26 before:content-[""]',
        formGlow: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]',
        label: 'border-white/40 bg-white/22 text-white',
        title: 'text-slate-900',
        text: 'text-slate-700/80',
        roleActive:
          'border-white/70 bg-white/72 shadow-[0_12px_24px_rgba(255,255,255,0.18)]',
        roleIdle: 'border-white/30 bg-white/16 hover:border-white/45 hover:bg-white/26',
        roleTitle: 'text-slate-900',
        card: 'border-white/35 bg-white/14',
        dividerBg: 'bg-transparent',
        dividerText: 'text-slate-700/70',
        helper: 'text-slate-700/70',
        footer: 'text-slate-700/80',
        fieldLabel: 'text-slate-900/90',
        fieldHint: 'text-slate-700/60',
        input:
          'border-white/35 bg-white/78 text-slate-900 placeholder:text-slate-500 hover:border-white/60 hover:bg-white/88 focus:border-cyan-200 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,255,255,0.22)]',
      };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    latestFormRef.current = form;
  }, [form]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyPreference = (event) => setIsDarkMode(event.matches);
    setIsDarkMode(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyPreference);
      return () => mediaQuery.removeEventListener('change', applyPreference);
    }

    mediaQuery.addListener(applyPreference);
    return () => mediaQuery.removeListener(applyPreference);
  }, []);

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
    const updateGoogleButtonWidth = () => {
      const width = googleButtonContainerRef.current?.offsetWidth || 320;
      setGoogleButtonWidth(Math.max(220, Math.min(Math.floor(width), 360)));
    };

    updateGoogleButtonWidth();
    window.addEventListener('resize', updateGoogleButtonWidth);
    return () => window.removeEventListener('resize', updateGoogleButtonWidth);
  }, []);

  const handleAuthSuccess = useCallback(
    async (result, sourceForm) => {
      const resolvedRole =
        result?.user?.userType || result?.user?.role || sourceForm.userType || 'buyer';

      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userEmail', result.user.email || sourceForm.email.trim());
      localStorage.setItem('userType', resolvedRole);
      localStorage.setItem('userId', result.user.id);
      if (result.token) {
        localStorage.setItem('userToken', result.token);
      }
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));

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
        'Google signup is not available for this origin. Add this URL to Google OAuth authorized JavaScript origins.'
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

      const email = encodeURIComponent(form.email.trim());
      router.push(`/login?registered=1&email=${email}`);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-3 sm:px-5 sm:py-5 ${theme.shell}`}>
      <Head>
        <title>Sign Up | Customer Portal</title>
        <meta
          name="description"
          content="Create your customer portal account with a responsive buyer or seller signup experience."
        />
      </Head>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}

      <div className={`pointer-events-none absolute inset-0 ${theme.bg}`} />
      <div className={`pointer-events-none absolute inset-0 hidden lg:block ${theme.leftGlow}`} />
      <div className={`pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full blur-3xl ${isDarkMode ? 'bg-cyan-300/16' : 'bg-cyan-200/72'}`} />
      <div className={`pointer-events-none absolute right-8 top-1/4 h-72 w-72 rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-300/14' : 'bg-indigo-200/44'}`} />
      <div className={`pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl ${isDarkMode ? 'bg-violet-300/12' : 'bg-violet-200/40'}`} />

      {isDarkMode ? (
        <>
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <span className="absolute left-[2%] top-[4%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            <span className="absolute left-[26%] top-[18%] h-72 w-72 rounded-full bg-sky-400/8 blur-3xl" />
            <span className="absolute right-[2%] top-[10%] h-72 w-72 rounded-full bg-indigo-400/8 blur-3xl" />
            <span className="absolute left-[8%] bottom-[4%] h-72 w-72 rounded-full bg-sky-300/8 blur-3xl" />
            <span className="absolute right-[4%] bottom-[4%] h-72 w-72 rounded-full bg-violet-400/8 blur-3xl" />

            <span className="bubble-outline bubble-slow absolute left-[8%] top-[10%] h-44 w-44 rounded-full border border-white/16" />
            <span className="bubble-outline bubble-drift absolute left-[32%] top-[26%] h-48 w-48 rounded-full border border-white/10" />
            <span className="bubble-outline bubble-slow absolute right-[-8%] top-[30%] h-48 w-48 rounded-full border border-white/10" />
            <span className="bubble-outline bubble-drift absolute left-[4%] bottom-[6%] h-46 w-46 rounded-full border border-white/10" />
            <span className="bubble-outline bubble-slow absolute right-[10%] bottom-[8%] h-40 w-40 rounded-full border border-white/10" />
            <span className="bubble-outline bubble-drift absolute left-[46%] bottom-[-2%] h-56 w-56 rounded-full border border-white/8" />
            <span className="bubble-outline bubble-slow absolute left-[48%] top-[12%] h-20 w-20 rounded-full border border-white/12" />

            <span className="bubble-solid bubble-slow absolute left-[13%] top-[14%] h-5 w-5 rounded-full bg-indigo-300/58" />
            <span className="bubble-solid bubble-slow absolute left-[56%] top-[18%] h-24 w-24 rounded-full bg-cyan-200/18 shadow-[0_22px_48px_rgba(34,211,238,0.14)]" />
            <span className="bubble-solid bubble-fast absolute left-[63%] top-[22%] h-4 w-4 rounded-full bg-white/40" />
            <span className="bubble-solid bubble-drift absolute right-[20%] top-[14%] h-24 w-24 rounded-full bg-indigo-200/14 shadow-[0_24px_48px_rgba(129,140,248,0.12)]" />
            <span className="bubble-solid bubble-fast absolute right-[10%] top-[28%] h-12 w-12 rounded-full bg-violet-200/14 shadow-[0_14px_26px_rgba(196,181,253,0.12)]" />
            <span className="bubble-solid bubble-drift absolute left-[20%] bottom-[18%] h-36 w-36 rounded-full bg-sky-100/8 shadow-[0_26px_60px_rgba(103,232,249,0.1)]" />
            <span className="bubble-solid bubble-slow absolute right-[8%] bottom-[18%] h-28 w-28 rounded-full bg-white/8 shadow-[0_24px_54px_rgba(148,163,184,0.08)]" />
            <span className="bubble-solid bubble-fast absolute left-[54%] bottom-[18%] h-10 w-10 rounded-full bg-sky-200/16 shadow-[0_16px_30px_rgba(56,189,248,0.12)]" />
            <span className="bubble-solid bubble-slow absolute right-[22%] bottom-[40%] h-5 w-5 rounded-full bg-cyan-200/42" />
          </div>
          <div className="pointer-events-none absolute inset-0 lg:hidden">
            <span className="absolute left-[10%] top-[10%] h-32 w-32 rounded-full border border-white/12" />
            <span className="absolute left-[20%] top-[15%] h-4 w-4 rounded-full bg-indigo-300/58" />
            <span className="absolute right-[16%] top-[18%] h-20 w-20 rounded-full bg-cyan-200/16" />
            <span className="absolute right-[2%] top-[30%] h-28 w-28 rounded-full border border-white/10" />
            <span className="absolute left-[8%] bottom-[14%] h-28 w-28 rounded-full border border-white/10" />
            <span className="absolute left-[18%] bottom-[18%] h-20 w-20 rounded-full bg-sky-100/8" />
            <span className="absolute right-[12%] bottom-[16%] h-24 w-24 rounded-full border border-white/10" />
          </div>
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <span
              className="bubble-soft bubble-slow absolute left-[-3%] top-[10%] h-48 w-48"
              style={{ borderRadius: '38% 62% 46% 54% / 46% 38% 62% 54%' }}
            />
            <span
              className="bubble-soft bubble-drift absolute left-[11%] top-[3%] h-56 w-40"
              style={{ borderRadius: '44% 56% 58% 42% / 38% 44% 56% 62%' }}
            />
            <span
              className="bubble-soft bubble-slow absolute left-[1%] bottom-[2%] h-56 w-44"
              style={{ borderRadius: '52% 48% 34% 66% / 38% 62% 38% 62%' }}
            />
            <span
              className="bubble-soft bubble-drift absolute left-[18%] bottom-[4%] h-36 w-28"
              style={{ borderRadius: '58% 42% 64% 36% / 52% 38% 62% 48%' }}
            />
            <span
              className="bubble-soft bubble-slow absolute right-[18%] top-[0%] h-60 w-52"
              style={{ borderRadius: '50% 50% 40% 60% / 44% 56% 44% 56%' }}
            />
            <span
              className="bubble-soft bubble-fast absolute right-[-3%] bottom-[4%] h-48 w-44"
              style={{ borderRadius: '54% 46% 58% 42% / 50% 40% 60% 50%' }}
            />
            <span
              className="bubble-soft bubble-drift absolute right-[10%] bottom-[-2%] h-60 w-60"
              style={{ borderRadius: '42% 58% 46% 54% / 54% 40% 60% 46%' }}
            />

            <span className="bubble-outline bubble-slow absolute left-[8%] top-[48%] h-64 w-64 rounded-full border border-white/70" />
            <span className="bubble-outline bubble-drift absolute left-[35%] top-[6%] h-52 w-52 rounded-full border border-white/56" />
            <span className="bubble-outline bubble-slow absolute right-[10%] top-[6%] h-60 w-60 rounded-full border border-white/58" />
            <span className="bubble-outline bubble-drift absolute right-[-6%] bottom-[18%] h-52 w-52 rounded-full border border-white/56" />
            <span className="bubble-outline bubble-slow absolute left-[-10%] bottom-[10%] h-80 w-80 rounded-full border border-white/56" />

            <span className="bubble-solid bubble-slow absolute left-[8%] top-[28%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.74)_34%,rgba(147,197,253,0.2)_78%,transparent_100%)] shadow-[0_30px_70px_rgba(255,255,255,0.16)]" />
            <span className="bubble-solid bubble-fast absolute left-[18%] bottom-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.95),rgba(216,180,254,0.78)_34%,rgba(34,211,238,0.2)_76%,transparent_100%)] shadow-[0_24px_50px_rgba(255,255,255,0.14)]" />
            <span className="bubble-solid bubble-drift absolute right-[8%] top-[12%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.76)_34%,rgba(59,130,246,0.18)_78%,transparent_100%)] shadow-[0_24px_52px_rgba(255,255,255,0.14)]" />
            <span className="bubble-solid bubble-fast absolute right-[10%] bottom-[8%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.74)_34%,rgba(59,130,246,0.18)_78%,transparent_100%)] shadow-[0_24px_52px_rgba(255,255,255,0.14)]" />
            <span className="bubble-solid bubble-slow absolute right-[20%] top-[34%] h-16 w-16 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.7)_34%,rgba(59,130,246,0.16)_78%,transparent_100%)] shadow-[0_16px_36px_rgba(255,255,255,0.12)]" />

            <span className="absolute left-[14%] top-[28%] h-32 w-32 rounded-full bg-white/8 blur-2xl" />
            <span className="absolute left-[16%] top-[50%] grid grid-cols-4 gap-5 text-white/60">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={`dots-left-${index}`} className="h-1.5 w-1.5 rounded-full bg-current" />
              ))}
            </span>
            <span className="absolute right-[10%] top-[8%] grid grid-cols-4 gap-5 text-white/60">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={`dots-top-${index}`} className="h-1.5 w-1.5 rounded-full bg-current" />
              ))}
            </span>
            <span className="absolute right-[20%] bottom-[12%] grid grid-cols-4 gap-5 text-white/60">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={`dots-bottom-${index}`} className="h-1.5 w-1.5 rounded-full bg-current" />
              ))}
            </span>

            <span className="absolute left-[34%] top-[14%] h-px w-[18%] rotate-[22deg] bg-white/70" />
            <span className="absolute right-[8%] bottom-[26%] h-px w-[18%] -rotate-[20deg] bg-white/70" />
            <span className="absolute left-[4%] bottom-[18%] h-[28rem] w-[28rem] rounded-full border border-white/60 [clip-path:inset(54%_0_0_0)]" />
            <span className="absolute right-[18%] top-[4%] h-[15rem] w-[20rem] rounded-full border border-white/60 [clip-path:inset(44%_0_0_0)]" />
          </div>

          <div className="pointer-events-none absolute inset-0 lg:hidden">
            <span
              className="absolute left-[-8%] top-[14%] h-32 w-32 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.76)_34%,rgba(59,130,246,0.18)_78%,transparent_100%)]"
              style={{ borderRadius: '42% 58% 46% 54% / 52% 40% 60% 48%' }}
            />
            <span className="absolute right-[6%] top-[14%] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),rgba(216,180,254,0.74)_34%,rgba(59,130,246,0.18)_78%,transparent_100%)]" />
            <span className="absolute left-[8%] bottom-[12%] h-24 w-24 rounded-full border border-white/64" />
            <span className="absolute right-[0%] bottom-[8%] h-28 w-28 rounded-full border border-white/58" />
            <span className="absolute left-[18%] top-[42%] grid grid-cols-3 gap-3 text-white/60">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={`dots-mobile-${index}`} className="h-1.5 w-1.5 rounded-full bg-current" />
              ))}
            </span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className={`absolute right-4 top-4 z-20 inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-[11px] font-semibold backdrop-blur-md sm:right-5 sm:top-5 ${theme.pill}`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? 'Light' : 'Dark'}
      </button>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1180px] items-center justify-center">
        <section
          className={`group relative w-full overflow-hidden rounded-[1.35rem] border p-3.5 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_34px_90px_rgba(15,23,42,0.22)] focus-within:-translate-y-1 focus-within:shadow-[0_38px_110px_rgba(15,23,42,0.28)] sm:p-4 lg:min-h-[620px] lg:max-w-[450px] lg:p-5 ${theme.formPanel}`}
        >
          <div className={`pointer-events-none absolute -inset-6 -z-10 hidden rounded-[2rem] blur-3xl transition duration-300 lg:block ${isDarkMode ? 'bg-cyan-400/10 group-hover:bg-cyan-300/16 group-focus-within:bg-cyan-300/20' : 'bg-sky-200/45 group-hover:bg-cyan-200/68 group-focus-within:bg-cyan-100/78'}`} />
          <div className={`pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 transition duration-300 ${isDarkMode ? 'bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_42%)] group-hover:opacity-80 group-focus-within:opacity-100' : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_42%)] group-hover:opacity-80 group-focus-within:opacity-100'}`} />
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 ${theme.formGlow}`} />
          <div className="relative">
            <div className="mb-4 text-center">
              <p className={`mx-auto mb-2 w-max rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.label}`}>
                Create Account
              </p>
              <h2 className={`text-[1.3rem] font-semibold tracking-[-0.02em] sm:text-[1.5rem] ${theme.title}`}>Sign Up</h2>
              <p className={`mt-1 text-[13px] sm:text-sm ${theme.text}`}>Register as a buyer or seller.</p>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <div className={`grid grid-cols-2 gap-1.5 rounded-[1rem] border p-1 ${isDarkMode ? 'border-slate-700/80 bg-slate-900/45' : 'border-slate-200/80 bg-white/45'}`}>
                {['buyer', 'seller'].map((type) => {
                  const selected = form.userType === type;
                  return (
                    <label
                      key={type}
                      className={`cursor-pointer rounded-[0.8rem] border px-3 py-2 transition-all ${
                        selected ? theme.roleActive : theme.roleIdle
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2.5">
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={selected}
                          onChange={(e) => setField('userType', e.target.value)}
                          className="mt-1 h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <p className={`text-[13px] font-medium capitalize ${theme.roleTitle}`}>{type}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <TextInput
                  id="name"
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  inputClassName={theme.input}
                  labelClassName={theme.fieldLabel}
                  hintClassName={theme.fieldHint}
                />

                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  <TextInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    inputClassName={theme.input}
                    labelClassName={theme.fieldLabel}
                    hintClassName={theme.fieldHint}
                  />
                  <TextInput
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    required
                    inputClassName={theme.input}
                    labelClassName={theme.fieldLabel}
                    hintClassName={theme.fieldHint}
                  />
                </div>

                {form.userType === 'seller' && (
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    <TextInput
                      id="companyName"
                      label="Company Name"
                      value={form.companyName}
                      onChange={(e) => setField('companyName', e.target.value)}
                      placeholder="Enter your company name"
                      autoComplete="organization"
                      required
                      inputClassName={theme.input}
                      labelClassName={theme.fieldLabel}
                      hintClassName={theme.fieldHint}
                    />
                    <TextInput
                      id="businessType"
                      label="Business Type"
                      value={form.businessType}
                      onChange={(e) => setField('businessType', e.target.value)}
                      placeholder="Wholesale, retail, manufacturing..."
                      autoComplete="organization-title"
                      hint="Optional"
                      inputClassName={theme.input}
                      labelClassName={theme.fieldLabel}
                      hintClassName={theme.fieldHint}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  <TextInput
                    id="password"
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    hint="Min 6 characters"
                    inputClassName={theme.input}
                    labelClassName={theme.fieldLabel}
                    hintClassName={theme.fieldHint}
                  />
                  <TextInput
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    inputClassName={theme.input}
                    labelClassName={theme.fieldLabel}
                    hintClassName={theme.fieldHint}
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-[0.85rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold text-white transition ${
                  loading
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:brightness-105'
                }`}
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
                      <span className={`px-2 ${theme.dividerBg} ${theme.dividerText}`}>
                        or sign up with Google
                      </span>
                    </div>
                  </div>

                  <div
                    ref={googleButtonContainerRef}
                    className={`mt-3 flex justify-center ${googleLoading ? 'opacity-70' : ''}`}
                  >
                    <div id="google-signup-button" />
                  </div>

                  <p className={`mt-3 text-center text-xs leading-5 ${theme.helper}`}>
                    Continues as
                    <span className={`ml-1 font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                      {form.userType}
                    </span>
                    {form.userType === 'seller' && !form.companyName.trim()
                      ? '. Add a company name first.'
                      : '.'}
                  </p>

                  {googleWarning ? (
                    <p className="mt-2 text-center text-xs text-amber-700">{googleWarning}</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-center text-xs text-amber-700">
                  Google signup is not configured yet. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
                </p>
              )}
            </form>

            <div className={`mt-4 text-center text-sm ${theme.footer}`}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
      <style jsx>{`
        @media (min-width: 1024px) {
          .bubble-slow {
            animation: bubbleFloatSlow 12s ease-in-out infinite;
          }
          .bubble-fast {
            animation: bubbleFloatFast 8s ease-in-out infinite;
          }
          .bubble-drift {
            animation: bubbleDrift 14s ease-in-out infinite;
          }
          .bubble-solid::after {
            content: '';
            position: absolute;
            inset: 12% 16% auto auto;
            width: 28%;
            height: 28%;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.28);
            filter: blur(2px);
          }
        }
        @keyframes bubbleFloatSlow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -10px, 0) scale(1.02); }
        }
        @keyframes bubbleFloatFast {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(6px, -12px, 0); }
        }
        @keyframes bubbleDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-8px, 8px, 0) scale(0.98); }
        }
      `}</style>
    </div>
  );
}
