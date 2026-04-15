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

      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:py-6">
        <div className="mb-4 text-xs text-slate-600">
          <Link href="/marketplace" className="hover:text-[var(--portal-accent)]">Marketplace</Link> /{' '}
          <span className="font-semibold text-slate-900">{sellerName}</span>
        </div>

        <section className="rounded-[1.85rem] border border-[rgba(255,255,255,0.72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(242,246,255,0.9))] p-4 shadow-[0_28px_80px_rgba(15,23,32,0.1)] backdrop-blur-xl sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
            <div>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.8)] bg-[linear-gradient(135deg,#E2E8F0,#F8FAFC)] shadow-[0_10px_30px_rgba(15,23,32,0.08)] sm:h-20 sm:w-20">
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
              <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,#111827,#1E1B4B,#312E81)] p-4 text-white shadow-[0_20px_44px_rgba(15,23,32,0.18)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">Quick Contact</p>
                <div className="mt-4 space-y-2 text-sm">
                  {sellerPhone ? (
                    <a href={`tel:${sellerPhone}`} className="block rounded-full bg-white/10 px-3.5 py-2.5 font-semibold text-white">
                      Call: {sellerPhone}
                    </a>
                  ) : null}
                  {sellerEmail ? (
                    <a href={`mailto:${sellerEmail}`} className="block rounded-full bg-white/10 px-3.5 py-2.5 font-semibold text-white">
                      Email Seller
                    </a>
                  ) : null}
                  {sellerWebsite ? (
                    <a
                      href={sellerWebsite.startsWith('http') ? sellerWebsite : `https://${sellerWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-full bg-white/10 px-3.5 py-2.5 font-semibold text-white"
                    >
                      Visit Website
                    </a>
                  ) : null}
                  {!sellerPhone && !sellerEmail && !sellerWebsite ? (
                    <p className="rounded-[1rem] bg-white/10 px-3.5 py-3 text-white/75">
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
      </main>
    </div>
  );
}
