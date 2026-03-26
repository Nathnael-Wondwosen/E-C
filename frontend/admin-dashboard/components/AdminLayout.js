import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { DEFAULT_ADMIN_SCOPE } from '../config/adminScopes';
import { getStoredAdminScope, setStoredAdminScope } from '../utils/adminScopeService';

const ICONS = {
  Dashboard: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M3.75 12h6.5v8h-6.5v-8zm10 0h6.5v8h-6.5v-8zm-10-8h16.5v5.5H3.75V4z"
    />
  ),
  Products: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 7.5 12 3l8 4.5M4 7.5v9L12 21l8-4.5v-9M4 7.5 12 12l8-4.5M12 12v9"
    />
  ),
  Sales: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M5 15.5h3.5V19H5v-3.5zm5.25-5h3.5V19h-3.5v-8.5zm5.25-3h3.5V19h-3.5V7.5z"
    />
  ),
  Customers: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M16 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8 1.75c-2 0-4 1.1-4 2.75V19h8v-3.5c0-1.65-2-2.75-4-2.75zM8 13.25c-2.55 0-5 1.4-5 3.5V19h8v-2.25c0-1.15.5-2.15 1.3-2.95-.98-.35-2.09-.55-3.3-.55z"
    />
  ),
  Marketing: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 14.5V9.75c0-.95.8-1.75 1.75-1.75H18l-1.25 3L18 14H5.75C4.8 14 4 13.2 4 12.25zm0 0v3.75M8.5 18.25h7"
    />
  ),
  Sections: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 5.5h16M4 12h16M4 18.5h10M4 3.5v17"
    />
  ),
  Services: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M14.5 4.5 13.8 3h-3.6l-.7 1.5-1.65.65-1.5-.6-2.55 2.55.6 1.5-.65 1.65L3 12l.65 1.65-.6 1.5 2.55 2.55 1.5-.6 1.65.65.7 1.5h3.6l.7-1.5 1.65-.65 1.5.6 2.55-2.55-.6-1.5L21 12l-.65-1.65.6-1.5-2.55-2.55-1.5.6-1.65-.65zM12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z"
    />
  ),
  Analytics: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 19.25h16M6 16l4.25-4.25L13 14.5l5-6.5"
    />
  ),
  Logs: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2.5 4h5m-5 4h7m-7 4h4"
    />
  ),
  Settings: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m11.95 3 .75 2.2a6.87 6.87 0 0 1 1.95.8l2.15-1.05 1.95 1.95-1.05 2.15c.34.6.61 1.25.8 1.95l2.2.75v2.75l-2.2.75a6.88 6.88 0 0 1-.8 1.95l1.05 2.15-1.95 1.95L14.65 18a6.88 6.88 0 0 1-1.95.8L11.95 21H9.2l-.75-2.2a6.87 6.87 0 0 1-1.95-.8L4.35 19.05 2.4 17.1l1.05-2.15a6.87 6.87 0 0 1-.8-1.95L.45 12.25V9.5l2.2-.75c.19-.7.46-1.35.8-1.95L2.4 4.65 4.35 2.7 6.5 3.75c.6-.34 1.25-.61 1.95-.8L9.2.75h2.75zm-1.38 12a3.38 3.38 0 1 0 0-6.75 3.38 3.38 0 0 0 0 6.75z"
    />
  ),
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {ICONS[name]}
    </svg>
  );
}

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [activeScope, setActiveScope] = useState(DEFAULT_ADMIN_SCOPE);
  const router = useRouter();

  const navigationItems = useMemo(
    () => [
      { name: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
      {
        name: 'Products',
        href: '#',
        icon: 'Products',
        submenu: [
          { name: 'All Products', href: '/products' },
          { name: 'Add New', href: '/products/new' },
          { name: 'B2B Products', href: '/b2b/products' },
          { name: 'Categories', href: '/categories' },
          { name: 'Inventory', href: '/products/inventory' },
          { name: 'Auto Categorize', href: '/auto-categorize' },
          { name: 'Variants & Comparison', href: '/product-variants' },
        ],
      },
      {
        name: 'Sales',
        href: '#',
        icon: 'Sales',
        submenu: [
          { name: 'Orders', href: '/orders' },
          { name: 'Transactions', href: '/transactions' },
          { name: 'Refunds', href: '/refunds' },
          { name: 'Reports', href: '/reports' },
        ],
      },
      {
        name: 'Customers',
        href: '#',
        icon: 'Customers',
        submenu: [
          { name: 'Customer List', href: '/customers' },
          { name: 'Groups', href: '/customers/groups' },
          { name: 'Feedback', href: '/feedback' },
        ],
      },
      {
        name: 'Marketing',
        href: '#',
        icon: 'Marketing',
        submenu: [
          { name: 'Promotions', href: '/promotions' },
          { name: 'Coupons', href: '/coupons' },
          { name: 'Newsletters', href: '/newsletters' },
          { name: 'Blog Posts', href: '/blog' },
        ],
      },
      {
        name: 'Page Sections',
        href: '#',
        icon: 'Sections',
        submenu: [
          { name: 'Hero Carousel', href: '/sections/hero-carousel' },
          { name: 'Special Offers', href: '/sections/special-offers' },
          { name: 'Category Slider', href: '/sections/category-slider' },
          { name: 'News & Blog', href: '/sections/news-blog' },
          { name: 'Full Width Banners', href: '/banners' },
          { name: 'Partners', href: '/partners' },
        ],
      },
      { name: 'Services', href: '/services', icon: 'Services' },
      { name: 'Analytics', href: '/analytics', icon: 'Analytics' },
      { name: 'Logs', href: '/logs', icon: 'Logs' },
      { name: 'Settings', href: '/settings', icon: 'Settings' },
    ],
    []
  );

  useEffect(() => {
    const scopeFromQuery = router.query.scope;
    const resolvedScope = scopeFromQuery || getStoredAdminScope() || DEFAULT_ADMIN_SCOPE;
    setActiveScope(resolvedScope);
    setStoredAdminScope(resolvedScope);
  }, [router.query.scope]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      return;
    }
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const expanded = {};
    navigationItems.forEach((item) => {
      if (item.submenu?.some((sub) => router.pathname === sub.href || router.pathname.startsWith(`${sub.href}/`))) {
        expanded[item.name] = true;
      }
    });
    setOpenSubmenus((prev) => ({ ...prev, ...expanded }));
  }, [router.pathname, navigationItems]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminScope');
    router.push('/login');
  };

  const withScope = (href) => {
    if (!href || href === '#' || href.startsWith('http')) return href;
    return `/admin/${activeScope}${href}`;
  };

  const isPathActive = (path) => router.pathname === path || router.pathname.startsWith(`${path}/`);
  const isSubmenuActive = (item) => item.submenu?.some((sub) => isPathActive(sub.href));
  const toggleSubmenu = (name) => setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));

  const desktopPadding = sidebarCollapsed ? 'md:pl-24' : 'md:pl-72';
  const desktopWidth = sidebarCollapsed ? 'md:w-24' : 'md:w-72';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Head>
        <title>{`${title} | B2B E-Commerce Platform`}</title>
        <meta name="description" content="Admin Dashboard for B2B E-Commerce Platform" />
      </Head>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-blue-600/20" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-80 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white/90 p-4 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Control Center</p>
                <h1 className="text-xl font-semibold">Trade Admin</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {navigationItems.map((item) => {
                const active = item.submenu ? isSubmenuActive(item) : isPathActive(item.href);
                const activeClass = active
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

                return (
                  <div key={item.name}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition ${activeClass}`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon name={item.icon} className="h-5 w-5" />
                            {item.name}
                          </span>
                          <svg
                            className={`h-4 w-4 transition ${openSubmenus[item.name] ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                        {openSubmenus[item.name] && (
                          <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-700">
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.name}
                                href={withScope(sub.href)}
                                className={`block rounded-lg px-3 py-2 text-sm transition ${
                                  isPathActive(sub.href)
                                    ? 'bg-cyan-500/15 font-medium text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link href={withScope(item.href)} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${activeClass}`}>
                        <Icon name={item.icon} className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 hidden ${desktopWidth} p-4 md:block`}>
        <div className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/75 p-4 shadow-2xl shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-slate-950/40">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Control Center</p>
              <h1 className="text-xl font-semibold">Trade Admin</h1>
            </div>
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <svg className={`h-5 w-5 transition ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 6 9 12l6 6" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {navigationItems.map((item) => {
              const active = item.submenu ? isSubmenuActive(item) : isPathActive(item.href);
              const activeClass = active
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-cyan-500 dark:text-slate-950'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

              return (
                <div key={item.name}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        title={item.name}
                        className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition ${activeClass} ${
                          sidebarCollapsed ? 'justify-center' : 'justify-between'
                        }`}
                      >
                        <span className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                          <Icon name={item.icon} className="h-5 w-5" />
                          {!sidebarCollapsed && item.name}
                        </span>
                        {!sidebarCollapsed && (
                          <svg
                            className={`h-4 w-4 transition ${openSubmenus[item.name] ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                          </svg>
                        )}
                      </button>
                      {!sidebarCollapsed && openSubmenus[item.name] && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-700">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={withScope(sub.href)}
                              className={`block rounded-lg px-3 py-2 text-sm transition ${
                                isPathActive(sub.href)
                                  ? 'bg-cyan-500/15 font-medium text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'
                                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={withScope(item.href)}
                      title={item.name}
                      className={`flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition ${activeClass} ${
                        sidebarCollapsed ? 'justify-center' : 'gap-3'
                      }`}
                    >
                      <Icon name={item.icon} className="h-5 w-5" />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`flex w-full items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
                sidebarCollapsed ? 'justify-center' : 'gap-2'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d={darkMode ? 'M12 3v2.25M12 18.75V21M4.75 12H3m18 0h-1.75M6.6 6.6 5.1 5.1m13.8 13.8-1.5-1.5M17.4 6.6l1.5-1.5M6.6 17.4l-1.5 1.5M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' : 'M20.5 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10 10.5z'}
                />
              </svg>
              {!sidebarCollapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
            </button>
            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-2xl bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700 ${
                sidebarCollapsed ? 'justify-center' : 'gap-2'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 5H6.75A1.75 1.75 0 0 0 5 6.75v10.5C5 18.22 5.78 19 6.75 19H10m3-4 4-3-4-3m4 3H9" />
              </svg>
              {!sidebarCollapsed && 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      <div className={`relative z-10 flex min-h-screen flex-col ${desktopPadding} transition-all duration-300`}>
        <header className="sticky top-0 z-30 p-4 pb-2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-lg shadow-slate-200/40 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-slate-950/40">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:block">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Admin Workspace</p>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>

            <div className="relative ml-auto hidden w-full max-w-md md:block">
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-cyan-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
              </svg>
            </div>

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Toggle theme"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d={darkMode ? 'M12 3v2.25M12 18.75V21M4.75 12H3m18 0h-1.75M6.6 6.6 5.1 5.1m13.8 13.8-1.5-1.5M17.4 6.6l1.5-1.5M6.6 17.4l-1.5 1.5M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' : 'M20.5 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10 10.5z'}
                />
              </svg>
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800 md:flex">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />
              <div className="leading-tight">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 pt-2 md:p-6 md:pt-3">{children}</main>
      </div>
    </div>
  );
}
