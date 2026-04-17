import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  getUserCart,
  getUserInquiryInbox,
  getUserInquirySent,
  getUserWishlist,
  subscribeToInquiryUpdates
} from '../../utils/userService';
import { getCategories } from '../../utils/heroDataService';
import { STATIC_NAVBAR_LINKS } from '../../constants/navbarLinks';
import AccountDropdown from './AccountDropdown';
import { clearCustomerSession, getCustomerSessionState, hasCustomerAuthToken } from '../../utils/session';

const supportedLocales = ['en', 'es', 'fr', 'de'];

const isLoggedIn = () => {
  return getCustomerSessionState().loggedIn;
};

const getUserType = () => {
  return getCustomerSessionState().userType;
};

const protectRoute = (route) => {
  if (!isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', route);
    window.location.href = '/login';
    return;
  }
  window.location.href = route;
};

export default function Header({ isMenuOpen, setIsMenuOpen, categories = [], mobileSeller = null, mobileTitle = '', mobileProfileHref = '' }) {
  const router = useRouter();
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const menuOpen = typeof isMenuOpen === 'boolean' ? isMenuOpen : internalMenuOpen;
  const setMenuOpen = typeof setIsMenuOpen === 'function' ? setIsMenuOpen : setInternalMenuOpen;
  const isProductDetailsPage = router.pathname === '/products/[id]';
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [inquiryNotificationCount, setInquiryNotificationCount] = useState(0);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [resolvedCategories, setResolvedCategories] = useState(Array.isArray(categories) ? categories : []);
  const [messageToast, setMessageToast] = useState({ open: false, count: 0 });
  const closeCategoryTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const previousInquiryCountRef = useRef(0);

  const normalizedCategories = useMemo(() => {
    if (!Array.isArray(resolvedCategories)) return [];
    return resolvedCategories
      .filter((category) => category && category.name)
      .filter((category) => category.isActive !== false)
      .map((category) => ({
        ...category,
        cid: category.id || category._id || category.name,
        parentKey: category.parentId || category.parentCategoryId || category.parent || null,
      }))
      .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
  }, [resolvedCategories]);

  useEffect(() => {
    const provided = Array.isArray(categories) ? categories : [];
    if (provided.length > 0) {
      setResolvedCategories(provided);
      return;
    }

    let cancelled = false;
    const loadCategories = async () => {
      try {
        const fetched = await getCategories();
        if (cancelled) return;
        setResolvedCategories(Array.isArray(fetched) ? fetched : []);
      } catch (error) {
        if (!cancelled) setResolvedCategories([]);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [categories]);

  const topLevelCategories = useMemo(() => {
    return normalizedCategories.filter((category) => !category.parentKey).slice(0, 14);
  }, [normalizedCategories]);

  const subcategoriesByParent = useMemo(() => {
    const map = new Map();
    normalizedCategories.forEach((category) => {
      if (!category.parentKey) return;
      const key = String(category.parentKey);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(category);
    });
    return map;
  }, [normalizedCategories]);

  const changeLocale = (locale) => {
    router.push(router.asPath, router.asPath, { locale });
  };

  const computeInquiryNotificationCount = (inquiries = []) =>
    inquiries.reduce((sum, entry) => {
      const unreadCount = Number(entry?.unreadCount || 0);
      if (unreadCount > 0) return sum + unreadCount;
      const status = String(entry?.status || 'new').toLowerCase();
      if (status === 'closed') return sum;
      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
      const latestMessage = messages.length ? messages[messages.length - 1] : null;
      const latestSenderRole = String(latestMessage?.senderRole || '').toLowerCase();
      const needsAttention = status === 'new' || latestSenderRole === 'buyer';
      return sum + (needsAttention ? 1 : 0);
    }, 0);
  const computeBuyerInquiryNotificationCount = (inquiries = []) =>
    inquiries.reduce((sum, entry) => {
      const unreadCount = Number(entry?.unreadCount || 0);
      if (unreadCount > 0) return sum + unreadCount;
      const status = String(entry?.status || 'new').toLowerCase();
      if (status === 'closed') return sum;
      const messages = Array.isArray(entry?.messages) ? entry.messages : [];
      const latestMessage = messages.length ? messages[messages.length - 1] : null;
      const latestSenderRole = String(latestMessage?.senderRole || '').toLowerCase();
      return sum + (latestSenderRole === 'seller' ? 1 : 0);
    }, 0);

  const loadHeaderCounts = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const session = getCustomerSessionState();
    const userId = String(session.userId || '').trim();
    if (!session.loggedIn || !userId) return;

    if (!hasCustomerAuthToken()) {
      setCartCount(0);
      setWishlistCount(0);
      setInquiryNotificationCount(0);
      return;
    }

    try {
      const currentType = session.userType || getUserType();
      const [cartData, wishlistData, inquiryResult] = await Promise.all([
        getUserCart(userId),
        getUserWishlist(userId),
        currentType === 'seller' ? getUserInquiryInbox(userId) : getUserInquirySent(userId),
      ]);
      const resolvedCartCount = Number(
        cartData?.count ??
        cartData?.totalItems ??
        (Array.isArray(cartData?.items) ? cartData.items.length : 0) ??
        0
      );
      setCartCount(Number.isFinite(resolvedCartCount) ? resolvedCartCount : 0);
      setWishlistCount(wishlistData.items?.length || 0);
      if (currentType === 'seller') {
        setInquiryNotificationCount(computeInquiryNotificationCount(inquiryResult?.inquiries || []));
      } else {
        setInquiryNotificationCount(computeBuyerInquiryNotificationCount(inquiryResult?.inquiries || []));
      }
    } catch (error) {
      console.error('Error loading cart and wishlist counts:', error);
      setCartCount(0);
      setWishlistCount(0);
      setInquiryNotificationCount(0);
    }
  }, []);

  useEffect(() => {
    const refreshLoginStatus = () => {
      const loggedIn = isLoggedIn();
      setIsUserLoggedIn(loggedIn);
      setUserType(getUserType());

      if (loggedIn) {
        loadHeaderCounts();
      } else {
        setCartCount(0);
        setWishlistCount(0);
        setInquiryNotificationCount(0);
      }
    };

    refreshLoginStatus();
    window.addEventListener('storage', refreshLoginStatus);
    window.addEventListener('loginStatusChanged', refreshLoginStatus);
    window.addEventListener('focus', refreshLoginStatus);

    return () => {
      window.removeEventListener('storage', refreshLoginStatus);
      window.removeEventListener('loginStatusChanged', refreshLoginStatus);
      window.removeEventListener('focus', refreshLoginStatus);
    };
  }, [loadHeaderCounts]);

  useEffect(() => {
    if (!isUserLoggedIn) return undefined;
    const intervalId = window.setInterval(() => {
      loadHeaderCounts();
    }, 20000);
    return () => window.clearInterval(intervalId);
  }, [isUserLoggedIn, loadHeaderCounts]);

  useEffect(() => {
    if (!isUserLoggedIn) return undefined;
    const userId = localStorage.getItem('userId');
    if (!userId) return undefined;
    const streamMode = userType === 'seller' ? 'inbox' : 'sent';
    const unsubscribe = subscribeToInquiryUpdates(userId, {
      mode: streamMode,
      onSnapshot: () => {
        loadHeaderCounts();
      }
    });
    return () => unsubscribe();
  }, [isUserLoggedIn, userType, loadHeaderCounts]);

  useEffect(() => {
    return () => {
      if (closeCategoryTimeoutRef.current) {
        clearTimeout(closeCategoryTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isUserLoggedIn) {
      previousInquiryCountRef.current = 0;
      return;
    }
    const previous = Number(previousInquiryCountRef.current || 0);
    const current = Number(inquiryNotificationCount || 0);
    previousInquiryCountRef.current = current;

    if (router.pathname === '/inquiries') return;
    if (current <= previous) return;

    setMessageToast({ open: true, count: current - previous });
    if (typeof window !== 'undefined' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try {
        // Browser-level alert when user is on a different tab/window.
        const notification = new Notification('New message update', {
          body: `${current - previous} new message${current - previous > 1 ? 's' : ''} received`,
          tag: 'tradeethiopia-messages',
          renotify: true,
        });
        notification.onclick = () => {
          window.focus();
          router.push('/inquiries');
          notification.close();
        };
      } catch (_error) {
        // Ignore notification API runtime issues.
      }
    }
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setMessageToast({ open: false, count: 0 });
    }, 4200);
  }, [inquiryNotificationCount, isUserLoggedIn, router.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    setMenuOpen(false);
  }, [menuOpen, router.asPath, setMenuOpen]);

  const sortedLinks = [...STATIC_NAVBAR_LINKS]
    .filter((link) => link.enabled)
    .sort((a, b) => a.order - b.order);
  const resolveNavHref = (link) => {
    if (!link) return '';
    const id = String(link.id || '').toLowerCase();
    const title = String(link.title || '').toLowerCase();
    if (id === 'local-market' || title === 'local market') {
      return '/localmarket';
    }
    if (id === 'global-market' || title === 'global market') {
      return '/marketplace';
    }
    return link.url;
  };
  const isActive = (url) => {
    if (!url) return false;
    if (url === '/') return router.pathname === '/';
    return router.pathname.startsWith(url);
  };

  const handleLogout = () => {
    clearCustomerSession();
    setIsUserLoggedIn(false);
    setUserType('buyer');
    setCartCount(0);
    setWishlistCount(0);
    setInquiryNotificationCount(0);
    window.location.href = '/login';
  };

  const handleMobileBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/marketplace');
  };

  const handleCategoryOpen = () => {
    if (closeCategoryTimeoutRef.current) {
      clearTimeout(closeCategoryTimeoutRef.current);
      closeCategoryTimeoutRef.current = null;
    }
    setIsCategoryOpen(true);
  };

  const handleCategoryClose = () => {
    closeCategoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 160);
  };

  const activeCategory = useMemo(() => {
    if (!topLevelCategories.length) return null;
    const matched = topLevelCategories.find((category) => String(category.cid) === String(activeCategoryId));
    return matched || topLevelCategories[0];
  }, [topLevelCategories, activeCategoryId]);

  const hasMobileSellerSlot = mobileSeller && typeof mobileSeller === 'object';
  const canOpenMobileProfile = Boolean(mobileProfileHref || (hasMobileSellerSlot && mobileSeller?.id));

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="h-14 hidden md:grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/TE-logo.png" alt="TradeEthiopia Logo" width={120} height={28} priority className="h-7 w-auto" />
            <span className="text-base font-bold text-gray-900">TradeEthiopia</span>
          </Link>

          <div className="flex items-center gap-1 overflow-visible">
            <div
              className="relative shrink-0"
              onMouseEnter={() => {
                handleCategoryOpen();
                if (topLevelCategories.length > 0) {
                  setActiveCategoryId(topLevelCategories[0].cid);
                }
              }}
              onMouseLeave={handleCategoryClose}
            >
              <button
                className={`px-3 h-8 inline-flex items-center rounded-md text-sm transition-colors ${
                  isCategoryOpen ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                }`}
                onFocus={handleCategoryOpen}
                onBlur={handleCategoryClose}
                aria-expanded={isCategoryOpen}
                aria-haspopup="menu"
              >
                Categories
                <svg className={`h-4 w-4 ml-1 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute left-0 top-full mt-3 w-[820px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 shadow-[0_24px_70px_rgba(15,23,42,0.2)] z-40 rounded-none overflow-hidden transition-all duration-200 ${
                  isCategoryOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="p-1.5 grid grid-cols-[280px_1fr] gap-1.5 bg-white">
                  <div className="border border-gray-200 overflow-hidden bg-white max-h-[470px] overflow-y-auto">
                    {topLevelCategories.map((category) => {
                      const isActiveCategory = String(activeCategory?.cid) === String(category.cid);
                      return (
                      <Link
                        key={category.cid}
                        href={`/products?category=${encodeURIComponent(category.name || '')}`}
                        onMouseEnter={() => setActiveCategoryId(category.cid)}
                        className={`px-2 py-2 border-b border-gray-100 last:border-b-0 flex items-center justify-between transition-colors ${
                          isActiveCategory ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700' : 'bg-white text-gray-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-8 w-8 rounded-none inline-flex items-center justify-center text-sm ${
                            isActiveCategory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {category.icon || '>'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">{category.name}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-1">Top picks and verified sellers</p>
                          </div>
                        </div>
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                    })}
                  </div>

                  <div className="border border-gray-200 bg-white p-2 max-h-[470px] overflow-y-auto">
                    {activeCategory ? (
                      <div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                          <p className="text-sm font-semibold text-gray-900">{activeCategory.name}</p>
                          <Link href={`/products?category=${encodeURIComponent(activeCategory.name || '')}`} className="text-xs font-semibold text-blue-700 hover:underline">
                            View all
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {(subcategoriesByParent.get(String(activeCategory.cid)) || []).map((subcategory) => (
                            <Link
                              key={subcategory.cid}
                              href={`/products?category=${encodeURIComponent(activeCategory.name || '')}&subcategory=${encodeURIComponent(subcategory.name || '')}`}
                              className="px-2 py-2 border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            >
                              <p className="line-clamp-1 font-medium">{subcategory.name}</p>
                            </Link>
                          ))}
                        </div>
                        {(subcategoriesByParent.get(String(activeCategory.cid)) || []).length === 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {topLevelCategories
                              .filter((category) => String(category.cid) !== String(activeCategory.cid))
                              .slice(0, 9)
                              .map((fallbackCategory) => (
                                <Link
                                  key={`fallback-${fallbackCategory.cid}`}
                                  href={`/products?category=${encodeURIComponent(fallbackCategory.name || '')}`}
                                  className="px-2 py-2 border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                                >
                                  <p className="line-clamp-1 font-medium">{fallbackCategory.name}</p>
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : <p className="text-sm text-gray-500">No categories available.</p>}
                  </div>
                </div>
              </div>
            </div>

            {sortedLinks.map((link) =>
              link.type === 'external' ? (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-3 h-8 inline-flex items-center rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition-colors">
                  {link.title}
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={resolveNavHref(link)}
                  className={`shrink-0 px-3 h-8 inline-flex items-center rounded-md text-sm transition-colors ${
                    isActive(resolveNavHref(link)) ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                  }`}
                >
                  {link.title}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            {!isProductDetailsPage ? (
            <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
              <a href="#" aria-label="Facebook" className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 hover:border-blue-400 hover:text-blue-700 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 hover:border-pink-400 hover:text-pink-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 hover:border-sky-400 hover:text-sky-700 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-9.5 6.75h-2.2V18h2.2V9.75Zm4.4 0h-2.1V18h2.1v-4.35c0-1.15.25-2.25 1.68-2.25 1.4 0 1.42 1.3 1.42 2.33V18H19v-4.72c0-2.32-.5-4.1-3.2-4.1-1.3 0-2.17.72-2.53 1.4h-.04V9.75ZM8.4 6.2a1.28 1.28 0 1 0 0 2.56 1.28 1.28 0 0 0 0-2.56Z" />
                </svg>
              </a>
            </div>
            ) : null}

            <button
              type="button"
              onClick={() => protectRoute('/wishlist')}
              aria-label="Wishlist"
              title="Wishlist"
              className="relative h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
              </svg>
              {isUserLoggedIn && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => protectRoute('/cart')}
              aria-label="Cart"
              title="Cart"
              className="relative h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
              </svg>
              {isUserLoggedIn && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().catch(() => {});
                  }
                  protectRoute('/inquiries');
                }}
                aria-label="Messages"
                title="Messages"
                className="relative h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M5 17h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {inquiryNotificationCount > 0 ? (
                  <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {inquiryNotificationCount > 99 ? '99+' : inquiryNotificationCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            <div className="relative group">
              <button
                type="button"
                aria-label="Language"
                title="Language"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1 13 4-10 4 10m-1-3h-6m-5 6h12a2 2 0 0 0 2-2v-5.5m0-5V9a2 2 0 0 0-2-2h-1.5m-13 0H5a2 2 0 0 1 2 2v1.5m0 8V21a2 2 0 0 1-2 2H3" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-200 shadow-xl hidden group-hover:block">
                <div className="p-2 grid grid-cols-2 gap-1">
                  {supportedLocales.map((locale) => {
                    const active = router.locale === locale;
                    const label = locale === 'en' ? 'EN' : locale === 'es' ? 'ES' : locale === 'fr' ? 'FR' : 'DE';
                    return (
                      <button
                        key={locale}
                        onClick={() => changeLocale(locale)}
                        className={`px-2 py-1 text-xs uppercase border ${
                          active ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <AccountDropdown />
          </div>
        </div>

        <div className="md:hidden h-14 flex items-center justify-between">
          <button type="button" onClick={handleMobileBack} className="p-2 text-gray-700" aria-label="Go back">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {mobileTitle ? (
            <p className="max-w-[60vw] truncate text-base font-semibold text-gray-900">{mobileTitle}</p>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image src="/TE-logo.png" alt="TradeEthiopia Logo" width={120} height={28} priority className="h-7 w-auto" />
              <span className="text-base font-bold text-gray-900">TradeEthiopia</span>
            </Link>
          )}

          {hasMobileSellerSlot ? (
            <button
              type="button"
              onClick={() => {
                if (!canOpenMobileProfile) return;
                if (mobileProfileHref) {
                  router.push(mobileProfileHref);
                  return;
                }
                router.push(`/seller/${encodeURIComponent(String(mobileSeller.id))}`);
              }}
              className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
              aria-label={mobileProfileHref ? 'Open profile' : `Open ${mobileSeller?.name || 'seller'} shop`}
              title={mobileProfileHref ? 'Open profile' : `Open ${mobileSeller?.name || 'seller'} shop`}
            >
              {mobileSeller?.imageUrl ? (
                <img src={mobileSeller.imageUrl} alt={mobileSeller?.name || 'Seller'} className="h-full w-full object-cover" />
              ) : (
                <span className="inline-flex h-full w-full items-center justify-center text-xs font-semibold text-slate-700">
                  {String(mobileSeller?.name || 'S').trim().charAt(0).toUpperCase() || 'S'}
                </span>
              )}
            </button>
          ) : (
            <button type="button" onClick={() => protectRoute('/cart')} className="p-2 text-gray-700 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
              </svg>
              {isUserLoggedIn && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-2 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-xs uppercase text-gray-400 mb-2">Language</p>
              <div className="grid grid-cols-4 gap-2">
                {supportedLocales.map((locale) => {
                  const active = router.locale === locale;
                  const label = locale === 'en' ? 'EN' : locale === 'es' ? 'ES' : locale === 'fr' ? 'FR' : 'DE';
                  return (
                    <button
                      key={locale}
                      onClick={() => changeLocale(locale)}
                      className={`px-2 py-1 text-xs uppercase border ${
                        active ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2">
              {sortedLinks.map((link) =>
                link.type === 'external' ? (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                    {link.title}
                  </a>
                ) : (
                  <Link key={link.id} href={resolveNavHref(link)} className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                    {link.title}
                  </Link>
                )
              )}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <Link href="/wishlist" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link href="/cart" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Cart</Link>
              {isUserLoggedIn ? (
                <Link href="/inquiries" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                  Messages {inquiryNotificationCount > 0 ? `(${inquiryNotificationCount})` : ''}
                </Link>
              ) : null}
              {isUserLoggedIn ? (
                <>
                  <Link href={userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer'} className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button className="block py-2 text-sm text-red-600" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link href="/signup" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isUserLoggedIn && messageToast.open ? (
        <button
          type="button"
          onClick={() => {
            setMessageToast({ open: false, count: 0 });
            router.push('/inquiries');
          }}
          className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-[0_14px_34px_rgba(15,23,42,0.16)]"
        >
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-100 px-1 text-[11px] text-emerald-700">
            +{messageToast.count}
          </span>
          New message update
          <span className="text-xs text-emerald-600">Open</span>
        </button>
      ) : null}
    </header>
  );
}
