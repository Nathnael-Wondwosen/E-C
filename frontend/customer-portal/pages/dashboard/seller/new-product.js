import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { createSellerProduct, getMarketplaceCategories, uploadSellerProductImage } from '../../../utils/userService';

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

  const normalizedPrice = Number(form.price) || 0;
  const normalizedDiscount = Number(form.discountPercentage) || 0;
  const finalPrice = normalizedPrice > 0
    ? Math.max(0, normalizedPrice - ((normalizedPrice * normalizedDiscount) / 100))
    : 0;

  return (
    <div className="portal-page min-h-screen bg-[linear-gradient(180deg,#F8FAFF_0%,#F3F6FF_36%,#EEF3FF_100%)]">
      <Head>
        <title>Post Product | Seller Dashboard</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-[1.4rem] border border-[#E7ECF5] bg-[#F8FAFF] p-3 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Seller Product</p>
              <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-[#111827]">Post New Product</h1>
            </div>
            <Link href="/dashboard/seller" className="inline-flex rounded-full border border-[#D9E0FF] bg-white px-4 py-2 text-xs font-semibold text-[#374151]">
              Back to Dashboard
            </Link>
          </div>

          <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="mb-4">
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

                  <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-[0.8rem] border border-[#E7ECF5] bg-[#FCFDFF] px-4 py-3">
                      <input type="checkbox" checked={Boolean(form.isMadeInEthiopia)} onChange={(e) => setField('isMadeInEthiopia', e.target.checked)} className="h-4 w-4" />
                      <span className="text-sm font-medium text-[#374151]">Made in Ethiopia</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-[0.8rem] border border-[#E7ECF5] bg-[#FCFDFF] px-4 py-3">
                      <input type="checkbox" checked={Boolean(form.isNewArrival)} onChange={(e) => setField('isNewArrival', e.target.checked)} className="h-4 w-4" />
                      <span className="text-sm font-medium text-[#374151]">Highlight as New Arrival</span>
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="mb-4">
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

              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">Gallery</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">Images and Media</h2>
                </div>
                <div className="grid gap-4">
                  <label className="block">
                    <SellerFieldLabel>Upload Product Images</SellerFieldLabel>
                    <SellerInputShell>
                      <input type="file" accept="image/*" multiple onChange={handleImageFileChange} className="portal-input file:mr-3 file:rounded-md file:border-0 file:bg-[#F3E8FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#7E22CE]" />
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
                          <div key={`${url}-${index}`} className="overflow-hidden rounded-[0.9rem] border border-[#E7ECF5] bg-white p-2 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
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

              <section className="rounded-[1rem] border border-[#E7ECF5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="mb-4">
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

            <aside className="space-y-5">
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
                  <Link href="/dashboard/seller" className="portal-outline-button block w-full px-4 py-3 text-center">Cancel</Link>
                  <button type="submit" disabled={saving || uploadingImage} className="portal-primary-button w-full px-4 py-3">
                    {uploadingImage ? 'Uploading Images...' : saving ? 'Posting...' : 'Post Product'}
                  </button>
                </div>
              </section>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
}
