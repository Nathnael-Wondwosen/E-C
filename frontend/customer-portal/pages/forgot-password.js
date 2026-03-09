import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { requestPasswordReset } from '../utils/userService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResetToken('');
    setLoading(true);

    const result = await requestPasswordReset(email);
    if (!result.success) {
      setError(result.message || 'Failed to start password reset');
      setLoading(false);
      return;
    }

    setSuccessMessage(result.message || 'Reset request submitted');
    if (result.resetToken) {
      setResetToken(result.resetToken);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Forgot Password | Customer Portal</title>
      </Head>

      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we will generate a reset token.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}

          {resetToken && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="font-semibold">Development reset token:</p>
              <p className="mt-1 break-all">{resetToken}</p>
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="mt-2 inline-block font-semibold underline">
                Continue to reset password
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Request Reset'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Back to <Link href="/login" className="font-semibold text-blue-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
