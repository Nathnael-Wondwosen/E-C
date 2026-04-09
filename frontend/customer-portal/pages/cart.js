import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import {
  getPreviewCart,
  getUserCart,
  getUserInquiryInbox,
  getUserInquirySent,
  getUserWishlist,
  removeFromCart,
  removePreviewFromCart,
  updateCartItemQuantity,
  updatePreviewCartItemQuantity,
} from '../utils/userService';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} birr`;
};

const resolveFallbackImage = (value) => {
  const src = String(value || '').trim();
  if (!src) return '/placeholder-carousel.jpg';
  const lowered = src.toLowerCase();
  if (lowered.includes('/placeholder-product.jpg') || lowered.includes('/placeholder-news-blog')) {
    return '/placeholder-carousel.jpg';
  }
  return src;
};

const getItemImage = (item) => resolveFallbackImage(item?.image || item?.images?.[0] || '/placeholder-carousel.jpg');

const getHistoryKey = (userId) => `cartHistory:${String(userId || 'guest')}`;
const getDemoCartKey = (userId) => `cartDemo:${String(userId || 'guest')}`;

const DEMO_CART_ITEMS = [
  {
    id: 'demo-cart-1',
    name: 'Sidama Reserve Coffee Beans',
    image: '/placeholder-carousel.jpg',
    price: 1500,
    quantity: 1,
    isDemo: true,
  },
  {
    id: 'demo-cart-2',
    name: 'Portable Blender Pro',
    image: '/placeholder-carousel.jpg',
    price: 3200,
    quantity: 1,
    isDemo: true,
  },
  {
    id: 'demo-cart-3',
    name: 'Premium Ceramic Mug Set',
    image: '/placeholder-carousel.jpg',
    price: 980,
    quantity: 2,
    isDemo: true,
  },
];

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [cartHistory, setCartHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoCart, setUsingDemoCart] = useState(false);
  const [view, setView] = useState('cart');
  const [mobileProfile, setMobileProfile] = useState({ id: '', name: 'User', imageUrl: '' });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [inquiryUnreadCount, setInquiryUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', '/cart');
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));
      router.push('/login');
      return;
    }

    const userId = localStorage.getItem('userId') || '';
    const fallbackName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Profile';
    setMobileProfile({ id: userId, name: fallbackName, imageUrl: '' });
    loadCart();
    loadHistory(userId);
  }, [router]);

  useEffect(() => {
    const loadWishlistCount = async () => {
      try {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const userId = localStorage.getItem('userId');
        if (!isLoggedIn || !userId) {
          setWishlistCount(0);
          return;
        }
        const result = await getUserWishlist(userId);
        const items = Array.isArray(result?.items) ? result.items : [];
        setWishlistCount(items.length);
      } catch {
        setWishlistCount(0);
      }
    };

    loadWishlistCount();
    const intervalId = window.setInterval(loadWishlistCount, 20000);
    window.addEventListener('loginStatusChanged', loadWishlistCount);
    window.addEventListener('focus', loadWishlistCount);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('loginStatusChanged', loadWishlistCount);
      window.removeEventListener('focus', loadWishlistCount);
    };
  }, []);

  useEffect(() => {
    const loadInquiryUnreadCount = async () => {
      try {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const userId = localStorage.getItem('userId');
        const userType = localStorage.getItem('userType') || 'buyer';
        if (!isLoggedIn || !userId) {
          setInquiryUnreadCount(0);
          return;
        }

        const result =
          userType === 'seller' ? await getUserInquiryInbox(userId) : await getUserInquirySent(userId);
        const inquiries = Array.isArray(result?.inquiries) ? result.inquiries : [];
        const computed = Number(
          result?.unreadTotal ?? inquiries.reduce((sum, row) => sum + Number(row?.unreadCount || 0), 0)
        );
        setInquiryUnreadCount(Number.isFinite(computed) ? computed : 0);
      } catch {
        setInquiryUnreadCount(0);
      }
    };

    loadInquiryUnreadCount();
    const intervalId = window.setInterval(loadInquiryUnreadCount, 20000);
    window.addEventListener('loginStatusChanged', loadInquiryUnreadCount);
    window.addEventListener('focus', loadInquiryUnreadCount);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('loginStatusChanged', loadInquiryUnreadCount);
      window.removeEventListener('focus', loadInquiryUnreadCount);
    };
  }, []);

  const loadHistory = (userId) => {
    try {
      const raw = localStorage.getItem(getHistoryKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      setCartHistory(Array.isArray(parsed) ? parsed : []);
    } catch (_error) {
      setCartHistory([]);
    }
  };

  const persistHistory = (userId, nextHistory) => {
    localStorage.setItem(getHistoryKey(userId), JSON.stringify(nextHistory));
    setCartHistory(nextHistory);
  };

  const persistDemoCart = (userId, nextItems) => {
    localStorage.setItem(getDemoCartKey(userId), JSON.stringify(nextItems));
  };

  const loadDemoCart = (userId) => {
    try {
      const raw = localStorage.getItem(getDemoCartKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      const demoItems = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_CART_ITEMS;
      const normalized = demoItems.map((item, index) => ({
        id: item?.id || `demo-cart-${index + 1}`,
        name: item?.name || 'Sample Product',
        image: resolveFallbackImage(item?.image || '/placeholder-carousel.jpg'),
        price: Number(item?.price || 0),
        quantity: Math.max(1, Number(item?.quantity || 1)),
        isDemo: true,
      }));
      persistDemoCart(userId, normalized);
      setUsingDemoCart(true);
      return normalized;
    } catch (_error) {
      const fallback = DEMO_CART_ITEMS.map((item) => ({ ...item }));
      persistDemoCart(userId, fallback);
      setUsingDemoCart(true);
      return fallback;
    }
  };

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found in localStorage');

      setLoading(true);
      const cartData = await getUserCart(userId);
      const liveItems = Array.isArray(cartData?.items) ? cartData.items : [];
      const previewItems = getPreviewCart(userId);
      const mergedItems = [...liveItems, ...previewItems];
      if (mergedItems.length > 0) {
        setCartItems(mergedItems);
        setUsingDemoCart(false);
        return;
      }

      setCartItems(loadDemoCart(userId));
    } catch (error) {
      console.error('Error loading cart:', error);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setCartItems([]);
        setUsingDemoCart(false);
      } else {
        setCartItems(loadDemoCart(userId));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const targetItem = cartItems.find((item) => String(item.id) === String(itemId));
      if (targetItem?.isDemo) {
        const nextItems = cartItems.map((item) =>
          String(item.id) === String(itemId) ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(nextItems);
        persistDemoCart(userId, nextItems);
        return;
      }

      const result = targetItem?.isPreview
        ? updatePreviewCartItemQuantity(userId, itemId, newQuantity)
        : await updateCartItemQuantity(userId, itemId, newQuantity);

      if (Array.isArray(result?.items)) {
        const liveItems = cartItems.filter((item) => !item.isPreview && String(item.id) !== String(itemId));
        if (targetItem?.isPreview) {
          setCartItems([...liveItems, ...result.items]);
        } else {
          const previewItems = getPreviewCart(userId);
          setCartItems([...(Array.isArray(result.items) ? result.items : []), ...previewItems]);
        }
        return;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) => (String(item.id) === String(itemId) ? { ...item, quantity: newQuantity } : item))
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      loadCart();
    }
  };

  const removeItem = async (itemId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const targetItem = cartItems.find((item) => String(item.id) === String(itemId));
      if (targetItem?.isDemo) {
        const nextItems = cartItems.filter((item) => String(item.id) !== String(itemId));
        setCartItems(nextItems);
        persistDemoCart(userId, nextItems);
        return;
      }

      const result = targetItem?.isPreview
        ? removePreviewFromCart(userId, itemId)
        : await removeFromCart(userId, itemId);

      if (Array.isArray(result?.items)) {
        if (targetItem?.isPreview) {
          const liveItems = cartItems.filter((item) => !item.isPreview);
          setCartItems([...liveItems, ...result.items]);
        } else {
          const previewItems = getPreviewCart(userId);
          setCartItems([...(Array.isArray(result.items) ? result.items : []), ...previewItems]);
        }
        return;
      }

      setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(itemId)));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const markAsDone = async (item) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const historyEntry = {
      id: `${String(item.id)}-${Date.now()}`,
      item,
      doneAt: new Date().toISOString(),
      total: Number(item.price || 0) * Number(item.quantity || 0),
    };
    const nextHistory = [historyEntry, ...cartHistory].slice(0, 100);
    persistHistory(userId, nextHistory);
    await removeItem(item.id);
  };

  const calculateTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(160,96,18,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#D7932D]" />
          Loading cart...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>My Cart | B2B E-Commerce Platform</title>
        <meta name="description" content="Manage cart items and cart history." />
      </Head>
      <Header mobileTitle="My Cart" mobileSeller={mobileProfile} mobileProfileHref="/profile" />

      <main className="mx-auto max-w-4xl px-3 py-3 pb-28 sm:px-4 sm:py-4 sm:pb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setView('cart')}
              className={`px-3 py-1.5 text-xs font-semibold ${view === 'cart' ? 'bg-slate-900 text-white' : 'text-slate-700'}`}
            >
              My Cart ({cartItems.length})
            </button>
            <button
              type="button"
              onClick={() => setView('history')}
              className={`px-3 py-1.5 text-xs font-semibold ${view === 'history' ? 'bg-slate-900 text-white' : 'text-slate-700'}`}
            >
              History ({cartHistory.length})
            </button>
          </div>
          <Link href="/marketplace" className="rounded-lg border border-[#F5D0FE] bg-white px-3 py-1.5 text-xs font-semibold text-[#C026D3]">
            Go to Marketplace
          </Link>
        </div>

        {usingDemoCart ? (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Using sample cart data while live cart is unavailable.
          </div>
        ) : null}

        {view === 'cart' ? (
          cartItems.length === 0 ? (
            <section className="rounded-2xl border border-[var(--portal-border)] bg-white p-6 text-center">
              <h3 className="portal-heading text-lg font-semibold">Your cart is empty</h3>
              <p className="portal-text mt-2 text-sm">Add products from marketplace and manage them here.</p>
            </section>
          ) : (
            <>
              <section className="space-y-3">
                {cartItems.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/placeholder-carousel.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-base leading-none text-slate-400 hover:text-slate-700">
                            x
                          </button>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(item.price)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.id, Number(item.quantity || 0) - 1)}
                              className="px-2 py-0.5 text-slate-700"
                              disabled={Number(item.quantity || 0) <= 1}
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-700">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, Number(item.quantity || 0) + 1)} className="px-2 py-0.5 text-slate-700">
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => markAsDone(item)}
                            className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Current Cart Total</span>
                  <span className="font-semibold text-slate-900">{formatMoney(calculateTotal)}</span>
                </div>
              </section>
            </>
          )
        ) : (
          <section className="space-y-3">
            {cartHistory.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No cart history yet. Mark items as done and they will appear here.
              </div>
            ) : (
              cartHistory.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img
                      src={getItemImage(entry.item)}
                      alt={entry.item?.name}
                      className="h-14 w-14 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-carousel.jpg';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{entry.item?.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Done on {new Date(entry.doneAt).toLocaleDateString()} {new Date(entry.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#C026D3]">{formatMoney(entry.total)}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/localmarket" className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M6 12h12m-9 8h6" />
            </svg>
            Filter
          </Link>
          <Link href="/localmarket" className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10z" />
            </svg>
            Home
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-900">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            Cart
            {cartItems.length > 0 ? (
              <span className="absolute right-5 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] text-white">
                {cartItems.length > 99 ? '99+' : cartItems.length}
              </span>
            ) : null}
          </Link>
          <Link
            href="/inquiries"
            onClick={() => setInquiryUnreadCount(0)}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8m-8 4h5m7 5l-3-3H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-1l3 3z" />
            </svg>
            Message
            {inquiryUnreadCount > 0 ? (
              <span className="absolute right-3 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] text-white">
                {inquiryUnreadCount > 99 ? '99+' : inquiryUnreadCount}
              </span>
            ) : null}
          </Link>
          <Link href="/wishlist" className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Favorite
            {wishlistCount > 0 ? (
              <span className="absolute right-3 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            ) : null}
          </Link>
        </div>
      </nav>
    </div>
  );
}
