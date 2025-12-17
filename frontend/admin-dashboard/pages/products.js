import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import ARPreview from '../components/ARPreview';
import ProductInsights from '../components/ProductInsights';
import PricingOptimizer from '../components/PricingOptimizer';
import SupplierRecommendations from '../components/SupplierRecommendations';
import CrossPlatformSync from '../components/CrossPlatformSync';
import ImageUploader from '../components/ImageUploader';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../utils/mongoService';
// Import CSV utilities
import { downloadCSV, readCSVFile } from '../utils/csvUtils';
// Import AI service
import { getProductSuggestions, suggestCategoryForProduct } from '../utils/aiService';
// Import predictive analytics
import { predictDemand, analyzeInventoryHealth, generateReorderSuggestions, forecastSeasonalTrends } from '../utils/predictiveAnalytics';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    images: [],
    thumbnail: '',
    isFeatured: false,
    isHotDeal: false,
    isPremium: false,
    discountPercentage: '',
    tags: [],
    specifications: {},
    // B2B-specific fields
    productType: 'B2C',
    moq: '',
    bulkPricing: [],
    leadTime: '',
    shippingOptions: [],
    certifications: [],
    supplierId: '',
    companyId: '',
    businessType: '',
    country: ''
  });
  const [importError, setImportError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analytics, setAnalytics] = useState({
    healthScore: 0,
    lowStockItems: 0,
    overstockedItems: 0,
    stockoutRisk: 0,
    recommendations: []
  });
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [seasonalForecasts, setSeasonalForecasts] = useState([]);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');
  const [arProduct, setArProduct] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      loadProducts();
      loadCategories();
    }
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      
      // Load analytics
      const healthAnalysis = await analyzeInventoryHealth(data);
      setAnalytics(healthAnalysis);
      
      const reorders = await generateReorderSuggestions(data);
      setReorderSuggestions(reorders);
      
      const forecasts = await forecastSeasonalTrends(data);
      setSeasonalForecasts(forecasts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Failed to load categories. Please try again.');
    }
  };

  const handleCreateProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.category) {
      try {
        const productData = {
          name: newProduct.name,
          description: newProduct.description || '',
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 0,
          sku: newProduct.sku || generateSKU(),
          images: newProduct.images || [],
          thumbnail: newProduct.thumbnail || (newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : ''),
          isFeatured: newProduct.isFeatured || false,
          isHotDeal: newProduct.isHotDeal || false,
          isPremium: newProduct.isPremium || false,
          discountPercentage: newProduct.discountPercentage ? parseFloat(newProduct.discountPercentage) : null,
          tags: newProduct.tags || [],
          specifications: newProduct.specifications || {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Call the actual API to create the product
        const product = await createProduct(productData);
        
        setProducts([...products, product]);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          sku: '',
          images: [],
          thumbnail: '',
          isFeatured: false,
          isHotDeal: false,
          isPremium: false,
          discountPercentage: '',
          tags: [],
          specifications: {}
        });
        setShowAddForm(false);
        
        // Refresh analytics
        const updatedProducts = [...products, product];
        const healthAnalysis = await analyzeInventoryHealth(updatedProducts);
        setAnalytics(healthAnalysis);
        
        const reorders = await generateReorderSuggestions(updatedProducts);
        setReorderSuggestions(reorders);
        
        // Refresh categories to update product counts
        loadCategories();
      } catch (error) {
        console.error('Error creating product:', error);
        alert('Failed to create product. Please try again.');
      }
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && editingProduct.name && editingProduct.price && editingProduct.category) {
      try {
        const updatedProduct = {
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock) || 0,
          thumbnail: editingProduct.thumbnail || (editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0] : ''),
          isFeatured: editingProduct.isFeatured || false,
          isHotDeal: editingProduct.isHotDeal || false,
          isPremium: editingProduct.isPremium || false,
          discountPercentage: editingProduct.discountPercentage ? parseFloat(editingProduct.discountPercentage) : null,
          tags: editingProduct.tags || [],
          specifications: editingProduct.specifications || {},
          updatedAt: new Date()
        };
        
        // Call the actual API to update the product
        const result = await updateProduct(editingProduct.id, updatedProduct);
        
        setProducts(products.map(prod => 
          prod.id === editingProduct.id ? result : prod
        ));
        
        setEditingProduct(null);
        
        // Refresh analytics
        const updatedProducts = products.map(prod => 
          prod.id === editingProduct.id ? result : prod
        );
        const healthAnalysis = await analyzeInventoryHealth(updatedProducts);
        setAnalytics(healthAnalysis);
        
        const reorders = await generateReorderSuggestions(updatedProducts);
        setReorderSuggestions(reorders);
        
        // Refresh categories to update product counts
        loadCategories();
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      }
    }
  };

  // Handle price updates from pricing optimizer
  const handlePriceUpdate = async (productId, newPrice) => {
    try {
      const productToUpdate = products.find(p => p.id === productId);
      if (!productToUpdate) return;

      const updatedProduct = {
        ...productToUpdate,
        price: parseFloat(newPrice),
        updatedAt: new Date()
      };

      // Call the actual API to update the product price
      const result = await updateProduct(productId, updatedProduct);

      setProducts(products.map(prod => 
        prod.id === productId ? result : prod
      ));

      // Refresh analytics
      const updatedProducts = products.map(prod => 
        prod.id === productId ? result : prod
      );
      const healthAnalysis = await analyzeInventoryHealth(updatedProducts);
      setAnalytics(healthAnalysis);
      
      const reorders = await generateReorderSuggestions(updatedProducts);
      setReorderSuggestions(reorders);
      
      // Refresh categories to update product counts if category changed
      if (productToUpdate.category !== result.category) {
        loadCategories();
      }
    } catch (error) {
      console.error('Error updating product price:', error);
      alert('Failed to update product price. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Call the actual API to delete the product
        const result = await deleteProduct(productId);
        
        if (result.success) {
          const updatedProducts = products.filter(prod => prod.id !== productId);
          setProducts(updatedProducts);
          
          // Refresh analytics
          const healthAnalysis = await analyzeInventoryHealth(updatedProducts);
          setAnalytics(healthAnalysis);
          
          const reorders = await generateReorderSuggestions(updatedProducts);
          setReorderSuggestions(reorders);
          
          // Refresh categories to update product counts
          loadCategories();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const generateSKU = () => {
    return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Handle search input with AI suggestions
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      try {
        const aiSuggestions = await getProductSuggestions(value, products);
        setSuggestions(aiSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Apply suggestion to search
  const applySuggestion = (product) => {
    setSearchTerm(product.name);
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-suggest category when creating a new product
  const handleProductNameChange = async (e) => {
    const name = e.target.value;
    setNewProduct({...newProduct, name});
    
    // Only suggest category if it's not already set
    if (name.length > 3 && !newProduct.category) {
      try {
        const suggestedCategory = await suggestCategoryForProduct(name, newProduct.description, categories);
        if (suggestedCategory) {
          setNewProduct(prev => ({...prev, category: suggestedCategory.name}));
        }
      } catch (error) {
        console.error('Error suggesting category:', error);
      }
    }
  };

  // Export products to CSV
  const handleExportProducts = () => {
    try {
      // Prepare data for export
      const exportData = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        stock: product.stock,
        sku: product.sku,
        createdAt: product.createdAt ? product.createdAt.toISOString() : '',
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : ''
      }));
      
      downloadCSV(exportData, 'products-export.csv');
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Failed to export products. Please try again.');
    }
  };

  // Import products from CSV
  const handleImportProducts = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setImportError('');
      const csvData = await readCSVFile(file);
      
      // Validate required fields
      const requiredFields = ['name', 'price', 'category'];
      const missingFields = requiredFields.filter(field => !csvData[0] || !(field in csvData[0]));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Process imported data
      const importedProducts = csvData.map((row, index) => ({
        id: row.id || Date.now() + index,
        name: row.name,
        description: row.description || '',
        price: parseFloat(row.price),
        category: row.category,
        stock: parseInt(row.stock) || 0,
        sku: row.sku || generateSKU(),
        images: [],
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      }));
      
      // Create products via API
      const createdProducts = [];
      for (const productData of importedProducts) {
        try {
          const createdProduct = await createProduct(productData);
          createdProducts.push(createdProduct);
        } catch (error) {
          console.error('Error creating product:', error);
        }
      }
      
      setProducts(prev => [...prev, ...createdProducts]);
      alert(`Successfully imported ${createdProducts.length} products.`);
      
      // Refresh analytics
      const updatedProducts = [...products, ...createdProducts];
      const healthAnalysis = await analyzeInventoryHealth(updatedProducts);
      setAnalytics(healthAnalysis);
      
      const reorders = await generateReorderSuggestions(updatedProducts);
      setReorderSuggestions(reorders);
      
      // Refresh categories to update product counts
      loadCategories();
    } catch (error) {
      console.error('Error importing products:', error);
      setImportError(error.message || 'Failed to import products. Please check the file format.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string sorting
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const uniqueCategories = [...new Set(products.map(p => p.category))];

  return (
    <AdminLayout title="Advanced Products Management">
      <Head>
        <title>Advanced Products Management</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Advanced Products Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your product catalog with advanced features
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                onClick={() => setShowInsights(!showInsights)}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {showInsights ? 'Hide Insights' : 'Show Insights'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowAddForm(true)}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Product
              </button>
            </div>
          </div>

          {/* Search Bar with AI Suggestions */}
          <div className="mt-6 relative">
            <div className="relative rounded-md shadow-sm max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                ref={searchInputRef}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 sm:text-sm"
                placeholder="Search products... (AI-powered suggestions available)"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              />
            </div>
            
            {/* AI Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg">
                <div className="rounded-md py-1">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    AI-Powered Suggestions
                  </div>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => applySuggestion(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {product.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {product.category} • ${product.price?.toFixed(2)} • SKU: {product.sku}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Import/Export Buttons */}
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={handleExportProducts}
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9.707 7.293a1 1 0 010-1.414l3-3a1 1 0 011.414 1.414L11.414 7H15a1 1 0 110 2h-3.586l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Import CSV
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleImportProducts}
            />
          </div>
          
          {/* Import Error Message */}
          {importError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {importError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Category Filter */}
              <select
                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {/* Sort */}
              <select
                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="stock-asc">Stock (Low-High)</option>
                <option value="stock-desc">Stock (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Add/Edit Product Form Modal */}
          {(showAddForm || editingProduct) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        id="product-name"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Enter product name"
                        value={editingProduct ? editingProduct.name : newProduct.name}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, name: e.target.value})
                            : handleProductNameChange(e)
                        }
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        id="product-price"
                        step="0.01"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="0.00"
                        value={editingProduct ? editingProduct.price : newProduct.price}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, price: e.target.value})
                            : setNewProduct({...newProduct, price: e.target.value})
                        }
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category *
                      </label>
                      <select
                        id="product-category"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        value={editingProduct ? editingProduct.category : newProduct.category}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, category: e.target.value})
                            : setNewProduct({...newProduct, category: e.target.value})
                        }
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        id="product-stock"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="0"
                        value={editingProduct ? editingProduct.stock : newProduct.stock}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, stock: e.target.value})
                            : setNewProduct({...newProduct, stock: e.target.value})
                        }
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="product-sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        SKU
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="product-sku"
                          className="flex-1 min-w-0 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md"
                          placeholder="Enter SKU or leave blank to auto-generate"
                          value={editingProduct ? editingProduct.sku : newProduct.sku}
                          onChange={(e) => 
                            editingProduct 
                              ? setEditingProduct({...editingProduct, sku: e.target.value})
                              : setNewProduct({...newProduct, sku: e.target.value})
                          }
                        />
                        {!editingProduct && (
                          <button
                            type="button"
                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm"
                            onClick={() => setNewProduct({...newProduct, sku: generateSKU()})}
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="product-description"
                        rows={3}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Enter product description"
                        value={editingProduct ? editingProduct.description : newProduct.description}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, description: e.target.value})
                            : setNewProduct({...newProduct, description: e.target.value})
                        }
                      />
                    </div>
                    
                    {/* Premium Product Options */}
                    <div className="sm:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Product Visibility Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <input
                            id="is-featured"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={editingProduct ? editingProduct.isFeatured : newProduct.isFeatured}
                            onChange={(e) => 
                              editingProduct 
                                ? setEditingProduct({...editingProduct, isFeatured: e.target.checked})
                                : setNewProduct({...newProduct, isFeatured: e.target.checked})
                            }
                          />
                          <label htmlFor="is-featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                            Featured Product
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="is-hot-deal"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={editingProduct ? editingProduct.isHotDeal : newProduct.isHotDeal}
                            onChange={(e) => 
                              editingProduct 
                                ? setEditingProduct({...editingProduct, isHotDeal: e.target.checked})
                                : setNewProduct({...newProduct, isHotDeal: e.target.checked})
                            }
                          />
                          <label htmlFor="is-hot-deal" className="ml-2 block text-sm text-gray-900 dark:text-white">
                            Hot Deal
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="is-premium"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={editingProduct ? editingProduct.isPremium : newProduct.isPremium}
                            onChange={(e) => 
                              editingProduct 
                                ? setEditingProduct({...editingProduct, isPremium: e.target.checked})
                                : setNewProduct({...newProduct, isPremium: e.target.checked})
                            }
                          />
                          <label htmlFor="is-premium" className="ml-2 block text-sm text-gray-900 dark:text-white">
                            Premium Product
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Discount Option */}
                    <div className="sm:col-span-2">
                      <label htmlFor="discount-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Percentage
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          id="discount-percentage"
                          min="0"
                          max="100"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="0"
                          value={editingProduct ? editingProduct.discountPercentage : newProduct.discountPercentage}
                          onChange={(e) => 
                            editingProduct 
                              ? setEditingProduct({...editingProduct, discountPercentage: e.target.value})
                              : setNewProduct({...newProduct, discountPercentage: e.target.value})
                          }
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set a discount percentage for this product</p>
                    </div>
                    
                    {/* Image Uploader */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Images
                      </label>
                      <ImageUploader 
                        onImagesChange={(images) => {
                          const imageUrls = images.map(img => img.url);
                          editingProduct 
                            ? setEditingProduct({
                                ...editingProduct, 
                                images: imageUrls,
                                // Only set thumbnail to first image if no thumbnail is already set
                                thumbnail: editingProduct.thumbnail || imageUrls[0] || ''
                              })
                            : setNewProduct({
                                ...newProduct, 
                                images: imageUrls,
                                // For new products, set thumbnail to first image
                                thumbnail: imageUrls[0] || ''
                              });
                        }}
                        initialImages={editingProduct ? editingProduct.images?.map(url => ({url})) : newProduct.images?.map(url => ({url})) || []}
                        maxImages={10}
                      />
                      
                      {/* Thumbnail Selection */}
                      {editingProduct && editingProduct.images && editingProduct.images.length > 1 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Thumbnail
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {editingProduct.images.map((imageUrl, index) => (
                              <div 
                                key={index} 
                                className={`relative cursor-pointer border-2 rounded ${editingProduct.thumbnail === imageUrl ? 'border-blue-500' : 'border-gray-300'}`}
                                onClick={() => setEditingProduct({...editingProduct, thumbnail: imageUrl})}
                              >
                                <img 
                                  src={imageUrl} 
                                  alt={`Thumbnail ${index + 1}`} 
                                  className="w-16 h-16 object-cover"
                                />
                                {editingProduct.thumbnail === imageUrl && (
                                  <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Predictive Analytics Dashboard */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Predictive Analytics Dashboard
            </h2>
            
            {/* Analytics Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveAnalyticsTab('overview')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeAnalyticsTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveAnalyticsTab('reorder')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeAnalyticsTab === 'reorder'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Reorder Suggestions
                </button>
                <button
                  onClick={() => setActiveAnalyticsTab('seasonal')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeAnalyticsTab === 'seasonal'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Seasonal Forecasts
                </button>
              </nav>
            </div>
            
            {/* Analytics Content */}
            {activeAnalyticsTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Inventory Health
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.healthScore}%
                              </div>
                              <div className={`ml-2 text-sm font-medium ${
                                analytics.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                analytics.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {analytics.healthScore >= 80 ? 'Excellent' :
                                 analytics.healthScore >= 60 ? 'Good' : 'Needs Attention'}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                          <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Low Stock Items
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.lowStockItems}
                              </div>
                              <div className="ml-2 text-sm font-medium text-red-600 dark:text-red-400">
                                {analytics.stockoutRisk}% Risk
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Overstocked Items
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {analytics.overstockedItems}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                          <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total Products
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {products.length}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                {analytics.recommendations && analytics.recommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      AI Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {analytics.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {rec}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeAnalyticsTab === 'reorder' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Reorder Suggestions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Based on current stock levels and predicted demand
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {reorderSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No immediate reorder suggestions at this time.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reorderSuggestions.map((product) => (
                        <li key={product.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.category} • Stock: {product.stock}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-sm text-gray-900 dark:text-white mr-4">
                                <span className="font-medium">Need:</span> {product.quantityNeeded}
                              </div>
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Reorder
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            {activeAnalyticsTab === 'seasonal' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Seasonal Demand Forecasts
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Predicted seasonal trends for your products
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {seasonalForecasts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No significant seasonal trends detected for your products.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {seasonalForecasts.map((product) => (
                        <li key={product.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.category} • Expected {product.expectedSalesIncrease > 0 ? '+' : ''}{product.expectedSalesIncrease} units
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.isPeakSeason 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {product.isPeakSeason ? 'Peak Season' : 'Normal'}
                              </div>
                              <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                x{product.expectedMultiplier}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {product.recommendation}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Product Catalog
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sortedProducts.length} products
              </span>
            </div>
            
            <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || filterCategory ? 'No products match your filters' : 'No products found'}
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock > 50 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : product.stock > 10 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setArProduct(product)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                          >
                            AR Preview
                          </button>
                          <button
                            onClick={() => setEditingProduct({...product})}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AR Preview Modal */}
          {arProduct && (
            <ARPreview 
              product={arProduct} 
              onClose={() => setArProduct(null)} 
            />
          )}
          
          {/* Advanced Product Insights */}
          {showInsights && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Advanced Product Insights
                </h2>
                <button 
                  onClick={() => setShowInsights(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Close
                </button>
              </div>
              <ProductInsights products={products} />
            </div>
          )}
          
          {/* Pricing Optimizer */}
          <div className="mt-8">
            <PricingOptimizer products={products} onUpdatePrice={handlePriceUpdate} />
          </div>
          
          {/* Supplier Recommendations */}
          <div className="mt-8">
            <SupplierRecommendations products={products} />
          </div>
          
          {/* Cross-Platform Sync */}
          <div className="mt-8">
            <CrossPlatformSync products={products} categories={categories} />
          </div>
          
          {/* Product Analytics */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Product Insights
            </h2>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Products
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {products.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Avg. Price
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {products.length > 0 
                              ? '$' + (products.reduce((sum, prod) => sum + prod.price, 0) / products.length).toFixed(2)
                              : '$0.00'}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Low Stock Items
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {products.filter(p => p.stock < 10).length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Categories
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {uniqueCategories.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}