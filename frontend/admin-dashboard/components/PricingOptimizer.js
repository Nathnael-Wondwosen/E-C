import { useState, useEffect } from 'react';

const PricingOptimizer = ({ products, onUpdatePrice }) => {
  const [optimizedPrices, setOptimizedPrices] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('demand_elasticity');

  // Calculate optimized prices based on various algorithms
  const calculateOptimizedPrices = async () => {
    setIsCalculating(true);
    
    // Simulate API delay for calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const optimizations = products.map(product => {
      // Base calculations
      const currentPrice = product.price;
      const stockLevel = product.stock || 0;
      const monthlySales = product.monthlySales || 0;
      
      let optimizedPrice = currentPrice;
      let reason = '';
      
      // Apply different algorithms based on selection
      switch (selectedAlgorithm) {
        case 'demand_elasticity':
          // Simple elasticity model - adjust based on sales velocity
          const salesVelocity = monthlySales / 30; // Daily sales rate
          const stockRatio = stockLevel / (monthlySales + 1); // Days of supply
          
          if (salesVelocity > 5 && stockRatio > 10) {
            // High demand, plenty of stock - can increase price
            optimizedPrice = currentPrice * 1.1;
            reason = 'High demand with sufficient stock';
          } else if (salesVelocity < 1 && stockRatio < 5) {
            // Low demand, low stock - reduce price to move inventory
            optimizedPrice = currentPrice * 0.9;
            reason = 'Low demand with low stock';
          } else if (stockRatio < 3) {
            // Very low stock - premium pricing
            optimizedPrice = currentPrice * 1.15;
            reason = 'Limited stock availability';
          } else {
            // Stable situation
            optimizedPrice = currentPrice;
            reason = 'Market equilibrium';
          }
          break;
          
        case 'competitive_pricing':
          // Competitive pricing - adjust based on category averages
          const categoryAvg = calculateCategoryAverage(product.category);
          const deviation = currentPrice / categoryAvg;
          
          if (deviation > 1.2) {
            // Significantly above average - reduce to be competitive
            optimizedPrice = categoryAvg * 1.1;
            reason = 'Above category average';
          } else if (deviation < 0.8) {
            // Below average - can increase
            optimizedPrice = categoryAvg * 0.95;
            reason = 'Below category average';
          } else {
            // Within competitive range
            optimizedPrice = currentPrice;
            reason = 'Competitively priced';
          }
          break;
          
        case 'profit_maximization':
          // Profit maximization - consider cost and demand
          const cost = product.cost || (currentPrice * 0.6); // Assume 60% margin
          const profitMargin = (currentPrice - cost) / currentPrice;
          
          if (profitMargin > 0.4) {
            // High margin - can afford to reduce price for volume
            optimizedPrice = currentPrice * 0.95;
            reason = 'High profit margin - optimize for volume';
          } else if (profitMargin < 0.15) {
            // Low margin - increase price or review costs
            optimizedPrice = currentPrice * 1.05;
            reason = 'Low profit margin - price adjustment needed';
          } else {
            // Healthy margin
            optimizedPrice = currentPrice;
            reason = 'Healthy profit margin';
          }
          break;
          
        default:
          optimizedPrice = currentPrice;
          reason = 'No optimization applied';
      }
      
      // Ensure price doesn't go below cost or become negative
      const finalCost = product.cost || (currentPrice * 0.6);
      optimizedPrice = Math.max(finalCost * 1.1, optimizedPrice);
      
      return {
        productId: product.id,
        productName: product.name,
        currentPrice: currentPrice,
        optimizedPrice: parseFloat(optimizedPrice.toFixed(2)),
        difference: parseFloat((optimizedPrice - currentPrice).toFixed(2)),
        percentageChange: parseFloat(((optimizedPrice - currentPrice) / currentPrice * 100).toFixed(1)),
        reason: reason,
        category: product.category
      };
    });
    
    setOptimizedPrices(optimizations);
    setIsCalculating(false);
  };

  // Calculate average price for a category
  const calculateCategoryAverage = (category) => {
    const categoryProducts = products.filter(p => p.category === category);
    if (categoryProducts.length === 0) return 0;
    
    const total = categoryProducts.reduce((sum, p) => sum + p.price, 0);
    return total / categoryProducts.length;
  };

  // Apply all optimized prices
  const applyAllOptimizations = () => {
    optimizedPrices.forEach(opt => {
      if (opt.difference !== 0) {
        onUpdatePrice(opt.productId, opt.optimizedPrice);
      }
    });
    alert(`Applied pricing optimizations to ${optimizedPrices.filter(o => o.difference !== 0).length} products.`);
  };

  // Apply individual optimization
  const applyOptimization = (productId, newPrice) => {
    onUpdatePrice(productId, newPrice);
    setOptimizedPrices(prev => 
      prev.map(opt => 
        opt.productId === productId 
          ? {...opt, currentPrice: newPrice, difference: 0, percentageChange: 0, reason: 'Manually adjusted'}
          : opt
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Dynamic Pricing Optimizer
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI-powered pricing recommendations to maximize revenue
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          >
            <option value="demand_elasticity">Demand Elasticity Model</option>
            <option value="competitive_pricing">Competitive Pricing</option>
            <option value="profit_maximization">Profit Maximization</option>
          </select>
          
          <button
            onClick={calculateOptimizedPrices}
            disabled={isCalculating || products.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isCalculating || products.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              'Calculate Optimizations'
            )}
          </button>
        </div>
      </div>
      
      {optimizedPrices.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Pricing Recommendations
            </h4>
            <button
              onClick={applyAllOptimizations}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Apply All Changes
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Suggested Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {optimizedPrices.map((opt) => (
                  <tr key={opt.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {opt.productName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {opt.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${opt.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${opt.optimizedPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        opt.difference > 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : opt.difference < 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {opt.difference > 0 ? '+' : ''}{opt.difference.toFixed(2)} ({opt.percentageChange > 0 ? '+' : ''}{opt.percentageChange}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {opt.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {opt.difference !== 0 ? (
                        <button
                          onClick={() => applyOptimization(opt.productId, opt.optimizedPrice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Apply
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Applied</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              How it works
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Our AI analyzes market conditions, competitor pricing, demand patterns, and profit margins to recommend optimal pricing strategies. 
                Select an algorithm above and click "Calculate Optimizations" to see recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingOptimizer;