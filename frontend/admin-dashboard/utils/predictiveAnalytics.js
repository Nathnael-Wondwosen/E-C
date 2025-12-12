// Predictive Analytics Service for Inventory Management and Demand Forecasting
// This is a mock implementation for demonstration purposes

// Mock function to predict future demand based on historical data
export const predictDemand = async (productId, historicalSalesData, timeframe = 30) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would use ML models like ARIMA, Prophet, or LSTM
  // For this demo, we'll use a simple moving average approach
  
  if (!historicalSalesData || historicalSalesData.length === 0) {
    return {
      predictedSales: 0,
      confidence: 0,
      trend: 'unknown',
      recommendations: []
    };
  }
  
  // Calculate average daily sales
  const totalSales = historicalSalesData.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = totalSales / historicalSalesData.length;
  
  // Predict sales for the next timeframe
  const predictedSales = Math.round(avgDailySales * timeframe);
  
  // Calculate trend based on recent vs older sales
  const midpoint = Math.floor(historicalSalesData.length / 2);
  const recentSales = historicalSalesData.slice(midpoint).reduce((sum, day) => sum + day.sales, 0);
  const olderSales = historicalSalesData.slice(0, midpoint).reduce((sum, day) => sum + day.sales, 0);
  
  let trend = 'stable';
  if (recentSales > olderSales * 1.1) trend = 'increasing';
  if (recentSales < olderSales * 0.9) trend = 'decreasing';
  
  // Confidence based on data consistency
  const variance = historicalSalesData.reduce((sum, day) => 
    sum + Math.pow(day.sales - avgDailySales, 2), 0) / historicalSalesData.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgDailySales;
  const confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 50));
  
  // Generate recommendations
  const recommendations = [];
  
  if (trend === 'increasing') {
    recommendations.push('Consider increasing inventory levels to meet rising demand');
  } else if (trend === 'decreasing') {
    recommendations.push('Monitor inventory closely to avoid overstock');
  }
  
  if (confidence < 70) {
    recommendations.push('Collect more sales data for better predictions');
  }
  
  if (predictedSales > 1000) {
    recommendations.push('Plan for high-demand period with adequate staffing');
  }
  
  return {
    predictedSales,
    confidence: Math.round(confidence),
    trend,
    recommendations
  };
};

// Mock function to analyze inventory health
export const analyzeInventoryHealth = async (products) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!products || products.length === 0) {
    return {
      totalProducts: 0,
      lowStockItems: 0,
      overstockedItems: 0,
      stockoutRisk: 0,
      healthScore: 0,
      recommendations: []
    };
  }
  
  // Analyze each product
  const analysis = products.map(product => {
    const stockLevel = product.stock || 0;
    const dailySales = (product.monthlySales || 0) / 30;
    
    // Calculate days of supply
    const daysOfSupply = dailySales > 0 ? stockLevel / dailySales : stockLevel > 0 ? 999 : 0;
    
    // Determine stock status
    let stockStatus = 'healthy';
    if (daysOfSupply < 7) stockStatus = 'low';
    if (daysOfSupply > 180) stockStatus = 'overstocked';
    
    return {
      ...product,
      daysOfSupply: Math.round(daysOfSupply),
      stockStatus
    };
  });
  
  // Aggregate results
  const lowStockItems = analysis.filter(item => item.stockStatus === 'low').length;
  const overstockedItems = analysis.filter(item => item.stockStatus === 'overstocked').length;
  const healthyItems = analysis.filter(item => item.stockStatus === 'healthy').length;
  
  // Calculate health score (0-100)
  const healthScore = Math.round(
    (healthyItems / products.length) * 100 * 0.7 + 
    (1 - lowStockItems / products.length) * 100 * 0.3
  );
  
  // Calculate stockout risk (0-100)
  const stockoutRisk = Math.round((lowStockItems / products.length) * 100);
  
  // Generate recommendations
  const recommendations = [];
  
  if (lowStockItems > products.length * 0.1) {
    recommendations.push('Reorder low-stock items immediately to prevent stockouts');
  }
  
  if (overstockedItems > products.length * 0.15) {
    recommendations.push('Review pricing or promotions for overstocked items');
  }
  
  if (healthScore < 70) {
    recommendations.push('Optimize inventory levels to improve overall health');
  }
  
  return {
    totalProducts: products.length,
    lowStockItems,
    overstockedItems,
    stockoutRisk,
    healthScore,
    recommendations
  };
};

