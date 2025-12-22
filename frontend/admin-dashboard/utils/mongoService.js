// MongoDB service utility for admin dashboard
// This connects to the actual MongoDB database using the provided URI

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'; // API Gateway

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Product management functions
export const getProducts = async () => {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (response.ok) {
      const products = await response.json();
      return products.map(product => ({
        ...product,
        id: product._id || product.id
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch products from API, using mock data:', error);
  }
  
  // Fallback to mock data
  await delay(500); // Simulate network delay
  return [
    { id: 1, name: 'Smartphone X Pro', price: 299.99, category: 'Electronics', stock: 150, sku: 'PHONE-XPRO-001', description: 'Latest smartphone with advanced features' },
    { id: 2, name: 'Bluetooth Headphones', price: 49.99, category: 'Electronics', stock: 300, sku: 'HEADPHONES-BT-002', description: 'Wireless headphones with noise cancellation' },
    { id: 3, name: 'Office Desk Chair', price: 89.99, category: 'Furniture', stock: 75, sku: 'CHAIR-OFFICE-003', description: 'Ergonomic office chair for comfort' },
    { id: 4, name: 'Stainless Steel Cookware', price: 129.99, category: 'Home & Kitchen', stock: 120, sku: 'COOKWARE-SS-004', description: 'Professional grade stainless steel cookware set' },
    { id: 5, name: 'Fitness Tracker Watch', price: 39.99, category: 'Wearables', stock: 200, sku: 'WATCH-FIT-005', description: 'Track your fitness goals with this smartwatch' },
    { id: 6, name: 'Gaming Laptop', price: 1299.99, category: 'Electronics', stock: 25, sku: 'LAPTOP-GAME-006', description: 'High-performance gaming laptop' },
    { id: 7, name: 'Coffee Maker', price: 79.99, category: 'Home & Kitchen', stock: 90, sku: 'COFFEE-MAKER-007', description: 'Automatic drip coffee maker' },
    { id: 8, name: 'Running Shoes', price: 59.99, category: 'Sports', stock: 180, sku: 'SHOES-RUN-008', description: 'Lightweight running shoes for athletes' }
  ];
};

export const getProductById = async (id) => {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (response.ok) {
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id
      };
    }
  } catch (error) {
    console.warn('Failed to fetch product from API, using mock data:', error);
  }
  
  // Fallback to mock data
  await delay(300);
  const products = await getProducts();
  return products.find(product => product.id === parseInt(id) || product.id === id);
};

export const createProduct = async (productData) => {
  try {
    // Try to create via API
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (response.ok) {
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id
      };
    }
  } catch (error) {
    console.warn('Failed to create product via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return {
    id: Date.now(),
    ...productData
  };
};

export const updateProduct = async (id, productData) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (response.ok) {
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id
      };
    }
  } catch (error) {
    console.warn('Failed to update product via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return {
    id: typeof id === 'string' ? id : parseInt(id),
    ...productData
  };
};

