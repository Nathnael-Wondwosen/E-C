import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { changeUserPassword, getUserProfile, updateUserProfile } from '../utils/userService';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'buyer',
    companyName: '',
    businessType: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadUserProfile();
  }, [router]);

  const loadUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      const userProfile = await getUserProfile(userId);
      setUser(userProfile);

      // Set form data
      setFormData({
        name: userProfile.profile?.name || userProfile.name || '',
        email: userProfile.profile?.email || userProfile.email || '',
        phone: userProfile.profile?.phone || '',
        userType: userProfile.profile?.userType || userProfile.userType || 'buyer',
        companyName: userProfile.profile?.companyName || '',
        businessType: userProfile.profile?.businessType || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      const result = await updateUserProfile(userId, profileData);

      if (result.success) {
        setMessage('Profile updated successfully!');
        // Update user state
        setUser(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...formData
          }
        }));
      } else {
        setMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    router.push('/login');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/dashboard/customer');
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const openPasswordModal = () => {
    setPasswordMessage('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setShowPasswordModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordMessage('New password must be different from current password.');
      return;
    }

    setPasswordSaving(true);
    const result = await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (!result.success) {
      setPasswordMessage(result.message || 'Failed to change password.');
      setPasswordSaving(false);
      return;
    }

    setPasswordMessage(result.message || 'Password changed successfully.');
    setPasswordSaving(false);
    setTimeout(() => {
      setShowPasswordModal(false);
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Head>
        <title>User Profile | B2B E-Commerce Platform</title>
        <meta name="description" content="Manage your user profile" />
      </Head>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-indigo-50 shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                Account Center
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Profile Settings</h1>
              <p className="mt-2 text-sm text-slate-600">
                Manage your personal details and account security in one place.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <Link href="/dashboard/customer" className="hover:text-cyan-700">Dashboard</Link>
                <span>/</span>
                <span className="font-medium text-slate-700">Profile</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Back
              </button>
              <Link
                href="/dashboard/customer"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message.includes('successfully')
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500">Keep your details up to date for better account management.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="userType" className="mb-1 block text-sm font-medium text-slate-700">
                    Account Type
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                    disabled
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">Account type cannot be changed</p>
                </div>

                {formData.userType === 'seller' && (
                  <>
                    <div>
                      <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-slate-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="businessType" className="mb-1 block text-sm font-medium text-slate-700">
                        Business Type
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                      >
                        <option value="">Select business type</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="distributor">Distributor</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="retailer">Retailer</option>
                        <option value="service">Service Provider</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                    saving ? 'cursor-not-allowed bg-slate-400' : 'bg-cyan-600 hover:bg-cyan-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Profile Overview</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium text-slate-800">{formData.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="max-w-[180px] truncate font-medium text-slate-800">{formData.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold uppercase text-cyan-700">
                    {formData.userType}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Account Security</h2>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Change Password</h3>
                    <p className="text-xs text-slate-500">Update your account password</p>
                  </div>
                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-500">Add extra account protection</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMessage('Two-factor authentication setup will be available soon.')}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Set Up
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
                <p className="mt-1 text-xs text-slate-500">Use a strong password with at least 6 characters.</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                <div>
                  <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-slate-700">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white"
                    required
                  />
                </div>

                {passwordMessage && (
                  <div className={`rounded-lg border px-3 py-2 text-xs ${
                    passwordMessage.toLowerCase().includes('success')
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {passwordMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      passwordSaving ? 'cursor-not-allowed bg-slate-400' : 'bg-cyan-600 hover:bg-cyan-700'
                    }`}
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
