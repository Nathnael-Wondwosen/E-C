import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { requestPasswordReset } from '../utils/userService';
import AuthShell from '../components/auth/AuthShell';
import { AuthAlert, AuthField, AuthInput } from '../components/auth/AuthPrimitives';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResetToken('');
    setExpiresAt('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);

    const result = await requestPasswordReset(normalizedEmail);
    if (!result.success) {
      setError(result.message || 'Failed to start password reset');
      setLoading(false);
      return;
    }

    setSuccessMessage(result.message || 'Reset request submitted');
    setEmail(normalizedEmail);
    if (result.resetToken) {
      setResetToken(result.resetToken);
    }
    if (result.expiresAt) {
      setExpiresAt(result.expiresAt);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Forgot Password | Customer Portal</title>
      </Head>

      <AuthShell
        badge="Password Recovery"
        title="Forgot Password"
        description="Recover access through the same premium entry experience, with a cleaner path back into your account."
        panelBadge="Access Recovery"
        panelTitle="A reset flow that still feels like part of the main platform."
        panelDescription="Even account recovery should carry the same editorial warmth and professional tone as the main sign-in experience. This keeps the platform feeling consistent when users need help most."
        highlights={[
          'Fast reset initiation without dropping the branded product tone.',
          'Clearer recovery path for returning buyers and sellers.',
          'A more confident, responsive layout for sensitive account actions.'
        ]}
        metrics={[
          { label: 'Recovery Flow', value: 'Guided' },
          { label: 'Account Return', value: 'Streamlined' }
        ]}
        size="wide"
        footer={(
          <>
            Back to{' '}
            <Link href="/login" className="font-semibold text-[#8E6A2F] hover:text-[#A8823E]">
              Sign in
            </Link>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthField label="Email" htmlFor="email">
            <AuthInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </AuthField>

          {error ? <AuthAlert>{error}</AuthAlert> : null}
          {successMessage ? <AuthAlert tone="success">{successMessage}</AuthAlert> : null}

          {resetToken ? (
            <AuthAlert tone="warning">
              <p className="font-semibold">Development reset token:</p>
              <p className="mt-1 break-all">{resetToken}</p>
              {expiresAt ? (
                <p className="mt-1 text-xs opacity-80">
                  Expires {new Date(expiresAt).toLocaleString()}
                </p>
              ) : null}
              <Link
                href={`/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`}
                className="mt-2 inline-block font-semibold text-[#8E6A2F] underline decoration-[#C8A96B] underline-offset-4 hover:text-[#A8823E]"
              >
                Continue to reset password
              </Link>
            </AuthAlert>
          ) : null}

          <button type="submit" disabled={loading || !email.trim()} className="auth-primary-button">
            {loading ? 'Submitting...' : 'Request Reset'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
