const globalMarket = {
  id: 'global',
  name: 'Global Market',
  description: 'Worldwide product discovery, sourcing, and export/import trade.',
  heroTag: 'Global Commerce',
  filter: (product = {}) => {
    const scope = `${product.marketScope || ''}`.toLowerCase();
    return scope === 'global';
  }
};

export default globalMarket;
