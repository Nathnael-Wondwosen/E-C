const localMarket = {
  id: 'local',
  name: 'Local Market',
  description: 'Ethiopia-first products and local commerce network.',
  heroTag: 'Local Commerce',
  filter: (product = {}) => {
    const scope = `${product.marketScope || ''}`.toLowerCase();
    const origin = `${product.origin || product.country || product.countryOfOrigin || ''}`.toLowerCase();
    return scope === 'local' || origin.includes('ethiopia');
  }
};

export default localMarket;
