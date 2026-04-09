import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { deleteSellerProduct, getSellerProducts } from '../../../../utils/userService';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

export default function SellerProductsManagementPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [specialFilter, setSpecialFilter] = useState('all');
  const [message, setMessage] = useState({ tone: '', text: '' });
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    if (!isLoggedIn || userType !== 'seller') {
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
  const hasItems = useMemo(() => filteredItems.length > 0, [filteredItems]);

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
    setMessage({ tone: 'success', text: 'Product deleted successfully.' });
  };

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Manage Products | Seller Dashboard</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="portal-card overflow-hidden rounded-[1.35rem]">
          <div className="border-b border-[var(--portal-border)] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="portal-badge">Seller Tools</p>
                <h1 className="portal-heading mt-2 text-2xl font-semibold">Manage Posted Products</h1>
                <p className="portal-muted mt-1 text-sm">Edit details, manage multiple images, or delete products you posted.</p>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/seller" className="portal-outline-button px-4 py-2 text-sm">Back</Link>
                <Link href="/dashboard/seller/new-product" className="portal-primary-button px-4 py-2 text-sm">Post New Product</Link>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
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
              <div
                className={`rounded-[0.9rem] border px-3 py-2.5 text-sm ${
                  message.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            ) : null}

            {loading ? (
              <p className="text-sm text-[#5F6773]">Loading products...</p>
            ) : !hasItems ? (
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
                            <p className="mt-1 text-sm text-[#5F6773]">Stock: {Number(item?.stock || 0)} | Price: ${Number(item?.price || 0).toFixed(2)}</p>
                            <p className="mt-1 text-xs text-[#7A818C]">Images: {images.length || (thumbnail ? 1 : 0)} | Updated: {formatDate(item?.updatedAt || item?.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/products/${encodeURIComponent(String(productId))}`} className="portal-outline-button px-3 py-2 text-xs">View</Link>
                          <Link href={`/dashboard/seller/products/${encodeURIComponent(String(productId))}`} className="portal-primary-button px-3 py-2 text-xs">Edit</Link>
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
      </main>
    </div>
  );
}