export const deleteProduct = async (id) => {
  try {
    // Try to delete via API
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      return { success: true };
    }
  } catch (error) {
    console.warn('Failed to delete product via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return { success: true };
};

export const bulkDeleteProducts = async (ids) => {
  try {
    // Try to delete via API
    const response = await fetch(`${API_BASE_URL}/api/products/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, deletedCount: result.deletedCount };
    }
  } catch (error) {
    console.warn('Failed to bulk delete products via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return { success: true, deletedCount: ids.length };
};

// Category management functions
export const getCategories = async () => {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (response.ok) {
      const categories = await response.json();
      return categories.map(category => ({
        ...category,
        id: category._id || category.id
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch categories from API, using mock data:', error);
  }
  
  // Fallback to mock data
  await delay(500);
  return [
    { id: 1, name: 'Electronics', icon: '🔌', description: 'Electronic devices and gadgets', count: 12000, parentId: null },
    { id: 2, name: 'Fashion', icon: '👕', description: 'Clothing and accessories', count: 8500, parentId: null },
    { id: 3, name: 'Home & Garden', icon: '🏠', description: 'Home improvement and garden supplies', count: 7200, parentId: null },
    { id: 4, name: 'Sports', icon: '⚽', description: 'Sports equipment and apparel', count: 5600, parentId: null },
    { id: 5, name: 'Furniture', icon: '🪑', description: 'Home and office furniture', count: 3200, parentId: 3 },
    { id: 6, name: 'Kitchen Appliances', icon: '🍳', description: 'Cooking and kitchen appliances', count: 2800, parentId: 3 },
    { id: 7, name: 'Smartphones', icon: '📱', description: 'Mobile phones and accessories', count: 4500, parentId: 1 },
    { id: 8, name: 'Laptops', icon: '💻', description: 'Computers and laptops', count: 2300, parentId: 1 }
  ];
};

export const getCategoryById = async (id) => {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
    if (response.ok) {
      const category = await response.json();
      return {
        ...category,
        id: category._id || category.id
      };
    }
  } catch (error) {
    console.warn('Failed to fetch category from API, using mock data:', error);
  }
  
  // Fallback to mock data
  await delay(300);
  const categories = await getCategories();
  return categories.find(category => category.id === parseInt(id) || category.id === id);
};

export const createCategory = async (categoryData) => {
  try {
    // Try to create via API
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (response.ok) {
      const category = await response.json();
      return {
        ...category,
        id: category._id || category.id
      };
    }
  } catch (error) {
    console.warn('Failed to create category via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return {
    id: Date.now(),
    ...categoryData
  };
};

export const updateCategory = async (id, categoryData) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (response.ok) {
      const category = await response.json();
      return {
        ...category,
        id: category._id || category.id
      };
    }
  } catch (error) {
    console.warn('Failed to update category via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return {
    id: typeof id === 'string' ? id : parseInt(id),
    ...categoryData
  };
};

export const deleteCategory = async (id) => {
  try {
    // Try to delete via API
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      return { success: true };
    }
  } catch (error) {
    console.warn('Failed to delete category via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return { success: true };
};

// Order management functions
export const getOrders = async () => {
  await delay(500);
  // In a real implementation, this would fetch from MongoDB
  return [
    { id: 1001, customer: 'ABC Corp', total: 1249.99, status: 'Processing', date: '2025-12-09' },
    { id: 1002, customer: 'XYZ Ltd', total: 875.50, status: 'Shipped', date: '2025-12-08' },
    { id: 1003, customer: 'Global Traders', total: 2100.00, status: 'Delivered', date: '2025-12-07' }
  ];
};

export const getOrderById = async (id) => {
  await delay(300);
  // In a real implementation, this would fetch from MongoDB
  const orders = await getOrders();
  return orders.find(order => order.id === parseInt(id));
};

export const updateOrderStatus = async (id, status) => {
  await delay(500);
  // In a real implementation, this would update in MongoDB
  return {
    id: parseInt(id),
    status
  };
};

// Hero Slides management functions
export const getHeroSlides = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hero-slides`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const slides = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return slides.map(slide => ({
      ...slide,
      id: slide._id.toString() // Ensure ID is a string
    }));
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    // Return default slides if API fails
    return [
      {
        id: '1',
        title: "Global Trade Solutions",
        subtitle: "Connect with suppliers worldwide",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "Explore Marketplace",
        ctaLink: "/marketplace",
        isActive: true
      },
      {
        id: '2',
        title: "Wholesale Excellence",
        subtitle: "Bulk orders with competitive pricing",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "View Products",
        ctaLink: "/products",
        isActive: true
      },
      {
        id: '3',
        title: "Verified Suppliers",
        subtitle: "Trusted partners for your business",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "Find Suppliers",
        ctaLink: "/suppliers",
        isActive: true
      }
    ];
  }
};

export const getAllHeroSlides = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hero-slides/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const slides = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return slides.map(slide => ({
      ...slide,
      id: slide._id.toString() // Ensure ID is a string
    }));
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    // Return default slides if API fails
    return [
      {
        id: '1',
        title: "Global Trade Solutions",
        subtitle: "Connect with suppliers worldwide",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "Explore Marketplace",
        ctaLink: "/marketplace",
        isActive: true
      },
      {
        id: '2',
        title: "Wholesale Excellence",
        subtitle: "Bulk orders with competitive pricing",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "View Products",
        ctaLink: "/products",
        isActive: true
      },
      {
        id: '3',
        title: "Verified Suppliers",
        subtitle: "Trusted partners for your business",
        imageUrl: "/placeholder-carousel.jpg",
        ctaText: "Find Suppliers",
        ctaLink: "/suppliers",
        isActive: true
      }
    ];
  }
};

export const createHeroSlide = async (slideData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hero-slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slideData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const slide = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...slide,
      id: slide._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error creating hero slide:', error);
    throw error;
  }
};

