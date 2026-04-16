import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { createSellerProduct, getMarketplaceCategories, uploadSellerProductImage } from '../../../utils/userService';
import { getRequiredCustomerSession } from '../../../utils/session';

function SellerFieldLabel ({ children, hint }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="block text-sm font-semibold text-[#111827]">{children}</span>
      {hint ? <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8A94A6]">{hint}</span> : null}
    </div>
  );
}

function SellerInputShell ({ children, className = '' }) {
  return (
    <div className={`rounded-[0.95rem] border border-[#E7ECF5] bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export default function SellerNewProductPage () {
  const router = useRouter();
  const [mobileTopBarVisible, setMobileTopBarVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPercentage: '0',
    stock: '',
    sku: '',
    tags: '',
    marketScope: 'local',
    countryOfOrigin: '',
    isMadeInEthiopia: false,
    isNewArrival: true
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [cameraDeviceCount, setCameraDeviceCount] = useState(0);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = getRequiredCustomerSession('seller');
    if (!session.loggedIn) {
      router.replace('/login');
      return;
    }

    return undefined;
  }, [router]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      const result = await getMarketplaceCategories(form.marketScope);
      if (!mounted) return;
      if (result?.success) {
        setCategories(result.categories || []);
      } else {
        setCategories([]);
      }
      setCategoriesLoading(false);
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, [form.marketScope]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleScroll = () => {
      setMobileTopBarVisible(window.scrollY > 140);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraVideoRef.current || !cameraStreamRef.current) return;

    cameraVideoRef.current.srcObject = cameraStreamRef.current;
    cameraVideoRef.current.play().catch(() => {});
  }, [cameraOpen]);

  useEffect(() => () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const syncCameraDevices = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameraDeviceCount(devices.filter((device) => device.kind === 'videoinput').length);
    } catch (error) {
      console.error('Could not inspect available cameras:', error);
    }
  };

  const uploadProductFiles = async (files) => {
    if (!files.length) return;

    setMessage({ tone: '', text: '' });
    setUploadStatus('uploading');
    setUploadStatusText(`Uploading ${files.length} image${files.length === 1 ? '' : 's'}...`);
    setUploadingImage(true);

    const nextUrls = [];
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const result = await uploadSellerProductImage(file);
      if (!result?.success || !result?.url) {
        setUploadingImage(false);
        if (result?.uploaded && !result?.verified) {
          setUploadStatus('not_public');
          setUploadStatusText('Uploaded, but not publicly viewable.');
        } else {
          setUploadStatus('error');
          setUploadStatusText('Upload failed.');
        }
        setMessage({ tone: 'error', text: result?.message || `Failed to upload ${file.name}` });
        return;
      }
      nextUrls.push(result.url);
    }

    setImageUrls((prev) => [...new Set([...prev, ...nextUrls])]);
    setUploadingImage(false);
    setUploadStatus('verified');
    setUploadStatusText(`Uploaded ${nextUrls.length} image${nextUrls.length === 1 ? '' : 's'}.`);
    setMessage({ tone: 'success', text: 'Images uploaded successfully.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ tone: '', text: '' });

    const normalizedName = String(form.name || '').trim();
    const normalizedCategory = String(form.category || '').trim();
    const normalizedPrice = Number(form.price);
    const normalizedDiscount = Number(form.discountPercentage);
    const normalizedStock = Number(form.stock);

    if (!normalizedName) {
      setMessage({ tone: 'error', text: 'Product name is required.' });
      return;
    }
    if (!normalizedCategory) {
      setMessage({ tone: 'error', text: 'Category is required.' });
      return;
    }
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setMessage({ tone: 'error', text: 'Price must be a valid number greater than 0.' });
      return;
    }
    if (!Number.isFinite(normalizedDiscount) || normalizedDiscount < 0 || normalizedDiscount > 90) {
      setMessage({ tone: 'error', text: 'Discount must be between 0 and 90.' });
      return;
    }
    if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
      setMessage({ tone: 'error', text: 'Stock must be 0 or a positive number.' });
      return;
    }
    if (uploadingImage) {
      setMessage({ tone: 'error', text: 'Please wait for image upload to finish.' });
      return;
    }

    setSaving(true);
    const normalizedImages = imageUrls
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
    const primaryImage = normalizedImages[0] || '';
    const result = await createSellerProduct({
      name: normalizedName,
      description: String(form.description || '').trim(),
      countryOfOrigin: String(form.countryOfOrigin || '').trim(),
      isMadeInEthiopia: Boolean(form.isMadeInEthiopia),
      isNewArrival: Boolean(form.isNewArrival),
      category: normalizedCategory,
      price: normalizedPrice,
      discountPercentage: normalizedDiscount,
      stock: normalizedStock,
      sku: String(form.sku || '').trim(),
      image: primaryImage,
      images: normalizedImages,
      thumbnail: primaryImage,
      tags: String(form.tags || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      marketScope: String(form.marketScope || 'local'),
      scope: String(form.marketScope || 'local')
    });
    setSaving(false);

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to post product.' });
      return;
    }

    setMessage({ tone: 'success', text: 'Product posted successfully.' });
    setTimeout(() => router.push('/dashboard/seller'), 900);
  };

  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    await uploadProductFiles(files);
    e.target.value = '';
  };

  const startCamera = async (facingMode) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const unsupportedMessage = 'Camera access is not supported on this device or browser.';
      setCameraOpen(false);
      setCameraError(unsupportedMessage);
      setMessage({ tone: 'error', text: unsupportedMessage });
      return;
    }

    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1440 }
        },
        audio: false
      });

      cameraStreamRef.current = stream;
      setCameraFacingMode(facingMode);
      setCameraError('');
      setCameraOpen(true);
      setMessage({ tone: '', text: '' });
      await syncCameraDevices();
    } catch (error) {
      console.error('Could not open product camera:', error);
      const permissionDenied =
        error?.name === 'NotAllowedError' ||
        error?.name === 'PermissionDeniedError' ||
        error?.name === 'SecurityError';

      const nextMessage = permissionDenied
        ? 'Camera access is blocked. Please enable camera permission in your browser or device settings, then try again.'
        : 'Could not start the camera on this device. Try again or use Choose Image.';

      setCameraOpen(false);
      setCameraError(nextMessage);
      setMessage({ tone: 'error', text: nextMessage });
    }
  };

  const handleOpenCamera = async () => {
    const prefersMobileCamera =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches;

    const preferredFacingMode = prefersMobileCamera ? 'environment' : 'user';
    await startCamera(preferredFacingMode);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCameraError('');
  };

  const handleSwitchCamera = async () => {
    const nextFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextFacingMode);
  };

  const handleCapturePhoto = async () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is not ready yet. Try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture the camera image.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });

    if (!blob) {
      setCameraError('Could not capture the camera image.');
      return;
    }

    const imageFile = new File([blob], `product-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleCloseCamera();
    await uploadProductFiles([imageFile]);
  };

  const addManualImage = () => {
    const normalized = String(manualImageUrl || '').trim();
    if (!normalized) return;
    setImageUrls((prev) => [...new Set([...prev, normalized])]);
    setManualImageUrl('');
  };

  const removeImage = (url) => {
    setImageUrls((prev) => prev.filter((entry) => entry !== url));
  };

  const normalizedPrice = Number(form.price) || 0;
  const normalizedDiscount = Number(form.discountPercentage) || 0;
  const finalPrice = normalizedPrice > 0
    ? Math.max(0, normalizedPrice - ((normalizedPrice * normalizedDiscount) / 100))
    : 0;
  const productSummaryCards = [
    { label: 'Category', value: form.category || 'No category' },
    { label: 'Price', value: `$${finalPrice.toFixed(2)}` },
    { label: 'Images', value: `${imageUrls.length}/4` }
  ];

  return (
    <div className="portal-page min-h-screen bg-[linear-gradient(180deg,#F8FAFF_0%,#F3F6FF_36%,#EEF3FF_100%)]">
      <Head>
        <title>Post Product | Seller Dashboard</title>
      </Head>

      <div
        className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-300 md:hidden ${
          mobileTopBarVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-between rounded-[1.1rem] border border-[rgba(226,232,240,0.92)] bg-white/92 px-3 py-2.5 shadow-[0_18px_36px_rgba(15,23,42,0.1)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => router.push('/dashboard/seller')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18 9 12l6-6" />
            </svg>
            Back
          </button>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">Seller Product</p>
            <p className="text-sm font-semibold text-[#111827]">Post New Product</p>
          </div>
          <button
            type="submit"
            form="seller-new-product-form"
            disabled={saving || uploadingImage}
            className="inline-flex h-9 min-w-[74px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#F97316)] px-3 text-[11px] font-semibold text-white disabled:opacity-70"
          >
            {saving ? 'Posting' : 'Publish'}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-0 py-4 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <section className="bg-transparent px-0 shadow-none sm:rounded-[1.4rem] sm:border sm:border-[#E7ECF5] sm:bg-[#F8FAFF] sm:p-4 sm:shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-4 hidden items-center justify-between gap-3 px-4 sm:flex sm:px-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Seller Product</p>
              <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[#111827]">Post New Product</h1>
            </div>
            <Link href="/dashboard/seller" className="inline-flex rounded-full border border-[#D9E0FF] bg-white px-4 py-2 text-xs font-semibold text-[#374151]">
              Back to Dashboard
            </Link>
          </div>

          <form id="seller-new-product-form" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
            <div className="space-y-6 px-4 sm:px-0 sm:space-y-5">
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {productSummaryCards.map((item) => (
                  <div key={item.label} className="rounded-[1rem] border border-[#E3E8F2] bg-white px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">{item.label}</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">{item.value}</p>
                  </div>
                ))}
              </div>

              <section className="bg-transparent p-0 shadow-none sm:rounded-[1rem] sm:border sm:border-[#E7ECF5] sm:bg-white sm:p-5 sm:shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Product Basics</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Identity and Market</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <SellerFieldLabel hint="Required">Product Name</SellerFieldLabel>
                    <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="Example: Premium Coffee Beans" required />
                  </label>

                  <label className="block">
                    <SellerFieldLabel>Post To Market</SellerFieldLabel>
                    <select
                      value={form.marketScope}
                      onChange={(e) => {
                        const nextScope = e.target.value;
                        setForm((prev) => ({ ...prev, marketScope: nextScope, category: '' }));
                      }}
                      className="portal-input h-[52px] rounded-[0.8rem]"
                    >
                      <option value="local">Local Market</option>
                      <option value="global">Global Market</option>
                      <option value="africa">Africa Market</option>
                      <option value="china">China Market</option>
                      <option value="b2b">B2B Market</option>
                    </select>
                  </label>

                  <label className="block">
                    <SellerFieldLabel hint={categoriesLoading ? 'Loading' : 'Required'}>Category</SellerFieldLabel>
                    <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" required disabled={categoriesLoading}>
                      <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
                      {categories.map((entry) => (
                        <option key={entry.value} value={entry.value}>{entry.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <SellerFieldLabel>Country of Origin</SellerFieldLabel>
                    <input value={form.countryOfOrigin} onChange={(e) => setField('countryOfOrigin', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="Example: Ethiopia" />
                  </label>

                  <label className="block">
                    <SellerFieldLabel>SKU</SellerFieldLabel>
                    <input value={form.sku} onChange={(e) => setField('sku', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="Example: AGR-COF-001" />
                  </label>

                  <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-[0.8rem] border border-[#E7ECF5] bg-white px-4 py-3">
                      <input type="checkbox" checked={Boolean(form.isMadeInEthiopia)} onChange={(e) => setField('isMadeInEthiopia', e.target.checked)} className="h-4 w-4" />
                      <span className="text-sm font-medium text-[#374151]">Made in Ethiopia</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-[0.8rem] border border-[#E7ECF5] bg-white px-4 py-3">
                      <input type="checkbox" checked={Boolean(form.isNewArrival)} onChange={(e) => setField('isNewArrival', e.target.checked)} className="h-4 w-4" />
                      <span className="text-sm font-medium text-[#374151]">Highlight as New Arrival</span>
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-transparent p-0 shadow-none sm:rounded-[1rem] sm:border sm:border-[#E7ECF5] sm:bg-white sm:p-5 sm:shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Pricing</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Commercial Details</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <SellerFieldLabel hint="Required">Price</SellerFieldLabel>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="0.00" required />
                  </label>
                  <label className="block">
                    <SellerFieldLabel hint="Required">Stock</SellerFieldLabel>
                    <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setField('stock', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="0" required />
                  </label>
                  <label className="block">
                    <SellerFieldLabel>Discount %</SellerFieldLabel>
                    <input type="number" min="0" max="90" step="0.1" value={form.discountPercentage} onChange={(e) => setField('discountPercentage', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="0" />
                  </label>
                </div>
              </section>

              <section className="bg-transparent p-0 shadow-none sm:rounded-[1rem] sm:border sm:border-[#E7ECF5] sm:bg-white sm:p-5 sm:shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Gallery</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Images and Media</h2>
                </div>
                <div className="grid gap-4">
                  <label className="block">
                    <SellerFieldLabel>Upload Product Images</SellerFieldLabel>
                    <SellerInputShell className="border-[#E3E8F2] p-0 shadow-none sm:border-[#E7ECF5] sm:p-3 sm:shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center justify-center rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-3 text-sm font-semibold text-[#374151]">
                          <input type="file" accept="image/*" multiple onChange={handleImageFileChange} className="hidden" />
                          Choose Image
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenCamera}
                          disabled={uploadingImage}
                          className="flex items-center justify-center rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-3 text-sm font-semibold text-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Take Picture
                        </button>
                      </div>

                      {cameraOpen ? (
                        <div className="mt-3 overflow-hidden rounded-[1rem] border border-[#D7DEEB] bg-[#0F172A] shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                          <div className="aspect-[4/3] w-full bg-black">
                            <video
                              ref={cameraVideoRef}
                              className="h-full w-full object-cover"
                              autoPlay
                              muted
                              playsInline
                            />
                          </div>
                          <div className="space-y-3 bg-white px-3 py-3">
                            {cameraError ? (
                              <p className="text-xs font-medium text-red-600">{cameraError}</p>
                            ) : (
                              <p className="text-xs text-[#667085]">Frame the product clearly, then capture the image. Back camera is preferred on phones.</p>
                            )}
                            <div className={`grid gap-3 ${cameraDeviceCount > 1 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                              <button
                                type="button"
                                onClick={handleCloseCamera}
                                className="rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-2.5 text-sm font-semibold text-[#374151]"
                              >
                                Cancel
                              </button>
                              {cameraDeviceCount > 1 ? (
                                <button
                                  type="button"
                                  onClick={handleSwitchCamera}
                                  className="rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-2.5 text-sm font-semibold text-[#374151]"
                                >
                                  Switch
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={handleCapturePhoto}
                                className="rounded-[0.8rem] bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#F97316)] px-3 py-2.5 text-sm font-semibold text-white"
                              >
                                Capture
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : cameraError ? (
                        <div className="mt-3 rounded-[0.95rem] border border-amber-200 bg-amber-50 px-3 py-3">
                          <p className="text-xs font-medium text-amber-700">{cameraError}</p>
                          <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="mt-2 inline-flex rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-700"
                          >
                            Retry Camera Access
                          </button>
                        </div>
                      ) : null}

                      {uploadStatus !== 'idle' ? (
                        <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                          uploadStatus === 'verified'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : uploadStatus === 'not_public'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : uploadStatus === 'uploading'
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                        }`}>
                          {uploadStatusText || uploadStatus}
                        </div>
                      ) : null}
                      {uploadingImage ? <p className="mt-2 text-xs text-[#5F6773]">Uploading images...</p> : null}
                    </SellerInputShell>
                  </label>

                  <div>
                    <SellerFieldLabel>Add Image URL</SellerFieldLabel>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="https://..." />
                      <button type="button" onClick={addManualImage} className="portal-outline-button px-5 py-3">Add</button>
                    </div>
                  </div>

                  <div>
                    <SellerFieldLabel hint={`${imageUrls.length} Added`}>Product Images</SellerFieldLabel>
                    {imageUrls.length === 0 ? (
                      <div className="rounded-[0.9rem] border border-dashed border-[#D6DEEE] bg-[#FCFDFF] px-4 py-10 text-center text-sm text-[#64748B]">
                          No images added yet.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {imageUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="overflow-hidden rounded-[0.9rem] border border-[#E3E8F2] bg-white p-2 shadow-none sm:border-[#E7ECF5] sm:shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                            <img src={url} alt={`Product ${index + 1}`} className="h-32 w-full rounded-[0.65rem] object-cover" />
                            <div className="mt-2 flex items-center justify-between gap-2 px-1 pb-1">
                              <span className="text-xs font-medium text-[#64748B]">{index === 0 ? 'Primary' : `Image ${index + 1}`}</span>
                              <button type="button" onClick={() => removeImage(url)} className="text-xs font-semibold text-red-600 hover:text-red-700">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-transparent p-0 shadow-none sm:rounded-[1rem] sm:border sm:border-[#E7ECF5] sm:bg-white sm:p-5 sm:shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Content</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Description and Search</h2>
                </div>
                <div className="grid gap-4">
                  <label className="block">
                    <SellerFieldLabel>Tags</SellerFieldLabel>
                    <input value={form.tags} onChange={(e) => setField('tags', e.target.value)} className="portal-input h-[52px] rounded-[0.8rem]" placeholder="organic, wholesale, export" />
                  </label>
                  <label className="block">
                    <SellerFieldLabel>Description</SellerFieldLabel>
                    <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} className="portal-input min-h-[140px] rounded-[0.8rem]" placeholder="Write a concise product description..." />
                  </label>
                </div>
              </section>
            </div>

            <aside className="hidden space-y-5 lg:block">
              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Live Preview</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Listing Snapshot</h2>
                <div className="mt-4 overflow-hidden rounded-[0.95rem] border border-[#E7ECF5] bg-[#FCFDFF] p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                  <div className="h-44 overflow-hidden rounded-[0.7rem] bg-[#EDEFF5]">
                    {imageUrls[0] ? <img src={imageUrls[0]} alt="Primary preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm font-medium text-[#8A94A6]">Product preview</div>}
                  </div>
                  <div className="mt-3">
                    <p className="text-lg font-semibold tracking-[-0.04em] text-[#111827]">{form.name || 'Your product name'}</p>
                    <p className="mt-1 text-sm text-[#667085]">{form.category || 'Category not selected'}</p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-xl font-semibold tracking-[-0.04em] text-[#111827]">${finalPrice.toFixed(2)}</span>
                      {normalizedDiscount > 0 ? <span className="text-sm text-[#8A94A6] line-through">${normalizedPrice.toFixed(2)}</span> : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Publish</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Final Actions</h2>
                {message.text ? (
                  <div className={`mt-4 rounded-[0.95rem] border px-3 py-2.5 text-sm ${
                    message.tone === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                ) : null}
                <div className="mt-4 space-y-3">
                  <Link href="/dashboard/seller" className="portal-outline-button hidden w-full px-4 py-3 text-center md:block">Cancel</Link>
                  <button type="submit" disabled={saving || uploadingImage} className="portal-primary-button hidden w-full px-4 py-3 md:block">
                    {uploadingImage ? 'Uploading Images...' : saving ? 'Posting...' : 'Post Product'}
                  </button>
                </div>
              </section>
            </aside>
          </form>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7ECF5] bg-white/96 px-3 py-3 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] backdrop-blur md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          <Link href="/dashboard/seller" className="flex items-center justify-center rounded-[0.95rem] border border-[#D8DFEB] bg-white px-4 py-3 text-sm font-semibold text-[#374151] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            Cancel
          </Link>
          <button
            type="submit"
            form="seller-new-product-form"
            disabled={saving || uploadingImage}
            className="rounded-[0.95rem] bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#F97316)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(124,58,237,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadingImage ? 'Uploading...' : saving ? 'Posting...' : 'Post Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
