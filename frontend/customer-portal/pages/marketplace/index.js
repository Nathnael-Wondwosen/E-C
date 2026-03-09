import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { getCategories, getProducts } from '../../utils/heroDataService';
import { addToCart, addToWishlist, getUserCart, getUserWishlist, removeFromWishlist } from '../../utils/userService';
import AccountDropdown from '../../components/header/AccountDropdown';

const fallbackCategories = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports',
  'Automotive',
  'Baby',
  'Industrial',
];

const spotlightCards = [
  {
    title: 'Top Deals in Ethiopia',
    subtitle: 'Fast local delivery and trusted stores',
    ctaLink: '/localmarket',
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Africa Supplier Picks',
    subtitle: 'Curated offers from regional sellers',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Global Trending Now',
    subtitle: 'Popular cross-border products',
    image:
      'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1400&q=80',
  },
];

const fallbackProductRail = [
  {
    name: 'Wireless Earbuds Pro',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Portable Blender',
    price: '$29.90',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Smart Watch Active',
    price: '$79.00',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Home Coffee Machine',
    price: '$119.00',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gaming Keyboard RGB',
    price: '$54.00',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Skin Care Set',
    price: '$34.50',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
  },
];

function deterministicRank(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

const sectionVariants = {
  deals: {
    section: 'border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50',
    card: 'border-rose-100 bg-white',
    price: 'text-rose-700',
    chip: 'bg-rose-600 text-white',
  },
  hot: {
    section: 'border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50',
    card: 'border-amber-100 bg-white',
    price: 'text-amber-700',
    chip: 'bg-orange-500 text-white',
  },
  new: {
    section: 'border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50',
    card: 'border-blue-100 bg-white',
    price: 'text-blue-700',
    chip: 'bg-blue-600 text-white',
  },
  best: {
    section: 'border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-purple-50',
    card: 'border-violet-100 bg-white',
    price: 'text-violet-700',
    chip: 'bg-violet-600 text-white',
  },
  budget: {
    section: 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50',
    card: 'border-emerald-100 bg-white',
    price: 'text-emerald-700',
    chip: 'bg-emerald-600 text-white',
  },
  china: {
    section: 'border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50',
    card: 'border-red-100 bg-white',
    price: 'text-red-700',
    chip: 'bg-red-600 text-white',
  },
  ali: {
    section: 'border-indigo-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50',
    card: 'border-indigo-100 bg-white',
    price: 'text-indigo-700',
    chip: 'bg-indigo-600 text-white',
  },
};

function ProductRailSection({
  title,
  subtitle,
  products,
  variant = 'deals',
  sourceLabel,
  autoScroll = false,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  getProductHref,
  loadingWishlist,
  loadingCart
}) {
  const styles = sectionVariants[variant] || sectionVariants.deals;
  const isTopDiscounts = title === 'Top Discounts';
  const isNewArrivals = title === 'New Arrivals';
  const cardWidthClass = isTopDiscounts
    ? 'min-w-[124px] max-w-[124px] sm:min-w-[148px] sm:max-w-[148px] md:min-w-[160px] md:max-w-[160px]'
    : isNewArrivals
      ? 'min-w-[205px] max-w-[205px]'
      : 'min-w-[220px] max-w-[220px]';
  const sectionPaddingClass = isTopDiscounts ? 'p-1' : isNewArrivals ? 'p-3' : 'p-4';
  const railItems = autoScroll ? [...products, ...products] : products;

  return (
    <div className={`border ${sectionPaddingClass} ${styles.section}`}>
      <div className={`${isTopDiscounts ? 'mb-1.5 sm:mb-2' : 'mb-4'} flex items-center justify-between`}>
        <div>
          <h3 className={`${isTopDiscounts ? 'text-[11px] sm:text-xs md:text-sm' : 'text-lg'} font-bold text-slate-900`}>{title}</h3>
          <p className={`${isTopDiscounts ? 'hidden sm:block' : ''} text-xs text-slate-500`}>{subtitle}</p>
        </div>
        <Link href="/e-commerce" className={`${isTopDiscounts ? 'text-xs' : 'text-sm'} text-[#1d4ed8] font-semibold`}>View All</Link>
      </div>

      <div className={autoScroll ? 'overflow-hidden' : `flex ${isTopDiscounts ? 'gap-1.5' : 'gap-2'} overflow-x-auto pb-1 scrollbar-hide`}>
        <div
          className={
            autoScroll
              ? `market-auto-scroll flex w-max ${isTopDiscounts ? 'gap-1.5' : 'gap-2'} pb-1 hover:[animation-play-state:paused]`
              : 'contents'
          }
        >
          {railItems.map((item, index) => (
          <article
            key={`${title}-${item.name}-${index}`}
            className={`${cardWidthClass} border overflow-hidden shadow-sm hover:shadow-md transition ${styles.card}`}
          >
            <div className={`${isTopDiscounts ? 'aspect-[0.82] sm:aspect-[0.9] md:aspect-[0.92]' : 'aspect-square'} bg-slate-100 overflow-hidden relative`}>
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
                <button
                  type="button"
                  onClick={() => onToggleWishlist?.(item)}
                  disabled={Boolean(loadingWishlist?.[String(item.id)])}
                  className={`${isTopDiscounts ? 'p-1' : 'p-1.5'} rounded-full bg-white/90 shadow-sm hover:bg-white ${
                    isWishlisted?.(item) ? 'text-red-600' : 'text-slate-600'
                  } ${loadingWishlist?.[String(item.id)] ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label="Add to favorites"
                  title="Add to favorites"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-6.7-4.35-9.33-8.14C.98 10.37 2.2 6.75 5.7 5.6A5.31 5.31 0 0 1 12 7.09 5.31 5.31 0 0 1 18.3 5.6c3.5 1.15 4.72 4.77 3.03 7.26C18.7 16.65 12 21 12 21z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${isTopDiscounts ? 'p-1' : 'p-1.5'} rounded-full bg-white/90 text-slate-600 shadow-sm hover:bg-white`}
                  aria-label="Share product"
                  title="Share product"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a3 3 0 1 0-2.82-4H13a3 3 0 0 0 .18 1L8.91 7.2A3 3 0 0 0 6 6a3 3 0 1 0 2.91 3.8l4.27 2.2A3 3 0 1 0 14 14.9l-4.27-2.2A3 3 0 0 0 9 10c0-.34.06-.66.18-.95l4.27-2.2c.53.7 1.36 1.15 2.32 1.15z" />
                  </svg>
                </button>
              </div>
              {item.discount > 0 && (
                <span className={`absolute top-1.5 left-1.5 bg-red-600 text-white ${isTopDiscounts ? 'text-[9px] px-1 py-0.5' : 'text-[11px] px-2 py-1'} font-semibold`}>
                  {item.discount}% OFF
                </span>
              )}
              {item.isHot && (
                <span className={`absolute top-1.5 right-1.5 bg-orange-500 text-white ${isTopDiscounts ? 'text-[9px] px-1 py-0.5' : 'text-[11px] px-2 py-1'} font-semibold`}>
                  HOT
                </span>
              )}
              {sourceLabel && (
                <span className={`absolute bottom-2 left-2 text-[11px] px-2 py-1 font-semibold ${styles.chip}`}>
                  {sourceLabel}
                </span>
              )}
            </div>
            <div className={`${isTopDiscounts ? 'p-1' : isNewArrivals ? 'p-2.5' : 'p-3'} bg-white`}>
              <h4 className={`${isTopDiscounts ? 'text-[9px] sm:text-[10px] md:text-[11px] min-h-[1.35rem] sm:min-h-[1.55rem] md:min-h-[1.75rem]' : 'text-sm min-h-[2.5rem]'} font-bold text-slate-900 leading-tight line-clamp-2`}>{item.name}</h4>
              <p className={`${isTopDiscounts ? 'hidden sm:block' : 'mt-1'} text-[11px] text-slate-500`}>by {item.supplier || 'TradeEthiopia Verified Seller'}</p>

              <div className={`${isTopDiscounts ? 'mt-1' : 'mt-2'} flex items-center justify-between`}>
                <div className={`flex items-center gap-1 ${isTopDiscounts ? 'text-[8px] sm:text-[9px] md:text-[10px]' : 'text-[11px]'} text-slate-500`}>
                  <span className="text-amber-500">★</span>
                  <span>{item.rating ? item.rating.toFixed(1) : '4.2'}</span>
                  <span className="text-slate-300">|</span>
                  <span>{item.soldCount || 80}+ sold</span>
                </div>
                <span className={`${isTopDiscounts ? 'hidden sm:inline-flex' : 'inline-flex'} rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600`}>
                  {item.shipLabel || '3-7 Days'}
                </span>
              </div>

              <div className={`${isTopDiscounts ? 'mt-1' : 'mt-2'} flex items-end justify-between`}>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <p className={`${isTopDiscounts ? 'text-[10px] sm:text-xs md:text-sm' : 'text-base'} font-extrabold leading-none ${item.oldPrice ? 'text-red-600' : styles.price}`}>
                      {item.price}
                    </p>
                    {item.oldPrice && (
                      <p className="text-[12px] text-slate-400 line-through">{item.oldPrice}</p>
                    )}
                    {item.discount > 0 && (
                      <p className="text-[12px] font-bold text-red-600">-{item.discount}%</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAddToCart?.(item)}
                    disabled={Boolean(loadingCart?.[String(item.id)])}
                    className={`rounded-md bg-slate-900 ${isTopDiscounts ? 'px-1.5 py-0.5 text-[8px] sm:text-[9px] md:text-[10px]' : 'px-2.5 py-1.5 text-[11px]'} font-semibold text-white hover:bg-slate-800 ${
                      loadingCart?.[String(item.id)] ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {loadingCart?.[String(item.id)] ? 'Adding...' : 'Add'}
                  </button>
                  <Link
                    href={getProductHref ? getProductHref(item) : '/marketplace'}
                    className={`rounded-md border border-slate-300 bg-white ${isTopDiscounts ? 'px-1.5 py-0.5 text-[8px] sm:text-[9px] md:text-[10px]' : 'px-2.5 py-1.5 text-[11px]'} font-semibold text-slate-700 hover:bg-slate-50`}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home({ initialIsLocalMarketView = false }) {
  const router = useRouter();
  const isLocalMarketView = initialIsLocalMarketView;
  const marketBasePath = isLocalMarketView ? '/localmarket' : '/marketplace';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [listingSearchTerm, setListingSearchTerm] = useState('');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('All');
  const [listingLocationFilter, setListingLocationFilter] = useState('All');
  const [listingPriceFilter, setListingPriceFilter] = useState('All');
  const [listingSort, setListingSort] = useState('featured');
  const [listingMinRatingFilter, setListingMinRatingFilter] = useState('All');
  const [listingSupplierTypeFilter, setListingSupplierTypeFilter] = useState('All');
  const [listingDeliveryFilter, setListingDeliveryFilter] = useState('All');
  const [listingInStockOnly, setListingInStockOnly] = useState(false);
  const [listingPage, setListingPage] = useState(1);
  const [wishlistSet, setWishlistSet] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [cartLoading, setCartLoading] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedProducts] = await Promise.all([getCategories(), getProducts()]);

        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      } catch (error) {
        console.error('Failed to load marketplace template data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadWishlist = async () => {
      const isLoggedIn = localStorage.getItem('userLoggedIn');
      const userId = localStorage.getItem('userId');
      if (!isLoggedIn || !userId) {
        setWishlistSet(new Set());
        setWishlistCount(0);
        return;
      }

      const result = await getUserWishlist(userId);
      const items = result?.items || [];
      setWishlistSet(new Set(items.map((item) => String(item))));
      setWishlistCount(items.length);
    };

    loadWishlist();
    window.addEventListener('loginStatusChanged', loadWishlist);
    return () => window.removeEventListener('loginStatusChanged', loadWishlist);
  }, []);

  useEffect(() => {
    const loadCartCount = async () => {
      const isLoggedIn = localStorage.getItem('userLoggedIn');
      const userId = localStorage.getItem('userId');
      if (!isLoggedIn || !userId) {
        setCartCount(0);
        return;
      }

      const result = await getUserCart(userId);
      setCartCount(Number(result?.count || 0));
    };

    loadCartCount();
    window.addEventListener('loginStatusChanged', loadCartCount);
    return () => window.removeEventListener('loginStatusChanged', loadCartCount);
  }, []);

  const quickCategories = useMemo(() => {
    if (!categories.length) return fallbackCategories;
    const names = categories
      .map((item) => item?.name || item?.title)
      .filter(Boolean)
      .slice(0, 12);
    return names.length ? names : fallbackCategories;
  }, [categories]);

  const productCatalog = useMemo(() => {
    const regularProducts = products.filter((product) => product?.productType !== 'B2B').slice(0, 24);
    if (!regularProducts.length) {
      return fallbackProductRail.map((item, index) => ({
        name: item.name,
        id: `fallback-${index + 1}`,
        price: item.price,
        oldPrice: null,
        oldPriceValue: null,
        priceValue: Number(item.price.replace('$', '')) || 0,
        image: item.image,
        discount: index % 3 === 0 ? 25 : index % 4 === 0 ? 15 : 0,
        isHot: index % 2 === 0,
        isNew: index < 3,
        rating: 4 + (index % 10) * 0.05,
        soldCount: 50 + index * 9,
        createdAtValue: Date.now() - index * 86400000,
        sourceTag: index % 4 === 0 ? 'Made in Ethiopia' : index % 5 === 0 ? 'AliExpress' : 'Global',
        supplier: index % 2 === 0 ? 'Addis Direct Trade' : 'Global Hub Store',
        shipLabel: index % 3 === 0 ? 'Express' : 'Standard',
        deliveryMode: index % 3 === 0 ? 'Express' : 'Standard',
        supplierType: index % 2 === 0 ? 'Local' : 'International',
        inStock: index % 6 !== 0,
        categoryLabel: fallbackCategories[index % fallbackCategories.length],
        locationLabel: index % 4 === 0 ? 'Ethiopia' : 'Global',
      }));
    }

    return regularProducts.map((product, index) => {
      const sourceText = `${product?.countryOfOrigin || ''} ${product?.originCountry || ''} ${product?.supplierCountry || ''} ${product?.sourcePlatform || ''} ${product?.source || ''}`.toLowerCase();
      let sourceTag = 'Global';
      if (sourceText.includes('aliexpress') || sourceText.includes('ali express')) sourceTag = 'AliExpress';
      else if (sourceText.includes('ethiopia')) sourceTag = 'Made in Ethiopia';
      else if (sourceText.includes('china')) sourceTag = 'Global';
      else if (index % 7 === 0) sourceTag = 'Made in Ethiopia';
      else if (index % 11 === 0) sourceTag = 'AliExpress';

      const priceValue = Number(product?.price || 0);
      const oldPriceValue =
        Number(product?.discountPercentage || 0) > 0
          ? priceValue / (1 - Number(product?.discountPercentage || 0) / 100)
          : null;
      const rawCategory =
        product?.category?.name ||
        product?.category ||
        product?.mainCategory ||
        product?.subcategory ||
        product?.type ||
        product?.department ||
        '';
      const categoryLabel =
        typeof rawCategory === 'string' && rawCategory.trim() ? rawCategory.trim() : 'General';
      const locationLabel =
        product?.countryOfOrigin ||
        product?.originCountry ||
        product?.supplierCountry ||
        (sourceTag === 'Made in Ethiopia' ? 'Ethiopia' : sourceTag === 'AliExpress' ? 'China' : 'Global');
      const deliveryRaw = `${product?.shippingType || product?.deliveryTime || 'Standard'}`.toLowerCase();
      const deliveryMode = deliveryRaw.includes('express') ? 'Express' : 'Standard';
      const supplierType = locationLabel.toLowerCase().includes('ethiopia') ? 'Local' : 'International';
      const stockValue = Number(
        product?.stock ??
        product?.inventory ??
        product?.quantity ??
        product?.availableQty ??
        1
      );

      return {
        name: product?.name || product?.title || `Product ${index + 1}`,
        id: String(product?._id || product?.id || product?.sku || `product-${index + 1}`),
        price: `$${priceValue.toFixed(2)}`,
        oldPrice: oldPriceValue ? `$${oldPriceValue.toFixed(2)}` : null,
        oldPriceValue,
        priceValue,
        image:
          product?.images?.[0] ||
          product?.image ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        discount: Number(product?.discountPercentage || 0),
        isHot: Boolean(product?.isHotDeal || product?.isFeatured),
        isNew: Boolean(product?.isNew),
        rating: Number(product?.rating || 0),
        soldCount: Number(product?.soldCount || product?.reviewCount || 0),
        createdAtValue: new Date(product?.createdAt || Date.now()).getTime(),
        sourceTag,
        supplier: product?.supplierName || product?.vendorName || product?.brand || 'TradeEthiopia Verified Seller',
        shipLabel: product?.shippingType || product?.deliveryTime || '3-7 Days',
        deliveryMode,
        supplierType,
        inStock: Number.isNaN(stockValue) ? true : stockValue > 0,
        categoryLabel,
        locationLabel,
      };
    });
  }, [products]);

  const getTop = (list, count = 8) => list.slice(0, count);

  const ensureLoggedIn = () => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userId = localStorage.getItem('userId');
    if (!isLoggedIn || !userId) {
      localStorage.setItem('redirectAfterLogin', marketBasePath);
      router.push('/login');
      return '';
    }
    return userId;
  };

  const isRealProduct = (item) => {
    return item?.id && !String(item.id).startsWith('fallback-');
  };

  const isWishlisted = (item) => {
    if (!item?.id) return false;
    return wishlistSet.has(String(item.id));
  };

  const getProductHref = (item) => {
    if (!isRealProduct(item)) return marketBasePath;
    return `/products/${encodeURIComponent(String(item.id))}`;
  };

  const handleToggleWishlist = async (item) => {
    if (!item?.id || !isRealProduct(item)) {
      setActionMessage('Favorites are available for catalog products only.');
      return;
    }
    const userId = ensureLoggedIn();
    if (!userId) return;

    const productId = String(item.id);
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    setActionMessage('');
    const currentlyWishlisted = wishlistSet.has(productId);

    const result = currentlyWishlisted
      ? await removeFromWishlist(userId, productId)
      : await addToWishlist(userId, productId);

    setWishlistLoading((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });

    if (!result?.success) {
      setActionMessage(result?.message || 'Failed to update favorites.');
      return;
    }

    const refreshed = await getUserWishlist(userId);
    const refreshedItems = refreshed?.items || [];
    setWishlistSet(new Set(refreshedItems.map((value) => String(value))));
    setWishlistCount(refreshedItems.length);
    setActionMessage(currentlyWishlisted ? 'Removed from favorites.' : 'Saved to favorites.');
    window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  };

  const handleAddToCart = async (item) => {
    if (!item?.id || !isRealProduct(item)) {
      setActionMessage('Cart is available for catalog products only.');
      return;
    }

    const userId = ensureLoggedIn();
    if (!userId) return;

    const productId = String(item.id);
    setCartLoading((prev) => ({ ...prev, [productId]: true }));
    setActionMessage('');

    const result = await addToCart(userId, productId, 1);
    setCartLoading((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });

    if (!result?.success) {
      setActionMessage(result?.message || 'Failed to add product to cart.');
      return;
    }

    setCartCount((prev) => prev + 1);
    setActionMessage(`${item.name} added to cart.`);
    window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  };

  const hotProducts = useMemo(
    () => getTop([...productCatalog].filter((p) => p.isHot || p.rating >= 4.5).sort((a, b) => b.rating - a.rating)),
    [productCatalog]
  );

  const newArrivalsProducts = useMemo(
    () => getTop([...productCatalog].filter((p) => p.isNew || p.createdAtValue).sort((a, b) => b.createdAtValue - a.createdAtValue)),
    [productCatalog]
  );

  const madeInEthiopiaProducts = useMemo(
    () => getTop([...productCatalog].filter((p) => p.sourceTag === 'Made in Ethiopia')),
    [productCatalog]
  );

  const listingCategories = useMemo(() => {
    const unique = Array.from(new Set(productCatalog.map((item) => item.categoryLabel).filter(Boolean)));
    return ['All', ...unique.sort((a, b) => a.localeCompare(b))];
  }, [productCatalog]);
  const listingLocations = useMemo(() => {
    const unique = Array.from(new Set(productCatalog.map((item) => item.locationLabel).filter(Boolean)));
    return ['All', ...unique.sort((a, b) => a.localeCompare(b))];
  }, [productCatalog]);

  useEffect(() => {
    if (!router.isReady) return;

    const queryCategory = typeof router.query.category === 'string' ? router.query.category.trim() : '';
    const querySort = typeof router.query.sort === 'string' ? router.query.sort.trim() : '';

    if (queryCategory) {
      const matchedCategory = listingCategories.find(
        (category) => category.toLowerCase() === queryCategory.toLowerCase()
      );
      if (matchedCategory) setListingCategoryFilter(matchedCategory);
    }

    if (querySort) {
      const supportedSorts = ['featured', 'discount', 'rating', 'newest', 'price-asc', 'price-desc'];
      if (supportedSorts.includes(querySort)) {
        setListingSort(querySort);
      }
    }
  }, [router.isReady, router.query.category, router.query.sort, listingCategories]);

  const randomListingProducts = useMemo(() => {
    return [...productCatalog].sort((a, b) => {
      const aRank = deterministicRank(`${a.name}-${a.supplier}-${a.price}`);
      const bRank = deterministicRank(`${b.name}-${b.supplier}-${b.price}`);
      return aRank - bRank;
    });
  }, [productCatalog]);

  const filteredListingProducts = useMemo(() => {
    const term = listingSearchTerm.trim().toLowerCase();
    let next = [...randomListingProducts];

    if (term) {
      next = next.filter((item) => {
        const haystack = `${item.name} ${item.supplier} ${item.categoryLabel}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    if (listingCategoryFilter !== 'All') {
      next = next.filter((item) => item.categoryLabel === listingCategoryFilter);
    }

    if (listingLocationFilter !== 'All') {
      next = next.filter((item) => item.locationLabel === listingLocationFilter);
    }

    if (listingPriceFilter !== 'All') {
      next = next.filter((item) => {
        if (listingPriceFilter === '0-50') return item.priceValue >= 0 && item.priceValue <= 50;
        if (listingPriceFilter === '50-100') return item.priceValue > 50 && item.priceValue <= 100;
        if (listingPriceFilter === '100-250') return item.priceValue > 100 && item.priceValue <= 250;
        if (listingPriceFilter === '250+') return item.priceValue > 250;
        return true;
      });
    }

    if (listingMinRatingFilter !== 'All') {
      const minRating = Number(listingMinRatingFilter);
      next = next.filter((item) => Number(item.rating || 0) >= minRating);
    }

    if (listingSupplierTypeFilter !== 'All') {
      next = next.filter((item) => item.supplierType === listingSupplierTypeFilter);
    }

    if (listingDeliveryFilter !== 'All') {
      next = next.filter((item) => item.deliveryMode === listingDeliveryFilter);
    }

    if (listingInStockOnly) {
      next = next.filter((item) => item.inStock);
    }

    if (listingSort === 'price-asc') next.sort((a, b) => a.priceValue - b.priceValue);
    if (listingSort === 'price-desc') next.sort((a, b) => b.priceValue - a.priceValue);
    if (listingSort === 'discount') next.sort((a, b) => b.discount - a.discount);
    if (listingSort === 'rating') next.sort((a, b) => b.rating - a.rating);
    if (listingSort === 'newest') next.sort((a, b) => b.createdAtValue - a.createdAtValue);

    return next;
  }, [
    randomListingProducts,
    listingSearchTerm,
    listingCategoryFilter,
    listingLocationFilter,
    listingPriceFilter,
    listingMinRatingFilter,
    listingSupplierTypeFilter,
    listingDeliveryFilter,
    listingInStockOnly,
    listingSort
  ]);

  const listingPageSize = 12;
  const totalListingPages = Math.max(1, Math.ceil(filteredListingProducts.length / listingPageSize));
  const activeFilterCount = [
    listingSearchTerm.trim() !== '',
    listingCategoryFilter !== 'All',
    listingLocationFilter !== 'All',
    listingPriceFilter !== 'All',
    listingSort !== 'featured',
    listingMinRatingFilter !== 'All',
    listingSupplierTypeFilter !== 'All',
    listingDeliveryFilter !== 'All',
    listingInStockOnly,
  ].filter(Boolean).length;

  useEffect(() => {
    setListingPage(1);
  }, [
    listingSearchTerm,
    listingCategoryFilter,
    listingLocationFilter,
    listingPriceFilter,
    listingMinRatingFilter,
    listingSupplierTypeFilter,
    listingDeliveryFilter,
    listingInStockOnly,
    listingSort
  ]);

  const paginatedListingProducts = useMemo(() => {
    const start = (listingPage - 1) * listingPageSize;
    return filteredListingProducts.slice(start, start + listingPageSize);
  }, [filteredListingProducts, listingPage]);

  const visiblePageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, listingPage - Math.floor(windowSize / 2));
    let end = Math.min(totalListingPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [listingPage, totalListingPages]);

  return (
    <>
      <Head>
        <title>{isLocalMarketView ? 'TradeEthiopia | Local Market' : 'TradeEthiopia | Shop Local, Africa, Global'}</title>
        <meta
          name="description"
          content={
            isLocalMarketView
              ? 'Local market view with advanced filtering for Ethiopian products.'
              : 'Marketplace gateway inspired layout for local, African, and global shopping experience.'
          }
        />
      </Head>

      <main className="min-h-screen bg-[#f5f6f8] text-slate-900" style={{ fontFamily: 'Poppins, Segoe UI, sans-serif' }}>
        <div className="bg-[#0f172a] text-slate-100 text-xs">
          <div className="max-w-[1440px] mx-auto px-4 h-9 flex items-center justify-between">
            <p>Shop Ethiopia, Africa, and Worldwide</p>
            <div className="flex items-center gap-4">
              <span>English</span>
              <span>USD</span>
              <span>Help</span>
            </div>
          </div>
        </div>

        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/e-commerce" className="text-2xl font-bold text-[#0f172a] shrink-0">TradeEthiopia</Link>

            <div className="flex-1 hidden md:flex items-center border-2 border-[#1d4ed8] rounded-sm overflow-hidden">
              <select className="h-11 px-3 text-sm bg-slate-100 border-r border-slate-200 outline-none">
                <option>All Categories</option>
                {quickCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search products, brands and suppliers"
                className="h-11 flex-1 px-3 outline-none"
              />
              <button className="h-11 px-5 bg-[#1d4ed8] text-white font-semibold">Search</button>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div>
                <AccountDropdown
                  buttonClassName="h-9 px-3 inline-flex items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                  menuClassName="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 shadow-xl z-40"
                  buttonContent={<span>Account</span>}
                />
              </div>
              <Link href="/wishlist" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <nav className="bg-white border-t border-slate-100">
            <div className="max-w-[1700px] mx-auto px-2 lg:px-3 h-11 flex items-center gap-5 overflow-x-auto scrollbar-hide text-sm whitespace-nowrap">
              <Link href={`${marketBasePath}?sort=discount`} className="font-semibold text-[#1d4ed8]">Today Deals</Link>
              <Link href={`${marketBasePath}?sort=rating`}>Best Sellers</Link>
              {!isLocalMarketView && <Link href="/localmarket">Local Market</Link>}
              <Link href="/marketplace">Global Market</Link>
              <Link href="/africamarket">Africa Market</Link>
              <Link href="/chinamarket">China Market</Link>
              <Link href="/b2bmarket">B2B Market</Link>
              <Link href={`${marketBasePath}?category=Home%20%26%20Kitchen`}>Home</Link>
            </div>
          </nav>
        </header>

        {!isLocalMarketView && (
          <section className="max-w-[1700px] mx-auto px-2 lg:px-3 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
              <aside className="bg-white border border-slate-200 p-3 hidden lg:block">
                <h2 className="font-semibold text-sm mb-3">Shop by Department</h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {quickCategories.map((item) => (
                    <li key={item} className="hover:text-[#1d4ed8] cursor-pointer">{item}</li>
                  ))}
                </ul>
              </aside>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {spotlightCards.map((card) => (
                  <article key={card.title} className="relative min-h-[240px] md:min-h-[300px] overflow-hidden bg-slate-900">
                    <img src={card.image} alt={card.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="relative p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Market Focus</p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight">{card.title}</h3>
                      <p className="mt-2 text-sm text-slate-200">{card.subtitle}</p>
                      <Link href={card.ctaLink || '/e-commerce'} className="mt-4 inline-block text-sm font-semibold text-cyan-300">Shop Now</Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-[1700px] mx-auto px-2 lg:px-3 pb-8">
          <div className="grid grid-cols-1 gap-4">
            <ProductRailSection
              title="Top Discounts"
              subtitle="Most attractive markdowns right now"
              products={hotProducts.length ? hotProducts : getTop(productCatalog)}
              variant="hot"
              autoScroll
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              getProductHref={getProductHref}
              loadingWishlist={wishlistLoading}
              loadingCart={cartLoading}
            />

            {!isLocalMarketView && (
              <ProductRailSection
                title="New Arrivals"
                subtitle="Freshly added products"
                products={newArrivalsProducts.length ? newArrivalsProducts : getTop(productCatalog)}
                variant="new"
                autoScroll
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                getProductHref={getProductHref}
                loadingWishlist={wishlistLoading}
                loadingCart={cartLoading}
              />
            )}

            {!isLocalMarketView && (
              <ProductRailSection
                title="Made in Ethiopia"
                subtitle="Local products, factories, and export-ready suppliers"
                products={madeInEthiopiaProducts.length ? madeInEthiopiaProducts : getTop(productCatalog)}
                variant="china"
                sourceLabel="Made in Ethiopia"
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                getProductHref={getProductHref}
                loadingWishlist={wishlistLoading}
                loadingCart={cartLoading}
              />
            )}

            <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
              <aside
                className={`h-max rounded-xl border ${
                  isLocalMarketView
                    ? 'sticky top-24 border-blue-200 bg-gradient-to-b from-blue-50 to-white p-3 shadow-sm'
                    : 'border-slate-200 bg-white p-3'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isLocalMarketView ? 'text-blue-700' : 'text-slate-700'}`}>
                      {isLocalMarketView ? 'Advanced Filters' : 'Filters'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {activeFilterCount} active • {filteredListingProducts.length} items
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setListingSearchTerm('');
                      setListingCategoryFilter('All');
                      setListingLocationFilter('All');
                      setListingPriceFilter('All');
                      setListingMinRatingFilter('All');
                      setListingSupplierTypeFilter('All');
                      setListingDeliveryFilter('All');
                      setListingInStockOnly(false);
                      setListingSort('featured');
                    }}
                    className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                      isLocalMarketView
                        ? 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Search</p>
                    <label htmlFor="listing-search-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Product
                    </label>
                    <input
                      id="listing-search-filter"
                      type="text"
                      value={listingSearchTerm}
                      onChange={(e) => setListingSearchTerm(e.target.value)}
                      placeholder="Search name"
                      className={`w-full rounded-md border ${
                        isLocalMarketView ? 'border-blue-200 bg-white' : 'border-slate-300 bg-white'
                      } text-xs px-2 py-1.5 outline-none focus:border-slate-500`}
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Core Filters</p>

                    <div>
                      <label htmlFor="listing-category-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                        Category
                      </label>
                      <select
                        id="listing-category-filter"
                        value={listingCategoryFilter}
                        onChange={(e) => setListingCategoryFilter(e.target.value)}
                        className={`w-full rounded-md border ${
                          isLocalMarketView ? 'border-blue-200 bg-white' : 'border-slate-300 bg-white'
                        } text-xs px-2 py-1.5 outline-none focus:border-slate-500`}
                      >
                        {listingCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="listing-location-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                        Location
                      </label>
                      <select
                        id="listing-location-filter"
                        value={listingLocationFilter}
                        onChange={(e) => setListingLocationFilter(e.target.value)}
                        className={`w-full rounded-md border ${
                          isLocalMarketView ? 'border-blue-200 bg-white' : 'border-slate-300 bg-white'
                        } text-xs px-2 py-1.5 outline-none focus:border-slate-500`}
                      >
                        {listingLocations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="listing-price-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                        Price
                      </label>
                      <select
                        id="listing-price-filter"
                        value={listingPriceFilter}
                        onChange={(e) => setListingPriceFilter(e.target.value)}
                        className={`w-full rounded-md border ${
                          isLocalMarketView ? 'border-blue-200 bg-white' : 'border-slate-300 bg-white'
                        } text-xs px-2 py-1.5 outline-none focus:border-slate-500`}
                      >
                        <option value="All">All</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-250">$100 - $250</option>
                        <option value="250+">$250+</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="listing-sort-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                        Sort
                      </label>
                      <select
                        id="listing-sort-filter"
                        value={listingSort}
                        onChange={(e) => setListingSort(e.target.value)}
                        className={`w-full rounded-md border ${
                          isLocalMarketView ? 'border-blue-200 bg-white' : 'border-slate-300 bg-white'
                        } text-xs px-2 py-1.5 outline-none focus:border-slate-500`}
                      >
                        <option value="featured">Featured</option>
                        <option value="discount">Best Discount</option>
                        <option value="rating">Top Rated</option>
                        <option value="newest">Newest</option>
                        <option value="price-asc">Price Low-High</option>
                        <option value="price-desc">Price High-Low</option>
                      </select>
                    </div>
                  </div>

                  {isLocalMarketView && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-2.5 space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">Local Market Controls</p>

                      <div>
                        <label htmlFor="listing-rating-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                          Min Rating
                        </label>
                        <select
                          id="listing-rating-filter"
                          value={listingMinRatingFilter}
                          onChange={(e) => setListingMinRatingFilter(e.target.value)}
                          className="w-full rounded-md border border-blue-200 bg-white text-xs px-2 py-1.5 outline-none focus:border-slate-500"
                        >
                          <option value="All">All</option>
                          <option value="4.5">4.5+</option>
                          <option value="4">4.0+</option>
                          <option value="3.5">3.5+</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="listing-supplier-type-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                          Supplier Type
                        </label>
                        <select
                          id="listing-supplier-type-filter"
                          value={listingSupplierTypeFilter}
                          onChange={(e) => setListingSupplierTypeFilter(e.target.value)}
                          className="w-full rounded-md border border-blue-200 bg-white text-xs px-2 py-1.5 outline-none focus:border-slate-500"
                        >
                          <option value="All">All</option>
                          <option value="Local">Local</option>
                          <option value="International">International</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="listing-delivery-filter" className="mb-1 block text-[10px] font-semibold text-slate-600">
                          Delivery Speed
                        </label>
                        <select
                          id="listing-delivery-filter"
                          value={listingDeliveryFilter}
                          onChange={(e) => setListingDeliveryFilter(e.target.value)}
                          className="w-full rounded-md border border-blue-200 bg-white text-xs px-2 py-1.5 outline-none focus:border-slate-500"
                        >
                          <option value="All">All</option>
                          <option value="Express">Express</option>
                          <option value="Standard">Standard</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2 rounded-md border border-blue-200 bg-white px-2 py-1.5 text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={listingInStockOnly}
                          onChange={(e) => setListingInStockOnly(e.target.checked)}
                        />
                        In-stock only
                      </label>
                    </div>
                  )}
                </div>
              </aside>

              <div className="space-y-3">
                {actionMessage && (
                  <div className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700">
                    {actionMessage}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paginatedListingProducts.map((item, index) => (
                    <article
                      key={`listing-${item.name}-${index}`}
                      className="group rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] rounded-md bg-slate-100 overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        {item.discount > 0 && (
                          <span className="absolute top-1.5 left-1.5 rounded bg-red-600 text-white text-[10px] px-1.5 py-0.5 font-semibold">
                            -{item.discount}%
                          </span>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 z-10">
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(item)}
                            disabled={Boolean(wishlistLoading[String(item.id)])}
                            className={`rounded-full bg-white/90 p-1 shadow-sm hover:bg-white ${
                              isWishlisted(item) ? 'text-red-600' : 'text-slate-600'
                            } ${wishlistLoading[String(item.id)] ? 'opacity-60 cursor-not-allowed' : ''}`}
                            aria-label="Add to favorites"
                            title="Add to favorites"
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                              <path d="M12 21s-6.7-4.35-9.33-8.14C.98 10.37 2.2 6.75 5.7 5.6A5.31 5.31 0 0 1 12 7.09 5.31 5.31 0 0 1 18.3 5.6c3.5 1.15 4.72 4.77 3.03 7.26C18.7 16.65 12 21 12 21z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-white/90 p-1 text-slate-600 shadow-sm hover:bg-white"
                            aria-label="Share product"
                            title="Share product"
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                              <path d="M16 8a3 3 0 1 0-2.82-4H13a3 3 0 0 0 .18 1L8.91 7.2A3 3 0 0 0 6 6a3 3 0 1 0 2.91 3.8l4.27 2.2A3 3 0 1 0 14 14.9l-4.27-2.2A3 3 0 0 0 9 10c0-.34.06-.66.18-.95l4.27-2.2c.53.7 1.36 1.15 2.32 1.15z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-xs font-bold text-slate-800 line-clamp-2">{item.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                        {item.supplier || 'TradeEthiopia Seller'} • {item.locationLabel || 'Ethiopia'}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-amber-500">★</span>
                          <span>{item.rating ? item.rating.toFixed(1) : '4.2'}</span>
                          <span className="text-slate-300">|</span>
                          <span>{item.soldCount || 80}+ sold</span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {item.shipLabel || '3-7 Days'}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className={`text-sm font-extrabold ${item.oldPrice ? 'text-red-600' : 'text-slate-900'}`}>{item.price}</span>
                        {item.oldPrice && <span className="text-[11px] text-slate-400 line-through">{item.oldPrice}</span>}
                        {item.discount > 0 && <span className="text-[11px] font-bold text-red-600">-{item.discount}%</span>}
                      </div>

                      {item.oldPriceValue && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                          Save ${(item.oldPriceValue - item.priceValue).toFixed(2)}
                        </p>
                      )}

                      <div className="mt-2.5 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={Boolean(cartLoading[String(item.id)])}
                          className={`flex-1 rounded-md bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 ${
                            cartLoading[String(item.id)] ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          {cartLoading[String(item.id)] ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <Link
                          href={getProductHref(item)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setListingPage((prev) => Math.max(1, prev - 1))}
                    disabled={listingPage === 1}
                    className="px-2 py-1 text-xs border border-slate-300 bg-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {visiblePageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setListingPage(pageNumber)}
                      className={`px-2 py-1 text-xs border ${
                        listingPage === pageNumber
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => setListingPage((prev) => Math.min(totalListingPages, prev + 1))}
                    disabled={listingPage === totalListingPages}
                    className="px-2 py-1 text-xs border border-slate-300 bg-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .market-auto-scroll {
            animation: marketMarquee 36s linear infinite;
          }
          @keyframes marketMarquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const queryView = `${context.query?.view || ''}`.toLowerCase();
  const resolved = `${context.resolvedUrl || ''}`.toLowerCase();
  const initialIsLocalMarketView = queryView === 'local' || resolved.startsWith('/localmarket');

  return {
    props: {
      initialIsLocalMarketView
    }
  };
}
