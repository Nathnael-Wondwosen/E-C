import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import {
  addPreviewToCart,
  addToCart,
  getPreviewWishlist,
  getUserWishlist,
  removeFromWishlist,
  removePreviewFromWishlist,
} from '../utils/userService';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', '/wishlist');
      window.dispatchEvent(new CustomEvent('loginStatusChanged'));
      router.push('/login');
      return;
    }

    loadWishlist();
  }, [router]);

  const loadWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      setLoading(true);
      const wishlistData = await getUserWishlist(userId);
      const liveItems = Array.isArray(wishlistData?.items) ? wishlistData.items : [];
      const previewItems = getPreviewWishlist(userId);
      setWishlistItems([...liveItems, ...previewItems]);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const targetItem = wishlistItems.find((item) => String(item.id) === String(itemId));
      const result = targetItem?.isPreview
        ? removePreviewFromWishlist(userId, itemId)
        : await removeFromWishlist(userId, itemId);
      if (Array.isArray(result?.items)) {
        if (targetItem?.isPreview) {
          const liveItems = wishlistItems.filter((item) => !item.isPreview);
          setWishlistItems([...liveItems, ...result.items]);
        } else {
          const previewItems = getPreviewWishlist(userId);
          setWishlistItems([...(Array.isArray(result.items) ? result.items : []), ...previewItems]);
        }
      } else {
        setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      }
      setMessage('Item removed from wishlist.');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const addToCartFromWishlist = async (item) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      if (item?.isPreview) {
        addPreviewToCart(userId, item, 1);
      } else {
        await addToCart(userId, item.productId);
      }
      setMessage(`${item.name} added to cart.`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setMessage('Failed to add item to cart.');
    }
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(160,96,18,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#D7932D]" />
          Loading wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Wishlist | B2B E-Commerce Platform</title>
        <meta name="description" content="Your wishlist" />
      </Head>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="portal-hero mb-8">
          <div className="bg-[linear-gradient(180deg,rgba(240,177,76,0.22),transparent)] px-5 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="portal-badge">Wishlist</p>
                <h1 className="portal-heading mt-3 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">Saved For Later</h1>
                <p className="portal-text mt-2 text-sm leading-6 sm:text-[15px]">
                  Keep track of products you want to compare, revisit, or move into your cart when you&apos;re ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="portal-pill">{wishlistItems.length} saved</span>
                <Link href="/dashboard/customer" className="portal-secondary-button">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {message ? (
          <div className="mb-5 rounded-[0.95rem] border border-[#E3D3B1] bg-[#FFFBF4] px-4 py-3 text-sm text-[#8E6A2F]">
            {message}
          </div>
        ) : null}

        {wishlistItems.length === 0 ? (
          <section className="portal-empty-state">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-12 w-12 text-[#B56B14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="portal-heading mb-2 text-xl font-medium">Your wishlist is empty</h3>
            <p className="portal-text mx-auto mb-6 max-w-md">
              Save products here to compare options, plan future purchases, and build a better shortlist.
            </p>
            <Link href="/marketplace" className="portal-primary-button inline-flex items-center px-6 py-3 text-base font-medium">
              Browse Products
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {wishlistItems.map((item) => (
              <article key={item.id} className="portal-card group transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(15,23,32,0.08)]">
                <div className="p-5">
                  <div className="overflow-hidden rounded-[1.1rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
                    <img className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]" src={item.image} alt={item.name} />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="portal-heading line-clamp-2 text-lg font-semibold">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-red-500 transition hover:text-red-700"
                        title="Remove from wishlist"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <p className="portal-muted mt-1 text-sm">Sold by: {item.seller || 'Marketplace seller'}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="portal-heading text-2xl font-bold">${Number(item.price || 0).toFixed(2)}</p>
                      <span className="portal-pill">Saved</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => addToCartFromWishlist(item)} className="portal-primary-button flex-1 py-3 text-sm font-medium">
                      Add to Cart
                    </button>
                    <Link href={item.productId ? `/products/${item.productId}` : '/marketplace'} className="portal-secondary-button flex-1 py-3 text-center text-sm font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
