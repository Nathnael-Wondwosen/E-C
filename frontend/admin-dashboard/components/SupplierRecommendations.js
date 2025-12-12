import { useState, useEffect } from 'react';

const SupplierRecommendations = ({ products }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    reliability: 'all',
    cost: 'all',
    delivery: 'all'
  });

  // Mock supplier database
  const mockSuppliers = [
    { id: 1, name: 'Global Tech Supplies', category: 'Electronics', reliability: 95, costRating: 85, deliverySpeed: 90, contact: 'contact@globaltech.com', location: 'Shanghai, China' },
    { id: 2, name: 'Fashion Forward Ltd', category: 'Apparel', reliability: 88, costRating: 92, deliverySpeed: 85, contact: 'info@fashionforward.com', location: 'Milan, Italy' },
    { id: 3, name: 'Home Essentials Co', category: 'Home & Garden', reliability: 92, costRating: 88, deliverySpeed: 88, contact: 'support@homeessentials.com', location: 'Los Angeles, USA' },
    { id: 4, name: 'Sports Pro Distributors', category: 'Sports', reliability: 85, costRating: 90, deliverySpeed: 92, contact: 'sales@sportspro.com', location: 'Berlin, Germany' },
    { id: 5, name: 'Premium Electronics Inc', category: 'Electronics', reliability: 97, costRating: 80, deliverySpeed: 95, contact: 'orders@premiumelectronics.com', location: 'Seoul, South Korea' },
    { id: 6, name: 'Organic Textiles Group', category: 'Apparel', reliability: 90, costRating: 87, deliverySpeed: 82, contact: 'hello@organictextiles.com', location: 'Bangalore, India' }
  ];

  // Analyze products and recommend suppliers
  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Group products by category
    const categoryGroups = {};
    products.forEach(product => {
      if (!categoryGroups[product.category]) {
        categoryGroups[product.category] = [];
      }
      categoryGroups[product.category].push(product);
    });
    
    // Generate recommendations for each category
    const recommendations = Object.entries(categoryGroups).map(([category, categoryProducts]) => {
      // Find best suppliers for this category
      const categorySuppliers = mockSuppliers.filter(supplier => 
        supplier.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(supplier.category.toLowerCase())
      );
      
      // If no direct match, find related suppliers
      if (categorySuppliers.length === 0) {
        categorySuppliers.push(...mockSuppliers.slice(0, 3));
      }
      
      // Calculate scores for each supplier
      const scoredSuppliers = categorySuppliers.map(supplier => {
        // Weighted scoring based on filters
        let score = 0;
        let maxScore = 0;
        
        // Reliability factor (30% weight)
        score += supplier.reliability * 0.3;
        maxScore += 100 * 0.3;
        
        // Cost factor (40% weight)
        score += supplier.costRating * 0.4;
        maxScore += 100 * 0.4;
        
        // Delivery speed factor (30% weight)
        score += supplier.deliverySpeed * 0.3;
        maxScore += 100 * 0.3;
        
        // Normalize score to 0-100
        const normalizedScore = (score / maxScore) * 100;
        
        return {
          ...supplier,
          score: Math.round(normalizedScore),
          productCount: categoryProducts.length,
          avgProductPrice: categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length
        };
      });
      
      // Sort by score
      scoredSuppliers.sort((a, b) => b.score - a.score);
      
      return {
        category,
        productCount: categoryProducts.length,
        avgPrice: categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length,
        suppliers: scoredSuppliers.slice(0, 3), // Top 3 suppliers
        potentialSavings: calculatePotentialSavings(categoryProducts, scoredSuppliers[0])
      };
    });
    
    setRecommendations(recommendations);
    setIsAnalyzing(false);
  };

  // Calculate potential savings with a new supplier
  const calculatePotentialSavings = (products, bestSupplier) => {
    if (!bestSupplier) return 0;
    
    // Mock calculation - in reality this would involve actual supplier pricing
    const currentAvgCost = products.reduce((sum, p) => sum + (p.cost || p.price * 0.6), 0) / products.length;
    const potentialCost = currentAvgCost * (bestSupplier.costRating / 100);
    const savingsPerProduct = currentAvgCost - potentialCost;
    
    return Math.round(savingsPerProduct * products.length);
  };

  // Filter recommendations based on selected criteria
  const filteredRecommendations = recommendations.filter(rec => {
    // For now, we'll return all recommendations
    // In a more complex implementation, we would filter based on selectedFilters
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Intelligent Supplier Recommendations
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI-powered supplier matching to optimize your supply chain
          </p>
        </div>
        
        <button
          onClick={analyzeAndRecommend}
          disabled={isAnalyzing || products.length === 0}
          className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isAnalyzing || products.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Supply Chain...
            </>
          ) : (
            'Analyze & Recommend Suppliers'
          )}
        </button>
      </div>
      
      {filteredRecommendations.length > 0 && (
        <div className="space-y-6">
          {filteredRecommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    {rec.category}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rec.productCount} products • Avg. price: ${rec.avgPrice.toFixed(2)}
                  </p>
                </div>
                {rec.potentialSavings > 0 && (
                  <div className="mt-2 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Potential savings: ${rec.potentialSavings.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rec.suppliers.map((supplier, supIndex) => (
                  <div key={supIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.location}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {supplier.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Reliability</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.reliability}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Cost</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.costRating}/100</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Delivery</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.deliverySpeed}/100</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {supplier.productCount} products
                      </span>
                      <button className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        Contact Supplier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {recommendations.length === 0 && !isAnalyzing && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recommendations yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click "Analyze & Recommend Suppliers" to get AI-powered supplier recommendations.
          </p>
        </div>
      )}
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
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
                Our AI analyzes your product catalog, current suppliers, and market data to recommend optimal suppliers for each category. 
                Factors include reliability, cost-effectiveness, and delivery performance to help you build a resilient supply chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRecommendations;