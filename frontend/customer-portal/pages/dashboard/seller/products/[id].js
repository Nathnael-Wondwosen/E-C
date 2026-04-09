import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  getMarketplaceCategories,
  getSellerProductById,
  updateSellerProduct,
  uploadSellerProductImage,
} from '../../../../utils/userService';

export default function SellerEditProductPage() {
  const router = useRouter();
  const { id } = router.query;
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
    isNewArrival: false,
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: '', text: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    if (!isLoggedIn || userType !== 'seller') {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady || !id) return;
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      const result = await getSellerProductById(id);
      if (!mounted) return;
      if (!result?.success || !result.product) {
        setMessage({ tone: 'error', text: result?.message || 'Failed to load product.' });
        setLoading(false);
        return;
      }

      const product = result.product;
      const images = Array.isArray(product?.images)
        ? product.images.filter((url) => typeof url === 'string' && url.trim())
        : [];
      const fallback = product?.image && typeof product.image === 'string' ? [product.image] : [];
      const merged = [...new Set([...images, ...fallback])];

      setForm({
        name: product?.name || '',
        description: product?.description || '',
        countryOfOrigin: product?.countryOfOrigin || '',
        isMadeInEthiopia: Boolean(product?.isMadeInEthiopia),
        isNewArrival: Boolean(product?.isNewArrival),
        category: product?.category || '',
        price: String(product?.price ?? ''),
        discountPercentage: String(product?.discountPercentage ?? 0),
        stock: String(product?.stock ?? ''),
        sku: product?.sku || '',
        tags: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
        marketScope: String(product?.marketScope || product?.scope || 'local'),
      });
      setImageUrls(merged);
      setLoading(false);
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [router.isReady, id]);

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      const result = await getMarketplaceCategories(form.marketScope);
      if (!mounted) return;
      setCategories(result?.success ? (result.categories || []) : []);
      setCategoriesLoading(false);
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, [form.marketScope]);

  const previewImages = useMemo(() => imageUrls.filter(Boolean), [imageUrls]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    setMessage({ tone: '', text: '' });

    const nextUrls = [];
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const result = await uploadSellerProductImage(file);
      if (!result?.success || !result?.url) {
        setUploadingImage(false);
        setMessage({ tone: 'error', text: result?.message || `Failed to upload ${file.name}` });
        return;
      }
      nextUrls.push(result.url);
    }

    setImageUrls((prev) => [...new Set([...prev, ...nextUrls])]);
    setUploadingImage(false);
    setMessage({ tone: 'success', text: `${nextUrls.length} image${nextUrls.length === 1 ? '' : 's'} uploaded.` });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ tone: '', text: '' });

    const normalizedName = String(form.name || '').trim();
    const normalizedCategory = String(form.category || '').trim();
    const normalizedPrice = Number(form.price);
    const normalizedDiscount = Number(form.discountPercentage);
    const normalizedStock = Number(form.stock);

    if (!normalizedName) return setMessage({ tone: 'error', text: 'Product name is required.' });
    if (!normalizedCategory) return setMessage({ tone: 'error', text: 'Category is required.' });
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      return setMessage({ tone: 'error', text: 'Price must be a valid number greater than 0.' });
    }
    if (!Number.isFinite(normalizedDiscount) || normalizedDiscount < 0 || normalizedDiscount > 90) {
      return setMessage({ tone: 'error', text: 'Discount must be between 0 and 90.' });
    }
    if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
      return setMessage({ tone: 'error', text: 'Stock must be 0 or a positive number.' });
    }
    if (uploadingImage) {
      return setMessage({ tone: 'error', text: 'Please wait for image upload to finish.' });
    }

    const normalizedImages = imageUrls.filter((url) => typeof url === 'string' && url.trim());
    setSaving(true);
    const result = await updateSellerProduct(id, {
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
      image: normalizedImages[0] || '',
      thumbnail: normalizedImages[0] || '',
      images: normalizedImages,
      tags: String(form.tags || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      marketScope: String(form.marketScope || 'local'),
      scope: String(form.marketScope || 'local'),
    });
    setSaving(false);

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to update product.' });
      return;
    }

    setMessage({ tone: 'success', text: 'Product updated successfully.' });
    setTimeout(() => router.push('/dashboard/seller/products'), 900);
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(15,23,32,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--portal-accent)]" />
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Edit Product | Seller Dashboard</title>
      </Head>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="portal-card overflow-hidden rounded-[1.35rem]">
          <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <p className="portal-badge">Seller Tools</p>
            <h1 className="portal-heading mt-2 text-2xl font-semibold">Edit Product</h1>
            <p className="portal-muted mt-1 text-sm">Update content, details, and product image gallery.</p>
          </div>

          <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Product Name</span>
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="portal-input" required />
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
                <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="portal-input" required disabled={categoriesLoading}>
                  <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
                  {categories.map((entry) => (
                    <option key={entry.value} value={entry.value}>{entry.label}</option>
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
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">SKU</span>
                <input value={form.sku} onChange={(e) => setField('sku', e.target.value)} className="portal-input" />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Price</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} className="portal-input" required />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Stock</span>
                <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setField('stock', e.target.value)} className="portal-input" required />
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
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className="portal-input file:mr-3 file:rounded-md file:border-0 file:bg-[#F3E8FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#7E22CE]"
                />
                {uploadingImage ? <p className="mt-1 text-xs text-[#5F6773]">Uploading images...</p> : null}
              </label>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Add Image URL</span>
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
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Product Images ({previewImages.length})</span>
                {previewImages.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-3 py-6 text-center text-sm text-[#64748B]">
                    No images added yet.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {previewImages.map((url, index) => (
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
                <span className="mb-1.5 block text-sm font-medium text-[var(--auth-label)]">Tags</span>
                <input value={form.tags} onChange={(e) => setField('tags', e.target.value)} className="portal-input" placeholder="organic, wholesale, export" />
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
              <Link href="/dashboard/seller/products" className="portal-outline-button px-4 py-2 text-center">Cancel</Link>
              <button type="submit" disabled={saving || uploadingImage} className="portal-primary-button px-4 py-2">
                {uploadingImage ? 'Uploading Images...' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
