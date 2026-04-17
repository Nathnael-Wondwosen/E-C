import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/header/Header';
import { getPublicSupplierProfile } from '../../utils/userService';
import { getProducts } from '../../utils/heroDataService';

const toText = (value, fallback = '') => {
  const normalized = String(value || '').trim();
  return normalized || fallback;
};

const getProductImage = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) return product.images[0];
  return toText(product?.image || product?.imageUrl, '/TE-logo.png');
};

const getSellerAvatar = (profile) =>
  toText(profile?.avatar || profile?.image || profile?.imageUrl || profile?.profileImage, '');

const productBelongsToSeller = (product, sellerId) => {
  const ownerKeys = [
    product?.supplierId,
    product?.companyId,
    product?.ownerId,
    product?.sellerId,
    product?.createdBy,
    product?.seller?._id,
    product?.supplier?._id,
    product?.supplier?.id
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return ownerKeys.includes(String(sellerId || '').trim());
};

function InfoPanel ({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'dark'
      ? 'bg-[linear-gradient(135deg,#111827,#1E1B4B,#312E81)] text-white'
      : tone === 'brand'
        ? 'bg-[linear-gradient(135deg,#0F3FAE,#1D4ED8,#38BDF8)] text-white'
        : 'border border-[var(--portal-border)] bg-white/85 text-[var(--portal-heading)]';

  return (
    <div className={`rounded-[1.25rem] p-4 shadow-[0_14px_30px_rgba(15,23,32,0.06)] ${toneClass}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${tone === 'default' ? 'text-[var(--portal-muted)]' : 'text-white/70'}`}>
        {label}
      </p>
      <p className="mt-3 text-base font-semibold leading-6">{value}</p>
    </div>
  );
}

function ShopMetricCard ({ label, value, accent = 'text-[#7C3AED]' }) {
  return (
    <div className="rounded-[0.95rem] border border-[#E5EAF4] bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,32,0.035)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">{label}</p>
      <p className={`mt-1 text-[1rem] font-semibold tracking-[-0.03em] ${accent}`}>{value}</p>
    </div>
  );
}

function ShopMobileNavItem ({ href, label, active = false, children }) {
  return (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-0.5 py-2">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
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

export default function SellerShopPage () {
  const router = useRouter();
  const { id } = router.query;
  const sellerId = String(id || '').trim();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!sellerId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [supplierProfile, allProducts] = await Promise.all([
          getPublicSupplierProfile(sellerId),
          getProducts('')
        ]);

        if (!mounted) return;

        setProfile(supplierProfile || null);
        const normalizedProducts = (Array.isArray(allProducts) ? allProducts : [])
          .map((item) => ({ ...item, id: String(item?._id || item?.id || '') }))
          .filter((item) => item.id)
          .filter((item) => productBelongsToSeller(item, sellerId));

        setProducts(normalizedProducts);
      } catch (_error) {
        if (!mounted) return;
        setProfile(null);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [sellerId]);

  const sellerName = useMemo(
    () => toText(profile?.companyName || profile?.name, 'Seller Shop'),
    [profile?.companyName, profile?.name]
  );
  const sellerAvatar = useMemo(() => getSellerAvatar(profile), [profile]);
  const sellerPhone = toText(profile?.phone, '');
  const sellerEmail = toText(profile?.contactEmail || profile?.email, '');
  const sellerAddress = toText(profile?.locationAddress || profile?.address, 'Address not provided');
  const sellerBusinessType = toText(profile?.businessType, 'General Seller');
  const sellerDescription = toText(
    profile?.description || profile?.bio,
    'This seller has not added a business description yet. Browse current listings and contact them directly for details.'
  );
  const sellerWebsite = toText(profile?.website, '');
  const hasCoordinates = Boolean(profile?.locationLat && profile?.locationLng);
  const locationMapHref = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${profile.locationLat},${profile.locationLng}`)}`
    : '';

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>{sellerName} | TradeEthiopia</title>
        <meta name="description" content={`View ${sellerName} shop details and products.`} />
      </Head>

      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 pb-24 sm:px-6 sm:pb-6 lg:py-6">
        <section className="sm:hidden">
          <div className="-mx-4 px-4 pb-2 pt-1">
            <div className="mb-3 text-[11px] text-slate-600">
              <Link href="/marketplace" className="font-medium hover:text-[var(--portal-accent)]">Marketplace</Link> /{' '}
              <span className="font-semibold text-slate-900">{sellerName}</span>
            </div>

            <section className="relative overflow-hidden rounded-[1.55rem] border border-[#E4EAF3] bg-[linear-gradient(180deg,#FFFFFF,#F8FAFF)] px-4 pb-4 pt-4 shadow-[0_14px_32px_rgba(15,23,32,0.06)]">
              <div className="relative flex items-start gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-[0.95rem] border border-[#E2E8F0] bg-[linear-gradient(135deg,#E2E8F0,#F8FAFC)]">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="inline-flex h-full w-full items-center justify-center text-lg font-semibold text-slate-700">
                      {sellerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Seller Storefront</p>
                  <h1 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.05em] text-[#111827]">
                    {sellerName}
                  </h1>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                    {sellerBusinessType}
                  </p>
                </div>
              </div>

              <p className="relative mt-3 text-[12.5px] leading-6 text-[#667085]">
                {sellerDescription}
              </p>

              <div className="relative mt-3 grid grid-cols-3 gap-2">
                <ShopMetricCard label="Products" value={`${products.length}`} />
                <ShopMetricCard label="Contact" value={sellerPhone ? 'Phone' : sellerEmail ? 'Email' : 'Private'} accent="text-[#111827]" />
                <ShopMetricCard label="Location" value={hasCoordinates ? 'Pinned' : 'Address'} accent="text-[#0F766E]" />
              </div>

              <div className="relative mt-3 rounded-[1rem] border border-[#E5EAF4] bg-[#FCFDFE] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Shop Summary</p>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-[#111827]">{sellerAddress}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                      Browse published items or contact the seller directly for details and delivery discussion.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#475569]">
                    Live
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {sellerPhone ? (
                    <a href={`tel:${sellerPhone}`} className="rounded-[0.85rem] bg-[#111827] px-3 py-2.5 text-center text-sm font-semibold text-white">
                      Call Seller
                    </a>
                  ) : null}
                  {sellerEmail ? (
                    <a href={`mailto:${sellerEmail}`} className="rounded-[0.85rem] border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#374151]">
                      Email Seller
                    </a>
                  ) : null}
                  {!sellerPhone && !sellerEmail ? (
                    <div className="col-span-2 rounded-[0.85rem] border border-[#E5EAF4] bg-[#F8FAFC] px-3 py-3 text-center text-xs font-medium text-[#667085]">
                      Direct contact details have not been published yet.
                    </div>
                  ) : null}
                  {locationMapHref ? (
                    <a
                      href={locationMapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 rounded-[0.85rem] border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#334155]"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                  {sellerWebsite ? (
                    <a
                      href={sellerWebsite.startsWith('http') ? sellerWebsite : `https://${sellerWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 rounded-[0.85rem] border border-[#D8E1F0] bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#374151]"
                    >
                      Visit Website
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <section className="mt-4 border-y border-[var(--portal-border)] bg-white/92 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,32,0.04)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--portal-accent-strong)]">Catalog</p>
                <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.04em] text-[#111827]">Seller Products</h2>
                <p className="mt-1 text-[12.5px] text-[#667085]">Products currently visible from this seller.</p>
              </div>
              <span className="rounded-full bg-[#F1F5F9] px-3 py-1.5 text-[11px] font-semibold text-[#475569]">
                {products.length} item{products.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Loading seller shop...</p>
            ) : products.length === 0 ? (
              <div className="mt-4 rounded-[1.1rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-10 text-center text-sm text-slate-500">
                No published products found for this seller.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {products.map((product) => {
                  const productId = String(product?.id || product?._id || '').trim();
                  return (
                    <Link
                      key={productId}
                      href={`/products/${encodeURIComponent(productId)}`}
                      className="block overflow-hidden rounded-[1.05rem] border border-[#E2E8F0] bg-white shadow-[0_10px_24px_rgba(15,23,32,0.045)]"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[0.9rem] bg-slate-100">
                          <img
                            src={getProductImage(product)}
                            alt={product?.name || 'Product'}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-[0.96rem] font-semibold leading-5 text-slate-900">
                                {toText(product?.name, 'Product')}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#475569]">
                                  {sellerBusinessType}
                                </span>
                                <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5]">
                                  {String(product?.marketScope || product?.scope || 'local')}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5]">
                              Live
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-3">
                            <p className="text-[15px] font-semibold text-emerald-700">
                              ETB {Number(product?.price || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] font-semibold text-slate-500">View product</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <div className="hidden sm:block">
          <div className="mb-4 text-xs text-slate-600">
            <Link href="/marketplace" className="hover:text-[var(--portal-accent)]">Marketplace</Link> /{' '}
            <span className="font-semibold text-slate-900">{sellerName}</span>
          </div>

          <section className="rounded-[1.7rem] border border-[#E5EAF4] bg-[linear-gradient(180deg,#FFFFFF,#F8FAFF)] p-4 shadow-[0_20px_52px_rgba(15,23,32,0.08)] sm:p-5 lg:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
              <div>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-[#E2E8F0] bg-[linear-gradient(135deg,#E2E8F0,#F8FAFC)] sm:h-20 sm:w-20">
                    {sellerAvatar ? (
                      <img src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="inline-flex h-full w-full items-center justify-center text-xl font-semibold text-slate-700">
                        {sellerName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="portal-badge">Seller Storefront</p>
                    <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]">
                      {sellerName}
                    </h1>
                    <p className="mt-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                      {sellerBusinessType}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      {sellerDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoPanel label="Active Listings" value={`${products.length} products`} tone="brand" />
                  <InfoPanel label="Business Type" value={sellerBusinessType} tone="dark" />
                  <InfoPanel label="Address" value={sellerAddress} />
                  <InfoPanel label="Contact" value={sellerPhone || sellerEmail || 'Contact not provided'} />
                </div>
              </div>

              <aside className="space-y-3">
                <div className="rounded-[1.2rem] border border-[#E5EAF4] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,32,0.05)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Quick Contact</p>
                  <div className="mt-4 space-y-2 text-sm">
                    {sellerPhone ? (
                      <a href={`tel:${sellerPhone}`} className="block rounded-full bg-[#111827] px-3.5 py-2.5 font-semibold text-white">
                        Call: {sellerPhone}
                      </a>
                    ) : null}
                    {sellerEmail ? (
                      <a href={`mailto:${sellerEmail}`} className="block rounded-full border border-[#D8E1F0] bg-white px-3.5 py-2.5 font-semibold text-[#374151]">
                        Email Seller
                      </a>
                    ) : null}
                    {sellerWebsite ? (
                      <a
                        href={sellerWebsite.startsWith('http') ? sellerWebsite : `https://${sellerWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-full border border-[#D8E1F0] bg-white px-3.5 py-2.5 font-semibold text-[#374151]"
                      >
                        Visit Website
                      </a>
                    ) : null}
                    {!sellerPhone && !sellerEmail && !sellerWebsite ? (
                      <p className="rounded-[1rem] bg-[#F8FAFC] px-3.5 py-3 text-slate-500">
                        This seller has not published direct contact details yet.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-[var(--portal-border)] bg-white/85 p-4 shadow-[0_14px_30px_rgba(15,23,32,0.06)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--portal-muted)]">Location</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{sellerAddress}</p>
                  {locationMapHref ? (
                    <a
                      href={locationMapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-full border border-[#E2E8F0] px-3.5 py-2 text-xs font-semibold text-[#4F46E5]"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                </div>
              </aside>
            </div>
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[var(--portal-border)] bg-white/88 p-4 shadow-[0_20px_48px_rgba(15,23,32,0.07)] sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--portal-accent-strong)]">Catalog</p>
                <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-900">Seller Products</h2>
                <p className="mt-1 text-sm text-slate-600">Browse the products currently published by this seller.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700">
                {products.length} item{products.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading seller shop...</p>
            ) : products.length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-10 text-center text-sm text-slate-500">
                No published products found for this seller.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const productId = String(product?.id || product?._id || '').trim();
                  return (
                    <Link
                      key={productId}
                      href={`/products/${encodeURIComponent(productId)}`}
                      className="group overflow-hidden rounded-[1.25rem] border border-[#E2E8F0] bg-white shadow-[0_14px_32px_rgba(15,23,32,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,32,0.1)]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img
                          src={getProductImage(product)}
                          alt={product?.name || 'Product'}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-base font-semibold text-slate-900">
                              {toText(product?.name, 'Product')}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.1em] text-slate-500">
                              {sellerBusinessType}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#4F46E5]">
                            Live
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-emerald-700">
                            ETB {Number(product?.price || 0).toLocaleString()}
                          </p>
                          <span className="text-xs font-semibold text-slate-500">View Product</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-10px_35px_rgba(15,23,32,0.08)] backdrop-blur sm:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <ShopMobileNavItem href="/" label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10v8.5h11V10" />
            </svg>
          </ShopMobileNavItem>
          <ShopMobileNavItem href="/marketplace" label="Market" active>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18M6 12h12M9 16h6" />
            </svg>
          </ShopMobileNavItem>
          <ShopMobileNavItem href="/cart" label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
          </ShopMobileNavItem>
          <ShopMobileNavItem href="/inquiries" label="Message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16v10H8l-4 3V6.5Z" />
            </svg>
          </ShopMobileNavItem>
          <ShopMobileNavItem href="/profile" label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
          </ShopMobileNavItem>
        </div>
      </nav>
    </div>
  );
}
