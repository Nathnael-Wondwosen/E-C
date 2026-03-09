const b2bMarket = {
  id: 'b2b',
  name: 'B2B Market',
  description: 'Bulk and wholesale products for business procurement.',
  heroTag: 'B2B Commerce',
  filter: (product = {}) => {
    const type = `${product.productType || ''}`.toLowerCase();
    const scope = `${product.marketScope || ''}`.toLowerCase();
    return type === 'b2b' || scope === 'b2b';
  }
};

export default b2bMarket;
