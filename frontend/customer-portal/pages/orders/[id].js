import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/header/Header';
import { getUserOrderById } from '../../utils/userService';

const getStatusClass = (status) => {
  const normalized = String(status || 'pending').toLowerCase();

  if (normalized === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === 'shipped') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (normalized === 'processing') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'cancelled') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (id) {
      loadOrderDetails();
    }
  }, [id, router]);

  const loadOrderDetails = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      const orderDetails = await getUserOrderById(userId, id);
      setOrder(orderDetails);
    } catch (loadError) {
      console.error('Error loading order details:', loadError);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(160,96,18,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#D7932D]" />
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="portal-page min-h-screen">
        <Head>
          <title>Order Not Found | B2B E-Commerce Platform</title>
          <meta name="description" content="Order not found" />
        </Head>
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="portal-empty-state">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-12 w-12 text-[#B5A88B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="portal-heading mb-2 text-xl font-medium">Order not found</h3>
            <p className="portal-text mx-auto mb-6 max-w-md">
              The order you are looking for does not exist or is no longer available.
            </p>
            <Link href="/orders" className="portal-primary-button inline-flex items-center px-6 py-3 text-base font-medium">
              Back to Orders
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal || (Number(order.total || 0) - Number(order.shipping || 0) - Number(order.tax || 0));
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Order #{order.orderNumber} | B2B E-Commerce Platform</title>
        <meta name="description" content="Order details" />
      </Head>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="portal-hero mb-8">
          <div className="bg-[linear-gradient(180deg,rgba(240,177,76,0.22),transparent)] px-5 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="portal-badge">Order Details</p>
                <h1 className="portal-heading mt-3 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">Order #{order.orderNumber || order.id || id}</h1>
                <p className="portal-text mt-2 text-sm leading-6 sm:text-[15px]">
                  Review purchased items, shipping details, and the current fulfillment state in the same premium account workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClass(order.status)}`}>
                  {String(order.status || 'pending')}
                </span>
                <Link href="/orders" className="portal-secondary-button">
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="portal-card overflow-hidden">
            <div className="border-b border-[var(--portal-border)] bg-[linear-gradient(135deg,#18232f,#283749)] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Items in This Order</h2>
              <p className="mt-1 text-sm text-white/70">A complete breakdown of the products attached to this shipment.</p>
            </div>

            <div className="divide-y divide-[var(--portal-border)]">
              {items.map((item, index) => (
                <div key={index} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-28 w-full overflow-hidden rounded-[1rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)] sm:w-28">
                      <img
                        className="h-full w-full object-cover"
                        src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/100x100'}
                        alt={item.name || item.title || 'Product'}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="portal-heading text-lg font-semibold">{item.name || item.title || 'Product'}</h3>
                          <p className="portal-muted mt-1 text-sm">Sold by: {item.seller || item.supplier || 'N/A'}</p>
                          <p className="portal-muted mt-1 text-sm">Quantity: {item.quantity || item.qty || 1}</p>
                          <p className="portal-heading mt-3 text-base font-semibold">{formatCurrency(item.price || item.unitPrice || 0)} each</p>
                        </div>
                        <p className="portal-heading text-lg font-bold">
                          {formatCurrency((item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 ? (
                <div className="p-6">
                  <p className="portal-text text-sm">No item details are available for this order.</p>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="portal-card p-6">
              <div className="border-b border-[var(--portal-border)] pb-4">
                <h2 className="portal-heading text-lg font-semibold">Order Summary</h2>
                <p className="portal-muted mt-1 text-sm">Core metadata and financial totals for this order.</p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="portal-soft-card p-4">
                  <p className="portal-muted text-xs uppercase tracking-[0.12em]">Order Number</p>
                  <p className="portal-heading mt-1 text-sm font-semibold">#{order.orderNumber || order.id || 'N/A'}</p>
                </div>

                <div className="portal-soft-card p-4">
                  <p className="portal-muted text-xs uppercase tracking-[0.12em]">Order Date</p>
                  <p className="portal-heading mt-1 text-sm font-semibold">{orderDate}</p>
                </div>

                <div className="portal-soft-card p-4">
                  <p className="portal-muted text-xs uppercase tracking-[0.12em]">Payment Method</p>
                  <p className="portal-heading mt-1 text-sm font-semibold">{order.paymentMethod || 'N/A'}</p>
                </div>

                <div className="space-y-2 border-t border-[var(--portal-border)] pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="portal-muted">Subtotal</span>
                    <span className="portal-heading font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="portal-muted">Shipping</span>
                    <span className="portal-heading font-semibold">{formatCurrency(order.shipping || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="portal-muted">Tax</span>
                    <span className="portal-heading font-semibold">{formatCurrency(order.tax || (Number(order.total || 0) * 0.15))}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--portal-border)] pt-3">
                    <span className="portal-heading text-base font-semibold">Total</span>
                    <span className="portal-heading text-xl font-bold">{formatCurrency(order.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="portal-card p-6">
              <div className="border-b border-[var(--portal-border)] pb-4">
                <h2 className="portal-heading text-lg font-semibold">Shipping Address</h2>
                <p className="portal-muted mt-1 text-sm">Delivery details captured for this order.</p>
              </div>

              <div className="portal-soft-card mt-5 p-4">
                <p className="portal-heading text-sm font-semibold">{order.shippingInfo?.fullName || order.shippingInfo?.name || 'N/A'}</p>
                <p className="portal-text mt-2 text-sm leading-6">{order.shippingInfo?.address || 'N/A'}</p>
                <p className="portal-text text-sm leading-6">
                  {order.shippingInfo?.city || ''}{order.shippingInfo?.city ? ', ' : ''}{order.shippingInfo?.state || ''} {order.shippingInfo?.zipCode || ''}
                </p>
                <p className="portal-text text-sm leading-6">{order.shippingInfo?.country || 'N/A'}</p>
                <p className="portal-muted mt-3 text-sm">Phone: {order.shippingInfo?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="portal-card p-6">
              <h2 className="portal-heading text-lg font-semibold">Order Actions</h2>
              <p className="portal-muted mt-1 text-sm">Quick access to the next workflow around this order.</p>
              <div className="mt-5 flex flex-col gap-3">
                <button className="portal-primary-button w-full">Track Order</button>
                <button className="portal-secondary-button w-full justify-center">Contact Seller</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
