import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { resetPasswordWithToken, validatePasswordResetToken } from '../utils/userService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useMemo(() => (typeof router.query.token === 'string' ? router.query.token : ''), [router.query.token]);
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Reset Password | Customer Portal</title>
      </Head>

      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-600">Set a new password for your account.</p>

        {validating ? (
          <p className="mt-4 text-sm text-slate-600">Validating reset token...</p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && (
              <p className="text-sm text-emerald-700">
                {successMessage} <Link href="/login" className="font-semibold underline">Go to Login</Link>
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !tokenValid}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
