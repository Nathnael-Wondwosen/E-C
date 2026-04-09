import { useState, useEffect } from 'react';
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

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', '/cart');
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));
      router.push('/login');
      return;
    }

    loadCart();
  }, [router]);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      setLoading(true);
      const cartData = await getUserCart(userId);
      const liveItems = Array.isArray(cartData?.items) ? cartData.items : [];
      const previewItems = getPreviewCart(userId);
      setCartItems([...liveItems, ...previewItems]);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
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
        prevItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
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

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const calculateTotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
        <title>Shopping Cart | B2B E-Commerce Platform</title>
        <meta name="description" content="Your shopping cart" />
      </Head>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="portal-hero mb-8">
          <div className="bg-[linear-gradient(180deg,rgba(240,177,76,0.22),transparent)] px-5 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="portal-badge">Cart</p>
                <h1 className="portal-heading mt-3 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">Shopping Cart</h1>
                <p className="portal-text mt-2 text-sm leading-6 sm:text-[15px]">
                  Review your selections, adjust quantities quickly, and move to checkout with a clearer responsive layout.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="portal-pill">{cartItems.length} items</span>
                <Link href="/dashboard/customer" className="portal-secondary-button">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {cartItems.length === 0 ? (
          <section className="portal-empty-state">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-12 w-12 text-[#B5A88B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="portal-heading mb-2 text-xl font-medium">Your cart is empty</h3>
            <p className="portal-text mx-auto mb-6 max-w-md">
              Looks like you haven&apos;t added anything to your cart yet. Start browsing to build your next order.
            </p>
            <Link href="/marketplace" className="portal-primary-button inline-flex items-center px-6 py-3 text-base font-medium">
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="portal-card lg:col-span-1">
              <div className="border-b border-[var(--portal-border)] px-6 py-4">
                <h2 className="portal-heading text-lg font-semibold">Cart Items ({cartItems.length})</h2>
              </div>
              <ul className="divide-y divide-[var(--portal-border)]">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-5 transition hover:bg-white/70">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-28 w-full overflow-hidden rounded-[1rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] sm:w-28">
                        <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="portal-heading text-lg font-semibold">{item.name}</h3>
                            <p className="portal-muted mt-1 text-sm">Sold by: {item.seller || 'Marketplace seller'}</p>
                            <p className="portal-heading mt-3 text-lg font-semibold">${Number(item.price || 0).toFixed(2)} each</p>
                          </div>
                          <p className="portal-heading text-lg font-bold">${Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="portal-muted text-sm font-medium">Quantity</span>
                            <div className="flex items-center rounded-[0.95rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-10 w-10 text-lg text-[var(--portal-accent-strong)] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="portal-heading flex h-10 min-w-[2.75rem] items-center justify-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-10 w-10 text-lg text-[var(--portal-accent-strong)] transition hover:bg-white/70"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="lg:col-span-1">
              <div className="portal-card sticky top-8 p-6">
                <div className="border-b border-[var(--portal-border)] pb-4">
                  <h2 className="portal-heading text-lg font-semibold">Order Summary</h2>
                  <p className="portal-muted mt-1 text-sm">A quick cost snapshot before you move to checkout.</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="portal-muted">Subtotal</span>
                    <span className="portal-heading font-semibold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="portal-muted">Shipping</span>
                    <span className="portal-heading font-semibold">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="portal-muted">Tax</span>
                    <span className="portal-heading font-semibold">$0.00</span>
                  </div>
                  <div className="border-t border-[var(--portal-border)] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="portal-heading text-base font-semibold">Total</span>
                      <span className="portal-heading text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => router.push('/checkout')} className="portal-primary-button mt-8 flex w-full justify-center px-6 py-3 text-base font-medium">
                  Proceed to Checkout
                </button>

                <div className="mt-6 border-t border-[var(--portal-border)] pt-6 text-center">
                  <p className="portal-muted text-sm">
                    or{' '}
                    <Link href="/marketplace" className="font-semibold text-[var(--portal-accent)] hover:text-[#c87918]">
                      Continue Shopping
                    </Link>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
