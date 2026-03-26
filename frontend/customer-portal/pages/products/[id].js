import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/header/Header';
import { getProductsPage } from '../../utils/heroDataService';
import {
  addToCart,
  addToWishlist,
  getProductById,
  submitProductInquiry,
  getUserWishlist,
  removeFromWishlist
} from '../../utils/userService';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const toText = (value, fallback = '-') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const normalizePositiveNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) return fallback;
  return numeric;
};

const getProductImage = (item) => {
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images[0];
  return item?.image || '';
};

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [actionLoading, setActionLoading] = useState({ cart: false, wishlist: false });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [inquiry, setInquiry] = useState({
    quantity: '1',
    message: ''
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const payload = await getProductById(id);
        if (!mounted) return;
        setProduct({
          ...payload,
          id: String(payload?.id || payload?._id || id)
        });
        setSelectedImageIndex(0);
      } catch {
        if (!mounted) return;
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (typeof window === 'undefined') return;
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const result = await getUserWishlist(userId);
      setWishlistItems(result?.items || []);
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    if (!product?.id) return;
    let mounted = true;
    const loadRelatedProducts = async () => {
      setIsRelatedLoading(true);
      try {
        const result = await getProductsPage(1, 72);
        if (!mounted) return;
        const categoryToken = String(product?.category?.name || product?.category || '').toLowerCase();
        const currentId = String(product.id);
        const candidates = (result?.items || [])
          .map((item) => ({ ...item, id: String(item?._id || item?.id || '') }))
          .filter((item) => item.id && item.id !== currentId)
          .filter((item) => item.productType !== 'B2B');

        const sameCategory = candidates.filter((item) => {
          const token = String(item?.category?.name || item?.category || '').toLowerCase();
          return categoryToken && token === categoryToken;
        });
        const fallbackPool = sameCategory.length > 0 ? sameCategory : candidates;
        setRelatedProducts(fallbackPool.slice(0, 4));
      } catch {
        if (!mounted) return;
        setRelatedProducts([]);
      } finally {
        if (mounted) setIsRelatedLoading(false);
      }
    };

    loadRelatedProducts();
    return () => {
      mounted = false;
    };
  }, [product?.id, product?.category?.name, product?.category]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const selectedImage = galleryImages[selectedImageIndex] || '';
  const isWishlisted = useMemo(
    () => wishlistItems.some((item) => String(item.productId || item.id || item._id || item) === String(product?.id)),
    [wishlistItems, product?.id]
  );

  const supplierName = toText(product?.supplierName || product?.seller || product?.companyName, 'Verified Supplier');
  const supplierYears = toText(product?.supplierYears || product?.yearsInBusiness, '8 Years');
  const supplierCountry = toText(product?.origin || product?.country || product?.countryOfOrigin, 'China');
  const supplierOwnerUserId = toText(
    product?.supplierId || product?.companyId || product?.ownerId || product?.sellerId || product?.createdBy,
    ''
  );
  const moq = normalizePositiveNumber(product?.moq, 1);
  const leadTime = toText(product?.leadTime, '15-25 days');
  const stock = normalizePositiveNumber(product?.stock, 0);
  const unitPrice = normalizePositiveNumber(product?.price, 0);
  const inquiryQuantity = Math.max(moq, normalizePositiveNumber(inquiry.quantity, moq));
  const productCategory = toText(product?.category?.name || product?.category, 'General Machinery');
  const modelNo = toText(product?.modelNo || product?.sku, `MDL-${String(product?.id || '').slice(-6).toUpperCase()}`);
  const hsCode = toText(product?.hsCode || product?.tariffCode, '8477.1000');
  const paymentTerms = toText(product?.paymentTerms, 'T/T, L/C');
  const supplyAbility = toText(product?.supplyAbility, '120 Sets / Month');
  const packageDetails = toText(product?.package || product?.packaging, 'Seaworthy wooden case');
  const dispatchPort = toText(product?.port || product?.shippingPort, 'Shanghai');
  const averageRating = normalizePositiveNumber(product?.rating, 4.7);
  const reviewCount = normalizePositiveNumber(product?.reviewCount, 32);
  const responseHours = normalizePositiveNumber(product?.responseHours, 4);

  const featureList = useMemo(() => {
    if (Array.isArray(product?.tags) && product.tags.length) return product.tags.slice(0, 8);
    return [
      'Industrial grade production',
      'Stable high-speed cycle',
      'Low maintenance design',
      'Support for OEM requirements'
    ];
  }, [product?.tags]);

  const specificationRows = useMemo(() => {
    const entries = product?.specifications && typeof product.specifications === 'object'
      ? Object.entries(product.specifications)
      : [];

    if (entries.length) {
      return entries.map(([key, value]) => [toText(key), toText(value)]);
    }

    return [
      ['Model No.', modelNo],
      ['Category', productCategory],
      ['MOQ', `${moq} Unit(s)`],
      ['Lead Time', leadTime],
      ['Stock Status', stock > 0 ? `${stock} Unit(s) Available` : 'On-demand manufacturing'],
      ['Origin', supplierCountry],
      ['HS Code', hsCode],
      ['Payment Terms', paymentTerms],
      ['Supply Ability', supplyAbility],
      ['Packaging Details', packageDetails],
      ['Port', dispatchPort]
    ];
  }, [product, modelNo, productCategory, moq, leadTime, stock, supplierCountry, hsCode, paymentTerms, supplyAbility, packageDetails, dispatchPort]);

  const pricingTiers = useMemo(() => {
    const tiers = Array.isArray(product?.pricingTiers) ? product.pricingTiers : [];
    if (tiers.length) {
      return tiers
        .map((tier) => ({
          minQty: normalizePositiveNumber(tier?.minQty, moq),
          maxQty: tier?.maxQty ? normalizePositiveNumber(tier.maxQty, 0) : 0,
          unitPrice: normalizePositiveNumber(tier?.unitPrice, unitPrice)
        }))
        .sort((a, b) => a.minQty - b.minQty);
    }

    const midPrice = unitPrice > 0 ? Number((unitPrice * 0.96).toFixed(2)) : unitPrice;
    const highPrice = unitPrice > 0 ? Number((unitPrice * 0.92).toFixed(2)) : unitPrice;
    return [
      { minQty: moq, maxQty: moq * 4, unitPrice },
      { minQty: moq * 5, maxQty: moq * 9, unitPrice: midPrice },
      { minQty: moq * 10, maxQty: 0, unitPrice: highPrice }
    ];
  }, [product?.pricingTiers, moq, unitPrice]);

  const quantityLevelPrice = useMemo(() => {
    const matchingTier = pricingTiers.find((tier) => {
      if (!tier.maxQty) return inquiryQuantity >= tier.minQty;
      return inquiryQuantity >= tier.minQty && inquiryQuantity <= tier.maxQty;
    });
    return matchingTier?.unitPrice || unitPrice;
  }, [pricingTiers, inquiryQuantity, unitPrice]);

  const quantityBasedTotal = Number((quantityLevelPrice * inquiryQuantity).toFixed(2));
  const savingsPercent = unitPrice > 0 ? Math.max(0, Math.round(((unitPrice - quantityLevelPrice) / unitPrice) * 100)) : 0;
  const canBrowseGallery = galleryImages.length > 1;

  const goToPrevImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleImageTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX || 0);
  };

  const handleImageTouchEnd = (event) => {
    if (!canBrowseGallery || !touchStartX) return;
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < 35) return;
    if (distance > 0) {
      goToPrevImage();
    } else {
      goToNextImage();
    }
    setTouchStartX(0);
  };

  const ensureLoggedInUser = () => {
    if (typeof window === 'undefined') return '';
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!userId || !isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', router.asPath);
      router.push('/login');
      return '';
    }
    return userId;
  };

  const refreshWishlist = async (userId) => {
    const result = await getUserWishlist(userId);
    setWishlistItems(result?.items || []);
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    const userId = ensureLoggedInUser();
    if (!userId) return;

    const quantity = inquiryQuantity;
    setActionLoading((prev) => ({ ...prev, cart: true }));
    setMessage('');
    const result = await addToCart(userId, product.id, quantity);
    setActionLoading((prev) => ({ ...prev, cart: false }));
    if (!result?.success) {
      setMessage(result?.message || 'Could not add product to cart.');
      return;
    }
    setMessage('Product added to cart successfully.');
  };

  const handleToggleWishlist = async () => {
    if (!product?.id) return;
    const userId = ensureLoggedInUser();
    if (!userId) return;

    setActionLoading((prev) => ({ ...prev, wishlist: true }));
    setMessage('');
    const result = isWishlisted
      ? await removeFromWishlist(userId, product.id)
      : await addToWishlist(userId, product.id);
    setActionLoading((prev) => ({ ...prev, wishlist: false }));
    if (!result?.success) {
      setMessage(result?.message || 'Could not update wishlist.');
      return;
    }

    await refreshWishlist(userId);
    setMessage(isWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.');
  };

  const handleInquirySubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const userId = ensureLoggedInUser();
    if (!userId) {
      const quantity = inquiryQuantity;
      const base = inquiry.message.trim() || `I am interested in ${product?.name}.`;
      const text = `${base}\n\nRequested Quantity: ${quantity}\nProduct ID: ${product?.id}`;
      const encoded = encodeURIComponent(text);
      router.push(`/login?next=${encodeURIComponent(router.asPath)}&inquiry=${encoded}`);
      return;
    }

    if (!supplierOwnerUserId) {
      setMessage('Supplier contact is not configured for this product yet.');
      return;
    }

    const result = await submitProductInquiry({
      productId: product?.id,
      supplierId: supplierOwnerUserId,
      quantity: inquiryQuantity,
      message: inquiry.message.trim() || `I am interested in ${product?.name}.`
    });
    if (!result?.success) {
      setMessage(result?.message || 'Failed to send inquiry.');
      return;
    }

    setMessage('Inquiry sent to this product owner successfully.');
    setInquiry((prev) => ({ ...prev, message: '' }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsImagePreviewOpen(false);
        return;
      }
      if (!canBrowseGallery) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevImage();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextImage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canBrowseGallery, galleryImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-cyan-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
            <p className="mt-2 text-sm text-slate-600">This item may have been removed or is outside your current market scope.</p>
            <Link href="/marketplace" className="mt-5 inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <Head>
        <title>{product.name} | TradeEthiopia</title>
        <meta name="description" content={product.description || `${product.name} product detail`} />
      </Head>

      <Header />

      <main className="mx-auto w-full max-w-[1360px] px-3 py-4 sm:px-5 lg:py-6">
        <div className="mb-4 rounded border border-[#e4e7ec] bg-white px-4 py-3 text-xs text-slate-500">
          <Link href="/dashboard/customer" className="hover:text-[#e2611a]">Dashboard</Link> /{' '}
          <Link href="/marketplace" className="hover:text-[#e2611a]">Marketplace</Link> /{' '}
          <span className="text-slate-700">{productCategory}</span> /{' '}
          <span className="font-semibold text-slate-900">{product.name}</span>
        </div>

        {message && (
          <div className="mb-4 rounded border border-[#ffd8c3] bg-[#fff6f1] px-3 py-2 text-sm text-[#ad4a16]">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.08fr_0.82fr]">
          <div className="rounded border border-[#dfe3e8] bg-white p-3">
            <div className="grid grid-cols-[84px_1fr] gap-3">
              <div className="space-y-2 overflow-y-auto pr-1">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, idx) => (
                    <button
                      key={`${image}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-[74px] w-[74px] overflow-hidden rounded border ${selectedImageIndex === idx ? 'border-[#e2611a]' : 'border-[#dfe3e8]'}`}
                    >
                      <img src={image} alt={`${product.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))
                ) : (
                  <div className="h-[74px] w-[74px] rounded border border-dashed border-slate-300 bg-slate-50" />
                )}
              </div>

              <div
                className="relative overflow-hidden rounded border border-[#dfe3e8] bg-[#f8fafc]"
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
              >
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt={product.name}
                      loading="lazy"
                      className="h-[430px] w-full cursor-zoom-in object-contain transition duration-300 hover:scale-[1.04]"
                      onClick={() => setIsImagePreviewOpen(true)}
                    />
                    {canBrowseGallery && (
                      <>
                        <button
                          type="button"
                          onClick={goToPrevImage}
                          aria-label="Previous image"
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1.5 text-sm font-bold text-slate-700 shadow hover:bg-white"
                        >
                          {'<'}
                        </button>
                        <button
                          type="button"
                          onClick={goToNextImage}
                          aria-label="Next image"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1.5 text-sm font-bold text-slate-700 shadow hover:bg-white"
                        >
                          {'>'}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-[430px] items-center justify-center text-sm text-slate-500">No image available</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded border border-[#dfe3e8] bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-[#fff2e8] px-2 py-1 font-semibold text-[#d94c00]">Verified Supplier</span>
              <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">{productCategory}</span>
              <span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{stock > 0 ? 'Ready Stock' : 'Build to Order'}</span>
            </div>

            <h1 className="text-[24px] font-bold leading-snug text-slate-900">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Model No.: {modelNo}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Rating {averageRating.toFixed(1)} / 5.0</span>
              <span>{reviewCount}+ Reviews</span>
            </div>

            <div className="mt-4 rounded border border-[#ffd6bf] bg-[#fff7f2] p-3">
              <p className="text-xs text-slate-600">Reference FOB Price (Port: {dispatchPort})</p>
              <p className="text-3xl font-bold text-[#d94c00]">{formatMoney(unitPrice)}</p>
              <p className="mt-1 text-xs text-slate-600">Min. Order: <span className="font-semibold">{moq} Unit(s)</span></p>
            </div>

            <div className="mt-4 overflow-hidden rounded border border-[#dfe3e8]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7f9fc] text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Quantity</th>
                    <th className="px-3 py-2 text-left font-semibold">Unit Price</th>
                    <th className="px-3 py-2 text-left font-semibold">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => {
                    const isOpenEnded = !tier.maxQty;
                    const range = isOpenEnded ? `${tier.minQty}+ Units` : `${tier.minQty}-${tier.maxQty} Units`;
                    const discount = unitPrice > 0 ? Math.max(0, Math.round(((unitPrice - tier.unitPrice) / unitPrice) * 100)) : 0;
                    return (
                      <tr key={`${tier.minQty}-${tier.maxQty || 'plus'}`} className="border-t border-[#eef2f6]">
                        <td className="px-3 py-2 font-medium text-slate-700">{range}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{formatMoney(tier.unitPrice)}</td>
                        <td className="px-3 py-2 text-emerald-700">{discount > 0 ? `${discount}% OFF` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Lead Time</p>
                <p className="font-semibold text-slate-800">{leadTime}</p>
              </div>
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Origin</p>
                <p className="font-semibold text-slate-800">{supplierCountry}</p>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-800">Key Features</h2>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                {featureList.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#e2611a]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={handleAddToCart}
                disabled={actionLoading.cart}
                className="rounded bg-[#e2611a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#cb5313] disabled:opacity-60"
              >
                {actionLoading.cart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={handleInquirySubmit}
                disabled={!supplierOwnerUserId}
                className="rounded border border-[#e2611a] bg-white px-4 py-2 text-sm font-semibold text-[#e2611a] hover:bg-[#fff5ef] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send Inquiry
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={actionLoading.wishlist}
                className={`rounded border px-4 py-2 text-sm font-semibold ${
                  isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700'
                } disabled:opacity-60`}
              >
                {isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
              </button>
            </div>
          </div>

          <aside className="h-fit rounded border border-[#dfe3e8] bg-white p-4 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Supplier Profile</h2>
            <p className="mt-2 text-lg font-bold text-slate-900">{supplierName}</p>
            <p className="text-sm text-slate-600">{supplierYears} experience | {supplierCountry}</p>

            <div className="mt-3 grid gap-2 text-xs text-slate-600">
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">Response time: within {responseHours}h</div>
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">Trade assurance available</div>
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">Support: OEM/ODM customization</div>
            </div>
            {!supplierOwnerUserId && (
              <p className="mt-2 text-xs text-amber-700">
                Supplier contact for this listing is not configured yet.
              </p>
            )}

            <form onSubmit={handleInquirySubmit} className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-600">Inquiry Quantity (Units)</label>
              <input
                type="number"
                min="1"
                value={inquiry.quantity}
                onChange={(e) => setInquiry((prev) => ({ ...prev, quantity: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder={`Min ${moq}`}
              />

              <label className="block text-xs font-semibold text-slate-600">Message</label>
              <textarea
                rows={4}
                value={inquiry.message}
                onChange={(e) => setInquiry((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Tell supplier your requirements..."
              />

              <div className="rounded border border-[#ffd6bf] bg-[#fff7f2] px-3 py-2 text-xs text-[#ad4a16]">
                Quote Preview:
                <span className="ml-1 font-bold">{formatMoney(quantityLevelPrice)}</span> x {inquiryQuantity} ={' '}
                <span className="font-bold">{formatMoney(quantityBasedTotal)}</span>
                {savingsPercent > 0 ? <span className="ml-1 text-emerald-700">({savingsPercent}% tier discount)</span> : null}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2 py-2 text-slate-600">
                  <p className="text-slate-500">Supply</p>
                  <p className="font-semibold text-slate-800">{supplyAbility}</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2 py-2 text-slate-600">
                  <p className="text-slate-500">Payment</p>
                  <p className="font-semibold text-slate-800">{paymentTerms}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!supplierOwnerUserId}
                className="w-full rounded bg-[#e2611a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#cb5313] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {supplierOwnerUserId ? 'Contact Supplier' : 'Supplier Contact Unavailable'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Marketplace
              </button>
            </form>
          </aside>
        </section>

        <section className="mt-5 rounded border border-[#dfe3e8] bg-white">
          <div className="flex flex-wrap border-b border-[#dfe3e8]">
            {[
              ['overview', 'Product Description'],
              ['specs', 'Technical Specifications'],
              ['trade', 'Trade Information'],
              ['supplier', 'Supplier Details']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 text-sm font-semibold ${activeTab === key ? 'border-b-2 border-[#e2611a] text-[#e2611a]' : 'text-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="p-4 text-sm leading-7 text-slate-700">
              <p>{toText(product.description, 'Detailed commercial description will be provided by supplier upon inquiry.')}</p>
              <p className="mt-3">
                This product listing supports bulk procurement workflows. Submit quantity and technical requirements to receive a formal quotation.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-200 text-sm">
                  <tbody>
                    {specificationRows.map(([label, value]) => (
                      <tr key={label} className="border-b border-slate-200">
                        <td className="w-[260px] bg-slate-50 px-3 py-2 font-semibold text-slate-700">{label}</td>
                        <td className="px-3 py-2 text-slate-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="p-4">
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Min Order Quantity</p>
                  <p className="font-semibold">{moq} Unit(s)</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Supply Ability</p>
                  <p className="font-semibold">{supplyAbility}</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Payment Terms</p>
                  <p className="font-semibold">{paymentTerms}</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Packaging Details</p>
                  <p className="font-semibold">{packageDetails}</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Dispatch Port</p>
                  <p className="font-semibold">{dispatchPort}</p>
                </div>
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">HS Code</p>
                  <p className="font-semibold">{hsCode}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="p-4 text-sm text-slate-700">
              <p><span className="font-semibold">Supplier:</span> {supplierName}</p>
              <p className="mt-1"><span className="font-semibold">Business Tenure:</span> {supplierYears}</p>
              <p className="mt-1"><span className="font-semibold">Location:</span> {supplierCountry}</p>
              <p className="mt-1"><span className="font-semibold">Primary Category:</span> {productCategory}</p>
              <p className="mt-1"><span className="font-semibold">Typical Response Time:</span> within {responseHours} hours</p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded border border-[#dfe3e8] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Similar Products</h2>
            <Link href="/products" className="text-sm font-semibold text-[#e2611a] hover:text-[#cb5313]">
              View all
            </Link>
          </div>

          {isRelatedLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((slot) => (
                <div key={slot} className="animate-pulse rounded border border-[#e9edf2] p-3">
                  <div className="h-32 rounded bg-slate-200" />
                  <div className="mt-3 h-3 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-slate-300" />
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="rounded border border-[#e9edf2] p-3 transition hover:border-[#e2611a]/40 hover:shadow-sm"
                >
                  <div className="flex h-32 items-center justify-center overflow-hidden rounded bg-slate-100">
                    {getProductImage(item) ? (
                      <img src={getProductImage(item)} alt={toText(item.name, 'Product')} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">{toText(item.name, 'Unnamed product')}</p>
                  <p className="mt-1 text-xs text-slate-500">{toText(item?.category?.name || item?.category, 'General')}</p>
                  <p className="mt-2 text-sm font-bold text-[#d94c00]">{formatMoney(item.price || 0)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No similar products found yet.
            </div>
          )}
        </section>
      </main>

      {isImagePreviewOpen && selectedImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsImagePreviewOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter') {
              setIsImagePreviewOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"
        >
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={selectedImage}
              alt={`${product.name} preview`}
              className="max-h-[88vh] w-full rounded bg-white object-contain"
            />
            {canBrowseGallery && (
              <>
                <button
                  type="button"
                  onClick={goToPrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow"
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow"
                >
                  {'>'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute right-3 top-3 rounded bg-black/70 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
