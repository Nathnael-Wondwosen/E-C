import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/header/Header';
import { getProductsPage } from '../../utils/heroDataService';
import {
  addToCart,
  addToWishlist,
  addPreviewToCart,
  addPreviewToWishlist,
  getProductById,
  getProductReviews,
  getPublicSupplierProfile,
  getPreviewProductById,
  getPreviewWishlist,
  submitProductReview,
  submitProductInquiry,
  getUserInquirySent,
  getUserWishlist,
  removeFromWishlist,
  removePreviewFromWishlist
} from '../../utils/userService';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatEtbCompact = (value) => {
  const amount = Number(value || 0);
  return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
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
  return item?.image || item?.thumbnail || '';
};

const SHOWCASE_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
];

const SIMILAR_PLACEHOLDER_ITEMS = [
  {
    id: 'similar-placeholder-1',
    name: 'Premium Coffee Grinder',
    category: 'Kitchen Appliances',
    price: 125,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    placeholder: true,
  },
  {
    id: 'similar-placeholder-2',
    name: 'Commercial Blender Set',
    category: 'Food Equipment',
    price: 239,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80',
    placeholder: true,
  },
  {
    id: 'similar-placeholder-3',
    name: 'Smart Kettle Pro',
    category: 'Home Appliances',
    price: 98,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80',
    placeholder: true,
  },
  {
    id: 'similar-placeholder-4',
    name: 'Espresso Machine',
    category: 'Coffee Equipment',
    price: 410,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80',
    placeholder: true,
  },
  {
    id: 'similar-placeholder-5',
    name: 'Multi-Tool Kitchen Pack',
    category: 'Kitchen Tools',
    price: 74,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
    placeholder: true,
  },
];

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [actionLoading, setActionLoading] = useState({ cart: false, wishlist: false });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('specs');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isMobileMessageOpen, setIsMobileMessageOpen] = useState(false);
  const [isMobileInquiryOpen, setIsMobileInquiryOpen] = useState(false);
  const [inquiryImageUrl, setInquiryImageUrl] = useState('');
  const [quickInquiryText, setQuickInquiryText] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [supplierProfileLoading, setSupplierProfileLoading] = useState(false);
  const [buyerThreadMeta, setBuyerThreadMeta] = useState({ threadId: '', unreadCount: 0 });
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [inquiry, setInquiry] = useState({
    quantity: '1',
    message: ''
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ totalReviews: 0, averageRating: 0 });
  const [reviewDraft, setReviewDraft] = useState({ rating: '5', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const isPreviewProductId = String(id || '').startsWith('fallback-');

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      try {
        let payload = null;
        if (isPreviewProductId) {
          payload = getPreviewProductById(id);
        } else {
          payload = await getProductById(id);
        }
        if (!mounted) return;
        if (!payload && isPreviewProductId) {
          setProduct(null);
          return;
        }
        setProduct({
          ...payload,
          id: String(payload?.id || payload?._id || id),
          isPreview: Boolean(payload?.isPreview || isPreviewProductId),
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
  }, [id, isPreviewProductId]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (typeof window === 'undefined') return;
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const result = await getUserWishlist(userId);
      const previewItems = getPreviewWishlist(userId);
      setWishlistItems([...(result?.items || []), ...previewItems]);
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    if (!product?.id || product?.isPreview) {
      setReviews([]);
      setReviewSummary({ totalReviews: 0, averageRating: 0 });
      return;
    }

    let mounted = true;
    const loadReviews = async () => {
      setReviewsLoading(true);
      const result = await getProductReviews(product.id);
      if (!mounted) return;
      if (result?.success) {
        setReviews(Array.isArray(result.reviews) ? result.reviews : []);
        setReviewSummary(result.summary || { totalReviews: 0, averageRating: 0 });
      } else {
        setReviews([]);
        setReviewSummary({ totalReviews: 0, averageRating: 0 });
      }
      setReviewsLoading(false);
    };

    loadReviews();
    return () => {
      mounted = false;
    };
  }, [product?.id, product?.isPreview]);

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
    const sourceImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);

    const normalized = sourceImages
      .map((item) => String(item || '').trim())
      .filter(Boolean);

    if (normalized.length >= 3) return normalized;

    const filler = SHOWCASE_PLACEHOLDER_IMAGES.filter((url) => !normalized.includes(url));
    return [...normalized, ...filler].slice(0, 5);
  }, [product]);

  const selectedImage = galleryImages[selectedImageIndex] || '';
  const isWishlisted = useMemo(
    () => wishlistItems.some((item) => String(item.productId || item.id || item._id || item) === String(product?.id)),
    [wishlistItems, product?.id]
  );

  const supplierOwnerUserId = toText(
    product?.supplierId || product?.companyId || product?.ownerId || product?.sellerId || product?.createdBy,
    ''
  );
  const supplierName = toText(
    supplierProfile?.companyName ||
      supplierProfile?.name ||
      product?.supplierName ||
      product?.seller ||
      product?.companyName,
    'Verified Supplier'
  );
  const supplierCountry = toText(
    supplierProfile?.city && supplierProfile?.country
      ? `${supplierProfile.city}, ${supplierProfile.country}`
      : supplierProfile?.country || product?.origin || product?.country || product?.countryOfOrigin,
    'Location not specified'
  );
  const supplierYears = useMemo(() => {
    if (supplierProfile?.joinedAt) {
      const joined = new Date(supplierProfile.joinedAt);
      if (!Number.isNaN(joined.getTime())) {
        const years = Math.max(1, new Date().getFullYear() - joined.getFullYear());
        return `${years} ${years === 1 ? 'Year' : 'Years'}`;
      }
    }
    return toText(product?.supplierYears || product?.yearsInBusiness, 'Not specified');
  }, [supplierProfile?.joinedAt, product?.supplierYears, product?.yearsInBusiness]);
  const supplierBusinessType = toText(supplierProfile?.businessType, 'Not specified');
  const supplierWebsite = toText(supplierProfile?.website, '');
  const supplierPhone = toText(supplierProfile?.phone, '');
  const supplierContactEmail = toText(supplierProfile?.contactEmail, '');
  const supplierAvatar = toText(
    supplierProfile?.avatar ||
      supplierProfile?.image ||
      supplierProfile?.imageUrl ||
      supplierProfile?.profileImage ||
      product?.supplierImage ||
      product?.sellerImage,
    ''
  );
  const supplierLocationAddress = toText(
    supplierProfile?.locationAddress || supplierProfile?.address || product?.locationAddress || '',
    ''
  );
  const supplierLocationLat = Number(supplierProfile?.locationLat);
  const supplierLocationLng = Number(supplierProfile?.locationLng);
  const hasSupplierCoordinates =
    Number.isFinite(supplierLocationLat) &&
    Number.isFinite(supplierLocationLng) &&
    Math.abs(supplierLocationLat) <= 90 &&
    Math.abs(supplierLocationLng) <= 180;
  const supplierMapQuery = hasSupplierCoordinates
    ? `${supplierLocationLat},${supplierLocationLng}`
    : supplierLocationAddress || supplierCountry;
  const supplierMapHref = supplierMapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplierMapQuery)}`
    : '';
  const supplierMapEmbedUrl = supplierMapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(supplierMapQuery)}&z=14&output=embed`
    : '';
  const resolvedSupplierContactId = String(supplierProfile?.id || supplierOwnerUserId || '').trim();
  const moq = normalizePositiveNumber(product?.moq, 1);
  const leadTime = toText(product?.leadTime, '15-25 days');
  const stock = normalizePositiveNumber(product?.stock, 0);
  const baseUnitPrice = normalizePositiveNumber(product?.price, 0);
  const listingDiscountPercent = Math.max(0, Math.min(90, Number(product?.discountPercentage || 0)));
  const unitPrice = Number((baseUnitPrice * (1 - listingDiscountPercent / 100)).toFixed(2));
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
  const effectiveAverageRating = reviewSummary?.averageRating > 0 ? Number(reviewSummary.averageRating) : averageRating;
  const effectiveReviewCount = Number(reviewSummary?.totalReviews || 0) > 0 ? Number(reviewSummary.totalReviews) : reviewCount;
  const responseHours = normalizePositiveNumber(supplierProfile?.responseHours || product?.responseHours, 4);
  const defaultBuyerMessage = `Hi, I'm interested in ${product?.name || 'this product'}. Is it available?`;

  useEffect(() => {
    if (!supplierOwnerUserId || product?.isPreview) {
      setSupplierProfile(null);
      setSupplierProfileLoading(false);
      return;
    }

    let mounted = true;
    const loadSupplierProfile = async () => {
      setSupplierProfileLoading(true);
      const payload = await getPublicSupplierProfile(supplierOwnerUserId);
      if (!mounted) return;
      setSupplierProfile(payload);
      setSupplierProfileLoading(false);
    };

    loadSupplierProfile();
    return () => {
      mounted = false;
    };
  }, [supplierOwnerUserId, product?.isPreview]);

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
  const similarItemsForMobile = useMemo(() => {
    const normalizedReal = (Array.isArray(relatedProducts) ? relatedProducts : []).slice(0, 8);
    if (normalizedReal.length >= 6) return normalizedReal;
    const needed = Math.max(0, 6 - normalizedReal.length);
    return [...normalizedReal, ...SIMILAR_PLACEHOLDER_ITEMS.slice(0, needed)];
  }, [relatedProducts]);

  const goToPrevImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    if (!galleryImages.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleImageTouchStart = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX || 0;
    touchStartYRef.current = event.touches[0]?.clientY || 0;
  };

  const handleImageTouchEnd = (event) => {
    if (!canBrowseGallery || !touchStartXRef.current) return;
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const touchEndY = event.changedTouches[0]?.clientY || 0;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
      return;
    }
    const distance = deltaX;
    if (Math.abs(distance) < 35) return;
    if (distance > 0) {
      goToPrevImage();
    } else {
      goToNextImage();
    }
    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
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

  const findMatchingBuyerThread = (entries = []) => {
    const normalizedProductId = String(product?.id || '').trim();
    const normalizedSupplierId = String(resolvedSupplierContactId || '').trim();
    const normalizedProductName = String(product?.name || '').trim().toLowerCase();

    return entries
      .filter((entry) => {
        const entryProductId = String(entry?.productId || '').trim();
        const entrySellerId = String(entry?.sellerId || entry?.toUserId || entry?.supplierId || '').trim();
        const entryProductName = String(entry?.productName || '').trim().toLowerCase();

        const matchesProduct =
          (normalizedProductId && entryProductId === normalizedProductId) ||
          (normalizedProductName && entryProductName === normalizedProductName);
        const matchesSeller = !normalizedSupplierId || !entrySellerId || entrySellerId === normalizedSupplierId;

        return matchesProduct && matchesSeller;
      })
      .sort(
        (a, b) =>
          new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
          new Date(a?.updatedAt || a?.createdAt || 0).getTime()
      )[0] || null;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !product?.id || !resolvedSupplierContactId) {
      setBuyerThreadMeta({ threadId: '', unreadCount: 0 });
      return;
    }

    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (!userId || !isLoggedIn) {
      setBuyerThreadMeta({ threadId: '', unreadCount: 0 });
      return;
    }

    let mounted = true;
    const loadBuyerThreadMeta = async () => {
      try {
        const result = await getUserInquirySent(userId);
        if (!mounted) return;
        const existingThread = findMatchingBuyerThread(Array.isArray(result?.inquiries) ? result.inquiries : []);
        setBuyerThreadMeta({
          threadId: String(existingThread?.id || existingThread?._id || '').trim(),
          unreadCount: Number(existingThread?.unreadCount || 0)
        });
      } catch {
        if (!mounted) return;
        setBuyerThreadMeta({ threadId: '', unreadCount: 0 });
      }
    };

    loadBuyerThreadMeta();
    return () => {
      mounted = false;
    };
  }, [product?.id, product?.name, resolvedSupplierContactId]);

  const refreshWishlist = async (userId) => {
    const result = await getUserWishlist(userId);
    const previewItems = getPreviewWishlist(userId);
    setWishlistItems([...(result?.items || []), ...previewItems]);
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    const userId = ensureLoggedInUser();
    if (!userId) return;

    const quantity = inquiryQuantity;
    setActionLoading((prev) => ({ ...prev, cart: true }));
    setMessage('');
    const result = product?.isPreview
      ? addPreviewToCart(userId, product, quantity)
      : await addToCart(userId, product.id, quantity);
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
    const result = product?.isPreview
      ? (isWishlisted
          ? removePreviewFromWishlist(userId, product.id)
          : addPreviewToWishlist(userId, product))
      : (isWishlisted
          ? await removeFromWishlist(userId, product.id)
          : await addToWishlist(userId, product.id));
    setActionLoading((prev) => ({ ...prev, wishlist: false }));
    if (!result?.success) {
      setMessage(result?.message || 'Could not update wishlist.');
      return;
    }

    await refreshWishlist(userId);
    setMessage(isWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.');
  };

  const handleInquirySubmit = async (e, overrideMessage = '') => {
    if (e?.preventDefault) e.preventDefault();
    const userId = ensureLoggedInUser();
    if (!userId) {
      const quantity = inquiryQuantity;
      const base = String(overrideMessage || inquiry.message || '').trim() || `I am interested in ${product?.name}.`;
      const text = `${base}\n\nRequested Quantity: ${quantity}\nProduct ID: ${product?.id}`;
      const encoded = encodeURIComponent(text);
      router.push(`/login?next=${encodeURIComponent(router.asPath)}&inquiry=${encoded}`);
      return false;
    }

    if (!resolvedSupplierContactId) {
      setMessage('Supplier contact is not configured for this product yet.');
      return false;
    }

    const result = await submitProductInquiry({
      productId: product?.id,
      supplierId: resolvedSupplierContactId,
      quantity: inquiryQuantity,
      message: String(overrideMessage || inquiry.message || '').trim() || `I am interested in ${product?.name}.`
    });
    if (!result?.success) {
      setMessage(result?.message || 'Failed to send inquiry.');
      return false;
    }

    setMessage('Inquiry sent to this product owner successfully.');
    setInquiry((prev) => ({ ...prev, message: '' }));
    return true;
  };

  const handleOpenBuyerMessages = async () => {
    if (!product?.id) return;
    const userId = ensureLoggedInUser();
    if (!userId) return;

    if (!resolvedSupplierContactId) {
      setMessage('Supplier contact is not configured for this product yet.');
      return;
    }

    try {
      const result = await getUserInquirySent(userId);
      const inquiries = Array.isArray(result?.inquiries) ? result.inquiries : [];
      const existingThread = findMatchingBuyerThread(inquiries);

      if (existingThread) {
        const threadId = String(existingThread?.id || existingThread?._id || '').trim();
        setBuyerThreadMeta({
          threadId,
          unreadCount: Number(existingThread?.unreadCount || 0)
        });
        const query = threadId ? `?thread=${encodeURIComponent(threadId)}` : '';
        router.push(`/inquiries${query}`);
        return;
      }

      setInquiry((prev) => ({
        ...prev,
        message: String(prev.message || '').trim() ? prev.message : defaultBuyerMessage
      }));
      setIsMobileMessageOpen(true);
    } catch (_error) {
      setInquiry((prev) => ({
        ...prev,
        message: String(prev.message || '').trim() ? prev.message : defaultBuyerMessage
      }));
      setIsMobileMessageOpen(true);
    }
  };

  const handleRequestCallBack = async () => {
    const userId = ensureLoggedInUser();
    if (!userId) return;
    if (!resolvedSupplierContactId) {
      setMessage('Seller contact is not available yet for callback request.');
      return;
    }

    const callbackMessage = `Please call me back regarding ${product?.name}.`;
    const result = await submitProductInquiry({
      productId: product?.id,
      supplierId: resolvedSupplierContactId,
      quantity: inquiryQuantity,
      message: callbackMessage,
    });

    if (!result?.success) {
      setMessage(result?.message || 'Failed to request callback.');
      return;
    }

    setMessage('Callback request sent to seller.');
  };

  const handleShareProduct = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `/products/${encodeURIComponent(String(product?.id || ''))}`;
    const shareTitle = toText(product?.name, 'Product');
    const shareText = `Check this product: ${shareTitle}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (_error) {
        // User cancelled or share failed; fallback below.
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setMessage('Product link copied. Share it anywhere.');
        return;
      } catch (_error) {
        // fallback to manual prompt below
      }
    }

    if (typeof window !== 'undefined') {
      window.prompt('Copy product link', shareUrl);
    }
  };

  const handleReviewSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!product?.id || product?.isPreview) {
      setReviewFeedback('Reviews are not available for preview products.');
      return;
    }

    if (typeof window === 'undefined') return;
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (!isLoggedIn) {
      const next = encodeURIComponent(router.asPath || `/products/${product.id}`);
      router.push(`/login?next=${next}`);
      return;
    }

    setReviewSubmitting(true);
    setReviewFeedback('');
    const result = await submitProductReview(product.id, {
      rating: Number(reviewDraft.rating || 0),
      comment: reviewDraft.comment
    });
    setReviewSubmitting(false);

    if (!result?.success) {
      setReviewFeedback(result?.message || 'Failed to submit review.');
      return;
    }

    setReviewFeedback(result.message || 'Review submitted successfully.');
    setReviewDraft((prev) => ({ ...prev, comment: '' }));
    const refreshed = await getProductReviews(product.id);
    if (refreshed?.success) {
      setReviews(Array.isArray(refreshed.reviews) ? refreshed.reviews : []);
      setReviewSummary(refreshed.summary || { totalReviews: 0, averageRating: 0 });
    }
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
      <div className="portal-page min-h-screen">
        <Header
          mobileTitle={productCategory}
          mobileSeller={{ id: '', name: supplierName, imageUrl: supplierAvatar }}
        />
        <main className="mx-auto w-full max-w-[1360px] px-2.5 py-3 sm:px-5 lg:py-6">
          <div className="mb-3 h-10 animate-pulse rounded-[0.9rem] border border-slate-200 bg-white sm:mb-4 sm:h-12" />
          <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.12fr_1.04fr_0.84fr]">
            <div className="rounded-[1.1rem] border border-slate-200 bg-white p-3">
              <div className="h-[290px] animate-pulse rounded-[1rem] bg-slate-200 sm:h-[420px]" />
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div key={slot} className="h-12 w-12 animate-pulse rounded-md bg-slate-200" />
                ))}
              </div>
            </div>
            <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-200" />
              <div className="mt-4 space-y-2">
                <div className="h-10 animate-pulse rounded bg-slate-200" />
                <div className="h-10 animate-pulse rounded bg-slate-200" />
                <div className="h-10 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4">
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-10 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-10 animate-pulse rounded bg-slate-200" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="portal-page min-h-screen">
        <Header mobileTitle="Product" mobileSeller={{ id: '', name: 'Seller', imageUrl: '' }} />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="portal-card p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
            <p className="mt-2 text-sm text-slate-600">This item may have been removed or is outside your current market scope.</p>
            <Link href="/marketplace" className="portal-primary-button mt-5 inline-flex items-center px-4 py-2.5 text-sm font-semibold">
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>{product.name} | TradeEthiopia</title>
        <meta name="description" content={product.description || `${product.name} product detail`} />
      </Head>

      <Header
        mobileSeller={{
          id: resolvedSupplierContactId || supplierOwnerUserId,
          name: supplierName,
          imageUrl: supplierAvatar,
        }}
        mobileTitle={productCategory}
      />

      <main className="mx-auto w-full max-w-[1360px] px-2.5 py-3 pb-24 sm:px-5 lg:py-6 lg:pb-6">
        <div className="mb-3 hidden rounded-[0.9rem] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-2.5 text-[10px] text-slate-500 shadow-[0_10px_24px_rgba(15,23,32,0.04)] sm:mb-4 sm:block sm:rounded-[1rem] sm:px-4 sm:py-3 sm:text-xs">
          <Link href="/dashboard/customer" className="hover:text-[var(--portal-accent)]">Dashboard</Link> /{' '}
          <Link href="/marketplace" className="hover:text-[var(--portal-accent)]">Marketplace</Link> /{' '}
          <span className="text-slate-700">{productCategory}</span> /{' '}
          <span className="font-semibold text-slate-900">{product.name}</span>
        </div>

        {message && (
          <div className="mb-3 rounded-[0.9rem] border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-2 text-xs text-[#A21CAF] sm:mb-4 sm:text-sm">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.12fr_1.04fr_0.84fr]">
          <div className="portal-card overflow-hidden p-2 sm:p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[84px_1fr]">
              <div className="hidden space-y-2 overflow-y-auto pr-1 md:block">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, idx) => (
                    <button
                      key={`${image}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-[74px] w-[74px] overflow-hidden rounded-[0.8rem] border transition ${selectedImageIndex === idx ? 'border-[#e2611a] ring-2 ring-[#fbcfe8]' : 'border-[#dfe3e8] hover:border-[#f59e0b]'}`}
                    >
                      <img src={image} alt={`${product.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))
                ) : (
                  <div className="h-[74px] w-[74px] rounded-[0.8rem] border border-dashed border-slate-300 bg-slate-50" />
                )}
              </div>

              <div
                className="relative overflow-hidden rounded-[1.2rem] border border-[var(--portal-border)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.95))]"
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
              >
                <div className="absolute bottom-3 right-3 z-20">
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={actionLoading.wishlist}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full shadow backdrop-blur transition hover:scale-105 active:scale-95 sm:h-8 sm:w-8 ${
                      isWishlisted ? 'bg-rose-100 text-rose-600' : 'bg-white/90 text-slate-700'
                    }`}
                    aria-label={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {selectedImage ? (
                  <>
                    <img
                      key={`hero-image-${selectedImageIndex}`}
                      src={selectedImage}
                      alt={product.name}
                      loading="lazy"
                      className="h-[290px] w-full cursor-zoom-in object-cover transition duration-300 sm:h-[420px] md:h-[430px] md:object-contain hover:scale-[1.03] animate-[productFadeIn_280ms_ease]"
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
                    {canBrowseGallery && (
                      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/70 px-2 py-1 backdrop-blur md:hidden">
                        {galleryImages.map((_, idx) => (
                          <span
                            key={`dot-${idx}`}
                            className={`h-1.5 w-1.5 rounded-full ${selectedImageIndex === idx ? 'bg-slate-800' : 'bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-[290px] items-center justify-center text-sm text-slate-500 sm:h-[420px] md:h-[430px]">No image available</div>
                )}
              </div>

              {galleryImages.length > 0 ? (
                <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
                  {galleryImages.map((image, idx) => (
                    <button
                      key={`mobile-${image}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[0.75rem] border transition ${
                        selectedImageIndex === idx ? 'border-[#f97316] ring-2 ring-[#fecdd3]' : 'border-[#dfe3e8]'
                      }`}
                    >
                      <img src={image} alt={`${product.name} mobile thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="portal-card p-3.5 sm:p-5">
            <div className="-mx-3.5 rounded-none bg-[linear-gradient(135deg,#ffffff,#fdf4ff)] px-3.5 py-3.5 lg:mx-0 lg:hidden lg:rounded-xl lg:p-3.5">
              <p className="text-[13px] font-medium tracking-[0.01em] text-slate-600">{supplierLocationAddress || supplierCountry}</p>
              <h1 className="mt-1.5 text-[18px] font-semibold leading-snug tracking-[-0.01em] text-slate-900">{product.name}</h1>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-[24px] font-medium leading-none tracking-[-0.01em] text-[#C026D3]">
                  {formatEtbCompact(unitPrice)}
                </p>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[13px] leading-none text-amber-500">
                    {'★★★★★'.slice(0, Math.max(1, Math.min(5, Math.round(effectiveAverageRating))))}
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {effectiveAverageRating.toFixed(1)} ({effectiveReviewCount})
                  </span>
                </div>
              </div>
              {listingDiscountPercent > 0 ? (
                <p className="mt-1 text-[13px] font-normal text-slate-500">
                  <span className="line-through">{formatEtbCompact(baseUnitPrice)}</span>{' '}
                  <span className="font-medium text-[#C026D3]">{listingDiscountPercent}% OFF</span>
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRequestCallBack}
                  disabled={!resolvedSupplierContactId}
                  className="rounded-lg border border-[#F5D0FE] bg-white px-2.5 py-2 text-[12px] font-medium text-[#C026D3] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Request Call
                </button>
                <a
                  href={supplierPhone ? `tel:${supplierPhone}` : '#'}
                  onClick={(event) => {
                    if (!supplierPhone) {
                      event.preventDefault();
                      setMessage('Seller phone is unverified.');
                    }
                  }}
                  className="rounded-lg border border-[#C026D3] bg-[#C026D3] px-2.5 py-2 text-center text-[12px] font-medium text-white"
                >
                  Call
                </a>
              </div>
            </div>

            <div className="mb-2 hidden flex-wrap items-center gap-2 text-xs lg:flex">
              <span className="rounded-full bg-[#FDF4FF] px-2.5 py-1 font-semibold text-[#C026D3]">Verified Supplier</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{productCategory}</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">{stock > 0 ? 'Ready Stock' : 'Build to Order'}</span>
            </div>

            <h1 className="hidden text-[18px] font-bold leading-snug text-slate-900 sm:text-[24px] lg:block">{product.name}</h1>
            <p className="mt-1 hidden text-xs text-slate-500 sm:text-sm lg:block">Model No.: {modelNo}</p>
            <div className="mt-2 hidden items-center gap-2 text-xs text-slate-500 lg:flex">
              <span>Rating {effectiveAverageRating.toFixed(1)} / 5.0</span>
              <span>{effectiveReviewCount}+ Reviews</span>
            </div>

            <div className="mt-4 hidden rounded-[1rem] border border-[#F5D0FE] bg-[linear-gradient(135deg,#FFFFFF,#FDF4FF,#FFF7ED)] p-3.5 lg:block">
              <p className="text-xs text-slate-600">Reference FOB Price (Port: {dispatchPort})</p>
              <div className="flex flex-wrap items-end gap-2">
                <p className="text-[1.75rem] font-black tracking-tight text-[#C026D3] sm:text-3xl">{formatMoney(unitPrice)}</p>
                {listingDiscountPercent > 0 ? (
                  <>
                    <p className="text-base font-semibold text-slate-400 line-through">{formatMoney(baseUnitPrice)}</p>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {listingDiscountPercent}% OFF
                    </span>
                  </>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-slate-600">Min. Order: <span className="font-semibold">{moq} Unit(s)</span></p>
            </div>

            <div className="mt-4 hidden overflow-hidden rounded border border-[#dfe3e8] lg:block">
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

            <div className="mt-4 hidden grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid">
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
              <ul className="mt-2 grid grid-cols-1 gap-1.5 text-[13px] text-slate-700 sm:grid-cols-2 sm:gap-2 sm:text-sm">
                {featureList.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#e2611a]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 lg:hidden">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-[#dfe3e8] pb-2">
                {[
                  ['specs', 'Specs'],
                  ['overview', 'Desc'],
                  ['trade', 'Trade'],
                  ['reviews', 'Comments']
                ].map(([key, label]) => (
                  <button
                    key={`mobile-${key}`}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === key ? 'border-[#D946EF] bg-[#FDF4FF] text-[#C026D3]' : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-[#e5e7eb] bg-white p-3 text-sm text-slate-700">
                {activeTab === 'overview' ? (
                  <p>{toText(product.description, 'Detailed commercial description will be provided by supplier upon inquiry.')}</p>
                ) : null}

                {activeTab === 'specs' ? (
                  <div className="space-y-2">
                    {specificationRows.slice(0, 8).map(([label, value]) => (
                      <div key={`mobile-spec-${label}`} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-b-0">
                        <p className="text-xs font-semibold text-slate-600">{label}</p>
                        <p className="text-xs text-right text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeTab === 'trade' ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2.5 py-2">
                      <p className="text-slate-500">MOQ</p>
                      <p className="font-semibold text-slate-800">{moq} Unit(s)</p>
                    </div>
                    <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2.5 py-2">
                      <p className="text-slate-500">Lead Time</p>
                      <p className="font-semibold text-slate-800">{leadTime}</p>
                    </div>
                    <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2.5 py-2">
                      <p className="text-slate-500">Payment</p>
                      <p className="font-semibold text-slate-800">{paymentTerms}</p>
                    </div>
                    <div className="rounded border border-[#dfe3e8] bg-slate-50 px-2.5 py-2">
                      <p className="text-slate-500">Supply</p>
                      <p className="font-semibold text-slate-800">{supplyAbility}</p>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'reviews' ? (
                  <div className="space-y-2">
                    <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Rating Summary</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{effectiveAverageRating.toFixed(1)} / 5.0</p>
                      <p className="text-xs text-slate-600">{effectiveReviewCount} review(s)</p>
                    </div>
                    {reviews.slice(0, 2).map((item) => (
                      <div key={`mobile-review-${item.id || item.createdAt}`} className="rounded border border-[#e5e7eb] bg-white p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{item.userName || 'Buyer'}</p>
                          <p className="text-[11px] text-slate-500">{formatDateTime(item.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-amber-600">Rating: {Number(item.rating || 0)} / 5</p>
                        <p className="mt-1 text-xs leading-5 text-slate-700">{item.comment || '-'}</p>
                      </div>
                    ))}
                    {reviews.length === 0 ? <p className="text-xs text-slate-500">No comments yet.</p> : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 hidden lg:flex lg:flex-wrap lg:gap-2">
              <button
                onClick={handleAddToCart}
                disabled={actionLoading.cart}
                className="rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
              >
                {actionLoading.cart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={handleInquirySubmit}
                disabled={!resolvedSupplierContactId}
                className="rounded border border-[#F5D0FE] bg-white px-4 py-2 text-sm font-semibold text-[#C026D3] transition-transform hover:bg-[#FDF4FF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send Inquiry
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={actionLoading.wishlist}
                className={`rounded border px-4 py-2 text-sm font-semibold transition-transform active:scale-[0.98] ${
                  isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700'
                } disabled:opacity-60`}
              >
                {isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
              </button>
            </div>
          </div>

          <aside className="portal-card h-fit p-3.5 sm:p-5 lg:sticky lg:top-20">
            <div className="space-y-3 lg:hidden">
              <div className="rounded-xl border border-[#dfe3e8] bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Seller Contact</p>
                <p className="mt-1 text-base font-bold text-slate-900">{supplierName}</p>
                <p className="text-xs text-slate-600">{supplierCountry}</p>
                {supplierPhone ? (
                  <a href={`tel:${supplierPhone}`} className="mt-2 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                    Call: {supplierPhone}
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Phone: Unverified</p>
                )}
                {supplierContactEmail ? <p className="mt-1 text-xs text-slate-700">Email: <span className="font-semibold">{supplierContactEmail}</span></p> : null}
              </div>

              {(supplierLocationAddress || supplierCountry !== 'Location not specified' || supplierMapHref) ? (
                <div className="rounded-xl border border-[#dfe3e8] bg-white p-3 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800">Seller Location</p>
                  <p className="mt-1">{supplierLocationAddress || supplierCountry}</p>
                  {supplierMapHref ? (
                    <a
                      href={supplierMapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block font-semibold text-[#C026D3] hover:text-[#DB2777]"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                  {supplierMapEmbedUrl ? (
                    <div className="mt-2 overflow-hidden rounded border border-[#e5e7eb] bg-white">
                      <iframe
                        title="Seller location map"
                        src={supplierMapEmbedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-40 w-full border-0"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-xl border border-[#dfe3e8] bg-white p-3">
                <p className="text-xs text-slate-600">
                  Need details, pricing, or availability updates? Chat the seller directly.
                </p>
                <button
                  type="button"
                  onClick={handleOpenBuyerMessages}
                  disabled={!resolvedSupplierContactId}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{resolvedSupplierContactId ? (buyerThreadMeta.threadId ? 'Open Chat' : 'Chat Seller') : 'Seller Contact Unavailable'}</span>
                  {buyerThreadMeta.unreadCount > 0 ? (
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {buyerThreadMeta.unreadCount > 9 ? '9+' : buyerThreadMeta.unreadCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Supplier Profile</h2>
            <p className="mt-2 text-lg font-bold text-slate-900">{supplierName}</p>
            <p className="text-sm text-slate-600">{supplierYears} experience | {supplierCountry}</p>
            {supplierProfileLoading ? (
              <p className="mt-2 text-xs text-slate-500">Loading supplier details...</p>
            ) : null}

            <div className="mt-3 grid gap-2 text-xs text-slate-600">
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">Response time: within {responseHours}h</div>
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                Verification: {supplierProfile?.isVerified ? 'Verified supplier' : 'Standard supplier'}
              </div>
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">
                Active listings: {Number(supplierProfile?.totalListings || 0)}
              </div>
              {supplierBusinessType !== 'Not specified' ? (
                <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-2">Business type: {supplierBusinessType}</div>
              ) : null}
            </div>
            {!resolvedSupplierContactId && (
              <p className="mt-2 text-xs text-amber-700">
                Supplier contact for this listing is not configured yet.
              </p>
            )}
            {!supplierProfileLoading && resolvedSupplierContactId && !supplierProfile && (
              <p className="mt-2 text-xs text-amber-700">
                Supplier profile is not available yet for this listing.
              </p>
            )}
            {(supplierWebsite || supplierPhone || supplierContactEmail) ? (
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                {supplierWebsite ? (
                  <p>
                    Website:{' '}
                    <a
                      href={supplierWebsite.startsWith('http') ? supplierWebsite : `https://${supplierWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#C026D3] hover:text-[#DB2777]"
                    >
                      {supplierWebsite}
                    </a>
                  </p>
                ) : null}
                {supplierPhone ? <p>Phone: <span className="font-semibold text-slate-800">{supplierPhone}</span></p> : null}
                {supplierContactEmail ? <p>Email: <span className="font-semibold text-slate-800">{supplierContactEmail}</span></p> : null}
              </div>
            ) : null}
            {(supplierLocationAddress || supplierCountry !== 'Location not specified' || supplierMapHref) ? (
              <div className="mt-3 rounded border border-[#dfe3e8] bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">Seller Location</p>
                <p className="mt-1">{supplierLocationAddress || supplierCountry}</p>
                {hasSupplierCoordinates ? (
                  <p className="mt-1 text-slate-500">
                    Coordinates: {supplierLocationLat.toFixed(6)}, {supplierLocationLng.toFixed(6)}
                  </p>
                ) : null}
                {supplierMapHref ? (
                  <a
                    href={supplierMapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold text-[#C026D3] hover:text-[#DB2777]"
                  >
                    Open in Google Maps
                  </a>
                ) : null}
                {supplierMapEmbedUrl ? (
                  <div className="mt-3 overflow-hidden rounded border border-[#e5e7eb] bg-white">
                    <iframe
                      title="Seller location map"
                      src={supplierMapEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-48 w-full border-0"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

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

              <label className="block text-xs font-semibold text-slate-600">Chat</label>
              <textarea
                rows={4}
                value={inquiry.message}
                onChange={(e) => setInquiry((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Tell supplier your requirements..."
              />

              <div className="rounded-[0.95rem] border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-2 text-xs text-[#A21CAF]">
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
                disabled={!resolvedSupplierContactId}
                className="w-full rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resolvedSupplierContactId ? 'Contact Supplier' : 'Supplier Contact Unavailable'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-transform hover:bg-slate-50 active:scale-[0.99]"
              >
                Back to Marketplace
              </button>
            </form>
            </div>
          </aside>
        </section>

        <section className="portal-card mt-5 hidden overflow-hidden lg:block">
          <div className="scrollbar-hide flex flex-nowrap overflow-x-auto border-b border-[#dfe3e8] bg-slate-50/70">
            {[
              ['specs', 'Technical Specifications'],
              ['overview', 'Product Description'],
              ['trade', 'Trade Information'],
              ['supplier', 'Supplier Details'],
              ['reviews', 'Customer Reviews']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`shrink-0 px-4 py-3 text-sm font-semibold transition ${activeTab === key ? 'border-b-2 border-[#D946EF] bg-white text-[#C026D3]' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="animate-[productFadeIn_220ms_ease] p-4 text-sm leading-7 text-slate-700">
              <p>{toText(product.description, 'Detailed commercial description will be provided by supplier upon inquiry.')}</p>
              <p className="mt-3">
                This product listing supports bulk procurement workflows. Submit quantity and technical requirements to receive a formal quotation.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="animate-[productFadeIn_220ms_ease] p-4">
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
            <div className="animate-[productFadeIn_220ms_ease] p-4">
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
            <div className="animate-[productFadeIn_220ms_ease] p-4 text-sm text-slate-700">
              <p><span className="font-semibold">Supplier:</span> {supplierName}</p>
              <p className="mt-1"><span className="font-semibold">Business Tenure:</span> {supplierYears}</p>
              <p className="mt-1"><span className="font-semibold">Location:</span> {supplierCountry}</p>
              {supplierLocationAddress ? <p className="mt-1"><span className="font-semibold">Address:</span> {supplierLocationAddress}</p> : null}
              {supplierMapHref ? (
                <p className="mt-1">
                  <span className="font-semibold">Map:</span>{' '}
                  <a
                    href={supplierMapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#C026D3] hover:text-[#DB2777]"
                  >
                    Open in Google Maps
                  </a>
                </p>
              ) : null}
              <p className="mt-1"><span className="font-semibold">Business Type:</span> {supplierBusinessType}</p>
              <p className="mt-1"><span className="font-semibold">Verification:</span> {supplierProfile?.isVerified ? 'Verified supplier' : 'Standard supplier'}</p>
              <p className="mt-1"><span className="font-semibold">Active Listings:</span> {Number(supplierProfile?.totalListings || 0)}</p>
              <p className="mt-1"><span className="font-semibold">Primary Category:</span> {productCategory}</p>
              <p className="mt-1"><span className="font-semibold">Typical Response Time:</span> within {responseHours} hours</p>
              {supplierWebsite ? <p className="mt-1"><span className="font-semibold">Website:</span> {supplierWebsite}</p> : null}
              {supplierPhone ? <p className="mt-1"><span className="font-semibold">Phone:</span> {supplierPhone}</p> : null}
              {supplierContactEmail ? <p className="mt-1"><span className="font-semibold">Email:</span> {supplierContactEmail}</p> : null}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-[productFadeIn_220ms_ease] space-y-4 p-4 text-sm text-slate-700">
              <div className="rounded border border-[#dfe3e8] bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Rating Summary</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{effectiveAverageRating.toFixed(1)} / 5.0</p>
                <p className="text-xs text-slate-600">{effectiveReviewCount} review(s)</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="rounded border border-[#dfe3e8] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Write a Review</p>
                <div className="mt-2">
                  <label className="text-xs font-semibold text-slate-600">Rating</label>
                  <select
                    value={reviewDraft.rating}
                    onChange={(event) => setReviewDraft((prev) => ({ ...prev, rating: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very Poor</option>
                  </select>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-600">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewDraft.comment}
                    onChange={(event) => setReviewDraft((prev) => ({ ...prev, comment: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Share your experience with this product..."
                  />
                </div>
                {reviewFeedback ? <p className="mt-2 text-xs text-[#C026D3]">{reviewFeedback}</p> : null}
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !String(reviewDraft.comment || '').trim()}
                    className="rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {reviewsLoading ? (
                  <p className="text-sm text-slate-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>
                ) : (
                  reviews.map((item) => (
                    <div key={item.id || `${item.userId}-${item.createdAt}`} className="rounded border border-[#e5e7eb] bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{item.userName || 'Buyer'}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-600">
                        Rating: {Number(item.rating || 0)} / 5
                      </p>
                      <p className="mt-2 whitespace-pre-line leading-6 text-slate-700">{item.comment || '-'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        <section className="portal-card -mx-2.5 mt-5 overflow-hidden rounded-none border-x-0 p-0 sm:mx-0 sm:rounded-[1rem] sm:border sm:p-4">
          <div className="mb-2 flex items-center justify-between px-3 pt-3 sm:mb-3 sm:px-0 sm:pt-0">
            <h2 className="text-base font-semibold text-slate-900">Similar Products</h2>
            <Link href="/products" className="text-sm font-semibold text-[#C026D3] hover:text-[#DB2777]">
              View all
            </Link>
          </div>

          {isRelatedLoading ? (
            <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="rounded border border-[#e9edf2] p-3 transition hover:border-[#F0ABFC] hover:shadow-sm"
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
                  <p className="mt-2 text-sm font-bold text-[#C026D3]">{formatMoney(item.price || 0)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 sm:block">
              No similar products found yet.
            </div>
          )}

          <div className="pb-3 sm:hidden">
            <div className="scrollbar-hidden flex gap-3 overflow-x-auto px-3">
              {similarItemsForMobile.map((item) => {
                const isPlaceholder = Boolean(item?.placeholder);
                const cardContent = (
                  <>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {getProductImage(item) ? (
                        <img src={getProductImage(item)} alt={toText(item.name, 'Product')} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-slate-400">No image</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-[13px] font-semibold text-slate-800">{toText(item.name, 'Unnamed product')}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{toText(item?.category?.name || item?.category, 'General')}</p>
                      <p className="mt-1.5 text-[13px] font-semibold text-[#C026D3]">{formatMoney(item.price || 0)}</p>
                    </div>
                  </>
                );

                if (isPlaceholder) {
                  return (
                    <div key={item.id} className="min-w-[165px] max-w-[165px] overflow-hidden border border-[#e9edf2] bg-white">
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link key={item.id} href={`/products/${item.id}`} className="min-w-[165px] max-w-[165px] overflow-hidden border border-[#e9edf2] bg-white">
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <button
            type="button"
            onClick={handleOpenBuyerMessages}
            disabled={!resolvedSupplierContactId}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M5 17h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Chat
            {buyerThreadMeta.unreadCount > 0 ? (
              <span className="absolute right-3 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#16A34A] px-1 text-[9px] font-semibold text-white">
                {buyerThreadMeta.unreadCount > 9 ? '9+' : buyerThreadMeta.unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={actionLoading.cart}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
            </svg>
            {actionLoading.cart ? 'Adding' : 'Cart'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!supplierPhone) {
                setMessage('Seller phone is unverified.');
                return;
              }
              window.location.href = `tel:${supplierPhone}`;
            }}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.9 1.37l.97 2.91a2 2 0 01-.45 2.06l-1.26 1.27a16 16 0 006.59 6.59l1.27-1.26a2 2 0 012.06-.45l2.91.97A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z" />
            </svg>
            Call
          </button>
          <button
            type="button"
            onClick={() => setIsMobileInquiryOpen(true)}
            disabled={!resolvedSupplierContactId}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h7m-9 8h14a2 2 0 002-2V8a2 2 0 00-2-2h-2l-2-2H9L7 6H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Message
          </button>
          <button
            type="button"
            onClick={handleShareProduct}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342 15.316 17m-.632-10.342-6 3.316m10.816 8.026a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0ZM9 12a2.25 2.25 0 1 1-4.5 0A2.25 2.25 0 0 1 9 12Zm10.5-6a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {isMobileMessageOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close message composer"
            onClick={() => setIsMobileMessageOpen(false)}
            className="absolute inset-0 bg-[#0f172a]/45"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">Chat with Seller</h3>
              <button
                type="button"
                onClick={() => setIsMobileMessageOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">{supplierName}</p>
              <p className="mt-0.5 text-slate-600">{supplierCountry}</p>
            </div>

            <form
              onSubmit={async (event) => {
                const normalizedImage = String(inquiryImageUrl || '').trim();
                const mergedMessage = normalizedImage
                  ? `${String(inquiry.message || '').trim() || `I am interested in ${product?.name}.`}\n\nImage reference: ${normalizedImage}`
                  : inquiry.message;
                const ok = await handleInquirySubmit(event, mergedMessage);
                if (ok) setIsMobileMessageOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={inquiry.quantity}
                  onChange={(e) => setInquiry((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder={`Min ${moq}`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Chat</label>
                <textarea
                  rows={4}
                  value={inquiry.message}
                  onChange={(e) => setInquiry((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder={defaultBuyerMessage}
                />
              </div>
              <div className="rounded-md border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-2.5">
                <p className="text-xs font-semibold text-[#C026D3]">Send a photo reference (optional)</p>
                <p className="mt-0.5 text-[11px] text-slate-600">Paste an image link so the seller understands your exact requirement faster.</p>
                <input
                  type="url"
                  value={inquiryImageUrl}
                  onChange={(e) => setInquiryImageUrl(e.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="https://example.com/product-image.jpg"
                />
              </div>
              <button
                type="submit"
                disabled={!resolvedSupplierContactId}
                className="w-full rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resolvedSupplierContactId ? 'Send Chat' : 'Seller Contact Unavailable'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isMobileInquiryOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close inquiry composer"
            onClick={() => setIsMobileInquiryOpen(false)}
            className="absolute inset-0 bg-[#0f172a]/45"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">Quick Message</h3>
              <button
                type="button"
                onClick={() => setIsMobileInquiryOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">{supplierName}</p>
              <p className="mt-0.5 text-slate-600">{supplierCountry}</p>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {['Is it available?', 'Last price please', 'Can you call me back?', 'Send full specification'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuickInquiryText((prev) => (prev ? `${prev} ${preset}` : preset))}
                  className="rounded-full border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-1.5 text-xs font-medium text-[#C026D3]"
                >
                  {preset}
                </button>
              ))}
            </div>

            <form
              onSubmit={async (event) => {
                const mergedMessage = String(quickInquiryText || '').trim() || `I am interested in ${product?.name}.`;
                const ok = await handleInquirySubmit(event, mergedMessage);
                if (ok) {
                  setQuickInquiryText('');
                  setIsMobileInquiryOpen(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={inquiry.quantity}
                  onChange={(e) => setInquiry((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder={`Min ${moq}`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Message</label>
                <textarea
                  rows={3}
                  value={quickInquiryText}
                  onChange={(e) => setQuickInquiryText(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Write your message..."
                />
              </div>
              <button
                type="submit"
                disabled={!resolvedSupplierContactId}
                className="w-full rounded bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resolvedSupplierContactId ? 'Send Message' : 'Seller Contact Unavailable'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

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

      <style jsx global>{`
        @keyframes productFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
