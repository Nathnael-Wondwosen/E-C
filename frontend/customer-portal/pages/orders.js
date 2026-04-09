import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { getUserOrders } from '../utils/userService';

const getStatusClass = (status) => {
  const normalized = String(status || 'pending').toLowerCase();

  if (normalized === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === 'shipped') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (normalized === 'processing') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'cancelled') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      const ordersData = await getUserOrders(userId);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(15,23,32,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--portal-accent)]" />
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="portal-card mx-4 w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-red-200 bg-red-50 text-red-600">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>
            <h2 className="portal-heading mb-2 text-xl font-bold">Error Loading Orders</h2>
            <p className="portal-text mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="portal-primary-button px-6 py-3">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Order History | B2B E-Commerce Platform</title>
        <meta name="description" content="Your order history" />
      </Head>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="portal-hero mb-8">
          <div className="relative overflow-hidden px-5 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full border border-fuchsia-200/70 opacity-70" />
            <div className="pointer-events-none absolute right-[-2rem] top-6 h-32 w-32 rounded-full border border-sky-200/80 opacity-80" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-56 -translate-x-1/2 rounded-[999px] border border-white/90 bg-white/30" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.52),transparent)]" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="portal-badge">Orders</p>
                <h1 className="portal-heading mt-3 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">Order History</h1>
                <p className="portal-text mt-2 text-sm leading-6 sm:text-[15px]">
                  Review your purchase timeline, track current activity, and open any order detail from a cleaner account workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="portal-pill">{orders.length} orders</span>
                <Link href="/dashboard/customer" className="portal-secondary-button">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {orders.length === 0 ? (
          <section className="portal-empty-state">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-12 w-12 text-[#B5A88B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="portal-heading mb-2 text-xl font-medium">No orders yet</h3>
            <p className="portal-text mx-auto mb-6 max-w-md">
              You haven&apos;t placed any orders yet. Start shopping to build your purchase history.
            </p>
            <Link href="/marketplace" className="portal-primary-button inline-flex items-center px-6 py-3 text-base font-medium">
              Browse Products
            </Link>
          </section>
        ) : (
          <section className="space-y-5">
            {orders.map((order) => {
              const itemCount = Array.isArray(order.items)
                ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                : 0;

              return (
                <article key={order.id} className="portal-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(15,23,32,0.08)]">
                  <div className="border-b border-[var(--portal-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(250,244,255,0.86),rgba(239,246,255,0.92))] px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-base font-semibold text-[#0F1720]">Order #{order.orderNumber}</p>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClass(order.status)}`}>
                          {String(order.status || 'pending')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
                    <div className="portal-soft-card p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">Summary</p>
                      <p className="portal-heading mt-3 text-2xl font-semibold">${Number(order.total || 0).toFixed(2)}</p>
                      <p className="portal-muted mt-1 text-xs">{itemCount} item{itemCount === 1 ? '' : 's'} in this order</p>
                    </div>

                    <div className="portal-soft-card p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">Items</p>
                      <ul className="mt-3 space-y-1">
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          order.items.slice(0, 3).map((item, index) => (
                            <li key={index} className="portal-text truncate text-sm">
                              {(item.quantity || 1)}x {item.name} <span className="portal-muted">(${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)})</span>
                            </li>
                          ))
                        ) : (
                          <li className="portal-text text-sm">No items in order</li>
                        )}
                        {Array.isArray(order.items) && order.items.length > 3 ? (
                          <li className="portal-muted text-sm">+{order.items.length - 3} more items</li>
                        ) : null}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link href={`/orders/${order.id}`} className="portal-primary-button whitespace-nowrap px-4 py-2 text-center text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
