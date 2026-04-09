import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
} from '../utils/userService';
import { clearCustomerSession } from '../utils/session';

const sellerBusinessTypes = [
  { value: '', label: 'Select business type' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'service', label: 'Service Provider' },
  { value: 'other', label: 'Other' },
];

function StatTile({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'accent'
      ? 'text-[var(--portal-accent-strong)]'
      : tone === 'success'
        ? 'text-emerald-600'
        : 'text-[var(--portal-heading)]';

  return (
    <div className="portal-soft-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-muted)]">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="portal-soft-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">{label}</p>
      <p className="portal-heading mt-2 text-sm font-medium break-words">{value || 'Not provided'}</p>
    </div>
  );
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  disabled = false,
  hint = '',
  children,
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[var(--auth-label)]">{label}</span>
        {hint ? <span className="text-[11px] text-[var(--portal-muted)]">{hint}</span> : null}
      </div>
      {children || (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`portal-input ${
            disabled
              ? '!border-[#E3D9C5] !bg-[#F4EFE4] !text-[#7A818C] dark:!border-[#33414f] dark:!bg-[#17212c] dark:!text-[#8f99a6]'
              : ''
          }`}
        />
      )}
    </label>
  );
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'buyer',
    companyName: '',
    businessType: '',
    locationAddress: '',
    locationLat: '',
    locationLng: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ tone: '', text: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleSessionExpired = () => {
      router.push('/login');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
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
      if (!userProfile?.id && !userProfile?._id) {
        router.push('/login');
        return;
      }

      setUser(userProfile);
      setFormData({
        name: userProfile.profile?.name || userProfile.name || '',
        email: userProfile.profile?.email || userProfile.email || '',
        phone: userProfile.profile?.phone || '',
        userType: userProfile.profile?.userType || userProfile.userType || 'buyer',
        companyName: userProfile.profile?.companyName || '',
        businessType: userProfile.profile?.businessType || '',
        locationAddress: userProfile.profile?.locationAddress || '',
        locationLat: userProfile.profile?.locationLat || '',
        locationLng: userProfile.profile?.locationLng || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ tone: 'error', text: 'Failed to load your profile.' });
    } finally {
      setLoading(false);
    }
  };

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ tone: '', text: '' });

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        userType: formData.userType,
        profile: {
          ...(user?.profile || {}),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          userType: formData.userType,
          ...(formData.userType === 'seller'
            ? {
                companyName: formData.companyName.trim(),
                businessType: formData.businessType,
                locationAddress: formData.locationAddress.trim(),
                locationLat: formData.locationLat ? Number(formData.locationLat) : null,
                locationLng: formData.locationLng ? Number(formData.locationLng) : null,
              }
            : {}),
        },
      };

      const result = await updateUserProfile(userId, payload);
      if (!result.success) {
        setMessage({ tone: 'error', text: result.message || 'Failed to update profile.' });
        setSaving(false);
        return;
      }

      setUser((prev) => ({
        ...prev,
        ...result.user,
        profile: {
          ...(prev?.profile || {}),
          ...payload.profile,
        },
      }));
      setMessage({ tone: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ tone: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    router.push('/login');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(formData.userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer');
  };

  const openPasswordModal = () => {
    setPasswordMessage({ tone: '', text: '' });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setShowPasswordModal(false);
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ tone: '', text: '' });

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ tone: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ tone: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordMessage({ tone: 'error', text: 'New password must be different from current password.' });
      return;
    }

    setPasswordSaving(true);
    const result = await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (!result.success) {
      setPasswordMessage({ tone: 'error', text: result.message || 'Failed to change password.' });
      setPasswordSaving(false);
      return;
    }

    setPasswordMessage({ tone: 'success', text: result.message || 'Password changed successfully.' });
    setPasswordSaving(false);
    setTimeout(() => setShowPasswordModal(false), 1100);
  };

  const profileCompletion = useMemo(() => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.userType === 'seller' ? formData.companyName : 'complete',
      formData.userType === 'seller' ? formData.businessType : 'complete',
    ];
    const completed = fields.filter((value) => String(value || '').trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  const accountBadge = formData.userType === 'seller' ? 'Seller Account' : 'Buyer Account';
  const accountHome = formData.userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer';
  const initials = (formData.name || formData.email || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((piece) => piece[0]?.toUpperCase())
    .join('');
  const hasValidLocation = Boolean(formData.locationLat && formData.locationLng);
  const locationMapLink = hasValidLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${formData.locationLat},${formData.locationLng}`)}`
    : '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (formData.userType !== 'seller') return;
    if (!mapContainerRef.current) return;
    if (!googleMapsApiKey) {
      setMapError('Google Maps key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map picker.');
      return;
    }

    const parseCoordinate = (value, fallback) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const reverseGeocode = (lat, lng) => {
      if (!window.google?.maps) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status !== 'OK') return;
        const nextAddress = results?.[0]?.formatted_address;
        if (!nextAddress) return;
        setFormData((prev) => ({ ...prev, locationAddress: nextAddress }));
      });
    };

    const initMap = () => {
      if (!window.google?.maps || !mapContainerRef.current) return;

      const center = {
        lat: parseCoordinate(formData.locationLat, 9.03),
        lng: parseCoordinate(formData.locationLng, 38.74),
      };

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: hasValidLocation ? 14 : 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }

      if (!mapMarkerRef.current) {
        mapMarkerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: center,
          draggable: true,
        });

        mapInstanceRef.current.addListener('click', (event) => {
          const lat = Number(event.latLng.lat().toFixed(6));
          const lng = Number(event.latLng.lng().toFixed(6));
          mapMarkerRef.current.setPosition({ lat, lng });
          setFormData((prev) => ({ ...prev, locationLat: String(lat), locationLng: String(lng) }));
          reverseGeocode(lat, lng);
        });

        mapMarkerRef.current.addListener('dragend', (event) => {
          const lat = Number(event.latLng.lat().toFixed(6));
          const lng = Number(event.latLng.lng().toFixed(6));
          setFormData((prev) => ({ ...prev, locationLat: String(lat), locationLng: String(lng) }));
          reverseGeocode(lat, lng);
        });
      }

      setMapError('');
      setMapReady(true);
    };

    if (window.google?.maps) {
      initMap();
      return;
    }

    if (!document.querySelector('script[data-google-maps-loader]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps-loader', 'true');
      script.onload = initMap;
      script.onerror = () => setMapError('Could not load Google Maps. Check API key and internet access.');
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(check);
          initMap();
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, [formData.userType, googleMapsApiKey, formData.locationLat, formData.locationLng, hasValidLocation]);

  useEffect(() => {
    if (formData.userType !== 'seller') return;
    if (!mapInstanceRef.current || !mapMarkerRef.current) return;
    const lat = Number(formData.locationLat);
    const lng = Number(formData.locationLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    mapMarkerRef.current.setPosition({ lat, lng });
    mapInstanceRef.current.panTo({ lat, lng });
    if ((mapInstanceRef.current.getZoom() || 0) < 12) {
      mapInstanceRef.current.setZoom(14);
    }
  }, [formData.locationLat, formData.locationLng, formData.userType]);

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(15,23,32,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--portal-accent)]" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | Customer Portal</title>
        <meta name="description" content="Manage your profile and account security." />
      </Head>

      <div className="portal-page min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
          <section className="portal-hero relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(251,113,133,0.16),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(59,130,246,0.14),transparent_30%),linear-gradient(120deg,rgba(255,255,255,0.74),rgba(255,255,255,0.28))]" />
            <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--portal-border-strong)] bg-[var(--portal-surface-muted)] text-lg font-bold text-[var(--portal-accent-strong)] sm:h-16 sm:w-16 sm:text-xl">
                  {initials || 'U'}
                </div>
                <div>
                  <p className="portal-badge">Account Center</p>
                  <h1 className="portal-heading mt-2 text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-[2.25rem]">
                    Profile Dashboard
                  </h1>
                  <p className="portal-text mt-1 text-sm leading-6 sm:text-[15px]">
                    Update identity details, business information, and security settings in one polished workspace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <StatTile label="Completion" value={`${profileCompletion}%`} tone="accent" />
                <StatTile label="Status" value={accountBadge} tone="success" />
                <StatTile label="Role" value={formData.userType} />
                <StatTile label="Security" value="Password" />
              </div>
            </div>
          </section>

          {message.text ? (
            <div
              className={`mt-5 rounded-[1rem] border px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,32,0.05)] ${
                message.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="portal-card overflow-hidden">
              <div className="border-b border-[var(--portal-border)] bg-[linear-gradient(135deg,#18232f,#283749)] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Keep your personal and business details accurate for orders, invoices, and account flows.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />

                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    required
                    placeholder="Enter your email address"
                  />

                  <FormField
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />

                  <FormField id="userType" label="Account Type" hint="Locked">
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      disabled
                      className="portal-input !border-[#E2E8F0] !bg-[#F8FAFC] !text-[#7A818C] dark:!border-[#33414f] dark:!bg-[#17212c] dark:!text-[#8f99a6]"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </FormField>

                  {formData.userType === 'seller' ? (
                    <>
                      <FormField
                        id="companyName"
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) => setField('companyName', e.target.value)}
                        placeholder="Enter your company name"
                      />

                      <FormField id="businessType" label="Business Type">
                        <select
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={(e) => setField('businessType', e.target.value)}
                          className="portal-input"
                        >
                          {sellerBusinessTypes.map((option) => (
                            <option key={option.value || 'empty'} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField
                        id="locationAddress"
                        label="Business Address"
                        value={formData.locationAddress}
                        onChange={(e) => setField('locationAddress', e.target.value)}
                        placeholder="Enter your address or pick on map"
                      />

                      <FormField
                        id="locationLat"
                        label="Latitude"
                        value={formData.locationLat}
                        onChange={(e) => setField('locationLat', e.target.value)}
                        placeholder="e.g. 9.030000"
                      />

                      <FormField
                        id="locationLng"
                        label="Longitude"
                        value={formData.locationLng}
                        onChange={(e) => setField('locationLng', e.target.value)}
                        placeholder="e.g. 38.740000"
                      />

                      <div className="md:col-span-2">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[13px] font-medium text-[var(--auth-label)]">Business Location Map</p>
                          {locationMapLink ? (
                            <a
                              href={locationMapLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[var(--portal-accent-strong)] hover:underline"
                            >
                              Open in Google Maps
                            </a>
                          ) : null}
                        </div>
                        <div className="overflow-hidden rounded-[1rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
                          <div ref={mapContainerRef} className="h-64 w-full" />
                        </div>
                        <p className="mt-2 text-xs text-[var(--portal-muted)]">
                          Click the map or drag the marker to set your exact seller location.
                        </p>
                        {!mapReady && !mapError ? (
                          <p className="mt-1 text-xs text-[var(--portal-muted)]">Loading map...</p>
                        ) : null}
                        {mapError ? (
                          <p className="mt-1 text-xs text-red-600">{mapError}</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="grid gap-3 border-t border-[var(--portal-border)] pt-5 sm:grid-cols-3">
                  <button type="button" onClick={handleGoBack} className="portal-outline-button">
                    Back
                  </button>
                  <Link href={accountHome} className="portal-outline-button text-center">
                    Dashboard
                  </Link>
                  <button type="submit" disabled={saving} className="portal-primary-button">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            <aside className="space-y-6">
              <section className="portal-card overflow-hidden">
                <div className="border-b border-[var(--portal-border)] px-5 py-4">
                  <h2 className="portal-heading text-base font-semibold">Account Snapshot</h2>
                </div>
                <div className="space-y-3 p-5">
                  <InfoField label="Name" value={formData.name} />
                  <InfoField label="Email" value={formData.email} />
                  <InfoField label="Phone" value={formData.phone} />
                  {formData.userType === 'seller' ? (
                    <>
                      <InfoField label="Company" value={formData.companyName} />
                      <InfoField label="Business Type" value={formData.businessType} />
                      <InfoField label="Location" value={formData.locationAddress || (hasValidLocation ? `${formData.locationLat}, ${formData.locationLng}` : '')} />
                    </>
                  ) : null}
                </div>
              </section>

              <section className="portal-card overflow-hidden">
                <div className="border-b border-[var(--portal-border)] px-5 py-4">
                  <h2 className="portal-heading text-base font-semibold">Security</h2>
                </div>
                <div className="space-y-4 p-5">
                  <div className="portal-soft-card p-4">
                    <h3 className="portal-heading text-sm font-semibold">Password Management</h3>
                    <p className="portal-muted mt-1 text-xs leading-5">
                      Rotate your password regularly and avoid reusing previous values.
                    </p>
                    <button
                      type="button"
                      onClick={openPasswordModal}
                      className="portal-primary-button mt-4 w-full px-4 py-2 text-xs"
                    >
                      Change Password
                    </button>
                  </div>

                  <button type="button" onClick={handleLogout} className="portal-outline-button w-full">
                    Logout
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>

        {showPasswordModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1720]/55 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-[1.35rem] border border-[var(--portal-border)] bg-[var(--portal-surface)] shadow-[0_28px_80px_rgba(15,23,32,0.26)]">
              <div className="border-b border-[var(--portal-border)] bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent)] px-5 py-4">
                <h3 className="portal-heading text-base font-semibold">Change Password</h3>
                <p className="portal-muted mt-1 text-xs">
                  Use at least 6 characters and keep it different from your current password.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                <FormField
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  required
                />
                <FormField
                  id="newPassword"
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  hint="Minimum 6 characters"
                />
                <FormField
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange}
                  required
                />

                {passwordMessage.text ? (
                  <div
                    className={`rounded-[0.9rem] border px-3 py-2.5 text-sm ${
                      passwordMessage.tone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closePasswordModal} className="portal-outline-button px-4 py-2">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      passwordSaving ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                    className="portal-primary-button px-4 py-2"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
