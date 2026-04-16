import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  createSellerProduct,
  getMarketplaceCategories,
  getSellerProducts,
  getUserInquiryInbox,
  getUserProfile,
  replyToProductInquiry,
  uploadSellerProductImage,
  updateUserInquiryStatus
} from '../../utils/userService';
import { clearCustomerSession, getRequiredCustomerSession } from '../../utils/session';

const THREADS_PER_PAGE = 6;
const CUSTOMER_PORTAL_THEME_KEY = 'customerPortalThemePreference';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatShortDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'No recent activity';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatMonthLabel = (value = new Date()) =>
  value.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });

function GlassShell ({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.7rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_18px_50px_rgba(31,41,55,0.08)] ${className}`}
      style={{ boxShadow: '0 18px 50px rgba(31,41,55,0.08), inset 0 1px 0 rgba(255,255,255,0.7)' }}
    >
      {children}
    </div>
  );
}

function DashboardStatCard ({ label, value, detail, trend, icon, accent = 'from-[#6366F1] via-[#7C3AED] to-[#A855F7]', href, className = '' }) {
  return (
    <Link
      href={href || '#'}
      className={`group relative min-w-[165px] overflow-hidden rounded-[1.45rem] border border-white/70 bg-white/70 p-3.5 backdrop-blur-xl shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 ${className}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.20),transparent_70%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8494]">{label}</p>
          <p className="mt-2 text-[1.55rem] font-semibold leading-none tracking-[-0.05em] text-[#111827]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.14))] text-[#6D28D9]">
          {icon}
        </span>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] leading-4 text-[#667085]">{detail}</p>
          {trend ? <p className="mt-2 text-[11px] font-semibold text-[#16A34A]">{trend}</p> : null}
        </div>
        <div className="flex h-10 items-end gap-1.5">
          {[34, 55, 42, 68].map((height, index) => (
            <span
              key={`${label}-${index}`}
              className="w-1.5 rounded-full bg-[linear-gradient(180deg,rgba(99,102,241,0.18),rgba(99,102,241,0.9))]"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard ({ href, title, description, count }) {
  return (
    <Link
      href={href}
      className="group rounded-[1.35rem] border border-[rgba(226,232,240,0.9)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-4 shadow-[0_14px_34px_rgba(15,23,32,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(124,58,237,0.28)] hover:shadow-[0_22px_42px_rgba(15,23,32,0.1)] dark:bg-[rgba(16,25,34,0.9)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--portal-heading)]">{title}</p>
          <p className="portal-muted mt-2 text-xs leading-5">{description}</p>
        </div>
        {typeof count !== 'undefined' ? (
          <span className="inline-flex min-w-[2.15rem] items-center justify-center rounded-full bg-[rgba(124,58,237,0.1)] px-2.5 py-1 text-xs font-semibold text-[#7C3AED]">
            {count}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function MiniBars ({ values = [] }) {
  const maxValue = Math.max(...values, 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 rounded-full bg-[linear-gradient(180deg,rgba(124,58,237,0.28),rgba(99,102,241,0.9))]"
          style={{ height: `${Math.max(18, Math.round((value / maxValue) * 100))}%` }}
        />
      ))}
    </div>
  );
}

function Sparkline () {
  return (
    <svg viewBox="0 0 300 120" className="h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.32)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.02)" />
        </linearGradient>
        <linearGradient id="sparkStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <path d="M0 96 C20 95, 34 84, 52 80 S84 68, 102 58 S134 42, 152 48 S184 64, 202 54 S236 20, 254 26 S282 46, 300 34 L300 120 L0 120 Z" fill="url(#sparkFill)" />
      <path d="M0 96 C20 95, 34 84, 52 80 S84 68, 102 58 S134 42, 152 48 S184 64, 202 54 S236 20, 254 26 S282 46, 300 34" fill="none" stroke="url(#sparkStroke)" strokeWidth="4" strokeLinecap="round" />
      {[52, 152, 254].map((x, index) => (
        <circle key={x} cx={x} cy={[80, 48, 26][index]} r="6" fill="#fff" stroke="#6366F1" strokeWidth="3" />
      ))}
    </svg>
  );
}

function InquiryStatusPill ({ status }) {
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

function MobileBottomNavItem ({ href, label, active = false, primary = false, children }) {
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center ${primary ? 'gap-0 py-1' : 'gap-0.5 py-2'}`}>
      <span className={`flex items-center justify-center rounded-full transition ${
        primary
          ? 'h-12 w-12 -translate-y-3 bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#A855F7)] text-white shadow-[0_18px_36px_rgba(124,58,237,0.34)]'
          : active
            ? 'h-8 w-8 bg-[rgba(124,58,237,0.12)] text-[#7C3AED]'
            : 'h-8 w-8 text-slate-400'
      }`}>
        {children}
      </span>
      {primary ? (
        <span className="mt-[-6px] text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
          Post
        </span>
      ) : (
        <span className={`text-[10px] font-semibold ${active ? 'text-[#7C3AED]' : 'text-slate-700'}`}>
          {label}
        </span>
      )}
    </Link>
  );
}

function QuickPostField ({ label, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-[#111827]">{label}</span>
        {hint ? <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function ThemeToggleButton ({ isDarkMode, onToggle, compact = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center justify-center rounded-full border border-white/70 bg-white/88 text-[#111827] shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 ${
        compact ? 'h-10 w-10' : 'h-11 w-11'
      }`}
      aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDarkMode ? 'Light theme' : 'Dark theme'}
    >
      {isDarkMode ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`}>
          <circle cx="12" cy="12" r="4.5" />
          <path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

export default function SellerDashboard () {
  const [user, setUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [productCount, setProductCount] = useState(0);
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
  const [mobileTopBarVisible, setMobileTopBarVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const [quickPostScrolled, setQuickPostScrolled] = useState(false);
  const [quickPostSaving, setQuickPostSaving] = useState(false);
  const [quickPostImageUploading, setQuickPostImageUploading] = useState(false);
  const [quickPostMessage, setQuickPostMessage] = useState({ tone: '', text: '' });
  const [quickPostCategories, setQuickPostCategories] = useState([]);
  const [quickPostCategoriesLoading, setQuickPostCategoriesLoading] = useState(false);
  const [quickPostImageUrls, setQuickPostImageUrls] = useState([]);
  const [quickPostCameraOpen, setQuickPostCameraOpen] = useState(false);
  const [quickPostCameraError, setQuickPostCameraError] = useState('');
  const [quickPostCameraFacingMode, setQuickPostCameraFacingMode] = useState('environment');
  const [quickPostCameraDeviceCount, setQuickPostCameraDeviceCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themePreference, setThemePreference] = useState('system');
  const [quickPostForm, setQuickPostForm] = useState({
    name: '',
    category: '',
    marketScope: 'local',
    price: '',
    stock: '',
    description: ''
  });
  const quickPostCameraVideoRef = useRef(null);
  const quickPostCameraStreamRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const session = getRequiredCustomerSession('seller');
    if (!session.loggedIn) {
      router.push('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const userId = String(session.userId || '').trim();
        if (!userId) {
          router.push('/login');
          return;
        }

        const [userProfile, inboxResult, productResult] = await Promise.all([
          getUserProfile(userId),
          getUserInquiryInbox(userId).catch((inboxError) => {
            console.error('Error loading seller inquiries:', inboxError);
            setInquiryError('Could not load inquiries right now. Please refresh in a moment.');
            return { inquiries: [] };
          }),
          getSellerProducts({ page: 1, limit: 1 }).catch((productError) => {
            console.error('Error loading seller products:', productError);
            return { success: false, items: [], pagination: null };
          })
        ]);

        setUser(userProfile);
        setInquiries(inboxResult?.inquiries || []);
        setProductCount(Number(productResult?.pagination?.total ?? productResult?.items?.length ?? 0));
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

    return base.sort(
      (a, b) =>
        new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
        new Date(a?.updatedAt || a?.createdAt || 0).getTime()
    );
  }, [inquiries, inquiryFilter]);

  const groupedInquiries = useMemo(() => {
    const groups = filteredInquiries.reduce((acc, entry) => {
      const buyerId = String(entry?.fromUserId || entry?.buyerId || '').trim();
      const buyerEmail = String(entry?.buyer?.email || '').trim().toLowerCase();
      const buyerName = String(entry?.buyer?.name || 'Unknown customer').trim();
      const key = buyerId || buyerEmail || buyerName.toLowerCase() || `unknown-${String(entry?.id || entry?._id || '')}`;

      if (!acc[key]) {
        acc[key] = {
          key,
          buyerId: buyerId || '-',
          buyerName: buyerName || 'Unknown customer',
          buyerEmail: entry?.buyer?.email || '',
          inquiries: []
        };
      }

      acc[key].inquiries.push(entry);
      return acc;
    }, {});

    return Object.values(groups)
      .map((group) => {
        const items = [...group.inquiries].sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
            new Date(a?.updatedAt || a?.createdAt || 0).getTime()
        );
        const openCount = items.filter((entry) => String(entry?.status || 'new').toLowerCase() !== 'closed').length;
        const needsReplyCount = items.filter((entry) => {
          const status = String(entry?.status || 'new').toLowerCase();
          if (status === 'closed') return false;
          const messages = Array.isArray(entry?.messages) ? entry.messages : [];
          const latest = messages.length ? messages[messages.length - 1] : null;
          return status === 'new' || String(latest?.senderRole || '').toLowerCase() === 'buyer';
        }).length;

        return {
          ...group,
          inquiries: items,
          total: items.length,
          openCount,
          needsReplyCount,
          latestAt: items[0]?.updatedAt || items[0]?.createdAt || null
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
  const pagedInquiryGroups = useMemo(() => {
    const start = (activeInquiryPage - 1) * THREADS_PER_PAGE;
    return searchableGroupedInquiries.slice(start, start + THREADS_PER_PAGE);
  }, [activeInquiryPage, searchableGroupedInquiries]);

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

  useEffect(() => {
    const handleScroll = () => {
      setMobileTopBarVisible(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncThemeState = () => {
      const storedPreference = String(localStorage.getItem(CUSTOMER_PORTAL_THEME_KEY) || 'system').trim().toLowerCase();
      setThemePreference(storedPreference === 'dark' || storedPreference === 'light' ? storedPreference : 'system');
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    syncThemeState();
    window.addEventListener('customerPortalThemePreferenceChanged', syncThemeState);
    window.addEventListener('storage', syncThemeState);
    return () => {
      window.removeEventListener('customerPortalThemePreferenceChanged', syncThemeState);
      window.removeEventListener('storage', syncThemeState);
    };
  }, []);

  useEffect(() => {
    if (!quickPostOpen) return;

    let mounted = true;
    const loadCategories = async () => {
      setQuickPostCategoriesLoading(true);
      const result = await getMarketplaceCategories(quickPostForm.marketScope);
      if (!mounted) return;
      setQuickPostCategories(result?.success ? (result.categories || []) : []);
      setQuickPostCategoriesLoading(false);
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, [quickPostForm.marketScope, quickPostOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (quickPostOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [quickPostOpen]);

  useEffect(() => {
    if (!quickPostCameraOpen || !quickPostCameraVideoRef.current || !quickPostCameraStreamRef.current) return;

    quickPostCameraVideoRef.current.srcObject = quickPostCameraStreamRef.current;
    quickPostCameraVideoRef.current.play().catch(() => {});
  }, [quickPostCameraOpen]);

  useEffect(() => () => {
    if (quickPostCameraStreamRef.current) {
      quickPostCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      quickPostCameraStreamRef.current = null;
    }
  }, []);

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

  const closedInquiryCount = useMemo(
    () => inquiries.filter((entry) => String(entry?.status || '').toLowerCase() === 'closed').length,
    [inquiries]
  );

  const sellerName = user?.profile?.name || user?.name || 'Seller';
  const shopTitle = user?.profile?.companyName || sellerName;
  const businessType = user?.profile?.businessType || 'Business profile not set';
  const initials = String(shopTitle).trim().split(' ').filter(Boolean).slice(0, 2).map((value) => value[0]?.toUpperCase()).join('') || 'S';
  const publicShopHref = user?.id || user?._id ? `/seller/${encodeURIComponent(String(user.id || user._id))}` : '';

  const profileReadiness = useMemo(() => {
    const checks = [
      Boolean(user?.profile?.companyName),
      Boolean(user?.profile?.businessType),
      Boolean(user?.profile?.phone || user?.phone),
      Boolean(user?.profile?.locationAddress || (user?.profile?.locationLat && user?.profile?.locationLng))
    ];
    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [user]);

  const responseRate = useMemo(() => {
    if (!inquiries.length) return 0;
    const answered = inquiries.filter((entry) => {
      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
      return messages.some((message) => String(message?.senderRole || '').toLowerCase() === 'seller');
    }).length;
    return Math.round((answered / inquiries.length) * 100);
  }, [inquiries]);

  const closedRate = useMemo(() => {
    if (!inquiries.length) return 0;
    return Math.round((closedInquiryCount / inquiries.length) * 100);
  }, [closedInquiryCount, inquiries]);

  const latestHistory = useMemo(
    () => [...inquiries].sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()).slice(0, 3),
    [inquiries]
  );

  const analyticsCards = [
    {
      label: 'Profile Ready',
      value: `${profileReadiness}%`,
      detail: 'Business identity quality',
      trend: '+5% this week',
      accent: 'from-[#4F46E5] via-[#6366F1] to-[#818CF8]',
      href: '/profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l8-4.5V7.5L12 3 4 7.5v9L12 21Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12 20 7.5M12 12 4 7.5M12 12v9" />
        </svg>
      )
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      detail: 'Threads answered by seller',
      trend: '+8% today',
      accent: 'from-[#0EA5E9] via-[#06B6D4] to-[#14B8A6]',
      href: '#seller-inbox',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16v10H8l-4 3V6.5Z" />
        </svg>
      )
    },
    {
      label: 'Closed Threads',
      value: `${closedRate}%`,
      detail: `${closedInquiryCount} conversations resolved`,
      trend: 'Stable performance',
      accent: 'from-[#7C3AED] via-[#8B5CF6] to-[#C084FC]',
      href: '#seller-inbox',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 9.2 16.5 19 6.5" />
        </svg>
      )
    }
  ];

  const chartSeries = [
    Math.max(newInquiryCount, 1),
    Math.max(pendingReplyNotificationCount, 1),
    Math.max(closedInquiryCount, 1),
    Math.max(productCount, 1),
    Math.max(searchableGroupedInquiries.length, 1),
    Math.max(inquiries.length, 1)
  ];
  const currentMonthShort = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'short' }),
    []
  );
  const mobileHistoryEntry = latestHistory[0] || null;
  const mobileMenuLinks = [
    { href: '/dashboard/seller', label: 'Dashboard Home' },
    { href: '/dashboard/seller/products', label: 'My Products' },
    { href: '/dashboard/seller/new-product', label: 'Advanced Product Form' },
    { href: '/profile', label: 'Business Profile' },
    { href: '/inquiries', label: 'Messages' },
    { href: '/dashboard/seller/products', label: 'Store' }
  ];

  const handleLogout = () => {
    clearCustomerSession();
    router.push('/login');
  };

  const applyThemePreference = (nextPreference) => {
    if (typeof window === 'undefined') return;

    const normalizedPreference = nextPreference === 'dark' || nextPreference === 'light' ? nextPreference : 'system';
    if (normalizedPreference === 'system') {
      localStorage.removeItem(CUSTOMER_PORTAL_THEME_KEY);
    } else {
      localStorage.setItem(CUSTOMER_PORTAL_THEME_KEY, normalizedPreference);
    }

    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedDarkMode = normalizedPreference === 'system' ? prefersDark : normalizedPreference === 'dark';
    document.documentElement.classList.toggle('dark', resolvedDarkMode);
    setThemePreference(normalizedPreference);
    setIsDarkMode(resolvedDarkMode);
    window.dispatchEvent(new CustomEvent('customerPortalThemePreferenceChanged'));
  };

  const handleToggleTheme = () => {
    applyThemePreference(isDarkMode ? 'light' : 'dark');
  };

  const quickPostPreview = useMemo(() => {
    const price = Number(quickPostForm.price) || 0;
    return {
      category: quickPostForm.category || 'No category',
      priceLabel: price > 0 ? `$${price.toFixed(2)}` : '$0.00',
      imageCount: quickPostImageUrls.length
    };
  }, [quickPostForm.category, quickPostForm.price, quickPostImageUrls.length]);

  const handleOpenQuickPost = () => {
    setMobileMenuOpen(false);
    setQuickPostMessage({ tone: '', text: '' });
    setQuickPostScrolled(false);
    setQuickPostOpen(true);
  };

  const handleCloseQuickPost = () => {
    if (quickPostSaving || quickPostImageUploading) return;
    stopQuickPostCameraStream();
    setQuickPostCameraOpen(false);
    setQuickPostCameraError('');
    setQuickPostScrolled(false);
    setQuickPostOpen(false);
  };

  const setQuickPostField = (key, value) => {
    setQuickPostForm((prev) => ({ ...prev, [key]: value }));
  };

  const stopQuickPostCameraStream = () => {
    if (quickPostCameraStreamRef.current) {
      quickPostCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      quickPostCameraStreamRef.current = null;
    }
  };

  const syncQuickPostCameraDevices = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');
      setQuickPostCameraDeviceCount(videoInputs.length);
    } catch (error) {
      console.error('Could not inspect available cameras:', error);
    }
  };

  const uploadQuickPostFiles = async (files) => {
    if (!files.length) return;

    setQuickPostMessage({ tone: '', text: '' });
    setQuickPostImageUploading(true);

    const nextUrls = [];
    for (const file of files) {
      let preparedFile = file;

      if (typeof window !== 'undefined' && String(file?.type || '').startsWith('image/')) {
        try {
          const bitmap = await createImageBitmap(file);
          const maxDimension = 1800;
          const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
          const width = Math.max(1, Math.round(bitmap.width * scale));
          const height = Math.max(1, Math.round(bitmap.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d', { alpha: false });

          if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
            context.drawImage(bitmap, 0, 0, width, height);

            const optimizedBlob = await new Promise((resolve) => {
              canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            if (optimizedBlob) {
              preparedFile = new File(
                [optimizedBlob],
                `${String(file.name || 'product-image').replace(/\.[^.]+$/, '') || 'product-image'}.jpg`,
                { type: 'image/jpeg' }
              );
            }
          }

          bitmap.close();
        } catch (error) {
          console.error('Could not optimize quick post image before upload:', error);
        }
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await uploadSellerProductImage(preparedFile);
      if (!result?.success || !result?.url) {
        setQuickPostImageUploading(false);
        setQuickPostMessage({ tone: 'error', text: result?.message || `Failed to upload ${file.name}` });
        return;
      }
      nextUrls.push(result.url);
    }

    setQuickPostImageUrls((prev) => [...new Set([...prev, ...nextUrls])].slice(0, 4));
    setQuickPostImageUploading(false);
    setQuickPostMessage({ tone: 'success', text: 'Product image added.' });
  };

  const handleQuickPostImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    await uploadQuickPostFiles(files);
    event.target.value = '';
  };

  const startQuickPostCamera = async (facingMode) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const unsupportedMessage = 'Camera access is not supported on this device or browser.';
      setQuickPostCameraOpen(false);
      setQuickPostCameraError(unsupportedMessage);
      setQuickPostMessage({ tone: 'error', text: unsupportedMessage });
      return;
    }

    stopQuickPostCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1440 }
        },
        audio: false
      });

      quickPostCameraStreamRef.current = stream;
      setQuickPostCameraFacingMode(facingMode);
      setQuickPostCameraError('');
      setQuickPostCameraOpen(true);
      setQuickPostMessage({ tone: '', text: '' });
      await syncQuickPostCameraDevices();
    } catch (error) {
      console.error('Could not open quick post camera:', error);
      const permissionDenied =
        error?.name === 'NotAllowedError' ||
        error?.name === 'PermissionDeniedError' ||
        error?.name === 'SecurityError';

      const message = permissionDenied
        ? 'Camera access is blocked. Please enable camera permission in your browser or device settings, then try again.'
        : 'Could not start the camera on this device. Try again or use Choose Image.';

      setQuickPostCameraOpen(false);
      setQuickPostCameraError(message);
      setQuickPostMessage({ tone: 'error', text: message });
    }
  };

  const handleOpenQuickPostCamera = async () => {
    const prefersMobileCamera =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches;

    const preferredFacingMode = prefersMobileCamera ? 'environment' : 'user';

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' });
        if (permission.state === 'denied') {
          const deniedMessage = 'Camera access is blocked. Please enable it in browser or device settings, then try again.';
          setQuickPostCameraOpen(false);
          setQuickPostCameraError(deniedMessage);
          setQuickPostMessage({ tone: 'error', text: deniedMessage });
          return;
        }
      } catch (error) {
        console.error('Could not inspect camera permission state:', error);
      }
    }

    await startQuickPostCamera(preferredFacingMode);
  };

  const handleCloseQuickPostCamera = () => {
    stopQuickPostCameraStream();
    setQuickPostCameraOpen(false);
    setQuickPostCameraError('');
  };

  const handleSwitchQuickPostCamera = async () => {
    const nextFacingMode = quickPostCameraFacingMode === 'environment' ? 'user' : 'environment';
    await startQuickPostCamera(nextFacingMode);
  };

  const handleCaptureQuickPostPhoto = async () => {
    const video = quickPostCameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setQuickPostCameraError('Camera is not ready yet. Try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setQuickPostCameraError('Could not capture the camera image.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });

    if (!blob) {
      setQuickPostCameraError('Could not capture the camera image.');
      return;
    }

    const imageFile = new File([blob], `quick-post-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleCloseQuickPostCamera();
    await uploadQuickPostFiles([imageFile]);
  };

  const removeQuickPostImage = (url) => {
    setQuickPostImageUrls((prev) => prev.filter((entry) => entry !== url));
  };

  const handleQuickPostSubmit = async (event) => {
    event.preventDefault();
    setQuickPostMessage({ tone: '', text: '' });

    const normalizedName = String(quickPostForm.name || '').trim();
    const normalizedCategory = String(quickPostForm.category || '').trim();
    const normalizedPrice = Number(quickPostForm.price);
    const normalizedStock = Number(quickPostForm.stock);

    if (!normalizedName) {
      setQuickPostMessage({ tone: 'error', text: 'Product name is required.' });
      return;
    }
    if (!normalizedCategory) {
      setQuickPostMessage({ tone: 'error', text: 'Category is required.' });
      return;
    }
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setQuickPostMessage({ tone: 'error', text: 'Price must be greater than 0.' });
      return;
    }
    if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
      setQuickPostMessage({ tone: 'error', text: 'Stock must be 0 or more.' });
      return;
    }
    if (quickPostImageUploading) {
      setQuickPostMessage({ tone: 'error', text: 'Please wait for image upload to finish.' });
      return;
    }

    setQuickPostSaving(true);
    const normalizedImages = quickPostImageUrls.map((entry) => String(entry || '').trim()).filter(Boolean);
    const primaryImage = normalizedImages[0] || '';
    const result = await createSellerProduct({
      name: normalizedName,
      description: String(quickPostForm.description || '').trim(),
      category: normalizedCategory,
      price: normalizedPrice,
      discountPercentage: 0,
      stock: normalizedStock,
      sku: '',
      image: primaryImage,
      images: normalizedImages,
      thumbnail: primaryImage,
      tags: [],
      marketScope: String(quickPostForm.marketScope || 'local'),
      scope: String(quickPostForm.marketScope || 'local'),
      isMadeInEthiopia: false,
      isNewArrival: true,
      countryOfOrigin: ''
    });
    setQuickPostSaving(false);

    if (!result?.success) {
      setQuickPostMessage({ tone: 'error', text: result?.message || 'Failed to post product.' });
      return;
    }

    setQuickPostMessage({ tone: 'success', text: 'Product posted successfully.' });
    setProductCount((prev) => prev + 1);
    setQuickPostForm({
      name: '',
      category: '',
      marketScope: 'local',
      price: '',
      stock: '',
      description: ''
    });
    setQuickPostImageUrls([]);
    setTimeout(() => {
      setQuickPostOpen(false);
      router.replace(router.asPath);
    }, 700);
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
    const session = getRequiredCustomerSession('seller');
    const userId = String(session.userId || '').trim();
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
        <meta name="description" content="Seller dashboard with profile, analytics, products, and customer inquiry inbox." />
      </Head>

      <main className="mx-auto max-w-6xl px-0 py-0 pb-24 md:px-4 md:py-5 md:pb-32 lg:px-6 lg:py-8 lg:pb-8">
        <div
          className={`fixed inset-x-0 top-0 z-40 px-4 pt-3 transition-all duration-300 md:hidden ${
            mobileTopBarVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-6 opacity-0'
          }`}
        >
          <div className="mx-auto flex max-w-md items-center justify-between rounded-[1.2rem] border border-white/70 bg-white/88 px-3 py-2 shadow-[0_18px_40px_rgba(15,23,32,0.12)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827]"
              aria-label="Open seller menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <div className="min-w-0 text-center">
              <p className="truncate text-sm font-semibold text-[#111827]">{shopTitle}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7C3AED]">Seller Dashboard</p>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} compact />
              <Link
                href="#seller-inbox"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827]"
                aria-label="Open notifications"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 16.5h11l-1.2-1.8a4.5 4.5 0 0 1-.8-2.5V10a3.5 3.5 0 1 0-7 0v2.2a4.5 4.5 0 0 1-.8 2.5L6.5 16.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 18.5a2 2 0 0 0 4 0" />
                </svg>
                {pendingReplyNotificationCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[9px] font-semibold text-white">
                    {pendingReplyNotificationCount > 9 ? '9+' : pendingReplyNotificationCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#111827,#4F46E5)] text-[11px] font-semibold text-white"
                aria-label="Open profile"
              >
                {initials}
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-[rgba(15,23,32,0.35)] transition-opacity duration-300 md:hidden ${
            mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-[60] w-[84%] max-w-[320px] bg-[linear-gradient(180deg,#FCFCFD,#EFF3F8)] px-5 pb-6 pt-6 shadow-[0_24px_60px_rgba(15,23,32,0.2)] transition-transform duration-300 md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">Seller Menu</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111827]">{shopTitle}</h2>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111827] shadow-[0_10px_24px_rgba(15,23,32,0.08)]"
              aria-label="Close seller menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-5 rounded-[1.4rem] bg-[linear-gradient(135deg,#111827,#1F2A44,#4F46E5)] p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Quick status</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[1rem] bg-white/10 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/60">Products</p>
                <p className="mt-1 text-lg font-semibold">{productCount}</p>
              </div>
              <div className="rounded-[1rem] bg-white/10 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/60">Replies</p>
                <p className="mt-1 text-lg font-semibold">{pendingReplyNotificationCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.2rem] border border-[rgba(226,232,240,0.9)] bg-white/92 p-4 shadow-[0_12px_28px_rgba(15,23,32,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">Theme</p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">Color appearance</p>
              </div>
              <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} compact />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' }
              ].map((option) => {
                const active = themePreference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => applyThemePreference(option.value)}
                    className={`rounded-[0.9rem] border px-3 py-2.5 text-xs font-semibold transition ${
                      active
                        ? 'border-[#C4B5FD] bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(99,102,241,0.1))] text-[#6D28D9]'
                        : 'border-[#E5EAF4] bg-[#F8FAFC] text-[#475467]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {mobileMenuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-[1.1rem] border border-[rgba(226,232,240,0.9)] bg-white/90 px-4 py-3 text-sm font-semibold text-[#111827] shadow-[0_12px_28px_rgba(15,23,32,0.05)]"
              >
                {item.label}
                <span className="text-[#7C3AED]">+</span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="w-full md:hidden">
          <div className="relative min-h-screen bg-[linear-gradient(180deg,#F8FAFF_0%,#F3F6FF_30%,#EEF3FF_100%)] pb-8 pt-3">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)]" />
              <div className="absolute right-[-30px] top-32 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_70%)]" />
              <div className="absolute bottom-20 left-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_70%)]" />
            </div>

            <div className={`relative px-4 transition duration-300 ${quickPostOpen ? 'scale-[0.985] opacity-60' : 'scale-100 opacity-100'}`}>
              <GlassShell className={`overflow-hidden px-4 transition-all duration-300 ${quickPostOpen ? 'pb-3 pt-3' : 'pb-4 pt-4'}`}>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_68%)]" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                      {formatShortDate(new Date())}
                    </p>
                    <h1 className={`font-semibold tracking-[-0.06em] text-[#111827] transition-all duration-300 ${quickPostOpen ? 'mt-2 text-[1.55rem]' : 'mt-3 text-[2rem]'}`}>
                      Hi, {shopTitle}
                    </h1>
                    <div className={`inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-[#667085] shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-all duration-300 ${quickPostOpen ? 'mt-1.5 scale-[0.97]' : 'mt-2 scale-100'}`}>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Seller workspace is active
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
                    <Link
                      href="/profile"
                      className={`relative flex items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#312E81,#6366F1,#A855F7)] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)] transition-all duration-300 ${quickPostOpen ? 'h-10 w-10' : 'h-12 w-12'}`}
                    >
                      <span className="absolute inset-[2px] rounded-full border border-white/20" />
                      <span className="relative">{initials}</span>
                    </Link>
                  </div>
                </div>

                <div className={`relative overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF2FF_45%,#F5F3FF_100%)] p-[1px] shadow-[0_18px_40px_rgba(99,102,241,0.12)] transition-all duration-300 ${quickPostOpen ? 'mt-3' : 'mt-5'}`}>
                  <div className="rounded-[1.55rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.74))] px-4 py-4 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7B8494]">Shop profile</p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#111827]">{businessType}</p>
                        <p className="mt-1 text-xs text-[#667085]">Your store identity and trust layer</p>
                      </div>
                      <span className="rounded-full bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.12))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                        {profileReadiness}% ready
                      </span>
                    </div>

                    <div className={`transition-all duration-300 ${quickPostOpen ? 'mt-3' : 'mt-4'}`}>
                      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[#667085]">
                        <span>Completion</span>
                        <span>{profileReadiness}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#E9EEFF]">
                        <div
                          className="h-2.5 rounded-full bg-[linear-gradient(90deg,#6366F1,#8B5CF6,#A855F7)] shadow-[0_6px_16px_rgba(124,58,237,0.25)]"
                          style={{ width: `${Math.max(profileReadiness, 8)}%` }}
                        />
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 transition-all duration-300 ${quickPostOpen ? 'mt-3' : 'mt-4'}`}>
                      <button
                        type="button"
                        onClick={handleOpenQuickPost}
                        className="inline-flex rounded-full bg-[linear-gradient(135deg,#6366F1,#8B5CF6)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_14px_28px_rgba(99,102,241,0.25)]"
                      >
                        Add Product
                      </button>
                      <Link href="/profile" className="inline-flex rounded-full border border-[#D9E0FF] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#374151]">
                        Edit Shop
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassShell>
            </div>

            <div className={`px-4 transition-all duration-300 ${quickPostOpen ? 'mt-4 opacity-45' : 'mt-7 opacity-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-[1.25rem] font-semibold text-[#111827]">Analytics</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(226,232,240,0.9)] bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111827] shadow-[0_10px_22px_rgba(15,23,32,0.05)]"
                >
                  Monthly
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M5.25 7.5 10 12.25 14.75 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2.5 px-4 transition-all duration-300 ${quickPostOpen ? 'mt-3 opacity-40' : 'mt-4 opacity-100'}`}>
              {analyticsCards.map((card, index) => (
                <DashboardStatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  detail={card.detail}
                  trend={card.trend}
                  accent={card.accent}
                  href={card.href}
                  icon={card.icon}
                  className={index === analyticsCards.length - 1 ? 'col-span-2 min-w-0' : 'min-w-0'}
                />
              ))}
            </div>

            <section className="relative mt-7 rounded-t-[2.2rem] border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.78))] px-4 pb-6 pt-5 backdrop-blur-xl shadow-[0_-10px_30px_rgba(15,23,32,0.03)]">
              <GlassShell className="overflow-hidden px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#111827]">Earnings</h2>
                    <p className="mt-1 text-sm text-[#667085]">Total balance</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-[rgba(168,85,247,0.10)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                      Live
                    </span>
                    <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.05em] text-[#111827]">$0.00</p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-white/80 bg-[linear-gradient(180deg,#FFFFFF,#F8FAFF)] px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#667085]">Seller pulse in <span className="text-[#6D28D9]">{currentMonthShort}</span></p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[2rem] font-semibold tracking-[-0.06em] text-[#111827]">{newInquiryCount}</p>
                        <p className="text-xs font-semibold text-[#16A34A]">+ {pendingReplyNotificationCount} need reply</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.12))] px-3 py-1.5 text-[11px] font-semibold text-[#6D28D9]">
                      +12.4%
                    </div>
                  </div>

                  <div className="mt-3">
                    <Sparkline />
                  </div>

                  <div className="mt-3 rounded-[1rem] border border-white/80 bg-white/85 px-3.5 py-3 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <span className="font-semibold text-[#111827]">$7,860</span>
                    <span className="ml-2 text-[#667085]">in the last 7 days</span>
                  </div>
                </div>
              </GlassShell>

              <div className="mt-5 grid gap-4">
                <GlassShell className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[1.2rem] font-semibold text-[#111827]">Live Activity</h3>
                    {mobileHistoryEntry ? <InquiryStatusPill status={mobileHistoryEntry?.status} /> : null}
                  </div>
                  <div className="mt-3 space-y-3">
                    {latestHistory.length ? latestHistory.map((entry) => (
                      <div key={String(entry?.id || entry?._id || entry?.createdAt || '')} className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/80 bg-white/82 px-3.5 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{entry?.productName || 'Customer inquiry'}</p>
                          <p className="mt-1 text-xs text-[#667085]">
                            {(entry?.buyer?.name || 'Unknown customer')} | {formatShortDate(entry?.updatedAt || entry?.createdAt)}
                          </p>
                        </div>
                        <InquiryStatusPill status={entry?.status} />
                      </div>
                    )) : (
                      <p className="text-sm text-[#667085]">No seller activity yet.</p>
                    )}
                  </div>
                </GlassShell>

                <GlassShell className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-[#111827]">Quick Actions</h2>
                      <p className="mt-1 text-sm text-[#667085]">Fast shortcuts for daily seller work</p>
                    </div>
                    <span className="text-[1.35rem] font-semibold text-[#111827]">{productCount}</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <QuickActionCard href="/dashboard/seller/products" title="Manage Store" description="Edit products, pricing, stock, and listing presentation." count={productCount} />
                    <QuickActionCard href="/profile" title="Business Profile" description="Upgrade trust, visibility, and seller completeness." count={`${profileReadiness}%`} />
                  </div>
                </GlassShell>
              </div>
            </section>
          </div>
        </section>

        <section className="hidden md:block">
          <section className="mx-auto max-w-[520px] px-4 lg:max-w-none lg:px-0">
            <div className="rounded-[2rem] border border-[rgba(255,255,255,0.65)] bg-[linear-gradient(180deg,rgba(255,255,255,0.93),rgba(245,247,255,0.92))] p-4 shadow-[0_30px_80px_rgba(15,23,32,0.12)] backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">{formatShortDate(new Date())}</p>
                  <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] sm:text-[2.4rem]">
                  Hi, {shopTitle}
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                  Run your shop from one cleaner seller workspace with better visibility, faster actions, and a stronger profile presence.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeToggleButton isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0F172A,#312E81,#7C3AED)] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.35)]">
                    {initials}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111827]">Analytics</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">{businessType}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#374151]">
                  {formatMonthLabel()}
                </span>
              </div>

              <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
                {analyticsCards.map((card) => (
                  <DashboardStatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    detail={card.detail}
                    trend={card.trend}
                    accent={card.accent}
                    href={card.href}
                    icon={card.icon}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                <section className="rounded-[1.5rem] bg-[linear-gradient(180deg,#EFF1F7,#E8EBF3)] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Operations</p>
                      <h3 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#111827]">{searchableGroupedInquiries.length}</h3>
                      <p className="mt-1 text-sm text-[#6B7280]">Live customer threads</p>
                    </div>
                    <div className="rounded-[1rem] bg-white px-3 py-2 text-right shadow-[0_10px_24px_rgba(15,23,32,0.08)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B5CF6]">Withdrawable</p>
                      <p className="mt-2 text-lg font-semibold text-[#111827]">$0.00</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1.25rem] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,32,0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Seller pulse in {formatMonthLabel().split(' ')[0]}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">New inquiries, replies needed, closed threads, products, active threads, total conversations.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B5CF6]">Need reply</p>
                        <p className="mt-2 text-base font-semibold text-[#111827]">{pendingReplyNotificationCount}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_140px] md:items-end">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-[1.8rem] font-semibold tracking-[-0.04em] text-[#111827]">{newInquiryCount}</p>
                          <p className="text-sm text-[#6B7280]">new this cycle</p>
                        </div>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {responseRate}% of conversations have already received a seller response.
                        </p>
                      </div>
                      <MiniBars values={chartSeries} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-semibold text-[#111827]">History</h3>
                    <div className="mt-3 space-y-3">
                      {latestHistory.length ? latestHistory.map((entry) => (
                        <div key={String(entry?.id || entry?._id || entry?.createdAt || '')} className="flex items-start justify-between gap-3 rounded-[1rem] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,32,0.05)]">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#7C3AED]">
                              {entry?.productName || 'Customer inquiry'}
                            </p>
                            <p className="mt-1 text-xs text-[#6B7280]">
                              {entry?.buyer?.name || 'Unknown customer'} • {formatShortDate(entry?.updatedAt || entry?.createdAt)}
                            </p>
                          </div>
                          <InquiryStatusPill status={entry?.status} />
                        </div>
                      )) : (
                        <div className="rounded-[1rem] bg-white px-4 py-5 text-sm text-[#6B7280] shadow-[0_10px_24px_rgba(15,23,32,0.05)]">
                        No seller activity yet.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_16px_38px_rgba(15,23,32,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#111827]">My Products</h3>
                        <p className="mt-1 text-sm text-[#6B7280]">Your listings and shop tools in one place.</p>
                      </div>
                      <span className="text-xl font-semibold text-[#111827]">{productCount}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <QuickActionCard href="/dashboard/seller/products" title="Manage Products" description="Edit listings, pricing, and images faster." count={productCount} />
                      <QuickActionCard href="/dashboard/seller/new-product" title="Post Product" description="Publish a new product straight from the dashboard." />
                      <QuickActionCard href="/profile" title="Business Profile" description="Keep your seller profile sharp and buyer-ready." count={`${profileReadiness}%`} />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#111827,#1E1B4B,#312E81)] p-4 text-white shadow-[0_22px_50px_rgba(15,23,32,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Shop Identity</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{shopTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{businessType}</p>
                    <p className="mt-3 text-xs text-white/60">
                      {user?.profile?.locationAddress || 'Add your business location in profile settings.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/profile" className="inline-flex rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#111827]">
                      Edit Profile
                      </Link>
                      {publicShopHref ? (
                        <Link href={publicShopHref} className="inline-flex rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white">
                        Preview Shop
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white"
                      >
                      Logout
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard href="/profile" title="Seller Profile" description="Refine how your business appears to buyers." count={`${profileReadiness}%`} />
            <QuickActionCard href="/inquiries" title="Inquiry Center" description="Review every buyer conversation in one feed." count={searchableGroupedInquiries.length} />
            <QuickActionCard href="/settlements" title="Settlements" description="Keep an eye on payout and withdrawal readiness." count="$0" />
            <QuickActionCard href="/markets/b2b" title="Market View" description="Jump into the wholesale marketplace experience." />
          </section>

          <section id="seller-inbox" className="portal-card mt-6 overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">Seller Inbox</p>
                  <h2 className="portal-heading mt-2 text-xl font-semibold">Customer Inquiry Inbox</h2>
                  <p className="portal-muted mt-1 text-sm">Compact, organized threads that make it easier to respond quickly on mobile and desktop.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <input
                    type="search"
                    value={inquirySearch}
                    onChange={(event) => setInquirySearch(event.target.value)}
                    placeholder="Search customer, email, product..."
                    className="w-full rounded-[1rem] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#334155] placeholder:text-[#94A3B8] sm:w-[260px]"
                  />
                  {['all', 'new', 'contacted', 'closed'].map((filter) => {
                    const isActive = inquiryFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setInquiryFilter(filter)}
                        className={`rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
                          isActive
                            ? 'bg-[#111827] text-white'
                            : 'border border-[#E2E8F0] bg-white text-[#5F6773]'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {copyMessage ? <p className="mb-3 text-xs text-[#7C3AED]">{copyMessage}</p> : null}
              {inquiryError ? <p className="mb-3 text-xs text-red-600">{inquiryError}</p> : null}

              {inquiryLoading ? (
                <p className="text-sm text-[#6A717B]">Loading inquiries...</p>
              ) : pagedInquiryGroups.length === 0 ? (
                <div className="rounded-[1.1rem] border border-dashed border-[#E2E8F0] bg-white/75 px-4 py-8 text-center text-sm text-[#6A717B]">
                No inquiries match your current filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {pagedInquiryGroups.map((group) => {
                    const isExpanded = Boolean(expandedCustomers[group.key]);

                    return (
                      <article key={group.key} className="rounded-[1.25rem] border border-[#E6EAF2] bg-white/90 p-4 shadow-[0_14px_30px_rgba(15,23,32,0.05)]">
                        <button
                          type="button"
                          onClick={() => toggleCustomerGroup(group.key)}
                          className="flex w-full items-start justify-between gap-3 text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#7C3AED]">Customer Thread</p>
                            <h3 className="mt-1 truncate text-base font-semibold text-[#111827]">{group.buyerName}</h3>
                            <p className="mt-1 text-xs text-[#6B7280]">
                              {group.buyerEmail || 'No email provided'} • ID: {group.buyerId}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-[#111827]">{group.total}</p>
                            <p className="mt-1 text-[11px] text-[#6B7280]">{isExpanded ? 'Collapse' : 'Expand'}</p>
                          </div>
                        </button>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1rem] bg-[#F8FAFC] px-3.5 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Open</p>
                            <p className="mt-2 text-xl font-semibold text-[#111827]">{group.openCount}</p>
                          </div>
                          <div className="rounded-[1rem] bg-[#F8FAFC] px-3.5 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Need Reply</p>
                            <p className="mt-2 text-xl font-semibold text-[#111827]">{group.needsReplyCount}</p>
                          </div>
                          <div className="rounded-[1rem] bg-[#F8FAFC] px-3.5 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Latest</p>
                            <p className="mt-2 text-sm font-semibold text-[#111827]">{formatShortDate(group.latestAt)}</p>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="mt-4 space-y-4">
                            {group.inquiries.map((entry) => {
                              const entryId = String(entry.id || entry._id || `${entry.productId}-${entry.createdAt}`);
                              const messages = Array.isArray(entry?.messages) ? entry.messages : [];
                              const buyerEmail = entry?.buyer?.email || group.buyerEmail;

                              return (
                                <div key={entryId} className="rounded-[1rem] border border-[#E5E7EB] bg-[#FCFCFD] p-4">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h4 className="truncate text-sm font-semibold text-[#111827]">
                                        {entry.productName || `Product ${entry.productId || '-'}`}
                                      </h4>
                                      <p className="mt-1 text-xs text-[#6B7280]">
                                        {formatDateTime(entry.createdAt)}
                                      </p>
                                    </div>
                                    <InquiryStatusPill status={entry.status} />
                                  </div>

                                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-[0.9rem] bg-white px-3 py-2.5">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A818C]">Quantity</p>
                                      <p className="mt-1 text-sm font-semibold text-[#111827]">{entry.quantity || 1}</p>
                                    </div>
                                    <div className="rounded-[0.9rem] bg-white px-3 py-2.5 md:col-span-2">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A818C]">Buyer Message</p>
                                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#5F6773]">{entry.message || '-'}</p>
                                    </div>
                                  </div>

                                  {messages.length > 0 ? (
                                    <div className="mt-3 rounded-[0.95rem] bg-white p-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A818C]">Conversation</p>
                                      <div className="mt-3 space-y-2">
                                        {messages.slice(-4).map((item) => (
                                          <div key={item?.id || `${entryId}-${item?.createdAt || ''}-${item?.text || ''}`} className="rounded-[0.85rem] border border-[#EEF2F7] px-3 py-2.5">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A818C]">
                                              {String(item?.senderRole || '').toLowerCase() === 'seller' ? 'You' : group.buyerName} | {formatDateTime(item?.createdAt)}
                                            </p>
                                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#475569]">{item?.text || '-'}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}

                                  <div className="mt-3 rounded-[0.95rem] bg-white p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A818C]">Reply to Customer</p>
                                    <textarea
                                      rows={3}
                                      value={replyDrafts[entryId] || ''}
                                      onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [entryId]: event.target.value }))}
                                      className="mt-2 w-full rounded-[0.9rem] border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#334155]"
                                      placeholder="Write your reply..."
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        disabled={replyActionState[entryId] || !String(replyDrafts[entryId] || '').trim()}
                                        onClick={() => handleReplySubmit(entryId)}
                                        className="inline-flex items-center rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {replyActionState[entryId] ? 'Sending...' : 'Send Reply'}
                                      </button>
                                      {buyerEmail ? (
                                        <a
                                          href={`mailto:${encodeURIComponent(buyerEmail)}?subject=${encodeURIComponent(`Regarding ${entry.productName || 'your inquiry'}`)}`}
                                          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#475569]"
                                        >
                                        Reply by Email
                                        </a>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() => handleCopyBuyerId(group.buyerId)}
                                        className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#475569]"
                                      >
                                      Copy Customer ID
                                      </button>
                                      <button
                                        type="button"
                                        disabled={statusActionState[entryId]}
                                        onClick={() => handleStatusUpdate(entryId, 'contacted')}
                                        className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 disabled:opacity-60"
                                      >
                                      Mark Contacted
                                      </button>
                                      <button
                                        type="button"
                                        disabled={statusActionState[entryId]}
                                        onClick={() => handleStatusUpdate(entryId, 'closed')}
                                        className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                                      >
                                      Mark Closed
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
              {!inquiryLoading && searchableGroupedInquiries.length > 0 && totalInquiryPages > 1 ? (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#64748B]">
                  Page {activeInquiryPage} of {totalInquiryPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={activeInquiryPage <= 1}
                      onClick={() => setInquiryPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#5F6773] disabled:cursor-not-allowed disabled:opacity-60"
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
                          className={`rounded-full px-3.5 py-2 text-sm ${
                            isActive
                              ? 'bg-[#111827] text-white'
                              : 'border border-[#E2E8F0] bg-white text-[#5F6773]'
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
                      className="rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#5F6773] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </section>

        <div
          className={`fixed inset-0 z-[70] bg-[rgba(15,23,32,0.38)] transition-opacity duration-300 md:hidden ${
            quickPostOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={handleCloseQuickPost}
        />
        <section
          className={`fixed inset-x-0 bottom-0 z-[80] overflow-hidden border-x-0 border-b-0 border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,255,0.98))] shadow-[0_-18px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-transform duration-300 md:hidden ${
            quickPostOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '90dvh', maxHeight: '90vh', touchAction: 'pan-y' }}
        >
          <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col">
            <div className="px-3 pt-3">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-[#D7DEEB]" />
            </div>

            <div
              className={`sticky top-0 z-10 mt-2 flex items-center justify-between border-b px-3 py-2.5 transition-all duration-300 ${
                quickPostScrolled
                  ? 'border-[#E7ECF5] bg-white/94 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl'
                  : 'border-transparent bg-transparent'
              }`}
            >
              <button
                type="button"
                onClick={handleCloseQuickPost}
                className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-sm font-semibold text-[#111827]"
                aria-label="Back to dashboard"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18 9 12l6-6" />
                </svg>
                Back to dashboard
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="#seller-inbox"
                  onClick={() => setQuickPostOpen(false)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111827] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                  aria-label="Open notifications"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 16.5h11l-1.2-1.8a4.5 4.5 0 0 1-.8-2.5V10a3.5 3.5 0 1 0-7 0v2.2a4.5 4.5 0 0 1-.8 2.5L6.5 16.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 18.5a2 2 0 0 0 4 0" />
                  </svg>
                  {pendingReplyNotificationCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[9px] font-semibold text-white">
                      {pendingReplyNotificationCount > 9 ? '9+' : pendingReplyNotificationCount}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>

            <div
              className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
              onScroll={(event) => setQuickPostScrolled(event.currentTarget.scrollTop > 24)}
            >
              <form id="__quick-post-form" className="space-y-4" onSubmit={handleQuickPostSubmit}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[0.9rem] border border-[#E5EAF4] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">Category</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">{quickPostPreview.category}</p>
                  </div>
                  <div className="rounded-[0.9rem] border border-[#E5EAF4] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">Price</p>
                    <p className="mt-1 text-[13px] font-semibold text-[#111827]">{quickPostPreview.priceLabel}</p>
                  </div>
                  <div className="rounded-[0.9rem] border border-[#E5EAF4] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">Images</p>
                    <p className="mt-1 text-[13px] font-semibold text-[#111827]">{quickPostPreview.imageCount}/4</p>
                  </div>
                </div>

                <QuickPostField label="Product Name" hint="Required">
                  <input
                    value={quickPostForm.name}
                    onChange={(event) => setQuickPostField('name', event.target.value)}
                    className="portal-input h-[50px] rounded-[0.8rem] px-4 text-[15px]"
                    placeholder="Example: Premium Coffee Beans"
                    required
                  />
                </QuickPostField>

                <div className="grid grid-cols-2 gap-3">
                  <QuickPostField label="Market">
                    <select
                      value={quickPostForm.marketScope}
                      onChange={(event) => setQuickPostForm((prev) => ({ ...prev, marketScope: event.target.value, category: '' }))}
                      className="portal-input h-[50px] rounded-[0.8rem] px-4 text-[15px]"
                    >
                      <option value="local">Local</option>
                      <option value="global">Global</option>
                      <option value="africa">Africa</option>
                      <option value="china">China</option>
                      <option value="b2b">B2B</option>
                    </select>
                  </QuickPostField>

                  <QuickPostField label="Category" hint={quickPostCategoriesLoading ? 'Loading' : ''}>
                    <select
                      value={quickPostForm.category}
                      onChange={(event) => setQuickPostField('category', event.target.value)}
                      className="portal-input h-[50px] rounded-[0.8rem] px-4 text-[15px]"
                      disabled={quickPostCategoriesLoading}
                      required
                    >
                      <option value="">{quickPostCategoriesLoading ? 'Loading...' : 'Select'}</option>
                      {quickPostCategories.map((entry) => (
                        <option key={entry.value} value={entry.value}>{entry.label}</option>
                      ))}
                    </select>
                  </QuickPostField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <QuickPostField label="Price" hint="Required">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quickPostForm.price}
                      onChange={(event) => setQuickPostField('price', event.target.value)}
                      className="portal-input h-[50px] rounded-[0.8rem] px-4 text-[15px]"
                      placeholder="0.00"
                      required
                    />
                  </QuickPostField>

                  <QuickPostField label="Stock" hint="Required">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quickPostForm.stock}
                      onChange={(event) => setQuickPostField('stock', event.target.value)}
                      className="portal-input h-[50px] rounded-[0.8rem] px-4 text-[15px]"
                      placeholder="0"
                      required
                    />
                  </QuickPostField>
                </div>

                <QuickPostField label="Description">
                  <textarea
                    value={quickPostForm.description}
                    onChange={(event) => setQuickPostField('description', event.target.value)}
                    className="portal-input min-h-[112px] rounded-[0.8rem] px-4 py-3 text-[15px]"
                    placeholder="Write a short buyer-facing description..."
                  />
                </QuickPostField>

                <QuickPostField label="Product Image" hint={quickPostImageUploading ? 'Uploading' : `${quickPostImageUrls.length}/4`}>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center justify-center rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-3 text-sm font-semibold text-[#374151] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQuickPostImageChange}
                          className="hidden"
                        />
                        Choose Image
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenQuickPostCamera}
                        disabled={quickPostImageUploading}
                        className="flex items-center justify-center rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-3 text-sm font-semibold text-[#374151] shadow-[0_8px_18px_rgba(15,23,42,0.04)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Take Picture
                      </button>
                    </div>

                    {quickPostCameraOpen ? (
                      <div className="overflow-hidden rounded-[1rem] border border-[#D7DEEB] bg-[#0F172A] shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                        <div className="aspect-[4/3] w-full bg-black">
                          <video
                            ref={quickPostCameraVideoRef}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            playsInline
                          />
                        </div>
                        <div className="space-y-3 bg-white px-3 py-3">
                          {quickPostCameraError ? (
                            <p className="text-xs font-medium text-red-600">{quickPostCameraError}</p>
                          ) : (
                            <p className="text-xs text-[#667085]">
                              Frame the product clearly, then capture the image. Back camera is preferred on phones by default.
                            </p>
                          )}
                          <div className={`grid gap-3 ${quickPostCameraDeviceCount > 1 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            <button
                              type="button"
                              onClick={handleCloseQuickPostCamera}
                              className="rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-2.5 text-sm font-semibold text-[#374151]"
                            >
                              Cancel
                            </button>
                            {quickPostCameraDeviceCount > 1 ? (
                              <button
                                type="button"
                                onClick={handleSwitchQuickPostCamera}
                                className="rounded-[0.8rem] border border-[#D7DEEB] bg-white px-3 py-2.5 text-sm font-semibold text-[#374151]"
                              >
                                Switch
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={handleCaptureQuickPostPhoto}
                              className="rounded-[0.8rem] bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#F97316)] px-3 py-2.5 text-sm font-semibold text-white"
                            >
                              Capture
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : quickPostCameraError ? (
                      <div className="rounded-[0.95rem] border border-amber-200 bg-amber-50 px-3 py-3">
                        <p className="text-xs font-medium text-amber-700">{quickPostCameraError}</p>
                        <button
                          type="button"
                          onClick={handleOpenQuickPostCamera}
                          className="mt-2 inline-flex rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-700"
                        >
                          Retry Camera Access
                        </button>
                      </div>
                    ) : null}

                    {quickPostImageUrls.length ? (
                      <div className="grid grid-cols-3 gap-2">
                        {quickPostImageUrls.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className={`overflow-hidden rounded-[0.9rem] border border-[#E4EAF4] bg-white p-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)] ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                          >
                            <div className="relative overflow-hidden rounded-[0.75rem] bg-[#F8FAFC]">
                              <img
                                src={url}
                                alt={`Quick product ${index + 1}`}
                                className={`${index === 0 ? 'h-32' : 'h-20'} w-full object-cover`}
                              />
                              {index === 0 ? (
                                <span className="absolute left-2 top-2 rounded-full bg-[rgba(17,24,39,0.72)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                                  Cover
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between px-1">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">
                                {index === 0 ? 'Main image' : `Image ${index + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeQuickPostImage(url)}
                                className="text-[11px] font-semibold text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </QuickPostField>

                {quickPostMessage.text ? (
                  <div className={`rounded-[0.95rem] border px-3 py-2.5 text-sm ${
                    quickPostMessage.tone === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {quickPostMessage.text}
                  </div>
                ) : null}
              </form>
            </div>

            <div
              className="border-t border-[#E7ECF5] bg-white/98 px-3 py-2.5 shadow-[0_-10px_28px_rgba(15,23,42,0.06)]"
              style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex gap-3">
                <Link
                  href="/dashboard/seller/new-product"
                  className="flex flex-1 items-center justify-center rounded-[0.95rem] border border-[#D8DFEB] bg-white px-4 py-3 text-center text-sm font-semibold text-[#374151] shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                  onClick={() => setQuickPostOpen(false)}
                >
                  Advanced
                </Link>
                <button
                  type="submit"
                  form="__quick-post-form"
                  disabled={quickPostSaving}
                  className="flex-1 rounded-[0.95rem] bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#F97316)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(124,58,237,0.28)] transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {quickPostSaving ? 'Posting...' : 'Post Now'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <nav
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-10px_35px_rgba(15,23,32,0.08)] backdrop-blur transition-transform md:hidden ${
            quickPostOpen ? 'translate-y-full' : 'translate-y-0'
          }`}
          style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto grid max-w-md grid-cols-5">
            <MobileBottomNavItem href="/dashboard/seller" active label="Home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10v8.5h11V10" />
              </svg>
            </MobileBottomNavItem>
            <MobileBottomNavItem href="/inquiries" label="Messages">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16v10H8l-4 3V6.5Z" />
              </svg>
            </MobileBottomNavItem>
            <button
              type="button"
              onClick={handleOpenQuickPost}
              className="relative flex flex-col items-center justify-center gap-0 py-1"
              aria-label="Open quick post"
            >
              <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#A855F7)] text-white shadow-[0_18px_36px_rgba(124,58,237,0.34)] transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="mt-[-6px] text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
                Post
              </span>
            </button>
            <MobileBottomNavItem href="/dashboard/seller/products" label="Store">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14l-1 11H6L5 7Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 1 1 6 0" />
              </svg>
            </MobileBottomNavItem>
            <MobileBottomNavItem href="/profile" label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
              </svg>
            </MobileBottomNavItem>
          </div>
        </nav>

        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </main>
    </div>
  );
}
