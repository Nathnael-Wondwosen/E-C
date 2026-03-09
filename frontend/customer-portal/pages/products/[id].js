import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/header/Header';
import {
  addToCart,
  addToWishlist,
  getProductById,
  getUserWishlist,
  removeFromWishlist
} from '../../utils/userService';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [actionLoading, setActionLoading] = useState({ cart: false, wishlist: false });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        if (!mounted) return;
        setProduct({
          ...productData,
          id: String(productData?.id || productData?._id || id),
        });
      } catch (error) {
        console.error('Failed to load product details:', error);
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
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const result = await getUserWishlist(userId);
      setWishlistItems(result?.items || []);
    };
    loadWishlist();
  }, []);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const productImage = galleryImages[selectedImageIndex] || '';

  const originalPrice = useMemo(() => {
    if (!product?.price) return null;
    const discount = Number(product.discountPercentage || 0);
    if (!discount || discount <= 0 || discount >= 100) return null;
    return Number((Number(product.price) * 100 / (100 - discount)).toFixed(2));
  }, [product]);

  const productCategory = useMemo(() => {
    if (!product) return 'General';
    if (typeof product.category === 'string') return product.category;
    if (product.category?.name) return product.category.name;
    return 'General';
  }, [product]);

  const keyFeatures = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.tags) && product.tags.length) {
      return product.tags.slice(0, 6);
    }
    if (product.specifications && typeof product.specifications === 'object') {
      return Object.entries(product.specifications).slice(0, 6).map(([key, value]) => `${key}: ${value}`);
    }
    return ['Quality checked', 'Secure purchase', 'Fast fulfillment'];
  }, [product]);

  const specificationEntries = useMemo(() => {
    if (!product?.specifications || typeof product.specifications !== 'object') return [];
    return Object.entries(product.specifications).slice(0, 8);
  }, [product]);

  const isWishlisted = useMemo(() => {
    if (!product?.id) return false;
    return wishlistItems.some((item) => String(item.productId || item.id || item._id) === String(product.id));
  }, [wishlistItems, product?.id]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const ensureLoggedInUser = () => {
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!userId || !isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', router.asPath);
      router.push('/login');
      return '';
    }
    return userId;
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    const userId = ensureLoggedInUser();
    if (!userId) return;

    setActionLoading((prev) => ({ ...prev, cart: true }));
    setMessage('');
    const result = await addToCart(userId, product.id, 1);
    setActionLoading((prev) => ({ ...prev, cart: false }));
    if (!result?.success) {
      setMessage(result?.message || 'Failed to add item to cart.');
      return;
    }
    setMessage(`${product.name} added to cart.`);
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
      setMessage(result?.message || 'Failed to update wishlist.');
      return;
    }

    const wishlistResult = await getUserWishlist(userId);
    setWishlistItems(wishlistResult?.items || []);
    setMessage(isWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
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
            <p className="mt-2 text-sm text-slate-600">This product may have been removed or is unavailable.</p>
            <Link
              href="/marketplace"
              className="mt-5 inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Head>
        <title>{product.name} | Product Details</title>
        <meta name="description" content={product.description || 'Product details'} />
      </Head>

      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard/customer" className="hover:text-cyan-700">Dashboard</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-cyan-700">Marketplace</Link>
          <span>/</span>
          <span className="truncate font-medium text-slate-700">{product.name}</span>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm text-cyan-700">
            {message}
          </div>
        )}

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="h-[300px] w-full object-cover sm:h-[420px]"
                />
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center border border-dashed border-slate-300 bg-gradient-to-br from-gray-100 to-gray-200 sm:h-[420px]">
                  <span className="text-sm text-slate-500">No image available</span>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                      selectedImageIndex === index ? 'border-cyan-500 ring-1 ring-cyan-200' : 'border-slate-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{productCategory}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                Number(product.stock || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {Number(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description || 'No description provided.'}</p>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-3xl font-bold text-slate-900">${Number(product.price || 0).toFixed(2)}</p>
              {originalPrice && (
                <p className="text-sm text-slate-400 line-through">${originalPrice.toFixed(2)}</p>
              )}
              {product.discountPercentage ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  {Math.round(Number(product.discountPercentage))}% OFF
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-800">Category:</span> {productCategory}</p>
              <p><span className="font-semibold text-slate-800">Stock:</span> {Number(product.stock || 0)}</p>
              {product.sku ? <p><span className="font-semibold text-slate-800">SKU:</span> {product.sku}</p> : null}
              {product.rating ? <p><span className="font-semibold text-slate-800">Rating:</span> {product.rating}</p> : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={actionLoading.cart || Number(product.stock || 0) <= 0}
                onClick={handleAddToCart}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${
                  actionLoading.cart || Number(product.stock || 0) <= 0
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {actionLoading.cart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                type="button"
                disabled={actionLoading.wishlist}
                onClick={handleToggleWishlist}
                className={`rounded-lg border px-5 py-2.5 text-sm font-semibold ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                } ${actionLoading.wishlist ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            </div>

            <div className="mt-5 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p>Secure checkout with verified payment flow</p>
              <p>Easy returns according to seller policy</p>
              <p>Support available for order issues</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {keyFeatures.map((feature, index) => (
                <li key={`${feature}-${index}`} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Specifications</h2>
            {specificationEntries.length > 0 ? (
              <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {specificationEntries.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2 text-sm">
                    <p className="font-medium capitalize text-slate-700">{String(key)}</p>
                    <p className="text-slate-600">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No detailed specifications provided for this product yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
