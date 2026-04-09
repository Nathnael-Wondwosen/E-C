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
    product?.supplier?.id,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return ownerKeys.includes(String(sellerId || '').trim());
};

export default function SellerShopPage() {
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
          getProducts(''),
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

        <section className="portal-card mb-5 rounded-[1rem] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
              ) : (
                <span className="inline-flex h-full w-full items-center justify-center text-lg font-semibold text-slate-700">
                  {sellerName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-slate-900">{sellerName}</h1>
              <p className="mt-1 text-sm text-slate-600">{sellerBusinessType}</p>
              <p className="mt-1 text-sm text-slate-600">{sellerAddress}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <span>{products.length} listing{products.length === 1 ? '' : 's'}</span>
                {sellerPhone ? <a href={`tel:${sellerPhone}`} className="font-medium text-emerald-700">Call: {sellerPhone}</a> : null}
                {sellerEmail ? <a href={`mailto:${sellerEmail}`} className="font-medium text-indigo-700">{sellerEmail}</a> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="portal-card rounded-[1rem] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Seller Products</h2>
            <span className="text-sm text-slate-600">{products.length} item{products.length === 1 ? '' : 's'}</span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading seller shop...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-500">No published products found for this seller.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const productId = String(product?.id || product?._id || '').trim();
                return (
                  <Link
                    key={productId}
                    href={`/products/${encodeURIComponent(productId)}`}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img src={getProductImage(product)} alt={product?.name || 'Product'} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{toText(product?.name, 'Product')}</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        ETB {Number(product?.price || 0).toLocaleString()}
                      </p>
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
