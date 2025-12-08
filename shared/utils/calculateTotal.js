function calculateTotal(items) {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    return total + (quantity * price);
  }, 0);
}

module.exports = calculateTotal;