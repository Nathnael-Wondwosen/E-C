import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { createSellerProduct, getMarketplaceCategories, uploadSellerProductImage } from '../../../utils/userService';

export default function SellerNewProductPage() {
  const router = useRouter();
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
    isNewArrival: true,
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    if (!isLoggedIn || userType !== 'seller') {
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

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      scope: String(form.marketScope || 'local'),
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

  const addManualImage = () => {
    const normalized = String(manualImageUrl || '').trim();
    if (!normalized) return;
    setImageUrls((prev) => [...new Set([...prev, normalized])]);
    setManualImageUrl('');
  };

  const removeImage = (url) => {
    setImageUrls((prev) => prev.filter((entry) => entry !== url));
  };

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Post Product | Seller Dashboard</title>
      </Head>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="portal-card overflow-hidden rounded-[1.35rem]">
          <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <p className="portal-badge">Seller Tools</p>
            <h1 className="portal-heading mt-2 text-2xl font-semibold">Post New Product</h1>
            <p className="portal-muted mt-1 text-sm">Publish a product directly from your seller dashboard.</p>
          </div>

          <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Product Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="portal-input"
                  placeholder="Example: Premium Coffee Beans"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Post To Market</span>
                <select
                  value={form.marketScope}
                  onChange={(e) => {
                    const nextScope = e.target.value;
                    setForm((prev) => ({ ...prev, marketScope: nextScope, category: '' }));
                  }}
                  className="portal-input"
                >
                  <option value="local">Local Market</option>
                  <option value="global">Global Market</option>
                  <option value="africa">Africa Market</option>
                  <option value="china">China Market</option>
                  <option value="b2b">B2B Market</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="portal-input"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Country of Origin</span>
                <input
                  value={form.countryOfOrigin}
                  onChange={(e) => setField('countryOfOrigin', e.target.value)}
                  className="portal-input"
                  placeholder="Example: Ethiopia"
                />
              </label>

              <label className="flex items-center gap-2 rounded-[0.8rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(form.isMadeInEthiopia)}
                  onChange={(e) => setField('isMadeInEthiopia', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-[var(--auth-label)]">Made in Ethiopia</span>
              </label>

              <label className="flex items-center gap-2 rounded-[0.8rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(form.isNewArrival)}
                  onChange={(e) => setField('isNewArrival', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-[var(--auth-label)]">Highlight as New Arrival</span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">SKU (Optional)</span>
                <input
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                  className="portal-input"
                  placeholder="Example: AGR-COF-001"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  className="portal-input"
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Stock</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                  className="portal-input"
                  placeholder="0"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Discount % (Optional)</span>
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="0.1"
                  value={form.discountPercentage}
                  onChange={(e) => setField('discountPercentage', e.target.value)}
                  className="portal-input"
                  placeholder="0"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Upload Product Images (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className="portal-input file:mr-3 file:rounded-md file:border-0 file:bg-[#F3E8FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#7E22CE]"
                />
                {uploadStatus !== 'idle' ? (
                  <div
                    className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                      uploadStatus === 'verified'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : uploadStatus === 'not_public'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : uploadStatus === 'uploading'
                            ? 'border-sky-200 bg-sky-50 text-sky-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {uploadStatusText || uploadStatus}
                  </div>
                ) : null}
                {uploadingImage ? <p className="mt-1 text-xs text-[#5F6773]">Uploading images...</p> : null}
              </label>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Add Image URL (Optional)</span>
                <div className="flex gap-2">
                  <input
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    className="portal-input"
                    placeholder="https://..."
                  />
                  <button type="button" onClick={addManualImage} className="portal-outline-button px-4 py-2">Add</button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Product Images ({imageUrls.length})</span>
                {imageUrls.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-3 py-6 text-center text-sm text-[#64748B]">
                    No images added yet.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {imageUrls.map((url, index) => (
                      <div key={`${url}-${index}`} className="rounded-lg border border-[var(--portal-border)] bg-white p-2">
                        <img src={url} alt={`Product ${index + 1}`} className="h-28 w-full rounded object-cover" />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-[#64748B]">{index === 0 ? 'Primary' : `Image ${index + 1}`}</span>
                          <button type="button" onClick={() => removeImage(url)} className="text-xs font-semibold text-red-600 hover:text-red-700">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Tags (Optional)</span>
                <input
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                  className="portal-input"
                  placeholder="organic, wholesale, export"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="portal-input min-h-[120px]"
                  placeholder="Write a concise product description..."
                />
              </label>
            </div>

            {message.text ? (
              <div
                className={`rounded-[0.9rem] border px-3 py-2.5 text-sm ${
                  message.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/dashboard/seller" className="portal-outline-button px-4 py-2 text-center">
                Cancel
              </Link>
              <button type="submit" disabled={saving || uploadingImage} className="portal-primary-button px-4 py-2">
                {uploadingImage ? 'Uploading Images...' : saving ? 'Posting...' : 'Post Product'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
