import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getUserInquiryInbox, getUserProfile, replyToProductInquiry, updateUserInquiryStatus } from '../../utils/userService';
import { clearCustomerSession } from '../../utils/session';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};
const THREADS_PER_PAGE = 6;

function SellerMetric({ label, value, detail, href }) {
  return (
    <div className="rounded-[1.2rem] border border-[#F5D0FE] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(253,244,255,0.95),rgba(239,246,255,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,32,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0F1720]">{value}</p>
      <p className="mt-2 text-sm text-[#5F6773]">{detail}</p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex items-center text-sm font-semibold text-[#C026D3] hover:text-[#DB2777]">
          Open
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}

function SellerAction({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-[1.15rem] border border-[#E2E8F0] bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,32,0.05)] transition hover:-translate-y-0.5 hover:border-[#F5D0FE] hover:shadow-[0_20px_42px_rgba(15,23,32,0.08)]"
    >
      <h3 className="text-base font-semibold text-[#0F1720]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5F6773]">{description}</p>
    </Link>
  );
}

function InquiryStatusPill({ status }) {
  const normalized = String(status || 'new').toLowerCase();
  const tone =
    normalized === 'closed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : normalized === 'contacted'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-sky-200 bg-sky-50 text-sky-700';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {normalized}
    </span>
  );
}

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [copyMessage, setCopyMessage] = useState('');
  const [statusActionState, setStatusActionState] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyActionState, setReplyActionState] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryPage, setInquiryPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userType = localStorage.getItem('userType');
    if (!isLoggedIn || userType !== 'seller') {
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

        const userProfile = await getUserProfile(userId);
        setUser(userProfile);

        try {
          const inboxResult = await getUserInquiryInbox(userId);
          setInquiries(inboxResult?.inquiries || []);
          setInquiryError('');
        } catch (inboxError) {
          console.error('Error loading seller inquiries:', inboxError);
          setInquiries([]);
          setInquiryError('Could not load inquiries right now. Please refresh in a moment.');
        }
      } catch (error) {
        console.error('Error loading seller dashboard data:', error);
        clearCustomerSession();
        router.push('/login');
      } finally {
        setInquiryLoading(false);
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const filteredInquiries = useMemo(() => {
    const base =
      inquiryFilter === 'all'
        ? [...inquiries]
        : inquiries.filter((entry) => String(entry.status || 'new') === inquiryFilter);

    return base.sort((a, b) => {
      const keyA =
        String(a?.fromUserId || '').trim() ||
        String(a?.buyer?.email || '').trim().toLowerCase() ||
        String(a?.buyer?.name || '').trim().toLowerCase();
      const keyB =
        String(b?.fromUserId || '').trim() ||
        String(b?.buyer?.email || '').trim().toLowerCase() ||
        String(b?.buyer?.name || '').trim().toLowerCase();
      if (keyA !== keyB) return keyA.localeCompare(keyB);
      return new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    });
  }, [inquiries, inquiryFilter]);
  const groupedInquiries = useMemo(() => {
    const groups = filteredInquiries.reduce((acc, entry) => {
      const buyerId = String(entry?.fromUserId || entry?.buyerId || '');
      const buyerEmail = String(entry?.buyer?.email || '').trim().toLowerCase();
      const buyerName = String(entry?.buyer?.name || '').trim().toLowerCase();
      const groupKey = buyerId || buyerEmail || buyerName || `unknown-${String(entry?.id || entry?._id || '')}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          key: groupKey,
          buyerId: buyerId || '-',
          buyerName: entry?.buyer?.name || 'Unknown customer',
          buyerEmail: entry?.buyer?.email || '',
          inquiries: []
        };
      }
      acc[groupKey].inquiries.push(entry);
      return acc;
    }, {});

    return Object.values(groups)
      .map((group) => {
        const sorted = [...group.inquiries].sort(
          (a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        );
        const openCount = sorted.filter((entry) => String(entry?.status || 'new').toLowerCase() !== 'closed').length;
        const needsReplyCount = sorted.filter((entry) => {
          const status = String(entry?.status || 'new').toLowerCase();
          if (status === 'closed') return false;
          const messages = Array.isArray(entry?.messages) ? entry.messages : [];
          const latest = messages.length ? messages[messages.length - 1] : null;
          return status === 'new' || String(latest?.senderRole || '').toLowerCase() === 'buyer';
        }).length;
        return {
          ...group,
          inquiries: sorted,
          total: sorted.length,
          openCount,
          needsReplyCount,
          latestAt: sorted[0]?.updatedAt || sorted[0]?.createdAt || null
        };
      })
      .sort((a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime());
  }, [filteredInquiries]);
  const normalizedInquirySearch = inquirySearch.trim().toLowerCase();
  const searchableGroupedInquiries = useMemo(() => {
    if (!normalizedInquirySearch) return groupedInquiries;
    return groupedInquiries.filter((group) => {
      const customerMatches =
        String(group?.buyerName || '').toLowerCase().includes(normalizedInquirySearch) ||
        String(group?.buyerEmail || '').toLowerCase().includes(normalizedInquirySearch) ||
        String(group?.buyerId || '').toLowerCase().includes(normalizedInquirySearch);
      if (customerMatches) return true;
      return group.inquiries.some((entry) => {
        const product = String(entry?.productName || '').toLowerCase();
        const message = String(entry?.message || '').toLowerCase();
        return product.includes(normalizedInquirySearch) || message.includes(normalizedInquirySearch);
      });
    });
  }, [groupedInquiries, normalizedInquirySearch]);

  const totalInquiryPages = Math.max(1, Math.ceil(searchableGroupedInquiries.length / THREADS_PER_PAGE));
  const activeInquiryPage = Math.min(inquiryPage, totalInquiryPages);
  const visibleInquiryPages = useMemo(() => {
    if (totalInquiryPages <= 7) {
      return Array.from({ length: totalInquiryPages }, (_, index) => index + 1);
    }

    const pageSet = new Set([
      1,
      totalInquiryPages,
      Math.max(1, activeInquiryPage - 1),
      activeInquiryPage,
      Math.min(totalInquiryPages, activeInquiryPage + 1)
    ]);
    const sortedPages = Array.from(pageSet).sort((a, b) => a - b);
    const withEllipsis = [];

    for (let index = 0; index < sortedPages.length; index += 1) {
      const page = sortedPages[index];
      const previous = sortedPages[index - 1];
      if (typeof previous === 'number' && page - previous > 1) {
        withEllipsis.push(`ellipsis-${previous}-${page}`);
      }
      withEllipsis.push(page);
    }

    return withEllipsis;
  }, [activeInquiryPage, totalInquiryPages]);
  const pagedInquiryGroups = useMemo(() => {
    const start = (activeInquiryPage - 1) * THREADS_PER_PAGE;
    return searchableGroupedInquiries.slice(start, start + THREADS_PER_PAGE);
  }, [searchableGroupedInquiries, activeInquiryPage]);
  const visibleCustomerKeys = useMemo(() => new Set(pagedInquiryGroups.map((group) => group.key)), [pagedInquiryGroups]);

  useEffect(() => {
    if (!groupedInquiries.length) return;
    setExpandedCustomers((prev) => {
      const next = { ...prev };
      groupedInquiries.forEach((group, index) => {
        if (typeof next[group.key] === 'undefined') {
          next[group.key] = index === 0;
        }
      });
      return next;
    });
  }, [groupedInquiries]);
  useEffect(() => {
    setInquiryPage(1);
  }, [inquiryFilter, normalizedInquirySearch]);
  useEffect(() => {
    if (inquiryPage > totalInquiryPages) {
      setInquiryPage(totalInquiryPages);
    }
  }, [inquiryPage, totalInquiryPages]);
  const groupedInquiriesByKey = useMemo(
    () =>
      searchableGroupedInquiries.reduce((acc, group) => {
        acc[group.key] = group;
        return acc;
      }, {}),
    [searchableGroupedInquiries]
  );

  const newInquiryCount = useMemo(
    () => inquiries.filter((entry) => String(entry.status || 'new') === 'new').length,
    [inquiries]
  );
  const pendingReplyNotificationCount = useMemo(
    () =>
      inquiries.reduce((sum, entry) => {
        const status = String(entry?.status || 'new').toLowerCase();
        if (status === 'closed') return sum;
        const messages = Array.isArray(entry?.messages) ? entry.messages : [];
        const latest = messages.length ? messages[messages.length - 1] : null;
        const latestRole = String(latest?.senderRole || '').toLowerCase();
        const needsReply = status === 'new' || latestRole === 'buyer';
        return sum + (needsReply ? 1 : 0);
      }, 0),
    [inquiries]
  );
  const sellerName = user?.profile?.name || user?.name || 'Seller';
  const initials = String(sellerName).trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase())
    .join('') || 'S';

  const handleLogout = () => {
    clearCustomerSession();
    router.push('/login');
  };

  const handleCopyBuyerId = async (buyerId) => {
    try {
      await navigator.clipboard.writeText(String(buyerId || ''));
      setCopyMessage('Buyer ID copied.');
      setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setCopyMessage('Could not copy Buyer ID.');
      setTimeout(() => setCopyMessage(''), 1800);
    }
  };

  const handleStatusUpdate = async (inquiryId, nextStatus) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !inquiryId) return;

    setStatusActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await updateUserInquiryStatus(userId, inquiryId, nextStatus);
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: false }));

    if (!result?.success) {
      setCopyMessage(result?.message || 'Failed to update inquiry status.');
      setTimeout(() => setCopyMessage(''), 2200);
      return;
    }

    setInquiries((prev) =>
      prev.map((entry) =>
        String(entry.id || entry._id) === String(inquiryId)
          ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  const handleReplySubmit = async (inquiryId) => {
    const draft = String(replyDrafts[inquiryId] || '').trim();
    if (!draft) return;

    setReplyActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await replyToProductInquiry(inquiryId, draft);
    setReplyActionState((prev) => ({ ...prev, [inquiryId]: false }));

    if (!result?.success || !result?.inquiry) {
      setCopyMessage(result?.message || 'Failed to send reply.');
      setTimeout(() => setCopyMessage(''), 2200);
      return;
    }

    setInquiries((prev) =>
      prev.map((entry) =>
        String(entry.id || entry._id) === String(inquiryId) ? result.inquiry : entry
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [inquiryId]: '' }));
  };

  const toggleCustomerGroup = (customerKey) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [customerKey]: !prev[customerKey]
    }));
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(15,23,32,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--portal-accent)]" />
          Loading seller dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen text-[#0F1720]">
      <Head>
        <title>Seller Dashboard | B2B E-Commerce Platform</title>
        <meta name="description" content="Seller dashboard with customer inquiry inbox" />
      </Head>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="portal-hero overflow-hidden rounded-[1.6rem]">
          <div className="relative overflow-hidden px-5 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full border border-fuchsia-200/75 opacity-70" />
            <div className="pointer-events-none absolute right-[-2rem] top-6 h-32 w-32 rounded-full border border-sky-200/80 opacity-80" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-56 -translate-x-1/2 rounded-[999px] border border-white/90 bg-white/30" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.48),transparent)]" />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--portal-border-strong)] bg-[var(--portal-surface-muted)] text-lg font-bold text-[var(--portal-accent-strong)] sm:h-16 sm:w-16 sm:text-xl">
                    {initials}
                  </div>
                  <div>
                    <p className="portal-badge">
                      Seller Dashboard
                    </p>
                    <h1 className="portal-heading mt-2 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">
                      Welcome back, {sellerName}
                    </h1>
                    <p className="portal-text mt-2 max-w-2xl text-sm leading-6 sm:text-[15px]">
                      Manage buyer inquiries, keep your seller profile sharp, and stay ready for the next conversion from one brighter workspace.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/seller/products"
                    className="portal-primary-button px-4 py-2.5 text-sm font-semibold"
                  >
                    Manage Products
                  </Link>
                  <Link
                    href="/profile"
                    className="portal-primary-button px-4 py-2.5 text-sm font-semibold"
                  >
                    Manage Profile
                  </Link>
                  <a
                    href="#seller-inbox"
                    className="portal-outline-button px-4 py-2.5 text-sm font-semibold"
                  >
                    Open Inbox {pendingReplyNotificationCount > 0 ? `(${pendingReplyNotificationCount})` : ''}
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="portal-outline-button px-4 py-2.5 text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="portal-card rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(253,244,255,0.82),rgba(239,246,255,0.88))] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent)]">Seller Snapshot</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#5F6773]">
                    <span>Company setup</span>
                    <span className="font-semibold text-[#0F1720]">
                      {user?.profile?.companyName ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F6773]">
                    <span>New inquiries</span>
                    <span className="font-semibold text-[#0F1720]">{newInquiryCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F6773]">
                    <span>Need reply</span>
                    <span className="font-semibold text-[#0F1720]">{pendingReplyNotificationCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F6773]">
                    <span>Total inquiries</span>
                    <span className="font-semibold text-[#0F1720]">{inquiries.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F6773]">
                    <span>Withdrawable</span>
                    <span className="font-semibold text-[#0F1720]">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SellerMetric label="Profile Setup" value={user?.profile?.companyName ? 'Ready' : 'Pending'} detail="Keep company details polished and visible across seller workflows." href="/profile" />
          <SellerMetric label="New Inquiries" value={newInquiryCount} detail="Fresh buyer outreach waiting for follow-up." href="#seller-inbox" />
          <SellerMetric label="Need Reply" value={pendingReplyNotificationCount} detail="Conversations where the latest message is from buyers." href="#seller-inbox" />
          <SellerMetric label="Total Inquiries" value={inquiries.length} detail="Buyer messages across all tracked seller activity." />
          <SellerMetric label="Withdrawable" value="$0.00" detail="Settlement summaries will surface here as payout flows expand." href="/settlements" />
        </section>

        <section id="seller-inbox" className="portal-card mt-6 overflow-hidden rounded-[1.35rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <div>
              <h2 className="portal-heading text-lg font-semibold">Customer Inquiry Inbox</h2>
              <p className="portal-muted text-sm">Customers contacting your shop are listed here with identity details and action controls.</p>
            </div>
                <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={inquirySearch}
                onChange={(event) => setInquirySearch(event.target.value)}
                placeholder="Search customer, email, product..."
                className="w-[260px] rounded-[0.85rem] border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#334155] placeholder:text-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setInquiryFilter('all')}
                className={`rounded-[0.85rem] border px-3 py-1.5 text-sm ${inquiryFilter === 'all' ? 'border-[#D946EF] bg-[#D946EF] text-white' : 'border-[#E2E8F0] bg-white text-[#5F6773]'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('new')}
                className={`rounded-[0.85rem] border px-3 py-1.5 text-sm ${inquiryFilter === 'new' ? 'border-[#D946EF] bg-[#D946EF] text-white' : 'border-[#E2E8F0] bg-white text-[#5F6773]'}`}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('contacted')}
                className={`rounded-[0.85rem] border px-3 py-1.5 text-sm ${inquiryFilter === 'contacted' ? 'border-[#D946EF] bg-[#D946EF] text-white' : 'border-[#E2E8F0] bg-white text-[#5F6773]'}`}
              >
                Contacted
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('closed')}
                className={`rounded-[0.85rem] border px-3 py-1.5 text-sm ${inquiryFilter === 'closed' ? 'border-[#D946EF] bg-[#D946EF] text-white' : 'border-[#E2E8F0] bg-white text-[#5F6773]'}`}
              >
                Closed
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {copyMessage ? <p className="mb-3 text-xs text-[#C026D3]">{copyMessage}</p> : null}
            {inquiryError ? <p className="mb-3 text-xs text-red-600">{inquiryError}</p> : null}

            {inquiryLoading ? (
              <p className="text-sm text-[#6A717B]">Loading inquiries...</p>
            ) : searchableGroupedInquiries.length === 0 ? (
              <div className="rounded-[1.1rem] border border-dashed border-[#E2E8F0] bg-white/75 px-4 py-8 text-center text-sm text-[#6A717B]">
                No inquiries match your current filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((entry, index) => {
                  const entryId = String(entry.id || entry._id || `${entry.productId}-${entry.createdAt}`);
                  const buyerName = entry?.buyer?.name || 'Unknown customer';
                  const buyerEmail = entry?.buyer?.email || '';
                  const messages = Array.isArray(entry?.messages) ? entry.messages : [];
                  const customerKey = String(entry?.fromUserId || '').trim() || String(buyerEmail).toLowerCase() || String(buyerName).toLowerCase();
                  const previous = index > 0 ? filteredInquiries[index - 1] : null;
                  const previousKey = previous
                    ? (String(previous?.fromUserId || '').trim() || String(previous?.buyer?.email || '').toLowerCase() || String(previous?.buyer?.name || '').toLowerCase())
                    : null;
                  const startsCustomerThread = index === 0 || customerKey !== previousKey;
                  const groupMeta = groupedInquiriesByKey[customerKey];
                  const isExpanded = Boolean(expandedCustomers[customerKey]);
                  if (!visibleCustomerKeys.has(customerKey)) {
                    return null;
                  }
                  if (!startsCustomerThread && !isExpanded) {
                    return null;
                  }
                  return (
                    <div key={entryId} className="space-y-2">
                      {startsCustomerThread ? (
                        <button
                          type="button"
                          onClick={() => toggleCustomerGroup(customerKey)}
                          className="flex w-full items-center justify-between gap-3 rounded-[0.95rem] border border-[#E9D5FF] bg-[linear-gradient(135deg,#FDF4FF,#EFF6FF)] px-3 py-2.5 text-left"
                        >
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#7C3AED]">Customer Thread</p>
                            <p className="mt-1 text-sm font-semibold text-[#0F1720]">{buyerName}</p>
                            <p className="text-xs text-[#5F6773]">{buyerEmail || 'No email provided'} | ID: {entry.fromUserId || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-[#6D28D9]">{groupMeta?.total || 1} messages</p>
                            <p className="text-[11px] text-[#7A818C]">{isExpanded ? 'Collapse' : 'Expand'}</p>
                          </div>
                        </button>
                      ) : null}
                    <article className="rounded-[1rem] border border-[#E2E8F0] bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,32,0.04)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#0F1720]">{entry.productName || `Product ${entry.productId || '-'}`}</h3>
                          <p className="mt-1 text-sm text-[#5F6773]">Customer: {buyerName}{buyerEmail ? ` (${buyerEmail})` : ''}</p>
                          <p className="text-xs text-[#7A818C]">Customer ID: {entry.fromUserId || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#7A818C]">{formatDateTime(entry.createdAt)}</p>
                          <div className="mt-1">
                            <InquiryStatusPill status={entry.status} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-[0.9rem] border border-[#E2E8F0] bg-white px-3 py-2">
                          <p className="text-xs text-[#7A818C]">Quantity</p>
                          <p className="font-semibold text-[#0F1720]">{entry.quantity || 1}</p>
                        </div>
                        <div className="rounded-[0.9rem] border border-[#E2E8F0] bg-white px-3 py-2 md:col-span-2">
                          <p className="text-xs text-[#7A818C]">Message</p>
                          <p className="whitespace-pre-line text-[#5F6773]">{entry.message || '-'}</p>
                        </div>
                      </div>

                      {messages.length > 0 ? (
                        <div className="mt-3 rounded-[0.9rem] border border-[#E2E8F0] bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A818C]">Conversation</p>
                          <div className="mt-2 space-y-2">
                            {messages.slice(-6).map((item) => (
                              <div key={item?.id || `${entryId}-${item?.createdAt || ''}-${item?.text || ''}`} className="rounded-lg border border-[#E5E7EB] bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                  {String(item?.senderRole || '').toLowerCase() === 'seller' ? 'You' : (entry?.buyer?.name || 'Buyer')} • {formatDateTime(item?.createdAt)}
                                </p>
                                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{item?.text || '-'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-3 rounded-[0.9rem] border border-[#E2E8F0] bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A818C]">Reply to Customer</p>
                        <textarea
                          rows={3}
                          value={replyDrafts[entryId] || ''}
                          onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [entryId]: event.target.value }))}
                          className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#334155]"
                          placeholder="Write your reply..."
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={replyActionState[entryId] || !String(replyDrafts[entryId] || '').trim()}
                            onClick={() => handleReplySubmit(entryId)}
                            className="inline-flex items-center rounded-[0.85rem] bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-3 py-2 text-xs font-semibold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {replyActionState[entryId] ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {buyerEmail ? (
                          <a
                            href={`mailto:${encodeURIComponent(buyerEmail)}?subject=${encodeURIComponent(`Regarding ${entry.productName || 'your inquiry'}`)}`}
                            className="inline-flex items-center rounded-[0.85rem] bg-[linear-gradient(135deg,#D946EF,#FB7185_52%,#FB923C)] px-3 py-2 text-xs font-semibold text-white hover:brightness-105"
                          >
                            Reply by Email
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleCopyBuyerId(entry.fromUserId)}
                          className="inline-flex items-center rounded-[0.85rem] border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#5F6773] hover:border-[#F0ABFC]"
                        >
                          Copy Customer ID
                        </button>
                        <button
                          type="button"
                          disabled={statusActionState[entryId]}
                          onClick={() => handleStatusUpdate(entryId, 'contacted')}
                          className="inline-flex items-center rounded-[0.85rem] border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                        >
                          Mark Contacted
                        </button>
                        <button
                          type="button"
                          disabled={statusActionState[entryId]}
                          onClick={() => handleStatusUpdate(entryId, 'closed')}
                          className="inline-flex items-center rounded-[0.85rem] border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          Mark Closed
                        </button>
                      </div>
                    </article>
                    </div>
                  );
                })}
              </div>
            )}
            {!inquiryLoading && searchableGroupedInquiries.length > 0 && totalInquiryPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-[#64748B]">
                  Page {activeInquiryPage} of {totalInquiryPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeInquiryPage <= 1}
                    onClick={() => setInquiryPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-[0.85rem] border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#5F6773] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  {visibleInquiryPages.map((pageToken) => {
                    if (typeof pageToken !== 'number') {
                      return (
                        <span key={pageToken} className="px-1 text-sm text-[#94A3B8]">
                          ...
                        </span>
                      );
                    }

                    const isActive = pageToken === activeInquiryPage;
                    return (
                      <button
                        key={pageToken}
                        type="button"
                        onClick={() => setInquiryPage(pageToken)}
                        className={`rounded-[0.85rem] border px-3 py-1.5 text-sm ${
                          isActive
                            ? 'border-[#D946EF] bg-[#D946EF] text-white'
                            : 'border-[#E2E8F0] bg-white text-[#5F6773]'
                        }`}
                      >
                        {pageToken}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={activeInquiryPage >= totalInquiryPages}
                    onClick={() => setInquiryPage((prev) => Math.min(totalInquiryPages, prev + 1))}
                    className="rounded-[0.85rem] border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#5F6773] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="portal-card mt-6 overflow-hidden rounded-[1.35rem]">
          <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <h2 className="portal-heading text-lg font-semibold">Seller Actions</h2>
            <p className="portal-muted mt-1 text-sm">The core seller actions, kept concise and easy to reach.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            <SellerAction href="/dashboard/seller/new-product" title="Post Product" description="Create and publish a new product listing from seller workspace." />
            <SellerAction href="/dashboard/seller/products" title="Manage Products" description="Review all your posted listings and edit or delete them quickly." />
            <SellerAction href="/profile" title="Business Profile" description="Update company details and seller account information." />
            <SellerAction href="/inquiries" title="Inquiry Center" description="Track and respond to customer messages." />
            <SellerAction href="/settlements" title="Settlements" description="Review payout and withdrawal status." />
            <SellerAction href="/markets/b2b" title="B2B Market" description="Review the current wholesale market experience." />
            <SellerAction href="/marketplace?view=local" title="Local Market" description="Browse the local buying journey and featured listings." />
          </div>
        </section>

        <section className="portal-card mt-6 overflow-hidden rounded-[1.35rem]">
          <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <h2 className="portal-heading text-lg font-semibold">Shop Information</h2>
            <p className="portal-muted mt-1 text-sm">A compact operational view of the seller identity attached to this account.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 sm:p-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0F1720]">Company Name</h3>
              <p className="text-[#5F6773]">{user?.profile?.companyName || 'Not set'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0F1720]">Business Type</h3>
              <p className="text-[#5F6773]">{user?.profile?.businessType || 'Not set'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0F1720]">Email</h3>
              <p className="text-[#5F6773]">{user?.profile?.email || user?.email || 'Not set'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0F1720]">Phone</h3>
              <p className="text-[#5F6773]">{user?.profile?.phone || 'Not set'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-[#0F1720]">Business Location</h3>
              <p className="text-[#5F6773]">
                {user?.profile?.locationAddress ||
                  (user?.profile?.locationLat && user?.profile?.locationLng
                    ? `${user.profile.locationLat}, ${user.profile.locationLng}`
                    : 'Not set')}
              </p>
              {user?.profile?.locationLat && user?.profile?.locationLng ? (
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(`${user.profile.locationLat},${user.profile.locationLng}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-semibold text-[#C026D3] hover:text-[#DB2777]"
                >
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          </div>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <Link href="/profile" className="portal-primary-button inline-flex items-center px-4 py-2.5 text-sm font-semibold">
              Edit Profile
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
