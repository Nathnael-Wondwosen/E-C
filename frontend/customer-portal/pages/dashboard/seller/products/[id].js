import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  deleteSellerProduct,
  getMarketplaceCategories,
  getProductReviews,
  getSellerProductById,
  getUserInquiryInbox,
  replyToProductInquiry,
  updateSellerProduct,
  updateUserInquiryStatus,
  uploadSellerProductImage
} from '../../../../utils/userService';
import { getRequiredCustomerSession } from '../../../../utils/session';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => index < Math.round(Number(rating || 0)));

function ProductWorkspaceNavItem ({ href, label, active = false, children }) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-0.5 py-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
        active ? 'bg-[rgba(124,58,237,0.12)] text-[#7C3AED]' : 'text-slate-400'
      }`}>
        {children}
      </span>
      <span className={`text-[10px] font-semibold ${active ? 'text-[#7C3AED]' : 'text-slate-700'}`}>
        {label}
      </span>
    </Link>
  );
}

export default function SellerEditProductPage () {
  const router = useRouter();
  const { id } = router.query;
  const [sellerUserId, setSellerUserId] = useState('');
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
    isNewArrival: false
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState({ totalReviews: 0, averageRating: 0 });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyActionState, setReplyActionState] = useState({});
  const [statusActionState, setStatusActionState] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = getRequiredCustomerSession('seller');
    if (!session.loggedIn) {
      router.replace('/login');
      return;
    }
    setSellerUserId(String(session.userId || '').trim());
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
        marketScope: String(product?.marketScope || product?.scope || 'local')
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
  const totalInquiryCount = inquiries.length;
  const totalReviewCount = Number(reviewSummary?.totalReviews || reviews.length || 0);
  const averageRating = Number(reviewSummary?.averageRating || 0);
  const openInquiryCount = useMemo(
    () => inquiries.filter((entry) => String(entry?.status || 'new').toLowerCase() !== 'closed').length,
    [inquiries]
  );
  const needsReplyCount = useMemo(
    () => inquiries.filter((entry) => {
      const status = String(entry?.status || 'new').toLowerCase();
      if (status === 'closed') return false;
      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
      const latest = messages.length ? messages[messages.length - 1] : null;
      return status === 'new' || String(latest?.senderRole || '').toLowerCase() === 'buyer';
    }).length,
    [inquiries]
  );

  useEffect(() => {
    if (!sellerUserId || !id) return;
    let mounted = true;

    const loadProductInquiries = async () => {
      setInquiriesLoading(true);
      try {
        const result = await getUserInquiryInbox(sellerUserId);
        if (!mounted) return;
        const filtered = Array.isArray(result?.inquiries)
          ? result.inquiries.filter((entry) => String(entry?.productId || '') === String(id))
          : [];
        setInquiries(filtered);
      } catch {
        if (mounted) setInquiries([]);
      } finally {
        if (mounted) setInquiriesLoading(false);
      }
    };

    loadProductInquiries();
    return () => {
      mounted = false;
    };
  }, [sellerUserId, id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      const result = await getProductReviews(id);
      if (!mounted) return;
      if (!result?.success) {
        setReviews([]);
        setReviewSummary({ totalReviews: 0, averageRating: 0 });
        setReviewsLoading(false);
        return;
      }
      setReviews(Array.isArray(result.reviews) ? result.reviews : []);
      setReviewSummary(result.summary || { totalReviews: 0, averageRating: 0 });
      setReviewsLoading(false);
    };

    loadReviews();
    return () => {
      mounted = false;
    };
  }, [id]);

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

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${form.name || 'this product'}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    const result = await deleteSellerProduct(id);
    setDeleting(false);

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to delete product.' });
      return;
    }

    router.push('/dashboard/seller/products');
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
      scope: String(form.marketScope || 'local')
    });
    setSaving(false);

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to update product.' });
      return;
    }

    setMessage({ tone: 'success', text: 'Product updated successfully.' });
    setTimeout(() => router.push('/dashboard/seller/products'), 900);
  };

  const handleInquiryStatusUpdate = async (inquiryId, nextStatus) => {
    if (!sellerUserId || !inquiryId) return;
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await updateUserInquiryStatus(sellerUserId, inquiryId, nextStatus);
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: false }));

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to update inquiry status.' });
      return;
    }

    setInquiries((prev) =>
      prev.map((entry) => (String(entry?.id || entry?._id) === String(inquiryId) ? (result.inquiry || { ...entry, status: nextStatus }) : entry))
    );
  };

  const handleReplySubmit = async (inquiryId) => {
    const draft = String(replyDrafts[inquiryId] || '').trim();
    if (!draft) return;

    setReplyActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await replyToProductInquiry(inquiryId, draft);
    setReplyActionState((prev) => ({ ...prev, [inquiryId]: false }));

    if (!result?.success || !result?.inquiry) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to send reply.' });
      return;
    }

    setInquiries((prev) =>
      prev.map((entry) => (String(entry?.id || entry?._id) === String(inquiryId) ? result.inquiry : entry))
    );
    setReplyDrafts((prev) => ({ ...prev, [inquiryId]: '' }));
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#F8FAFF_0%,#F1F5FF_42%,#EEF3FF_100%)]">
        <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-5 py-3 text-sm font-medium text-[#111827] shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#6366F1]" />
          Loading product workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F8FAFF_0%,#F1F5FF_42%,#EEF3FF_100%)]">
      <Head>
        <title>{form.name ? `${form.name} | Seller Workspace` : 'Product Workspace | Seller Dashboard'}</title>
      </Head>

      <main className="mx-auto max-w-6xl px-0 py-0 pb-24 sm:px-4 sm:py-5 sm:pb-8 lg:px-6 lg:py-8">
        <section className="px-4 pt-4 sm:px-0 sm:pt-0">
          <div className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/84 px-4 pb-4 pt-4 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6 sm:pb-6 sm:pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Product Workspace</p>
                <h1 className="mt-2 line-clamp-2 text-[1.9rem] font-semibold tracking-[-0.06em] text-[#111827] sm:text-[2.3rem]">
                  {form.name || 'Untitled Product'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                  Manage the listing, gallery, customer questions, and visibility of this product from one cleaner seller workspace.
                </p>
              </div>
              <Link href="/dashboard/seller/products" className="inline-flex h-11 shrink-0 items-center rounded-full border border-[#D7E0EC] bg-white px-4 text-sm font-semibold text-[#334155]">
                Back
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              <div className="rounded-[1.1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Price</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">{formatPrice(form.price)}</p>
              </div>
              <div className="rounded-[1.1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Stock</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">{Number(form.stock || 0)}</p>
              </div>
              <div className="rounded-[1.1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Inquiries</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">{totalInquiryCount}</p>
              </div>
              <div className="hidden rounded-[1.1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3 sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Need Reply</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">{needsReplyCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 px-4 sm:px-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/84 shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="border-b border-[#E5E9F5] px-4 py-4 sm:px-5">
              <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#111827]">Product Details</h2>
              <p className="mt-1 text-sm text-[#667085]">Update listing content, prices, stock, and marketplace placement.</p>
            </div>

            <form className="space-y-4 p-4 sm:p-5" onSubmit={handleSubmit}>
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

              <div className="grid gap-2 sm:grid-cols-3">
                <Link href={`/products/${encodeURIComponent(String(id || ''))}`} className="portal-outline-button px-4 py-2.5 text-center text-sm">Public View</Link>
                <button type="button" onClick={handleDelete} disabled={deleting} className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60">
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
                <button type="submit" disabled={saving || uploadingImage} className="portal-primary-button px-4 py-2.5 text-sm">
                  {uploadingImage ? 'Uploading Images...' : saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </section>

          <section className="space-y-4">
            <div className="overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/84 shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="border-b border-[#E5E9F5] px-4 py-4 sm:px-5">
                <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#111827]">Ratings & Reviews</h2>
                <p className="mt-1 text-sm text-[#667085]">Buyer sentiment, comments, and product credibility signals in one place.</p>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="rounded-[1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Average Rating</p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-xl font-semibold text-[#111827]">{averageRating.toFixed(1)}</p>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {renderStars(averageRating).map((filled, index) => (
                          <span key={`avg-star-${index}`} className={filled ? 'opacity-100' : 'opacity-30'}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Review Count</p>
                    <p className="mt-2 text-xl font-semibold text-[#111827]">{totalReviewCount}</p>
                  </div>
                </div>

                {reviewsLoading ? (
                  <p className="text-sm text-[#667085]">Loading buyer feedback...</p>
                ) : reviews.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-[#D7E0EC] bg-[#F8FAFF] px-4 py-8 text-center text-sm text-[#64748B]">
                    No ratings or review comments yet for this product.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.slice(0, 4).map((review, index) => (
                      <article key={String(review?.id || review?._id || `${review?.createdAt || ''}-${index}`)} className="rounded-[1.05rem] border border-[#E5E9F5] bg-[#FAFCFF] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">
                              {review?.user?.name || review?.author?.name || review?.name || 'Verified customer'}
                            </p>
                            <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                              {renderStars(review?.rating).map((filled, starIndex) => (
                                <span key={`review-star-${index}-${starIndex}`} className={`text-sm ${filled ? 'opacity-100' : 'opacity-30'}`}>★</span>
                              ))}
                              <span className="ml-1 text-[11px] font-semibold text-amber-600">
                                {Number(review?.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#7A869A]">
                            {formatDateTime(review?.createdAt || review?.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#334155]">
                          {review?.comment || review?.text || 'No written comment.'}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/84 shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="border-b border-[#E5E9F5] px-4 py-4 sm:px-5">
                <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#111827]">Customer Messages</h2>
                <p className="mt-1 text-sm text-[#667085]">Questions and replies connected to this exact product.</p>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Open Threads</p>
                    <p className="mt-2 text-lg font-semibold text-[#111827]">{openInquiryCount}</p>
                  </div>
                  <div className="rounded-[1rem] border border-[#E5E9F5] bg-[#F8FAFF] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Need Reply</p>
                    <p className="mt-2 text-lg font-semibold text-[#111827]">{needsReplyCount}</p>
                  </div>
                </div>

                {inquiriesLoading ? (
                  <p className="text-sm text-[#667085]">Loading product messages...</p>
                ) : inquiries.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-[#D7E0EC] bg-[#F8FAFF] px-4 py-8 text-center text-sm text-[#64748B]">
                    No customer inquiries for this product yet.
                  </div>
                ) : (
                  inquiries
                    .slice()
                    .sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime())
                    .map((entry) => {
                      const inquiryId = String(entry?.id || entry?._id || '');
                      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
                      const latestMessage = messages.length ? messages[messages.length - 1] : null;

                      return (
                        <article key={inquiryId} className="rounded-[1.05rem] border border-[#E5E9F5] bg-[#FAFCFF] p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">{entry?.buyer?.name || 'Unknown customer'}</p>
                              <p className="mt-1 text-[12px] text-[#667085]">{entry?.buyer?.email || entry?.buyerId || '-'}</p>
                            </div>
                            <span className="rounded-full border border-[#D7E0EC] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475467]">
                              {String(entry?.status || 'new')}
                            </span>
                          </div>

                          <div className="mt-3 rounded-[0.95rem] bg-white px-3 py-3 text-sm leading-6 text-[#334155] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                            {latestMessage?.text || entry?.message || 'No message content.'}
                          </div>

                          <p className="mt-2 text-[12px] text-[#7A869A]">
                            Updated {formatDateTime(entry?.updatedAt || entry?.createdAt)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={statusActionState[inquiryId]}
                              onClick={() => handleInquiryStatusUpdate(inquiryId, 'contacted')}
                              className="rounded-[0.85rem] border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700 disabled:opacity-60"
                            >
                              Contacted
                            </button>
                            <button
                              type="button"
                              disabled={statusActionState[inquiryId]}
                              onClick={() => handleInquiryStatusUpdate(inquiryId, 'closed')}
                              className="rounded-[0.85rem] border border-emerald-300 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 disabled:opacity-60"
                            >
                              Close
                            </button>
                            {entry?.buyer?.phone ? (
                              <a href={`tel:${entry.buyer.phone}`} className="rounded-[0.85rem] border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] font-semibold text-sky-700">
                                Call
                              </a>
                            ) : null}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <input
                              value={replyDrafts[inquiryId] || ''}
                              onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [inquiryId]: event.target.value }))}
                              placeholder="Reply to this buyer..."
                              className="h-10 flex-1 rounded-[0.95rem] border border-[#D7E0EC] bg-white px-3 text-sm text-[#334155] placeholder:text-[#8A97A9]"
                            />
                            <button
                              type="button"
                              disabled={replyActionState[inquiryId] || !String(replyDrafts[inquiryId] || '').trim()}
                              onClick={() => handleReplySubmit(inquiryId)}
                              className="inline-flex h-10 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,#6D28D9,#8B5CF6)] px-4 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              {replyActionState[inquiryId] ? '...' : 'Reply'}
                            </button>
                          </div>
                        </article>
                      );
                    })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8E1EA] bg-white/95 shadow-[0_-10px_35px_rgba(15,23,32,0.08)] backdrop-blur sm:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <ProductWorkspaceNavItem href="/dashboard/seller" label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10v8.5h11V10" />
            </svg>
          </ProductWorkspaceNavItem>
          <ProductWorkspaceNavItem href="/inquiries" label="Messages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16v10H8l-4 3V6.5Z" />
            </svg>
          </ProductWorkspaceNavItem>
          <Link href="/dashboard/seller/new-product" className="relative flex flex-col items-center justify-center gap-0 py-1" aria-label="Open advanced product form">
            <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#A855F7)] text-white shadow-[0_18px_36px_rgba(124,58,237,0.34)] transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="mt-[-6px] text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
              Post
            </span>
          </Link>
          <ProductWorkspaceNavItem href="/dashboard/seller/products" label="Store" active>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14l-1 11H6L5 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 1 1 6 0" />
            </svg>
          </ProductWorkspaceNavItem>
          <ProductWorkspaceNavItem href="/profile" label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
          </ProductWorkspaceNavItem>
        </div>
      </nav>
    </div>
  );
}
