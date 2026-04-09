import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import {
  getPreviewCart,
  getUserCart,
  removeFromCart,
  removePreviewFromCart,
  updateCartItemQuantity,
  updatePreviewCartItemQuantity,
} from '../utils/userService';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} birr`;
};

const getHistoryKey = (userId) => `cartHistory:${String(userId || 'guest')}`;
const getDemoCartKey = (userId) => `cartDemo:${String(userId || 'guest')}`;

const DEMO_CART_ITEMS = [
  {
    id: 'demo-cart-1',
    name: 'Sidama Reserve Coffee Beans',
    image: '/placeholder-product.jpg',
    price: 1500,
    quantity: 1,
    isDemo: true,
  },
  {
    id: 'demo-cart-2',
    name: 'Portable Blender Pro',
    image: '/placeholder-product.jpg',
    price: 3200,
    quantity: 1,
    isDemo: true,
  },
  {
    id: 'demo-cart-3',
    name: 'Premium Ceramic Mug Set',
    image: '/placeholder-product.jpg',
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
        image: item?.image || '/placeholder-product.jpg',
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

      <main className="mx-auto max-w-4xl px-3 py-3 sm:px-4 sm:py-4">
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
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
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
                    <img src={entry.item?.image} alt={entry.item?.name} className="h-14 w-14 rounded-xl object-cover" />
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
    </div>
  );
}
