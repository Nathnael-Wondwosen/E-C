// User service utility for customer portal
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getAuthHeaders = (extraHeaders = {}) => {
  if (typeof window === 'undefined') {
    return extraHeaders;
  }

  const token = localStorage.getItem('userToken');
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

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
        message: error.error || error.message || 'Authentication failed'
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
        message: error.error || error.message || 'Registration failed'
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

// Google authentication (sign in / sign up)
export const authenticateWithGoogle = async (credential, userType = 'buyer') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential, userType }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        user: result.user,
        token: result.token
      };
    }

    const error = await response.json();
    return {
      success: false,
      message: error.error || error.message || 'Google authentication failed'
    };
  } catch (error) {
    console.warn('Failed Google authentication via API:', error);
    return {
      success: false,
      message: 'Google authentication failed'
    };
  }
};

export const getGoogleAuthConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google/config`);
    if (!response.ok) {
      return { configured: false, clientId: '' };
    }

    const result = await response.json();
    return {
      configured: Boolean(result?.configured && result?.clientId),
      clientId: result?.clientId || ''
    };
  } catch (error) {
    console.warn('Failed to load Google auth config via API:', error);
    return { configured: false, clientId: '' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: payload.error || payload.message || 'Failed to start password reset',
      };
    }

    return {
      success: true,
      message: payload.message || 'Password reset request submitted',
      resetToken: payload.resetToken || '',
      expiresAt: payload.expiresAt || '',
    };
  } catch (error) {
    console.warn('Failed to request password reset:', error);
    return {
      success: false,
      message: 'Failed to start password reset',
    };
  }
};

export const validatePasswordResetToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
    const payload = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: payload.error || payload.message || 'Invalid or expired reset token',
      };
    }
    return {
      success: true,
      message: payload.message || 'Token is valid',
    };
  } catch (error) {
    console.warn('Failed to validate password reset token:', error);
    return {
      success: false,
      message: 'Failed to validate reset token',
    };
  }
};

export const resetPasswordWithToken = async (token, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });
    const payload = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: payload.error || payload.message || 'Failed to reset password',
      };
    }
    return {
      success: true,
      message: payload.message || 'Password reset successfully',
    };
  } catch (error) {
    console.warn('Failed to reset password:', error);
    return {
      success: false,
      message: 'Failed to reset password',
    };
  }
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: payload.error || payload.message || 'Failed to change password',
      };
    }
    return {
      success: true,
      message: payload.message || 'Password changed successfully',
    };
  } catch (error) {
    console.warn('Failed to change password:', error);
    return {
      success: false,
      message: 'Failed to change password',
    };
  }
};

// Get user profile function
export const getUserProfile = async (userId) => {
  try {
    // Try to fetch via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: getAuthHeaders()
    });
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
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart`, {
      headers: getAuthHeaders()
    });
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
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
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

// Set cart item quantity (exact value)
export const updateCartItemQuantity = async (userId, productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
      },
      body: JSON.stringify({ quantity }),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('Failed to update cart quantity via API, using mock data:', error);
  }

  await delay(300);
  return {
    success: true,
    message: 'Cart quantity updated'
  };
};

// Remove item from user's cart
export const removeFromCart = async (userId, productId) => {
  try {
    // Try to update via API
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`, {
      headers: getAuthHeaders()
    });
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
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        ...getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/orders`, {
      headers: getAuthHeaders()
    });
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
  authenticateWithGoogle,
  getGoogleAuthConfig,
  requestPasswordReset,
  validatePasswordResetToken,
  resetPasswordWithToken,
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserOrders,
  getProductById,
  getProductsByIds
};