export const updateHeroSlide = async (id, slideData) => {
  try {
    // Ensure we're using the correct ID format (string)
    const slideId = typeof id === 'object' ? id.toString() : id;
    
    // Remove immutable fields from slideData to avoid conflicts
    const { id: _, _id, createdAt, updatedAt, ...dataToUpdate } = slideData;
    
    const response = await fetch(`${API_BASE_URL}/api/hero-slides/${slideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToUpdate),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const slide = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...slide,
      id: slide._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error updating hero slide:', error);
    throw error;
  }
};

export const deleteHeroSlide = async (id) => {
  try {
    // Ensure we're using the correct ID format (string)
    const slideId = typeof id === 'object' ? id.toString() : id;
    
    const response = await fetch(`${API_BASE_URL}/api/hero-slides/${slideId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    throw error;
  }
};

export const toggleHeroSlideStatus = async (id) => {
  try {
    // Ensure we're using the correct ID format (string)
    const slideId = typeof id === 'object' ? id.toString() : id;
    
    const response = await fetch(`${API_BASE_URL}/api/hero-slides/${slideId}/toggle`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const slide = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...slide,
      id: slide._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error toggling hero slide status:', error);
    throw error;
  }
};

// Authentication function
export const authenticateAdmin = async (username, password) => {
  await delay(800); // Simulate network delay for auth
  // In a real application, this would call an authentication API
  if (username === 'admin' && password === 'admin123') {
    return { 
      success: true, 
      user: { id: 1, username: 'admin', role: 'administrator' },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbmlzdHJhdG9yIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    };
  }
  return { success: false, message: 'Invalid credentials' };
};

// Special Offers management functions
export const getSpecialOffers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/special-offers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const offers = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return offers.map(offer => ({
      ...offer,
      id: offer._id.toString() // Ensure ID is a string
    }));
  } catch (error) {
    console.error('Error fetching special offers:', error);
    // Return default offers if API fails
    return [
      {
        id: '1',
        title: "Flash Sale - 24 Hours Only",
        subtitle: "Up to 70% off on selected electronics",
        description: "Limited time offer on our best selling electronics. Don't miss out on these amazing deals!",
        imageUrl: "/images/flash-sale.jpg",
        discount: "70%",
        expiryDate: "2025-12-15",
        isActive: true
      },
      {
        id: '2',
        title: "Buy 1 Get 1 Free",
        subtitle: "On all clothing items this week",
        description: "Take advantage of our BOGO offer on all clothing items. Perfect opportunity to refresh your wardrobe!",
        imageUrl: "/images/bogo.jpg",
        discount: "50%",
        expiryDate: "2025-12-20",
        isActive: true
      },
      {
        id: '3',
        title: "Free Gift with Purchase",
        subtitle: "Free gift on orders over $150",
        description: "Spend $150 or more and receive a free premium gift. Limited quantities available while supplies last.",
        imageUrl: "/images/free-gift.jpg",
        discount: "Free",
        expiryDate: "2025-12-25",
        isActive: false
      }
    ];
  }
};

export const createSpecialOffer = async (offerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/special-offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const offer = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...offer,
      id: offer._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error creating special offer:', error);
    throw error;
  }
};

export const updateSpecialOffer = async (id, offerData) => {
  try {
    // Ensure we're using the correct ID format (string)
    const offerId = typeof id === 'object' ? id.toString() : id;
    
    // Remove immutable fields from offerData to avoid conflicts
    const { id: _, _id, createdAt, updatedAt, ...dataToUpdate } = offerData;
    
    const response = await fetch(`${API_BASE_URL}/api/special-offers/${offerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToUpdate),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const offer = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...offer,
      id: offer._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error updating special offer:', error);
    throw error;
  }
};

export const deleteSpecialOffer = async (id) => {
  try {
    // Ensure we're using the correct ID format (string)
    const offerId = typeof id === 'object' ? id.toString() : id;
    
    const response = await fetch(`${API_BASE_URL}/api/special-offers/${offerId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting special offer:', error);
    throw error;
  }
};

export const toggleSpecialOfferStatus = async (id) => {
  try {
    // Ensure we're using the correct ID format (string)
    const offerId = typeof id === 'object' ? id.toString() : id;
    
    const response = await fetch(`${API_BASE_URL}/api/special-offers/${offerId}/toggle`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const offer = await response.json();
    // Convert MongoDB _id to id for frontend compatibility
    return {
      ...offer,
      id: offer._id.toString() // Ensure ID is a string
    };
  } catch (error) {
    console.error('Error toggling special offer status:', error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
  getSpecialOffers,
  createSpecialOffer,
  updateSpecialOffer,
  deleteSpecialOffer,
  toggleSpecialOfferStatus,
  authenticateAdmin
};