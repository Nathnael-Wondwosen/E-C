import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/header/Header';
import {
  getUserInquiryInbox,
  getUserInquirySent,
  markInquiryAsRead,
  replyToProductInquiry,
  subscribeToInquiryUpdates,
  updateUserInquiryStatus
} from '../utils/userService';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusClass = (status) => {
  const normalized = String(status || 'new').toLowerCase();
  if (normalized === 'closed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === 'contacted') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (normalized === 'new') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

const getInquiryKey = (entry) => String(entry?.id || entry?._id || `${entry?.productId || 'product'}-${entry?.createdAt || Date.now()}`);
const getProductThreadKey = (entry) => {
  const productId = String(entry?.productId || '').trim();
  if (productId) return `product:${productId}`;
  const productName = String(entry?.productName || '').trim().toLowerCase();
  if (productName) return `name:${productName}`;
  return `fallback:${getInquiryKey(entry)}`;
};

const getLastMessageText = (entry) => {
  const messages = Array.isArray(entry?.messages) ? entry.messages : [];
  if (messages.length > 0) return String(messages[messages.length - 1]?.text || '').trim();
  return String(entry?.message || '').trim();
};

const getProductImageUrl = (entry) => {
  const candidates = [
    entry?.productImageUrl,
    entry?.productImage,
    entry?.image,
    Array.isArray(entry?.images) ? entry.images[0] : null,
    entry?.product?.image,
    entry?.product?.imageUrl,
    Array.isArray(entry?.product?.images) ? entry.product.images[0] : null
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
};

const getProductPriceLabel = (entry) => {
  const candidates = [
    entry?.price,
    entry?.productPrice,
    entry?.product?.price,
    entry?.product?.unitPrice,
    entry?.unitPrice
  ];

  for (const candidate of candidates) {
    if (candidate === 0 || candidate === '0') return 'ETB 0';
    if (candidate) return `ETB ${candidate}`;
  }
  return '';
};

const getContactDetails = (entry, userType) => {
  const counterpart = userType === 'seller' ? entry?.buyer : entry?.seller;
  const phoneCandidates = [
    counterpart?.phone,
    counterpart?.profile?.phone,
    entry?.counterpartPhone,
    entry?.phone,
    entry?.seller?.phone,
    entry?.seller?.profile?.phone,
    entry?.buyer?.phone,
    entry?.buyer?.profile?.phone
  ];
  const emailCandidates = [
    counterpart?.email,
    counterpart?.profile?.email,
    entry?.counterpartEmail,
    entry?.email,
    entry?.seller?.email,
    entry?.buyer?.email
  ];

  const phone = phoneCandidates.find((value) => typeof value === 'string' && value.trim()) || '';
  const email = emailCandidates.find((value) => typeof value === 'string' && value.trim()) || '';
  return { phone: phone.trim(), email: email.trim() };
};

function SellerMessagesHeader ({
  title,
  unreadCount,
  onBack,
  onRefresh,
  isRefreshing = false,
  threadContactName = '',
  threadContactInitials = '',
  showThreadHeader = false
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#D5DEE7] bg-white/96 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1450px] items-center justify-between px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#334155]"
          aria-label="Go back"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {showThreadHeader ? (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#9FD3A4] bg-[#8DD490] text-xs font-semibold text-white">
                {threadContactInitials || 'U'}
              </div>
              <p className="truncate text-[15px] font-semibold text-[#2A3D50]">{threadContactName || title}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1AA347]"
              aria-label="Chat options"
              title="Chat options"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 4a2 2 0 110-4 2 2 0 010 4Zm0 8a2 2 0 110-4 2 2 0 010 4Zm0 8a2 2 0 110-4 2 2 0 010 4Z" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <p className="max-w-[58vw] truncate text-base font-semibold text-[#0F172A] sm:text-lg">{title}</p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#334155] disabled:opacity-60"
                aria-label="Refresh messages"
                title="Refresh messages"
              >
                <svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 9a8 8 0 0 0-13.66-3.66L4 10m16 4-2.34 4.66A8 8 0 0 1 4 15" />
                </svg>
              </button>

              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[#334155]"
                aria-label="Notifications"
                title="Notifications"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.5 16.5h11l-1.2-1.8a4.5 4.5 0 0 1-.8-2.5V10a3.5 3.5 0 1 0-7 0v2.2a4.5 4.5 0 0 1-.8 2.5L6.5 16.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18.5a2 2 0 0 0 4 0" />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute right-0.5 top-0.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#16A34A] px-1 text-[9px] font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function SellerMessagesNavItem ({ href, label, active = false, children }) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-0.5 py-2">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
        active ? 'bg-[rgba(124,58,237,0.12)] text-[#7C3AED]' : 'text-slate-400'
      }`}>
        {children}
      </span>
      <span className={`text-[10px] font-semibold ${active ? 'text-[#7C3AED]' : 'text-slate-700'}`}>{label}</span>
    </Link>
  );
}

export default function InquiryCenterPage () {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [userType, setUserType] = useState('buyer');
  const [currentUserId, setCurrentUserId] = useState('');
  const [statusActionState, setStatusActionState] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyActionState, setReplyActionState] = useState({});
  const [activeContactKey, setActiveContactKey] = useState('');
  const [activeInquiryId, setActiveInquiryId] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [leftTab, setLeftTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [refreshError, setRefreshError] = useState('');
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);
  const chatScrollRef = useRef(null);

  const loadInquiries = useCallback(
    async ({ showLoader = false, silent = false } = {}) => {
      if (typeof window === 'undefined') return;
      try {
        if (showLoader) setLoading(true);
        else setIsRefreshing(true);

        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const storedUserType = localStorage.getItem('userType') || 'buyer';
        const userId = localStorage.getItem('userId');

        if (!isLoggedIn || !userId) {
          router.push('/login');
          return;
        }

        setUserType(storedUserType);
        setCurrentUserId(String(userId));

        const result =
          storedUserType === 'seller' ? await getUserInquiryInbox(userId) : await getUserInquirySent(userId);
        setRows(Array.isArray(result?.inquiries) ? result.inquiries : []);
        setLastSyncedAt(Date.now());
        setRefreshError('');
      } catch (loadError) {
        console.error('Failed to load inquiries:', loadError);
        if (!silent) setRows([]);
        setRefreshError('Unable to refresh messages. Check your connection and try again.');
      } finally {
        if (showLoader) setLoading(false);
        setIsRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadInquiries({ showLoader: true });
  }, [loadInquiries]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadInquiries({ silent: true });
    }, 12000);
    const onFocus = () => {
      loadInquiries({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadInquiries]);

  useEffect(() => {
    if (!currentUserId) return undefined;
    const streamMode = userType === 'seller' ? 'inbox' : 'sent';
    const unsubscribe = subscribeToInquiryUpdates(currentUserId, {
      mode: streamMode,
      onSnapshot: () => {
        loadInquiries({ silent: true });
      },
      onError: () => {
        setRefreshError('Live updates disconnected. Using background refresh.');
      }
    });
    return () => {
      unsubscribe();
    };
  }, [currentUserId, userType, loadInquiries]);

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
      ),
    [rows]
  );

  const groupedContacts = useMemo(() => {
    const map = new Map();
    sortedRows.forEach((entry) => {
      const counterpart = userType === 'seller' ? entry?.buyer : entry?.seller;
      const counterpartId = String(counterpart?.id || counterpart?._id || (userType === 'seller' ? entry?.buyerId || entry?.fromUserId : entry?.sellerId || entry?.toUserId) || '').trim();
      const fallbackEmail = String(counterpart?.email || '').trim().toLowerCase();
      const fallbackName = String(counterpart?.name || '').trim().toLowerCase();
      const contactKey = counterpartId || fallbackEmail || fallbackName || `contact-${getInquiryKey(entry)}`;

      if (!map.has(contactKey)) {
        map.set(contactKey, {
          key: contactKey,
          counterpartId,
          counterpartName: counterpart?.name || (userType === 'seller' ? 'Unknown customer' : 'Shop owner'),
          counterpartEmail: counterpart?.email || '',
          threads: [],
          latestAt: entry?.updatedAt || entry?.createdAt || null,
          unreadTotal: 0
        });
      }
      const current = map.get(contactKey);
      current.threads.push(entry);
      current.unreadTotal += Number(entry?.unreadCount || 0);
      const currentLatest = new Date(current.latestAt || 0).getTime();
      const rowLatest = new Date(entry?.updatedAt || entry?.createdAt || 0).getTime();
      if (rowLatest > currentLatest) current.latestAt = entry?.updatedAt || entry?.createdAt || current.latestAt;
    });

    return Array.from(map.values())
      .map((contact) => ({
        ...contact,
        threads: [...contact.threads].sort(
          (a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        )
      }))
      .sort((a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime());
  }, [sortedRows, userType]);

  const normalizedContactSearch = String(contactSearch || '').trim().toLowerCase();
  const normalizedThreadSearch = String(threadSearch || '').trim().toLowerCase();

  const filteredContacts = useMemo(() => {
    return groupedContacts
      .map((contact) => {
        const filteredThreads = contact.threads.filter((thread) => {
          if (!normalizedThreadSearch) return true;
          const productName = String(thread?.productName || '').toLowerCase();
          const status = String(thread?.status || '').toLowerCase();
          return productName.includes(normalizedThreadSearch) || status.includes(normalizedThreadSearch);
        });
        return {
          ...contact,
          threads: filteredThreads,
          unreadTotal: filteredThreads.reduce((sum, thread) => sum + Number(thread?.unreadCount || 0), 0),
          latestAt: filteredThreads[0]?.updatedAt || filteredThreads[0]?.createdAt || contact.latestAt
        };
      })
      .filter((contact) => contact.threads.length > 0)
      .filter((contact) => {
        if (!normalizedContactSearch) return true;
        const haystack = [
          contact.counterpartName,
          contact.counterpartEmail,
          contact.counterpartId
        ]
          .map((value) => String(value || '').toLowerCase())
          .join(' ');
        return haystack.includes(normalizedContactSearch);
      });
  }, [groupedContacts, normalizedContactSearch, normalizedThreadSearch]);

  useEffect(() => {
    if (!filteredContacts.length) {
      setActiveContactKey('');
      return;
    }
    const stillExists = filteredContacts.some((contact) => contact.key === activeContactKey);
    if (!stillExists) setActiveContactKey(filteredContacts[0].key);
  }, [filteredContacts, activeContactKey]);

  const conversationThreads = useMemo(() => {
    const conversations = [];

    filteredContacts.forEach((contact) => {
      const grouped = new Map();
      contact.threads.forEach((entry) => {
        const key = getProductThreadKey(entry);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(entry);
      });

      Array.from(grouped.values()).forEach((items) => {
        const sorted = [...items].sort(
          (a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        );
        const primary = sorted[0];
        const mergedMessages = sorted
          .flatMap((row) => (Array.isArray(row?.messages) ? row.messages : []))
          .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

        const uniqueMessages = [];
        const seen = new Set();
        mergedMessages.forEach((message) => {
          const messageKey = `${String(message?.senderId || '')}|${String(message?.createdAt || '')}|${String(message?.text || '')}`;
          if (seen.has(messageKey)) return;
          seen.add(messageKey);
          uniqueMessages.push(message);
        });

        conversations.push({
          ...primary,
          messages: uniqueMessages,
          sourceThreadIds: sorted.map((row) => getInquiryKey(row)),
          mergedThreadCount: sorted.length,
          unreadCount: sorted.reduce((sum, row) => sum + Number(row?.unreadCount || 0), 0),
          contactKey: contact.key,
          counterpartName: contact.counterpartName,
          counterpartEmail: contact.counterpartEmail,
          counterpartId: contact.counterpartId
        });
      });
    });

    return conversations.sort(
      (a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
    );
  }, [filteredContacts]);

  const visibleThreads = useMemo(() => {
    if (leftTab === 'unread') {
      return conversationThreads.filter((entry) => Number(entry?.unreadCount || 0) > 0);
    }
    if (leftTab === 'contacted') {
      return conversationThreads.filter((entry) => String(entry?.status || '').toLowerCase() === 'contacted');
    }
    if (leftTab === 'closed') {
      return conversationThreads.filter((entry) => String(entry?.status || '').toLowerCase() === 'closed');
    }
    if (leftTab === 'spam') {
      return conversationThreads.filter((entry) => String(entry?.status || '').toLowerCase() === 'spam');
    }
    return conversationThreads;
  }, [conversationThreads, leftTab]);

  const leftTabs = useMemo(() => {
    if (userType === 'seller') {
      return [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'contacted', label: 'Contacted' },
        { id: 'closed', label: 'Closed' },
      ];
    }
    return [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
      { id: 'closed', label: 'Closed' },
    ];
  }, [userType]);

  useEffect(() => {
    if (!leftTabs.some((tab) => tab.id === leftTab)) {
      setLeftTab('all');
    }
  }, [leftTabs, leftTab]);

  useEffect(() => {
    if (!visibleThreads.length) {
      setActiveInquiryId('');
      setActiveContactKey('');
      return;
    }

    const activeStillExists = visibleThreads.some((entry) => getInquiryKey(entry) === activeInquiryId);
    if (!activeStillExists) {
      const first = visibleThreads[0];
      setActiveInquiryId(getInquiryKey(first));
      setActiveContactKey(first.contactKey || '');
    }
  }, [visibleThreads, activeInquiryId]);

  const activeInquiry = useMemo(
    () => visibleThreads.find((entry) => getInquiryKey(entry) === activeInquiryId) || null,
    [visibleThreads, activeInquiryId]
  );

  useEffect(() => {
    if (!activeInquiryId) return;
    const el = chatScrollRef.current;
    if (!el) return;
    const rafId = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [activeInquiryId, activeInquiry?.messages?.length]);

  const activeContactDetails = useMemo(
    () => (activeInquiry ? getContactDetails(activeInquiry, userType) : { phone: '', email: '' }),
    [activeInquiry, userType]
  );
  const unreadNotificationCount = useMemo(
    () => conversationThreads.reduce((sum, entry) => sum + Number(entry?.unreadCount || 0), 0),
    [conversationThreads]
  );
  const sellerHeaderTitle = userType === 'seller' && isMobileThreadOpen && activeInquiry
    ? String(activeInquiry?.counterpartName || 'Messages')
    : 'Messages';
  const activeInquiryInitials = useMemo(
    () => String(activeInquiry?.counterpartName || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((piece) => piece[0]?.toUpperCase())
      .join('') || 'U',
    [activeInquiry]
  );

  useEffect(() => {
    if (!activeInquiryId) return;
    const selected = visibleThreads.find((entry) => getInquiryKey(entry) === activeInquiryId);
    if (!selected) return;
    if (Number(selected?.unreadCount || 0) <= 0) return;

    let cancelled = false;
    const markRead = async () => {
      const sourceIds = Array.isArray(selected?.sourceThreadIds) && selected.sourceThreadIds.length
        ? selected.sourceThreadIds
        : [activeInquiryId];
      const results = await Promise.all(sourceIds.map((threadId) => markInquiryAsRead(threadId)));
      if (cancelled) return;
      const successful = results.filter((result) => result?.success && result?.inquiry).map((result) => result.inquiry);
      const successfulMap = new Map(successful.map((entry) => [getInquiryKey(entry), entry]));
      setRows((prev) =>
        prev.map((entry) =>
          sourceIds.includes(getInquiryKey(entry))
            ? (successfulMap.get(getInquiryKey(entry)) || { ...entry, unreadCount: 0 })
            : entry
        )
      );
    };
    markRead();
    return () => {
      cancelled = true;
    };
  }, [activeInquiryId, visibleThreads]);

  const title = useMemo(
    () => (userType === 'seller' ? 'Customer Inquiry Inbox' : 'My Conversations'),
    [userType]
  );
  const subtitle = useMemo(
    () => (userType === 'seller'
      ? 'Conversations are grouped by customer, with each product inquiry as a separate thread.'
      : 'Conversations are grouped by seller, with separate threads for different products.'),
    [userType]
  );
  const accountHome = userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer';
  const handleGoBack = () => {
    if (isMobileThreadOpen) {
      setIsMobileThreadOpen(false);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(accountHome);
  };

  const handleStatusUpdate = async (inquiryId, nextStatus) => {
    if (userType !== 'seller') return;
    const userId = localStorage.getItem('userId');
    if (!userId || !inquiryId) return;

    const activeThread = conversationThreads.find((entry) => getInquiryKey(entry) === String(inquiryId));
    const sourceIds = Array.isArray(activeThread?.sourceThreadIds) && activeThread.sourceThreadIds.length
      ? activeThread.sourceThreadIds
      : [String(inquiryId)];

    setStatusActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const results = await Promise.all(sourceIds.map((threadId) => updateUserInquiryStatus(userId, threadId, nextStatus)));
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: false }));

    const anySuccess = results.some((result) => result?.success);
    if (!anySuccess) return;
    const updatedMap = new Map(
      results
        .filter((result) => result?.success && result?.inquiry)
        .map((result) => [getInquiryKey(result.inquiry), result.inquiry])
    );

    setRows((prev) =>
      prev.map((entry) =>
        sourceIds.includes(getInquiryKey(entry))
          ? (updatedMap.get(getInquiryKey(entry)) || { ...entry, status: nextStatus, updatedAt: new Date().toISOString() })
          : entry
      )
    );
  };

  const handleReplySubmit = async (inquiryId) => {
    const draft = String(replyDrafts[inquiryId] || '').trim();
    if (!draft) return;

    const activeThread = conversationThreads.find((entry) => getInquiryKey(entry) === String(inquiryId));
    const sourceIds = Array.isArray(activeThread?.sourceThreadIds) && activeThread.sourceThreadIds.length
      ? activeThread.sourceThreadIds
      : [String(inquiryId)];

    setReplyActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await replyToProductInquiry(inquiryId, draft);
    setReplyActionState((prev) => ({ ...prev, [inquiryId]: false }));
    if (!result?.success || !result?.inquiry) {
      setRefreshError(result?.message || 'Failed to send message. Please try again.');
      return;
    }

    setRows((prev) =>
      prev.map((entry) =>
        sourceIds.includes(getInquiryKey(entry))
          ? {
              ...entry,
              ...result.inquiry,
              unreadCount: getInquiryKey(entry) === String(inquiryId) ? result.inquiry?.unreadCount || 0 : 0
            }
          : entry
      )
    );
    setLastSyncedAt(Date.now());
    setRefreshError('');
    setReplyDrafts((prev) => ({ ...prev, [inquiryId]: '' }));
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(160,96,18,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#D7932D]" />
          Loading inquiries...
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Inquiry Center | B2B E-Commerce Platform</title>
        <meta name="description" content="Inquiry center with separated inquiry detail and message thread views" />
      </Head>
      {userType === 'seller'
        ? (
          <SellerMessagesHeader
            title={sellerHeaderTitle}
            unreadCount={unreadNotificationCount}
            onBack={handleGoBack}
            onRefresh={() => loadInquiries({ silent: true })}
            isRefreshing={isRefreshing}
            showThreadHeader={Boolean(userType === 'seller' && isMobileThreadOpen && activeInquiry)}
            threadContactName={activeInquiry?.counterpartName || ''}
            threadContactInitials={activeInquiryInitials}
          />
          )
        : <Header />}

      <main className="mx-auto h-[calc(100vh-56px)] max-w-[1450px] px-0 py-0 pb-24 sm:px-4 sm:py-3 sm:pb-3 lg:px-6">
        {sortedRows.length === 0 ? (
          <section className="mx-3 mt-3 rounded-2xl border border-[var(--portal-border)] bg-white p-10 text-center shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:mx-0 sm:mt-0">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-10 w-10 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
            </div>
            <h3 className="portal-heading text-xl font-semibold">No conversations yet</h3>
            <p className="portal-text mt-2 text-sm">Start from any product page and your threads will appear here.</p>
            <div className="mt-5">
              <Link href={accountHome} className="portal-secondary-button">Back to Dashboard</Link>
            </div>
          </section>
        ) : (
          <section className="grid h-full min-h-0 overflow-hidden rounded-none border-0 bg-[#DDE6EC] shadow-none grid-cols-1 sm:mx-0 sm:rounded-none sm:border sm:border-[#BFD0DB] sm:shadow-[0_10px_32px_rgba(15,23,42,0.12)] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className={`min-h-0 flex-col border-r border-[#BFD0DB] bg-[#F6F8FA] ${isMobileThreadOpen ? 'hidden lg:flex' : 'flex'}`}>
              <div className="border-b border-[#CAD6DF] px-3 py-1.5 sm:px-4 sm:py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-[-0.01em] text-[#2B3D50] sm:text-lg">{userType === 'seller' ? 'Messages' : 'My messages'}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadInquiries({ silent: true })}
                    disabled={isRefreshing}
                    className="rounded-md border border-[#BFCFDC] bg-white px-2 py-1 text-[11px] font-semibold text-[#40617B] disabled:opacity-60"
                  >
                    {isRefreshing ? 'Syncing...' : 'Refresh'}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#6F8CA3]">
                  {refreshError
                    ? refreshError
                    : lastSyncedAt
                      ? `Updated ${formatTime(lastSyncedAt)}`
                      : 'Waiting for first sync...'}
                </p>
                <div className="relative mt-2">
                  <input
                    type="search"
                    value={contactSearch}
                    onChange={(event) => setContactSearch(event.target.value)}
                    placeholder="Search"
                    className="w-full rounded-xl border border-[#BFCFDC] bg-white px-3 py-2 pr-9 text-sm text-[#3B556D] placeholder:text-[#7A93A8]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F8CA3]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.6 10.6Z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="border-b border-[#CAD6DF] px-4 pt-2">
                <div className={`grid ${leftTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {leftTabs.map((tab) => {
                    const isActive = leftTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLeftTab(tab.id)}
                        className={`relative py-1 text-center text-[11px] font-medium sm:text-xs ${
                          isActive ? 'text-[#159C43]' : 'text-[#6C869B]'
                        }`}
                      >
                        {tab.label}
                        {isActive ? <span className="absolute inset-x-8 bottom-0 h-0.5 bg-[#16A34A]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {visibleThreads.map((thread) => {
                  const threadId = getInquiryKey(thread);
                  const isActive = threadId === activeInquiryId;
                  const initials = String(thread?.counterpartName || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((piece) => piece[0]?.toUpperCase())
                    .join('') || 'U';
                  const productImage = getProductImageUrl(thread);
                  const lastText = getLastMessageText(thread) || 'No messages yet.';

                  return (
                    <button
                      key={threadId}
                      type="button"
                      onClick={() => {
                        setActiveContactKey(thread.contactKey || '');
                        setActiveInquiryId(threadId);
                        setIsMobileThreadOpen(true);
                      }}
                      className={`w-full border-b border-[#D4DEE6] px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
                        isActive ? 'bg-[#E7F6ED]' : 'bg-white hover:bg-[#F4F8FB]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C6D4DF] bg-[#E9F0F6] text-[11px] font-semibold text-[#516D84]">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-1 text-[13px] font-semibold text-[#1E3447]">{thread?.counterpartName || initials}</p>
                            <span className="shrink-0 pt-0.5 text-[10px] text-[#607D94]">{formatTime(thread?.updatedAt || thread?.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-[#35536C]">{thread?.productName || `Product ${thread?.productId || '-'}`}</p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="line-clamp-1 text-[11px] text-[#6A879D]">{lastText}</p>
                            {Number(thread?.unreadCount || 0) > 0 ? (
                              <span className="inline-flex rounded-full bg-[#16A34A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {Number(thread.unreadCount)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={thread?.productName || 'Product'}
                            className="h-10 w-10 shrink-0 rounded-md border border-[#C6D4DF] object-cover"
                          />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
                {visibleThreads.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-[#5A7489]">No conversations in this tab.</div>
                ) : null}
              </div>
            </aside>

            {activeInquiry ? (
              <div className={`min-h-0 flex-col bg-[#D4DEE5] ${isMobileThreadOpen ? 'flex' : 'hidden lg:flex'}`}>
                <div className="border-b border-[#BFD0DB] bg-[#F7F8F9] px-2 py-1 sm:py-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {getProductImageUrl(activeInquiry) ? (
                        <img
                          src={getProductImageUrl(activeInquiry)}
                          alt={activeInquiry?.productName || 'Product'}
                          className="h-10 w-12 shrink-0 rounded-sm border border-[#C7D4DF] object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-sm border border-[#C7D4DF] bg-[#E9F0F6] text-xs text-[#6E8497]">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[13px] font-semibold text-[#4B5563]">{activeInquiry?.productName || `Product ${activeInquiry?.productId || '-'}`}</p>
                        {getProductPriceLabel(activeInquiry) ? (
                          <div className="mt-0.5 inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {getProductPriceLabel(activeInquiry)}
                          </div>
                        ) : (
                          <div className="mt-0.5 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Price on request
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                      {activeContactDetails.phone ? (
                        <a
                          href={`tel:${activeContactDetails.phone}`}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.9 1.37l.97 2.91a2 2 0 01-.45 2.06l-1.26 1.27a16 16 0 006.59 6.59l1.27-1.26a2 2 0 012.06-.45l2.91.97A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z" />
                          </svg>
                          {activeContactDetails.phone}
                        </a>
                      ) : (
                        <span className="inline-flex h-9 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-500">
                          Un verified
                        </span>
                      )}
                      {userType === 'seller' ? (
                        <>
                          <button
                            type="button"
                            disabled={statusActionState[activeInquiryId]}
                            onClick={() => handleStatusUpdate(activeInquiryId, 'contacted')}
                            className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 disabled:opacity-60"
                          >
                            Contacted
                          </button>
                          <button
                            type="button"
                            disabled={statusActionState[activeInquiryId]}
                            onClick={() => handleStatusUpdate(activeInquiryId, 'closed')}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 disabled:opacity-60"
                          >
                            Closed
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div ref={chatScrollRef} className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-[#CFD9E1] px-3 py-3 sm:px-4">
                  <div className="mx-auto mb-3 w-fit rounded-full border border-[#F0A552] bg-[#FFF4E7] px-6 py-1.5 text-sm text-[#926022]">
                    Avoid paying in advance! Even for delivery
                  </div>

                  <div className="space-y-3">
                    {(Array.isArray(activeInquiry?.messages) && activeInquiry.messages.length
                      ? activeInquiry.messages
                      : [{
                          id: `${activeInquiryId}-initial`,
                          senderId: String(activeInquiry?.buyerId || activeInquiry?.fromUserId || ''),
                          senderRole: 'buyer',
                          text: activeInquiry?.message || '',
                          createdAt: activeInquiry?.createdAt || null
                        }].filter((item) => item.text)
                    ).map((item, index, list) => {
                      const isMine = currentUserId && String(item?.senderId || '') === String(currentUserId);
                      const prev = list[index - 1];
                      const currentDay = item?.createdAt ? new Date(item.createdAt).toDateString() : '';
                      const prevDay = prev?.createdAt ? new Date(prev.createdAt).toDateString() : '';
                      const showDayDivider = currentDay && currentDay !== prevDay;
                      return (
                        <div key={item?.id || `${activeInquiryId}-${item?.createdAt || ''}-${item?.text || ''}`}>
                          {showDayDivider ? (
                            <p className="mb-3 text-center text-xs text-[#60809B]">{new Date(item.createdAt).toLocaleDateString()}</p>
                          ) : null}
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[78%] rounded-2xl px-4 py-2 ${
                              isMine
                                ? 'rounded-br-md bg-[#B8DBBF] text-[#19324A]'
                                : 'rounded-bl-md bg-white text-[#19324A]'
                            }`}>
                              <p className="whitespace-pre-line text-sm leading-6 sm:text-[15px]">{item?.text || '-'}</p>
                              <p className={`mt-1 text-right text-xs ${isMine ? 'text-[#3C6A4A]' : 'text-[#7191A8]'}`}>
                                {formatTime(item?.createdAt)} {isMine ? '✓✓' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[#BFD0DB] bg-[#F2F4F6] px-3 py-2.5 sm:px-4">
                  <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {['Last price', 'Ask for location', 'Make an offer', 'Please call me', "Let's plan a meeting"].map((shortcut) => (
                      <button
                        key={shortcut}
                        type="button"
                        onClick={() =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [activeInquiryId]: prev[activeInquiryId]
                              ? `${prev[activeInquiryId]} ${shortcut}`
                              : shortcut
                          }))
                        }
                        className="rounded-xl border border-[#129B45] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F8A3D] sm:px-3 sm:py-1.5 sm:text-sm"
                      >
                        {shortcut}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-[#6A8BA3]">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 11-5.656-5.656m5.656 5.656L19 19m-4.172-4.172a4 4 0 00-5.656-5.656" />
                      </svg>
                    </button>
                    <button type="button" className="text-[#6A8BA3]">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487a2.5 2.5 0 00-3.536 0L5.5 12.313a4 4 0 005.657 5.657l7.778-7.778a5.5 5.5 0 10-7.778-7.778L3.38 10.192" />
                      </svg>
                    </button>
                    <input
                      value={replyDrafts[activeInquiryId] || ''}
                      onChange={(event) =>
                        setReplyDrafts((prev) => ({ ...prev, [activeInquiryId]: event.target.value }))
                      }
                      placeholder="Type a message"
                      className="h-10 flex-1 rounded-[1.1rem] border border-[#BDCFDC] bg-white px-3 text-sm text-[#314B62] placeholder:text-[#7F97AB] sm:h-11 sm:px-4 sm:text-base"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          if (!replyActionState[activeInquiryId] && String(replyDrafts[activeInquiryId] || '').trim()) {
                            handleReplySubmit(activeInquiryId);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={replyActionState[activeInquiryId] || !String(replyDrafts[activeInquiryId] || '').trim()}
                      onClick={() => handleReplySubmit(activeInquiryId)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A] text-white disabled:opacity-60"
                    >
                      {replyActionState[activeInquiryId] ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m22 2-7 20-4-9-9-4 20-7Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden items-center justify-center bg-[#D4DEE5] p-8 lg:flex">
                <div className="text-center">
                  <p className="text-base font-semibold text-[#334155]">Select a conversation</p>
                  <p className="mt-1 text-sm text-[#64748B]">Choose one chat from the left panel.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <style jsx global>{`
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