// Mock function to generate reorder suggestions
export const generateReorderSuggestions = async (products) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  if (!products || products.length === 0) {
    return [];
  }
  
  // Analyze products for reorder suggestions
  const suggestions = products
    .map(product => {
      const stockLevel = product.stock || 0;
      const monthlySales = product.monthlySales || 0;
      const leadTimeDays = product.leadTimeDays || 14; // Default 2 weeks
      const safetyStock = product.safetyStock || Math.ceil(monthlySales * 0.1); // 10% of monthly sales
      
      // Calculate reorder point
      const dailySales = monthlySales / 30;
      const reorderPoint = Math.ceil(dailySales * leadTimeDays + safetyStock);
      
      // Check if reorder is needed
      const shouldReorder = stockLevel <= reorderPoint;
      const quantityNeeded = shouldReorder ? Math.ceil(reorderPoint * 1.5) - stockLevel : 0; // 50% buffer
      
      return {
        ...product,
        reorderPoint,
        shouldReorder,
        quantityNeeded,
        priority: quantityNeeded > 0 ? 
          (stockLevel / (quantityNeeded + 1)) : // Lower ratio = higher priority
          999 // No reorder needed
      };
    })
    .filter(item => item.shouldReorder)
    .sort((a, b) => a.priority - b.priority) // Lower priority number = higher urgency
    .slice(0, 10); // Limit to top 10 suggestions
  
  return suggestions;
};

// Mock function to forecast seasonal trends
export const forecastSeasonalTrends = async (products) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  if (!products || products.length === 0) {
    return [];
  }
  
  // In a real implementation, this would use time series analysis
  // For this demo, we'll use simple heuristics
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  // Seasonal multipliers (simplified)
  const seasonalMultipliers = {
    // Winter (Dec-Feb)
    0: 1.2, // January
    1: 1.1, // February
    11: 1.3, // December
    
    // Spring (Mar-May)
    2: 1.0, // March
    3: 1.1, // April
    4: 1.0, // May
    
    // Summer (Jun-Aug)
    5: 1.3, // June
    6: 1.4, // July
    7: 1.3, // August
    
    // Fall (Sep-Nov)
    8: 1.1, // September
    9: 1.0, // October
    10: 1.2 // November
  };
  
  // Product category seasonality
  const categorySeasonality = {
    'swimsuits': [5, 6, 7], // Summer peak
    'heaters': [0, 1, 11], // Winter peak
    'backpacks': [7, 8], // Back to school
    'skis': [0, 1, 11], // Winter sports
    'air conditioners': [5, 6, 7], // Summer peak
    'umbrellas': [2, 3, 4, 5], // Spring rains
    'holiday decorations': [10, 11], // Holiday season
  };
  
  const forecasts = products.map(product => {
    const baseMultiplier = seasonalMultipliers[currentMonth] || 1.0;
    
    // Adjust based on product category
    let categoryMultiplier = 1.0;
    for (const [category, peakMonths] of Object.entries(categorySeasonality)) {
      if (product.category.toLowerCase().includes(category) && peakMonths.includes(currentMonth)) {
        categoryMultiplier = 1.5;
        break;
      }
    }
    
    const expectedMultiplier = baseMultiplier * categoryMultiplier;
    
    // Calculate expected sales increase
    const currentMonthlySales = product.monthlySales || 0;
    const expectedSalesIncrease = Math.round(currentMonthlySales * (expectedMultiplier - 1));
    
    // Determine if this is a peak season
    const isPeakSeason = expectedMultiplier > 1.2;
    
    return {
      ...product,
      expectedMultiplier: expectedMultiplier.toFixed(1),
      expectedSalesIncrease,
      isPeakSeason,
      recommendation: isPeakSeason ? 
        `Prepare for peak season with increased inventory (${Math.round((expectedMultiplier - 1) * 100)}% increase expected)` :
        'Normal seasonal demand expected'
    };
  });
  
  // Filter to only show products with significant seasonal variations
  return forecasts.filter(item => item.expectedMultiplier > 1.1);
};

export default {
  predictDemand,
  analyzeInventoryHealth,
  generateReorderSuggestions,
  forecastSeasonalTrends
};