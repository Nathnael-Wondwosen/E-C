import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import MarketLandingPage from '../../components/markets/MarketLandingPage';
import { getProducts } from '../../utils/heroDataService';
import { getMarketByScope } from '../../features/markets/registry';

const toViewModel = (product) => ({
  id: product._id || product.id,
  name: product.name || product.title || 'Unnamed Product',
  image: product.images?.[0] || product.image || product.thumbnail || '/placeholder-product.jpg',
  description: product.description || '',
  price: typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `${product.price || '$0.00'}`,
  marketScope: product.marketScope,
  productType: product.productType,
  origin: product.origin || product.country || product.countryOfOrigin
});

export default function MarketScopePage() {
  const router = useRouter();
  const { scope } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const market = useMemo(() => getMarketByScope(scope), [scope]);

  useEffect(() => {
    if (!scope) return;
    if (!market) {
      router.replace('/marketplace');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const resolvedScope = String(scope || '').toLowerCase();
        const all = await getProducts(resolvedScope);
        const mapped = all.map(toViewModel);
        const filtered = mapped.filter((item) => market.filter(item));
        setProducts(filtered);
      } catch (error) {
        console.error('Failed to load market products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [scope, market, router]);

  if (!market) return null;
  if (loading) return <MarketLandingPage market={market} products={[]} />;

  return <MarketLandingPage market={market} products={products} />;
}
