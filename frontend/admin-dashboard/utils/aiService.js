// Mock AI service for advanced search and filtering suggestions
// In a real implementation, this would connect to an actual AI service

// Mock AI-powered category suggestions based on search terms
export const getCategorySuggestions = async (searchTerm, allCategories) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  // Simple mock implementation - in reality, this would use NLP or ML models
  const term = searchTerm.toLowerCase();
  const suggestions = [];
  
  // Find categories that match the search term
  const directMatches = allCategories.filter(cat => 
    cat.name.toLowerCase().includes(term) || 
    cat.description.toLowerCase().includes(term)
  );
  
  // Add related categories based on common words
  const relatedCategories = allCategories.filter(cat => {
    if (directMatches.some(dm => dm.id === cat.id)) return false;
    
    // Simple keyword matching for demo purposes
    const keywords = ['electronics', 'fashion', 'home', 'sports', 'kitchen', 'furniture', 'mobile', 'laptop'];
    return keywords.some(keyword => 
      cat.name.toLowerCase().includes(keyword) && term.includes(keyword.substring(0, 3))
    );
  });
  
  // Combine and limit results
  const allSuggestions = [...directMatches, ...relatedCategories];
  return allSuggestions.slice(0, 5);
};

// Mock AI-powered product suggestions based on search terms
export const getProductSuggestions = async (searchTerm, allProducts) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  // Simple mock implementation - in reality, this would use NLP or ML models
  const term = searchTerm.toLowerCase();
  const suggestions = [];
  
  // Find products that match the search term
  const directMatches = allProducts.filter(prod => 
    prod.name.toLowerCase().includes(term) || 
    prod.description.toLowerCase().includes(term) ||
    prod.sku.toLowerCase().includes(term)
  );
  
  // Add related products based on category similarity
  const relatedProducts = allProducts.filter(prod => {
    if (directMatches.some(dm => dm.id === prod.id)) return false;
    
    // Simple category matching for demo purposes
    const categories = ['smartphone', 'laptop', 'furniture', 'kitchen', 'sports'];
    return categories.some(category => 
      prod.category.toLowerCase().includes(category) && term.includes(category.substring(0, 3))
    );
  });
  
  // Combine and limit results
  const allSuggestions = [...directMatches, ...relatedProducts];
  return allSuggestions.slice(0, 5);
};

// Mock AI-powered category assignment for products using ML classification
export const suggestCategoryForProduct = async (productName, productDescription, allCategories) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const text = (productName + ' ' + productDescription).toLowerCase();
  
  // Simple keyword-based category suggestion (in reality, this would use ML models)
  if (text.includes('phone') || text.includes('mobile') || text.includes('smartphone')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('smartphones')) || 
           allCategories.find(cat => cat.name.toLowerCase().includes('electronics'));
  }
  
  if (text.includes('laptop') || text.includes('computer')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('laptops')) || 
           allCategories.find(cat => cat.name.toLowerCase().includes('electronics'));
  }
  
  if (text.includes('chair') || text.includes('desk') || text.includes('furniture')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('furniture')) || 
           allCategories.find(cat => cat.name.toLowerCase().includes('home'));
  }
  
  if (text.includes('cook') || text.includes('kitchen')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('kitchen')) || 
           allCategories.find(cat => cat.name.toLowerCase().includes('home'));
  }
  
  if (text.includes('shirt') || text.includes('pants') || text.includes('clothing')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('fashion'));
  }
  
  if (text.includes('ball') || text.includes('sport')) {
    return allCategories.find(cat => cat.name.toLowerCase().includes('sports'));
  }
  
  // Default to the first category if no match found
  return allCategories[0] || null;
};

// Enhanced ML-based category classifier
export const classifyProductCategory = async (productName, productDescription, allCategories) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real implementation, this would use a trained ML model
  // For this demo, we'll enhance the keyword-based approach with confidence scoring
  
  const text = (productName + ' ' + productDescription).toLowerCase();
  const scores = {};
  
  // Score each category based on keyword matches
  allCategories.forEach(category => {
    const categoryName = category.name.toLowerCase();
    let score = 0;
    
    // Direct keyword matches in category name
    if (text.includes(categoryName)) score += 10;
    
    // Specific product type matches
    if (categoryName.includes('electronics')) {
      if (text.includes('phone') || text.includes('mobile') || text.includes('smartphone') ||
          text.includes('laptop') || text.includes('computer') || text.includes('tablet')) {
        score += 8;
      }
    }
    
    if (categoryName.includes('furniture')) {
      if (text.includes('chair') || text.includes('desk') || text.includes('table') ||
          text.includes('sofa') || text.includes('bed')) {
        score += 8;
      }
    }
    
    if (categoryName.includes('kitchen')) {
      if (text.includes('cook') || text.includes('pan') || text.includes('pot') ||
          text.includes('knife') || text.includes('appliance')) {
        score += 8;
      }
    }
    
    if (categoryName.includes('fashion')) {
      if (text.includes('shirt') || text.includes('pants') || text.includes('dress') ||
          text.includes('shoe') || text.includes('clothing')) {
        score += 8;
      }
    }
    
    if (categoryName.includes('sports')) {
      if (text.includes('ball') || text.includes('sport') || text.includes('fitness') ||
          text.includes('exercise')) {
        score += 8;
      }
    }
    
    // General keyword matches
    const generalKeywords = ['device', 'gadget', 'tech', 'electronic'];
    generalKeywords.forEach(keyword => {
      if (text.includes(keyword) && categoryName.includes('electronics')) {
        score += 3;
      }
    });
    
    scores[category.id] = score;
  });
  
  // Find the category with the highest score
  let bestCategoryId = null;
  let bestScore = -1;
  
  Object.entries(scores).forEach(([categoryId, score]) => {
    if (score > bestScore) {
      bestScore = score;
      bestCategoryId = categoryId;
    }
  });
  
  // If no good matches found, return null
  if (bestScore < 3) {
    return null;
  }
  
  // Calculate confidence (0-100)
  const confidence = Math.min(100, Math.round((bestScore / 15) * 100));
  
  // Return the best matching category with confidence score
  const bestCategory = allCategories.find(cat => cat.id == bestCategoryId);
  
  return {
    category: bestCategory,
    confidence: confidence,
    alternativeCategories: Object.entries(scores)
      .filter(([id, score]) => score >= bestScore * 0.7 && id != bestCategoryId)
      .map(([id]) => allCategories.find(cat => cat.id == id))
      .slice(0, 3)
  };
};

// Batch category classification for multiple products
export const batchClassifyProducts = async (products, allCategories) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would process multiple products efficiently
  const results = [];
  
  for (const product of products) {
    const classification = await classifyProductCategory(
      product.name, 
      product.description, 
      allCategories
    );
    
    results.push({
      productId: product.id,
      productName: product.name,
      classification: classification
    });
  }
  
  return results;
};

export default {
  getCategorySuggestions,
  getProductSuggestions,
  suggestCategoryForProduct,
  classifyProductCategory,
  batchClassifyProducts
};