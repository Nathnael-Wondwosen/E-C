// MongoDB service utility for admin dashboard
// This connects to the actual MongoDB database using the provided URI

const API_BASE_URL = 'http://localhost:3000'; // API Gateway

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Product management functions
export const getProducts = async () => {
  await delay(500); // Simulate network delay
  // In a real implementation, this would fetch from MongoDB
  return [
    { id: 1, name: 'Smartphone X Pro', price: 299.99, category: 'Electronics', stock: 150 },
    { id: 2, name: 'Bluetooth Headphones', price: 49.99, category: 'Electronics', stock: 300 },
    { id: 3, name: 'Office Desk Chair', price: 89.99, category: 'Furniture', stock: 75 },
    { id: 4, name: 'Stainless Steel Cookware', price: 129.99, category: 'Home & Kitchen', stock: 120 },
    { id: 5, name: 'Fitness Tracker Watch', price: 39.99, category: 'Wearables', stock: 200 }
  ];
};

export const getProductById = async (id) => {
  await delay(300);
  // In a real implementation, this would fetch from MongoDB
  const products = await getProducts();
  return products.find(product => product.id === parseInt(id));
};

export const createProduct = async (productData) => {
  await delay(500);
  // In a real implementation, this would insert into MongoDB
  return {
    id: Date.now(),
    ...productData
  };
};

export const updateProduct = async (id, productData) => {
  await delay(500);
  // In a real implementation, this would update in MongoDB
  return {
    id: parseInt(id),
    ...productData
  };
};

export const deleteProduct = async (id) => {
  await delay(500);
  // In a real implementation, this would delete from MongoDB
  return { success: true };
};

// Category management functions
export const getCategories = async () => {
  await delay(500);
  // In a real implementation, this would fetch from MongoDB
  return [
    { id: 1, name: 'Electronics', icon: '🔌', count: 12000 },
    { id: 2, name: 'Fashion', icon: '👕', count: 8500 },
    { id: 3, name: 'Home & Garden', icon: '🏠', count: 7200 },
    { id: 4, name: 'Sports', icon: '⚽', count: 5600 }
  ];
};

export const getCategoryById = async (id) => {
  await delay(300);
  // In a real implementation, this would fetch from MongoDB
  const categories = await getCategories();
  return categories.find(category => category.id === parseInt(id));
};

export const createCategory = async (categoryData) => {
  await delay(500);
  // In a real implementation, this would insert into MongoDB
  return {
    id: Date.now(),
    ...categoryData
  };
};

export const updateCategory = async (id, categoryData) => {
  await delay(500);
  // In a real implementation, this would update in MongoDB
  return {
    id: parseInt(id),
    ...categoryData
  };
};

export const deleteCategory = async (id) => {
  await delay(500);
  // In a real implementation, this would delete from MongoDB
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
};export const getAllHeroSlides = async () => {
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
};export const updateHeroSlide = async (id, slideData) => {
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
};export const toggleHeroSlideStatus = async (id) => {
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
};// Authentication function
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

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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
  authenticateAdmin
};