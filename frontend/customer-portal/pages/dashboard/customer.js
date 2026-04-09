import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/header/Header';
import { getProducts } from '../../utils/heroDataService';
import {
  addToCart,
  addToWishlist,
  getUserCart,
  getUserInquirySent,
  getUserOrders,
  getUserProfile,
  getUserWishlist,
  removeFromWishlist,
} from '../../utils/userService';

function DashboardMetric({ label, value, detail, href, accent = 'gold' }) {
  const accentClass =
    accent === 'dark'
      ? 'border-[#E2E8F0] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]'
      : 'border-[#F5D0FE] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(253,244,255,0.98),rgba(239,246,255,0.96))]';

  return (
    <div className={`rounded-[1.2rem] border p-4 shadow-[0_14px_32px_rgba(15,23,32,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,23,32,0.08)] sm:p-5 ${accentClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">{label}</p>
        <span className="rounded-full border border-[#F5D0FE] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#C026D3]">Live</span>
      </div>
      <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#0F1720] sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#5F6773]">{detail}</p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex items-center text-sm font-semibold text-[#7F4A10] hover:text-[#C87918]">
          Open
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}

function QuickAction({ href, title, description }) {
  return (
    <Link
      href={href}
      className="group rounded-[1.1rem] border border-[#E2E8F0] bg-white/92 p-4 shadow-[0_12px_28px_rgba(15,23,32,0.04)] transition hover:-translate-y-0.5 hover:border-[#F5D0FE] hover:shadow-[0_20px_42px_rgba(15,23,32,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-[#0F1720]">{title}</h3>
        <span className="rounded-full border border-[#F5D0FE] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C026D3]">
          Open
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#5F6773]">{description}</p>
    </Link>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || 'pending').toLowerCase();
  const tone =
    normalized === 'completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : normalized === 'processing'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : normalized === 'shipped'
          ? 'border-sky-200 bg-sky-50 text-sky-700'
          : normalized === 'closed'
            ? 'border-slate-200 bg-slate-100 text-slate-700'
            : 'border-violet-200 bg-violet-50 text-violet-700';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {normalized}
    </span>
  );
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [sentInquiries, setSentInquiries] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [hotDealsMessage, setHotDealsMessage] = useState('');
  const [dealActionState, setDealActionState] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleSessionExpired = () => {
      router.push('/login');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');

    if (!isLoggedIn || userType !== 'buyer') {
      router.push('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('/login');
          return;
        }

        const [userProfile, userOrders, userWishlist, userCart, fetchedProducts] = await Promise.all([
          getUserProfile(userId),
          getUserOrders(userId),
          getUserWishlist(userId),
          getUserCart(userId),
          getProducts(),
        ]);

        setUser(userProfile);
        setOrders(userOrders.orders || []);
        setWishlist(userWishlist.items || []);
        setCart(userCart || { items: [], total: 0, count: 0 });

        try {
          const inquiryPayload = await getUserInquirySent(userId);
          setSentInquiries(Array.isArray(inquiryPayload?.inquiries) ? inquiryPayload.inquiries : []);
        } catch (inquiryError) {
          console.error('Error loading customer inquiries:', inquiryError);
          setSentInquiries([]);
        }

        const regularProducts = (fetchedProducts || []).filter((product) => product.productType !== 'B2B');
        const convertedProducts = regularProducts.map((product) => ({
          ...product,
          id: product._id || product.id,
        }));

        const resolvedHotDeals = convertedProducts
          .filter((product) => product.isHotDeal || (product.discountPercentage && Number(product.discountPercentage) >= 10))
          .slice(0, 4)
          .map((product, index) => {
            const discountValue = Number(product.discountPercentage || 0);
            const basePrice = Number(product.price || 0);
            const effectiveDiscount = discountValue > 0 ? discountValue : 15;
            const originalPrice = basePrice > 0 ? basePrice : Number(product.originalPrice || 0) || 0;
            const finalPrice = originalPrice > 0
              ? Number(((originalPrice * (100 - effectiveDiscount)) / 100).toFixed(2))
              : 0;

            return {
              ...product,
              id: String(product.id || product.sku || `deal-${index + 1}`),
              name: product.name || 'Featured Deal',
              price: finalPrice || originalPrice || 0,
              originalPrice: originalPrice || finalPrice || 0,
              discount: Math.round(effectiveDiscount),
            };
          });

        setHotDeals(
          resolvedHotDeals.length > 0
            ? resolvedHotDeals
            : [
                { id: 'local-1', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, discount: 31, image: null },
                { id: 'local-2', name: 'Smart Fitness Watch', price: 149.99, originalPrice: 199.99, discount: 25, image: null },
                { id: 'local-3', name: 'Portable Power Bank', price: 39.99, originalPrice: 59.99, discount: 33, image: null },
                { id: 'local-4', name: '4K Ultra HD Camera', price: 299.99, originalPrice: 399.99, discount: 25, image: null },
              ]
        );
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const isDealWishlisted = (dealId) =>
    wishlist.some((item) => String(item.productId || item.id || item._id) === String(dealId));

  const setDealLoading = (dealId, key, value) => {
    setDealActionState((prev) => ({
      ...prev,
      [dealId]: {
        ...(prev[dealId] || {}),
        [key]: value,
      },
    }));
  };

  const getDealImage = (deal) => {
    if (deal.image) return deal.image;
    if (Array.isArray(deal.images) && deal.images.length > 0) return deal.images[0];
    return '';
  };

  const getDealDetailsHref = (dealId) =>
    String(dealId).startsWith('local-') ? '/marketplace' : `/products/${encodeURIComponent(String(dealId))}`;

  const handleAddDealToCart = async (deal) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    setDealLoading(deal.id, 'cartLoading', true);
    setHotDealsMessage('');
    const result = await addToCart(userId, deal.id, 1);
    setDealLoading(deal.id, 'cartLoading', false);

    if (!result?.success) {
      setHotDealsMessage(result?.message || 'Failed to add item to cart.');
      return;
    }

    const updatedCart = await getUserCart(userId);
    setCart(updatedCart || { items: [], total: 0, count: 0 });
    setHotDealsMessage(`${deal.name} added to cart.`);
  };

  const handleToggleDealWishlist = async (deal) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const alreadyWishlisted = isDealWishlisted(deal.id);
    setDealLoading(deal.id, 'wishlistLoading', true);
    setHotDealsMessage('');

    const result = alreadyWishlisted
      ? await removeFromWishlist(userId, deal.id)
      : await addToWishlist(userId, deal.id);

    setDealLoading(deal.id, 'wishlistLoading', false);

    if (!result?.success) {
      setHotDealsMessage(result?.message || 'Failed to update wishlist.');
      return;
    }

    const updatedWishlist = await getUserWishlist(userId);
    setWishlist(updatedWishlist?.items || []);
    setHotDealsMessage(alreadyWishlisted ? `${deal.name} removed from wishlist.` : `${deal.name} added to wishlist.`);
  };

  const orderCount = orders.length;
  const wishlistCount = wishlist.length;
  const cartCount = cart.count || 0;
  const inquiryCount = sentInquiries.length;
  const firstName = user?.profile?.name || user?.name || 'Customer';
  const firstNameLabel = String(firstName).trim().split(' ')[0] || 'Customer';
  const initials = String(firstName).trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase())
    .join('') || 'C';

  const recentOrderSummary = useMemo(
    () =>
      orders.slice(0, 4).map((order) => ({
        ...order,
        lineCount: Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : 0,
      })),
    [orders]
  );

  const profileCompletion = useMemo(() => {
    const profile = user?.profile || {};
    const fields = [
      profile?.name || user?.name || '',
      profile?.email || user?.email || '',
      profile?.phone || '',
      profile?.locationAddress || '',
    ];
    const completed = fields.filter((value) => String(value || '').trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [user]);

  const recentInquirySummary = useMemo(
    () =>
      [...sentInquiries]
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
            new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        )
        .slice(0, 5),
    [sentInquiries]
  );

  const waitingForSupplierCount = useMemo(
    () =>
      sentInquiries.reduce((sum, inquiry) => {
        if (String(inquiry?.status || '').toLowerCase() === 'closed') return sum;
        const messages = Array.isArray(inquiry?.messages) ? inquiry.messages : [];
        const latest = messages.length ? messages[messages.length - 1] : null;
        const latestRole = String(latest?.senderRole || '').toLowerCase();
        const waiting = !latest || latestRole === 'buyer';
        return sum + (waiting ? 1 : 0);
      }, 0),
    [sentInquiries]
  );

  const cartPreview = Array.isArray(cart?.items) ? cart.items.slice(0, 4) : [];
  const savedValue = Number(cart.total || 0).toFixed(2);

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(15,23,32,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--portal-accent)]" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Customer Dashboard | Customer Portal</title>
        <meta name="description" content="Professional buyer dashboard with orders, messages, actions, and deal tracking." />
      </Head>

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} categories={[]} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="relative overflow-hidden rounded-[1.9rem] border border-[#E5E7EB] bg-[linear-gradient(145deg,#FFFFFF_0%,#F8FAFC_45%,#FDF4FF_100%)] px-5 py-6 shadow-[0_22px_52px_rgba(15,23,32,0.08)] sm:px-7">
          <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full border border-sky-200/70" />
          <div className="pointer-events-none absolute right-[-1.5rem] top-5 h-36 w-36 rounded-full border border-fuchsia-200/70" />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] border border-[var(--portal-border-strong)] bg-white text-lg font-bold text-[var(--portal-accent-strong)]">
                  {initials}
                </div>
                <div>
                  <p className="portal-badge">Buyer Command Center</p>
                  <h1 className="portal-heading mt-2 text-[1.95rem] font-semibold tracking-[-0.04em] sm:text-[2.45rem]">Welcome back, {firstNameLabel}</h1>
                  <p className="portal-text mt-2 max-w-2xl text-sm leading-6">
                    Procurement activity, supplier conversations, and purchase controls in one responsive workspace built for daily execution.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/marketplace" className="portal-primary-button rounded-[1rem] px-4 py-2.5 text-sm font-semibold">Browse Marketplace</Link>
                <Link href="/inquiries" className="portal-outline-button rounded-[1rem] px-4 py-2.5 text-sm font-semibold">Open Messages</Link>
                <Link href="/dashboard/buyer-settlements" className="portal-outline-button rounded-[1rem] px-4 py-2.5 text-sm font-semibold">Settlements</Link>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-[#E2E8F0] bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,32,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">Operational Snapshot</p>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-[#475569]"><span>Profile completion</span><span className="font-semibold text-[#0F1720]">{profileCompletion}%</span></div>
                <div className="flex items-center justify-between text-[#475569]"><span>Messages waiting reply</span><span className="font-semibold text-[#0F1720]">{waitingForSupplierCount}</span></div>
                <div className="flex items-center justify-between text-[#475569]"><span>Cart value</span><span className="font-semibold text-[#0F1720]">${savedValue}</span></div>
                <div className="flex items-center justify-between text-[#475569]"><span>Order volume</span><span className="font-semibold text-[#0F1720]">{orderCount}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardMetric label="Cart" value={cartCount} detail={`Current basket total: $${Number(cart.total || 0).toFixed(2)}`} href="/cart" />
          <DashboardMetric label="Wishlist" value={wishlistCount} detail="Saved products ready to revisit or compare." href="/wishlist" accent="dark" />
          <DashboardMetric label="Orders" value={orderCount} detail="Track current and completed order flows." href="/orders" />
          <DashboardMetric label="Messages" value={inquiryCount} detail={`${waitingForSupplierCount} waiting on supplier response.`} href="/inquiries" />
          <DashboardMetric label="Profile" value={`${profileCompletion}%`} detail="Keep account details current for faster checkout and support." href="/profile" accent="dark" />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <section className="portal-card overflow-hidden rounded-[1.45rem]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="portal-heading text-lg font-semibold">Conversation Inbox</h2>
                  <p className="portal-muted mt-1 text-sm">Latest supplier communication for your inquiries.</p>
                </div>
                <Link href="/inquiries" className="text-sm font-semibold text-[#7C3AED] hover:text-[#5B21B6]">View all</Link>
              </div>
              <div className="p-5 sm:p-6">
                {recentInquirySummary.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#64748B]">
                    No messages yet. Start a supplier conversation from any product page.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentInquirySummary.map((entry) => {
                      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
                      const latest = messages.length ? messages[messages.length - 1] : null;
                      const latestText = String(latest?.text || entry?.message || '').trim() || 'No message content';
                      const supplierName = entry?.seller?.name || entry?.supplier?.name || entry?.sellerName || 'Supplier';
                      return (
                        <Link
                          key={entry?.id || entry?._id || `${entry?.productId}-${entry?.createdAt}`}
                          href="/inquiries"
                          className="block rounded-[1rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,32,0.04)] transition hover:border-[#DDD6FE]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[#0F1720]">{entry?.productName || `Product ${entry?.productId || '-'}`}</p>
                              <p className="mt-1 text-xs text-[#6B7280]">Supplier: {supplierName}</p>
                              <p className="mt-2 line-clamp-2 text-sm text-[#475569]">{latestText}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <StatusPill status={entry?.status || 'pending'} />
                              <p className="mt-2 text-xs text-[#6B7280]">{new Date(entry?.updatedAt || entry?.createdAt || Date.now()).toLocaleString()}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="portal-card overflow-hidden rounded-[1.45rem]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="portal-heading text-lg font-semibold">Recent Orders</h2>
                  <p className="portal-muted mt-1 text-sm">Monitor order status and value without leaving the dashboard.</p>
                </div>
                <Link href="/orders" className="text-sm font-semibold text-[#7C3AED] hover:text-[#5B21B6]">View all</Link>
              </div>
              <div className="p-5 sm:p-6">
                {recentOrderSummary.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-4 py-8 text-center">
                    <h3 className="portal-heading text-lg font-semibold">No orders yet</h3>
                    <p className="portal-text mt-2 text-sm">Place your first order to populate this section with live tracking data.</p>
                    <Link href="/marketplace" className="portal-primary-button mt-4 inline-flex rounded-[1rem] px-4 py-2.5 text-sm font-semibold">Browse Marketplace</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrderSummary.map((order) => (
                      <div key={order.id} className="rounded-[1rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,32,0.04)]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0F1720]">Order #{order.orderNumber || order.id}</p>
                            <p className="mt-1 text-xs text-[#6B7280]">{order.date ? new Date(order.date).toLocaleDateString() : '-'} | {order.lineCount} item{order.lineCount === 1 ? '' : 's'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusPill status={order.status} />
                            <span className="text-sm font-semibold text-[#0F1720]">${Number(order.total || 0).toFixed(2)}</span>
                            <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-[#334155] hover:text-[#7C3AED]">Details</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:col-span-4">
            <section className="portal-card overflow-hidden rounded-[1.45rem]">
              <div className="border-b border-[var(--portal-border)] px-5 py-4">
                <h2 className="portal-heading text-lg font-semibold">Action Center</h2>
                <p className="portal-muted mt-1 text-sm">High-frequency shortcuts for day-to-day buying tasks.</p>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-1 sm:p-5">
                <QuickAction href="/marketplace" title="Browse Products" description="Discover catalog items and supplier offers." />
                <QuickAction href="/wishlist" title="Wishlist" description="Review saved products and compare options." />
                <QuickAction href="/cart" title="Shopping Cart" description="Adjust quantities and proceed to checkout." />
                <QuickAction href="/inquiries" title="Messages" description="Track supplier responses and send follow-ups." />
              </div>
            </section>

            <section className="portal-card overflow-hidden rounded-[1.45rem]">
              <div className="border-b border-[var(--portal-border)] px-5 py-4">
                <h2 className="portal-heading text-lg font-semibold">Cart Preview</h2>
                <p className="portal-muted mt-1 text-sm">A quick list of items currently in your basket.</p>
              </div>
              <div className="p-5">
                {cartPreview.length === 0 ? (
                  <p className="text-sm text-[#64748B]">Your cart is empty right now.</p>
                ) : (
                  <div className="space-y-3">
                    {cartPreview.map((item) => (
                      <div key={item?.id || item?.productId} className="rounded-[0.9rem] border border-[#E2E8F0] bg-white px-3 py-2.5">
                        <p className="line-clamp-1 text-sm font-semibold text-[#0F1720]">{item?.name || 'Product'}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">Qty: {item?.quantity || 1} | ${Number(item?.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/cart" className="portal-outline-button mt-4 inline-flex w-full rounded-[1rem] px-4 py-2.5 text-sm font-semibold">
                  Open Cart
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <section className="portal-card mt-6 overflow-hidden rounded-[1.45rem]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <div>
              <h2 className="portal-heading text-lg font-semibold">Featured Deals</h2>
              <p className="portal-muted mt-1 text-sm">High-value picks with quick add-to-cart and save actions.</p>
            </div>
            <span className="portal-pill">{hotDeals.length} live</span>
          </div>
          <div className="p-4 sm:p-6">
            {hotDealsMessage ? (
              <div className="mb-4 rounded-[0.95rem] border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-2 text-xs text-[#A21CAF]">
                {hotDealsMessage}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {hotDeals.map((deal) => (
                <article key={deal.id} className="rounded-[1rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,32,0.04)]">
                  <Link href={getDealDetailsHref(deal.id)} className="block overflow-hidden rounded-[0.9rem] border border-[#E2E8F0] bg-white">
                    {getDealImage(deal) ? (
                      <img src={getDealImage(deal)} alt={deal.name} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[linear-gradient(180deg,#FFFFFF,#FDF4FF,#EFF6FF)]">
                        <svg className="h-10 w-10 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <Link href={getDealDetailsHref(deal.id)} className="block text-sm font-semibold leading-6 text-[#0F1720] hover:text-[#7C3AED]">{deal.name}</Link>
                    <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-700">{deal.discount}% off</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-base font-semibold text-[#0F1720]">${Number(deal.price || 0).toFixed(2)}</p>
                      <p className="text-xs text-[#7A818C] line-through">${Number(deal.originalPrice || 0).toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(dealActionState[deal.id]?.wishlistLoading)}
                      onClick={() => handleToggleDealWishlist(deal)}
                      className={`rounded-[0.85rem] border px-2.5 py-2 transition ${
                        isDealWishlisted(deal.id)
                          ? 'border-[#F5D0FE] bg-[#FDF4FF] text-[#C026D3]'
                          : 'border-[#E2E8F0] bg-white text-[#1B2A38]'
                      } ${dealActionState[deal.id]?.wishlistLoading ? 'cursor-not-allowed opacity-60' : 'hover:border-[#F0ABFC]'}`}
                      aria-label={isDealWishlisted(deal.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={Boolean(dealActionState[deal.id]?.cartLoading)}
                      onClick={() => handleAddDealToCart(deal)}
                      className={`flex-1 rounded-[0.85rem] px-3 py-2 text-sm font-semibold text-white transition ${
                        dealActionState[deal.id]?.cartLoading
                          ? 'cursor-not-allowed bg-slate-400'
                          : 'bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] hover:brightness-105'
                      }`}
                    >
                      {dealActionState[deal.id]?.cartLoading ? 'Adding...' : 'Add'}
                    </button>
                    <Link href={getDealDetailsHref(deal.id)} className="rounded-[0.85rem] border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#1B2A38] transition hover:border-[#F0ABFC] hover:text-[#C026D3]">
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <Link href="/marketplace" className="portal-outline-button mt-5 inline-flex w-full rounded-[1rem] px-4 py-2.5 text-sm font-semibold">
              View More Deals
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
