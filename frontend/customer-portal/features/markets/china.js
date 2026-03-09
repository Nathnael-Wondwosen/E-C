const chinaMarket = {
  id: 'china',
  name: 'China Market',
  description: 'China-focused supply channels and manufacturing products.',
  heroTag: 'China Commerce',
  filter: (product = {}) => {
    const scope = `${product.marketScope || ''}`.toLowerCase();
    const origin = `${product.origin || product.country || product.countryOfOrigin || ''}`.toLowerCase();
    return scope === 'china' || origin.includes('china');
  }
};

export default chinaMarket;
