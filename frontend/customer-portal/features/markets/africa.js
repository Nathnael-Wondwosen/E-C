const africaMarket = {
  id: 'africa',
  name: 'Africa Market',
  description: 'Regional marketplace for African suppliers and buyers.',
  heroTag: 'Africa Commerce',
  filter: (product = {}) => {
    const scope = `${product.marketScope || ''}`.toLowerCase();
    const origin = `${product.origin || product.country || product.countryOfOrigin || ''}`.toLowerCase();
    return (
      scope === 'africa' ||
      origin.includes('africa') ||
      origin.includes('kenya') ||
      origin.includes('nigeria') ||
      origin.includes('ghana') ||
      origin.includes('rwanda')
    );
  }
};

export default africaMarket;
