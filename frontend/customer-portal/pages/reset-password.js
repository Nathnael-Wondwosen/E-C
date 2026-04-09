import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { resetPasswordWithToken, validatePasswordResetToken } from '../utils/userService';
import AuthShell from '../components/auth/AuthShell';
import { AuthAlert, AuthField, AuthInput } from '../components/auth/AuthPrimitives';

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useMemo(() => (typeof router.query.token === 'string' ? router.query.token : ''), [router.query.token]);
  const email = useMemo(() => (typeof router.query.email === 'string' ? router.query.email : ''), [router.query.email]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      if (!router.isReady) return;
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        setError('Missing reset token.');
        return;
      }

      const result = await validatePasswordResetToken(token);
      setTokenValid(result.success);
      setError(result.success ? '' : (result.message || 'Invalid or expired token'));
      setValidating(false);
    };

    checkToken();
  }, [router.isReady, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!tokenValid) {
      setError('Reset token is not valid.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPasswordWithToken(token, password);
    if (!result.success) {
      setError(result.message || 'Failed to reset password');
      setLoading(false);
      return;
    }

    setSuccessMessage(result.message || 'Password reset successful.');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);

    setTimeout(() => {
      router.push({
        pathname: '/login',
        query: {
          reset: '1',
          ...(email ? { email } : {}),
        },
      });
    }, 1200);
  };

  return (
    <>
      <Head>
        <title>Reset Password | Customer Portal</title>
      </Head>

      <AuthShell
        badge="Credential Reset"
        title="Reset Password"
        description="Create a new password inside the same polished access experience used across sign-in and registration."
        panelBadge="Secure Recovery"
        panelTitle="Restore access without leaving the platform's premium visual world."
        panelDescription="Resetting credentials is a sensitive step, so the interface should feel calm, trustworthy, and clearly connected to the rest of the product."
        highlights={[
          'Security-focused reset experience with a stronger visual hierarchy.',
          'Consistent recovery language across login, signup, and password flows.',
          'Cleaner responsive composition for desktop and mobile reset screens.'
        ]}
        metrics={[
          { label: 'Security Step', value: 'Trusted' },
          { label: 'Flow Tone', value: 'Consistent' }
        ]}
        size="wide"
        footer={(
          <>
            Need another reset link?{' '}
            <Link href="/forgot-password" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Request a new one
            </Link>
            {' '}or{' '}
            <Link href="/login" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Sign in
            </Link>
          </>
        )}
      >
        {validating ? (
          <div className="rounded-[0.9rem] border border-[#D8C39A] bg-[#FBF6EC] px-4 py-3 text-sm text-[#8E6A2F] dark:border-[#C8A96B]/25 dark:bg-[#C8A96B]/10 dark:text-[#E7D3A5]">
            Validating reset token...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!tokenValid ? (
              <AuthAlert tone="warning">
                This reset link is missing, invalid, or expired. Request a fresh password reset link to continue.
              </AuthAlert>
            ) : null}

            <AuthField label="New Password" htmlFor="password" hint="At least 6 characters">
              <AuthInput
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your new password"
              />
            </AuthField>

            <AuthField label="Confirm Password" htmlFor="confirmPassword">
              <AuthInput
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </AuthField>

            {error ? <AuthAlert>{error}</AuthAlert> : null}
            {successMessage ? (
              <AuthAlert tone="success">
                {successMessage}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#8E6A2F] underline decoration-[#C8A96B] underline-offset-4 hover:text-[#A8823E]"
                >
                  Go to sign in
                </Link>
              </AuthAlert>
            ) : null}

            <button
              type="submit"
              disabled={loading || !tokenValid || !password || !confirmPassword}
              className="auth-primary-button"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
