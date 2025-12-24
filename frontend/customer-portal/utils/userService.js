// User service utility for customer portal
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// User authentication function
export const authenticateUser = async (email, password, userType = 'buyer') => {
  try {
    // Try to authenticate via API
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, userType }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        user: result.user,
        token: result.token
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Authentication failed'
      };
    }
  } catch (error) {
    console.warn('Failed to authenticate user via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  
  // Mock authentication for demo purposes
  if (email === 'user@example.com' && password === 'password123') {
    return {
      success: true,
      user: {
        id: 1,
        email: email,
        name: 'John Doe',
        userType: userType,
        isActive: true
      },
      token: 'mock-jwt-token'
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

// Create new user function
export const createUser = async (userData) => {
  try {
    // Try to create via API
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        user: result.user,
        token: result.token
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  } catch (error) {
    console.warn('Failed to create user via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  
  // Mock user creation for demo purposes
  return {
    success: true,
    user: {
      id: Date.now(),
      email: userData.email,
      name: userData.name,
      userType: userData.userType,
      isActive: true,
      profile: userData.profile
    },
    token: 'mock-jwt-token'
  };
};

// Get user profile function
export const getUserProfile = async (userId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    if (response.ok) {
      const user = await response.json();
      return {
        ...user,
        id: user._id || user.id
      };
    }
  } catch (error) {
    console.warn('Failed to fetch user profile via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    id: userId,
    email: 'user@example.com',
    name: 'John Doe',
    userType: 'buyer',
    isActive: true,
    profile: {
      name: 'John Doe',
      email: 'user@example.com',
      phone: '+1234567890',
      userType: 'buyer'
    }
  };
};

// Update user profile function
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (response.ok) {
      const user = await response.json();
      return {
        success: true,
        user: {
          ...user,
          id: user._id || user.id
        }
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Update failed'
      };
    }
  } catch (error) {
    console.warn('Failed to update user profile via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(500);
  return {
    success: true,
    user: {
      id: userId,
      ...profileData,
      updatedAt: new Date().toISOString()
    }
  };
};

// Get user's cart items
export const getUserCart = async (userId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart`);
    if (response.ok) {
      const cart = await response.json();
      return cart;
    }
  } catch (error) {
    console.warn('Failed to fetch user cart via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    items: [],
    total: 0,
    count: 0
  };
};

// Add item to user's cart
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('Failed to add to cart via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    success: true,
    message: 'Item added to cart'
  };
};

// Remove item from user's cart
export const removeFromCart = async (userId, productId) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('Failed to remove from cart via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    success: true,
    message: 'Item removed from cart'
  };
};

// Get user's wishlist items
export const getUserWishlist = async (userId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`);
    if (response.ok) {
      const wishlist = await response.json();
      return wishlist;
    }
  } catch (error) {
    console.warn('Failed to fetch user wishlist via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    items: []
  };
};

// Add item to user's wishlist
export const addToWishlist = async (userId, productId) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('Failed to add to wishlist via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    success: true,
    message: 'Item added to wishlist'
  };
};

// Remove item from user's wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('Failed to remove from wishlist via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    success: true,
    message: 'Item removed from wishlist'
  };
};

// Get user's order history
export const getUserOrders = async (userId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/orders`);
    if (response.ok) {
      const orders = await response.json();
      return orders;
    }
  } catch (error) {
    console.warn('Failed to fetch user orders via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    orders: []
  };
};

// Get product details by ID
export const getProductById = async (productId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (response.ok) {
      const product = await response.json();
      // Ensure product has proper image property for compatibility
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // If images array exists, use the first image as the image property
        product.image = product.images[0];
      } else if (product.image) {
        // If single image property exists, ensure images array is also available
        product.images = [product.image];
      }
      return product;
    }
  } catch (error) {
    console.warn('Failed to fetch product via API, using mock data:', error);
  }
  
  // Fallback to mock implementation
  await delay(300);
  return {
    id: productId,
    name: `Product ${productId}`,
    price: 0,
    image: 'https://via.placeholder.com/100x100',
    seller: 'Seller Name'
  };
};

// Get multiple products by IDs
export const getProductsByIds = async (productIds) => {
  try {
    // Try to fetch via API
    const promises = productIds.map(id => getProductById(id));
    const products = await Promise.all(promises);
    return products;
  } catch (error) {
    console.warn('Failed to fetch products via API, using mock data:', error);
    // Fallback to mock implementation
    await delay(300);
    return productIds.map(id => ({
      id,
      name: `Product ${id}`,
      price: 0,
      image: 'https://via.placeholder.com/100x100',
      seller: 'Seller Name'
    }));
  }
};

export default {
  authenticateUser,
  createUser,
  getUserProfile,
  updateUserProfile,
  getUserCart,
  addToCart,
  removeFromCart,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserOrders,
  getProductById,
  getProductsByIds
};