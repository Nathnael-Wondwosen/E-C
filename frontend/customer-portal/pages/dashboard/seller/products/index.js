import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { deleteSellerProduct, getSellerProducts } from '../../../../utils/userService';
import { getRequiredCustomerSession } from '../../../../utils/session';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

function StoreNavItem ({ href, label, active = false, children }) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-0.5 py-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
        active ? 'bg-[rgba(124,58,237,0.12)] text-[#7C3AED]' : 'text-slate-400'
      }`}>
        {children}
      </span>
      <span className={`text-[10px] font-semibold ${active ? 'text-[#7C3AED]' : 'text-slate-700'}`}>
        {label}
      </span>
    </Link>
  );
}

export default function SellerProductsManagementPage () {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [specialFilter, setSpecialFilter] = useState('all');
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [deletingId, setDeletingId] = useState('');
  const [mobileViewType, setMobileViewType] = useState('list');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = getRequiredCustomerSession('seller');
    if (!session.loggedIn) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setLoading(true);
      const result = await getSellerProducts({ page: 1, limit: 100, query: debouncedQuery });
      if (!mounted) return;
      if (!result?.success) {
        setItems([]);
        setMessage({ tone: 'error', text: result?.message || 'Failed to load products.' });
      } else {
        setItems(Array.isArray(result.items) ? result.items : []);
      }
      setLoading(false);
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [debouncedQuery]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const scope = String(item?.marketScope || item?.scope || '').toLowerCase();
      const matchesScope = scopeFilter === 'all' || scope === scopeFilter;
      const matchesSpecial =
        specialFilter === 'all' ||
        (specialFilter === 'made-in-ethiopia' && Boolean(item?.isMadeInEthiopia)) ||
        (specialFilter === 'new-arrival' && Boolean(item?.isNewArrival)) ||
        (specialFilter === 'discounted' && Number(item?.discountPercentage || 0) > 0);
      return matchesScope && matchesSpecial;
    });
  }, [items, scopeFilter, specialFilter]);

  const totalProducts = filteredItems.length;
  const totalStock = useMemo(
    () => filteredItems.reduce((sum, item) => sum + Number(item?.stock || 0), 0),
    [filteredItems]
  );
  const highlightedCount = useMemo(
    () => filteredItems.filter((item) => Boolean(item?.isMadeInEthiopia) || Boolean(item?.isNewArrival)).length,
    [filteredItems]
  );
  const lowStockCount = useMemo(
    () => filteredItems.filter((item) => Number(item?.stock || 0) > 0 && Number(item?.stock || 0) <= 10).length,
    [filteredItems]
  );
  const allVisibleProductIds = useMemo(
    () => filteredItems.map((item) => String(item?.id || item?._id || '')).filter(Boolean),
    [filteredItems]
  );
  const selectedVisibleCount = useMemo(
    () => allVisibleProductIds.filter((productId) => selectedProductIds.includes(productId)).length,
    [allVisibleProductIds, selectedProductIds]
  );
  const allVisibleSelected = allVisibleProductIds.length > 0 && selectedVisibleCount === allVisibleProductIds.length;

  const handleDelete = async (productId, name) => {
    const confirmed = window.confirm(`Delete "${name || 'this product'}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(String(productId));
    const result = await deleteSellerProduct(productId);
    setDeletingId('');

    if (!result?.success) {
      setMessage({ tone: 'error', text: result?.message || 'Failed to delete product.' });
      return;
    }

    setItems((prev) => prev.filter((item) => String(item.id || item._id) !== String(productId)));
    setSelectedProductIds((prev) => prev.filter((entry) => entry !== String(productId)));
    setMessage({ tone: 'success', text: 'Product deleted successfully.' });
  };

  const toggleProductSelection = (productId) => {
    const normalizedId = String(productId || '');
    if (!normalizedId) return;
    setSelectedProductIds((prev) =>
      prev.includes(normalizedId)
        ? prev.filter((entry) => entry !== normalizedId)
        : [...prev, normalizedId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (!allVisibleProductIds.length) return;
    setSelectedProductIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((entry) => !allVisibleProductIds.includes(entry));
      }

      return [...new Set([...prev, ...allVisibleProductIds])];
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedProductIds.length) return;

    const confirmed = window.confirm(`Delete ${selectedProductIds.length} selected product${selectedProductIds.length === 1 ? '' : 's'}? This cannot be undone.`);
    if (!confirmed) return;

    setBulkDeleting(true);
    const results = await Promise.all(selectedProductIds.map((productId) => deleteSellerProduct(productId)));
    setBulkDeleting(false);

    const deletedIds = selectedProductIds.filter((productId, index) => results[index]?.success);
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length) {
      setItems((prev) => prev.filter((item) => !deletedIds.includes(String(item?.id || item?._id || ''))));
    }
    setSelectedProductIds([]);

    if (failedCount > 0) {
      setMessage({
        tone: 'error',
        text: deletedIds.length
          ? `Deleted ${deletedIds.length} product${deletedIds.length === 1 ? '' : 's'}, but ${failedCount} failed.`
          : 'Bulk delete failed.'
      });
      return;
    }

    setMessage({
      tone: 'success',
      text: `Deleted ${deletedIds.length} product${deletedIds.length === 1 ? '' : 's'} successfully.`
    });
  };

  return (
    <div className="portal-page min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F8FAFF_0%,#F1F5FF_42%,#EEF3FF_100%)]">
      <Head>
        <title>Seller Store | Seller Dashboard</title>
      </Head>

      <main className="mx-auto max-w-6xl px-0 py-0 pb-24 sm:px-4 sm:py-5 sm:pb-8 lg:px-6 lg:py-8">
        <section className="sm:hidden">
          <div className="relative overflow-hidden px-4 pb-2 pt-4">
            <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_56%),radial-gradient(circle_at_top_right,rgba(251,113,133,0.1),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(243,246,255,0.72))]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Seller Store</p>
                  <h1 className="mt-1 text-[1.65rem] font-semibold tracking-[-0.06em] text-[#111827]">My Products</h1>
                  <p className="mt-1 max-w-[15rem] text-[12.5px] leading-5 text-[#667085]">
                    Manage what buyers see, track store movement, and keep your listings sharp.
                  </p>
                </div>
                <Link
                  href="/dashboard/seller/new-product"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/86 text-[#6D28D9] shadow-[0_12px_28px_rgba(124,58,237,0.16)] backdrop-blur-xl"
                  aria-label="Add product"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-[0.95rem] border border-white/75 bg-white/78 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Products</p>
                    <span className="text-[#8B5CF6]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14l-1 11H6L5 7Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 1 1 6 0" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.04em] text-[#111827]">{totalProducts}</p>
                  <p className="mt-1 text-[10px] text-[#7B8797]">Listings live now</p>
                </div>
                <div className="rounded-[0.95rem] border border-white/75 bg-white/78 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Stock</p>
                    <span className="text-[#6366F1]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 12h10M9 17h6" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.04em] text-[#111827]">{totalStock}</p>
                  <p className="mt-1 text-[10px] text-[#7B8797]">Units available</p>
                </div>
                <div className="rounded-[0.95rem] border border-white/75 bg-white/78 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A94A6]">Low Stock</p>
                    <span className="text-[#F59E0B]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.04em] text-[#111827]">{lowStockCount}</p>
                  <p className="mt-1 text-[10px] text-[#7B8797]">Need restock</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4">
            <div className="space-y-2.5">
              <div className="rounded-[1rem] border border-white/80 bg-white/88 p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-[0.95rem] border border-[#D7E0EC] bg-[#FAFCFF] px-3">
                    <span className="text-[#8A97A9]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.6 10.6Z" />
                      </svg>
                    </span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search products..."
                      className="h-10 w-full bg-transparent text-[13px] text-[#243447] outline-none placeholder:text-[#8A97A9]"
                    />
                  </div>

                  <div className="inline-flex h-10 shrink-0 items-center rounded-[0.95rem] border border-[#D7E0EC] bg-[#FAFCFF] p-1">
                    <button
                      type="button"
                      onClick={() => setMobileViewType('list')}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-[0.75rem] transition ${
                        mobileViewType === 'list' ? 'bg-white text-[#6D28D9] shadow-[0_8px_18px_rgba(124,58,237,0.12)]' : 'text-[#7B8797]'
                      }`}
                      aria-label="List view"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h11M8 12h11M8 17h11" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h.01M4 12h.01M4 17h.01" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileViewType('grid')}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-[0.75rem] transition ${
                        mobileViewType === 'grid' ? 'bg-white text-[#6D28D9] shadow-[0_8px_18px_rgba(124,58,237,0.12)]' : 'text-[#7B8797]'
                      }`}
                      aria-label="Grid view"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
                        <rect x="4" y="4" width="6" height="6" rx="1.2" />
                        <rect x="14" y="4" width="6" height="6" rx="1.2" />
                        <rect x="4" y="14" width="6" height="6" rx="1.2" />
                        <rect x="14" y="14" width="6" height="6" rx="1.2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[1rem] border border-white/80 bg-white/88 p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    className="inline-flex h-8 items-center rounded-full border border-[#D7E0EC] bg-white px-3 text-[11px] font-semibold text-[#334155]"
                  >
                    {allVisibleSelected ? 'Clear Selection' : 'Select Visible'}
                  </button>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#7B8797]">
                      {selectedProductIds.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={!selectedProductIds.length || bulkDeleting}
                      className="inline-flex h-8 items-center rounded-full border border-red-200 bg-[#FFF4F4] px-3 text-[11px] font-semibold text-red-700 disabled:opacity-50"
                    >
                      {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="scrollbar-hidden -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none]">
                <div className="flex min-w-max items-center gap-2 pb-1">
                  {[
                    { id: 'all', label: 'All', onClick: () => { setScopeFilter('all'); setSpecialFilter('all'); }, active: scopeFilter === 'all' && specialFilter === 'all' },
                    { id: 'local', label: 'Local', onClick: () => setScopeFilter('local'), active: scopeFilter === 'local' },
                    { id: 'global', label: 'Export', onClick: () => setScopeFilter('global'), active: scopeFilter === 'global' },
                    { id: 'low-stock', label: `Low Stock ${lowStockCount ? `(${lowStockCount})` : ''}`.trim(), onClick: () => { setScopeFilter('all'); setSpecialFilter('all'); }, active: false, lowStock: true },
                    { id: 'made', label: 'Made in ET', onClick: () => setSpecialFilter('made-in-ethiopia'), active: specialFilter === 'made-in-ethiopia' },
                    { id: 'new', label: 'New Arrival', onClick: () => setSpecialFilter('new-arrival'), active: specialFilter === 'new-arrival' }
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={chip.onClick}
                      className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold transition ${
                        chip.active
                          ? 'bg-[linear-gradient(135deg,#A78BFA,#8B5CF6,#EC4899)] text-white shadow-[0_10px_18px_rgba(139,92,246,0.2)]'
                          : chip.lowStock
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'border border-white/80 bg-white/88 text-[#526173]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}

                  <div className="relative">
                    <select
                      value={specialFilter}
                      onChange={(event) => setSpecialFilter(event.target.value)}
                      className="h-8 appearance-none rounded-full border border-white/80 bg-white/88 pl-3 pr-8 text-[12px] font-semibold text-[#526173]"
                    >
                      <option value="all">Sort by</option>
                      <option value="made-in-ethiopia">Made in Ethiopia</option>
                      <option value="new-arrival">New Arrival</option>
                      <option value="discounted">Discounted</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M5.25 7.5 10 12.25 14.75 7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 px-4">
            {message.text ? (
              <div className={`rounded-[1rem] border px-3 py-2.5 text-sm ${
                message.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-[1.2rem] border border-white/70 bg-white/78 px-4 py-8 text-center text-sm text-[#667085] shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                Loading store products...
              </div>
            ) : totalProducts === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-[#D5DDE8] bg-white/78 px-4 py-10 text-center shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                <p className="text-base font-semibold text-[#111827]">No products found</p>
                <p className="mt-2 text-sm text-[#667085]">Post a product and it will appear in your store here.</p>
              </div>
            ) : (
              <div className={mobileViewType === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                {filteredItems.map((item) => {
                  const productId = item?.id || item?._id;
                  const normalizedProductId = String(productId || '');
                  const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
                  const thumbnail = item?.image || images[0] || item?.thumbnail || '';
                  const isDeleting = String(deletingId) === String(productId);
                  const isSelected = selectedProductIds.includes(normalizedProductId);
                  const stockCount = Number(item?.stock || 0);
                  const stockTone = stockCount > 10 ? 'text-emerald-700' : stockCount > 0 ? 'text-amber-700' : 'text-rose-700';
                  const stockDotTone = stockCount > 10 ? 'bg-emerald-500' : stockCount > 0 ? 'bg-amber-400' : 'bg-rose-500';
                  const stockLabel = stockCount > 10 ? 'In Stock' : stockCount > 0 ? 'Low Stock' : 'Out of Stock';

                  return (
                    mobileViewType === 'grid' ? (
                      <article key={String(productId)} className={`overflow-hidden rounded-[0.95rem] border bg-white/92 p-2 shadow-[0_10px_20px_rgba(15,23,42,0.045)] backdrop-blur-xl ${isSelected ? 'border-[#8B5CF6] ring-1 ring-[#C4B5FD]' : 'border-white/85'}`}>
                        <div className="relative overflow-hidden rounded-[0.8rem] border border-[#E2E8F0] bg-[#F8FAFC]">
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(normalizedProductId)}
                            className={`absolute left-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border text-white shadow-[0_8px_16px_rgba(15,23,42,0.12)] ${isSelected ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-white/90 bg-white/90 text-transparent'}`}
                            aria-label={isSelected ? 'Unselect product' : 'Select product'}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                              <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.13a1 1 0 0 1-1.42 0L4.29 9.9a1 1 0 1 1 1.42-1.407l3.22 3.253 6.36-6.415a1 1 0 0 1 1.414-.04Z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {thumbnail ? (
                            <img src={thumbnail} alt={item?.name || 'Product'} className="h-28 w-full object-cover" />
                          ) : (
                            <div className="flex h-28 items-center justify-center text-xs text-[#94A3B8]">No image</div>
                          )}
                          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                            {String(item?.marketScope || item?.scope || 'store')}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <h2 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#111827]">
                            {item?.name || 'Untitled Product'}
                          </h2>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">{item?.category || 'General'}</p>
                          <div className="mt-2 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[0.95rem] font-semibold text-[#111827]">{formatPrice(item?.price)}</p>
                              <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium ${stockTone}`}>
                                <span className={`h-2 w-2 rounded-full ${stockDotTone}`} />
                                {stockLabel}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8A94A6]">{formatDate(item?.updatedAt || item?.createdAt)}</p>
                          </div>
                        </div>
                        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                          <Link
                            href={`/dashboard/seller/products/${encodeURIComponent(String(productId))}`}
                            className="inline-flex h-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C3AED,#8B5CF6,#A855F7)] px-2 text-[10px] font-semibold text-white shadow-[0_10px_18px_rgba(124,58,237,0.18)]"
                          >
                            Manage
                          </Link>
                          <Link
                            href={`/products/${encodeURIComponent(String(productId))}`}
                            className="inline-flex h-8 items-center justify-center rounded-full border border-[#D7E0EC] bg-[#F8FAFF] px-2 text-[10px] font-semibold text-[#334155]"
                          >
                            Preview
                          </Link>
                        </div>
                      </article>
                    ) : (
                      <article key={String(productId)} className={`overflow-hidden rounded-[0.95rem] border bg-white/92 p-2.25 shadow-[0_10px_20px_rgba(15,23,42,0.045)] backdrop-blur-xl ${isSelected ? 'border-[#8B5CF6] ring-1 ring-[#C4B5FD]' : 'border-white/85'}`}>
                        <div className="flex gap-2.5">
                          <div className="relative h-[4.45rem] w-[4.45rem] shrink-0 overflow-hidden rounded-[0.8rem] border border-[#E2E8F0] bg-[#F8FAFC]">
                            <button
                              type="button"
                              onClick={() => toggleProductSelection(normalizedProductId)}
                              className={`absolute left-1.5 top-1.5 z-10 inline-flex h-5.5 w-5.5 items-center justify-center rounded-full border text-white shadow-[0_8px_16px_rgba(15,23,42,0.12)] ${isSelected ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-white/90 bg-white/90 text-transparent'}`}
                              aria-label={isSelected ? 'Unselect product' : 'Select product'}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.13a1 1 0 0 1-1.42 0L4.29 9.9a1 1 0 1 1 1.42-1.407l3.22 3.253 6.36-6.415a1 1 0 0 1 1.414-.04Z" clipRule="evenodd" />
                              </svg>
                            </button>
                            {thumbnail ? (
                              <img src={thumbnail} alt={item?.name || 'Product'} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[#94A3B8]">No image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h2 className="line-clamp-1 text-[13.5px] font-semibold leading-5 text-[#111827]">
                                  {item?.name || 'Untitled Product'}
                                </h2>
                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">
                                  {item?.category || 'General'} | SKU: {item?.sku || '-'}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                                {String(item?.marketScope || item?.scope || 'store')}
                              </span>
                            </div>

                            <div className="mt-2 flex items-end justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[0.96rem] font-semibold text-[#111827]">{formatPrice(item?.price)}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-[#667085]">
                                  <span className={`inline-flex items-center gap-1 font-medium ${stockTone}`}>
                                    <span className={`h-2 w-2 rounded-full ${stockDotTone}`} />
                                    {stockLabel}
                                  </span>
                                  <span>{stockCount} pcs</span>
                                </div>
                              </div>
                              <p className="shrink-0 text-[10px] text-[#8A94A6]">
                                {formatDate(item?.updatedAt || item?.createdAt)}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5">
                              <Link
                                href={`/products/${encodeURIComponent(String(productId))}`}
                                className="inline-flex h-7.5 min-w-[4.35rem] items-center justify-center rounded-full border border-[#D7E0EC] bg-[#F8FAFF] px-2.5 text-[10px] font-semibold text-[#334155] transition hover:border-[#C7D2E0] hover:bg-white"
                              >
                                Preview
                              </Link>
                              <Link
                                href={`/dashboard/seller/products/${encodeURIComponent(String(productId))}`}
                                className="inline-flex h-7.5 min-w-[4.75rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C3AED,#8B5CF6,#A855F7)] px-3 text-[10px] font-semibold text-white shadow-[0_10px_18px_rgba(124,58,237,0.18)] transition hover:shadow-[0_12px_22px_rgba(124,58,237,0.24)]"
                              >
                                Manage
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(productId, item?.name)}
                                disabled={isDeleting}
                                className="inline-flex h-7.5 min-w-[4.25rem] items-center justify-center rounded-full border border-red-200 bg-[#FFF7F7] px-2.5 text-[10px] font-semibold text-red-700 transition hover:bg-[#FFF1F1] disabled:opacity-60"
                              >
                                {isDeleting ? '...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="hidden sm:block">
          <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="border-b border-[var(--portal-border)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Seller Store</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">Manage Posted Products</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                    Review what customers can see in your store, update product details, and keep your listings sharp.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/seller" className="portal-outline-button px-4 py-2 text-sm">Back</Link>
                  <Link href="/dashboard/seller/new-product" className="portal-primary-button px-4 py-2 text-sm">Post New Product</Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.2rem] border border-[#E5E9F5] bg-[#F8FAFF] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Visible Products</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827]">{totalProducts}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[#E5E9F5] bg-[#F8FAFF] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Total Stock</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827]">{totalStock}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[#E5E9F5] bg-[#F8FAFF] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Highlighted</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827]">{highlightedCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, category or SKU..."
                  className="portal-input md:col-span-2"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="portal-input">
                    <option value="all">All Scopes</option>
                    <option value="local">Local</option>
                    <option value="global">Global</option>
                    <option value="africa">Africa</option>
                    <option value="china">China</option>
                    <option value="b2b">B2B</option>
                  </select>
                  <select value={specialFilter} onChange={(event) => setSpecialFilter(event.target.value)} className="portal-input">
                    <option value="all">All Types</option>
                    <option value="made-in-ethiopia">Made in Ethiopia</option>
                    <option value="new-arrival">New Arrival</option>
                    <option value="discounted">Discounted</option>
                  </select>
                </div>
              </div>

              {message.text ? (
                <div className={`rounded-[0.9rem] border px-3 py-2.5 text-sm ${
                  message.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              ) : null}

              {loading ? (
                <p className="text-sm text-[#5F6773]">Loading products...</p>
              ) : totalProducts === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-muted)] px-4 py-10 text-center text-sm text-[#5F6773]">
                  No products found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const productId = item?.id || item?._id;
                    const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
                    const thumbnail = item?.image || images[0] || item?.thumbnail || '';
                    const isDeleting = String(deletingId) === String(productId);

                    return (
                      <article key={String(productId)} className="rounded-[1rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,32,0.04)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                              {thumbnail ? (
                                <img src={thumbnail} alt={item?.name || 'Product'} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-[#94A3B8]">No image</div>
                              )}
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[#0F1720]">{item?.name || 'Untitled Product'}</h2>
                              <p className="mt-1 text-sm text-[#5F6773]">{item?.category || 'General'} | SKU: {item?.sku || '-'}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {item?.isMadeInEthiopia ? (
                                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Made in Ethiopia</span>
                                ) : null}
                                {item?.isNewArrival ? (
                                  <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">New Arrival</span>
                                ) : null}
                                {Number(item?.discountPercentage || 0) > 0 ? (
                                  <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                    {Math.round(Number(item?.discountPercentage || 0))}% Off
                                  </span>
                                ) : null}
                                {item?.marketScope || item?.scope ? (
                                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                                    {String(item?.marketScope || item?.scope)}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-[#5F6773]">Stock: {Number(item?.stock || 0)} | Price: {formatPrice(item?.price)}</p>
                              <p className="mt-1 text-xs text-[#7A818C]">Images: {images.length || (thumbnail ? 1 : 0)} | Updated: {formatDate(item?.updatedAt || item?.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/products/${encodeURIComponent(String(productId))}`} className="portal-outline-button px-3 py-2 text-xs">Preview</Link>
                            <Link href={`/dashboard/seller/products/${encodeURIComponent(String(productId))}`} className="portal-primary-button px-3 py-2 text-xs">Manage</Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(productId, item?.name)}
                              disabled={isDeleting}
                              className="rounded-[0.85rem] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </section>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8E1EA] bg-white/95 shadow-[0_-10px_35px_rgba(15,23,32,0.08)] backdrop-blur sm:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <StoreNavItem href="/dashboard/seller" label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10v8.5h11V10" />
            </svg>
          </StoreNavItem>
          <StoreNavItem href="/inquiries" label="Messages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16v10H8l-4 3V6.5Z" />
            </svg>
          </StoreNavItem>
          <Link href="/dashboard/seller/new-product" className="relative flex flex-col items-center justify-center gap-0 py-1" aria-label="Open advanced product form">
            <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D28D9,#8B5CF6,#A855F7)] text-white shadow-[0_18px_36px_rgba(124,58,237,0.34)] transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="mt-[-6px] text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
              Post
            </span>
          </Link>
          <StoreNavItem href="/dashboard/seller/products" label="Store" active>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14l-1 11H6L5 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 1 1 6 0" />
            </svg>
          </StoreNavItem>
          <StoreNavItem href="/profile" label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
          </StoreNavItem>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
