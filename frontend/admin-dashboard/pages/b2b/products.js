import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ImageUploader from '../../components/ImageUploader';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../utils/mongoService';
// Import CSV utilities
import { downloadCSV, readCSVFile } from '../../utils/csvUtils';
// Import AI service
import { getProductSuggestions, suggestCategoryForProduct } from '../../utils/aiService';

export default function B2BProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [socialLinkInput, setSocialLinkInput] = useState('');
  const [newProduct, setNewProduct] = useState({
    // Core product fields
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
    productType: 'B2B',
    postAs: 'seller', // 'buyer' or 'seller'
    qualityGrade: '', // Open text field for quality grades
    quantity: '', // Numeric quantity
    unit: 'pc', // Default unit
    moq: '',
    destination: '', // For buyer posts
    countryOfOrigin: '',
    paymentTerms: '',
    phone: '',
    email: '',
    website: '',
    socialLinks: [],
    
    // Advanced fields (collapsed by default)
    bulkPricing: [],
    leadTime: '',
    shippingOptions: [],
    certifications: [],
    supplierId: '',
    companyId: '',
    businessType: ''
  });
  const [bulkTier, setBulkTier] = useState({ quantity: '', price: '' });
  const [certificationInput, setCertificationInput] = useState('');
  const [shippingOptionInput, setShippingOptionInput] = useState('');
  const [importError, setImportError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Collapsible sections state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
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
      // Filter for B2B products only
      const b2bProducts = data.filter(product => product.productType === 'B2B');
      setProducts(b2bProducts);
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
          // B2B-specific fields
          productType: 'B2B',
          postAs: newProduct.postAs || 'seller',
          moq: newProduct.moq ? parseInt(newProduct.moq) : null,
          destination: newProduct.destination || null,
          countryOfOrigin: newProduct.countryOfOrigin || null,
          paymentTerms: newProduct.paymentTerms || '',
          phone: newProduct.phone || '',
          email: newProduct.email || '',
          website: newProduct.website || '',
          socialLinks: newProduct.socialLinks || [],
          bulkPricing: newProduct.bulkPricing || [],
          leadTime: newProduct.leadTime ? parseInt(newProduct.leadTime) : null,
          shippingOptions: newProduct.shippingOptions || [],
          certifications: newProduct.certifications || [],
          supplierId: newProduct.supplierId || null,
          companyId: newProduct.companyId || null,
          businessType: newProduct.businessType || null,
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
          specifications: {},
          // B2B-specific fields
          productType: 'B2B',
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
        setShowAddForm(false);
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
          // B2B-specific fields
          productType: 'B2B',
          postAs: editingProduct.postAs || 'seller',
          moq: editingProduct.moq ? parseInt(editingProduct.moq) : null,
          destination: editingProduct.destination || null,
          countryOfOrigin: editingProduct.countryOfOrigin || null,
          paymentTerms: editingProduct.paymentTerms || '',
          phone: editingProduct.phone || '',
          email: editingProduct.email || '',
          website: editingProduct.website || '',
          socialLinks: editingProduct.socialLinks || [],
          bulkPricing: editingProduct.bulkPricing || [],
          leadTime: editingProduct.leadTime ? parseInt(editingProduct.leadTime) : null,
          shippingOptions: editingProduct.shippingOptions || [],
          certifications: editingProduct.certifications || [],
          supplierId: editingProduct.supplierId || null,
          companyId: editingProduct.companyId || null,
          businessType: editingProduct.businessType || null,
          updatedAt: new Date()
        };
        
        // Call the actual API to update the product
        const result = await updateProduct(editingProduct.id, updatedProduct);
        
        setProducts(products.map(prod => 
          prod.id === editingProduct.id ? result : prod
        ));
        
        setEditingProduct(null);
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this B2B product?')) {
      try {
        // Call the actual API to delete the product
        const result = await deleteProduct(productId);
        
        if (result.success) {
          const updatedProducts = products.filter(prod => prod.id !== productId);
          setProducts(updatedProducts);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const generateSKU = () => {
    return 'B2B-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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
        postAs: product.postAs || 'seller',
        moq: product.moq || '',
        destination: product.destination || '',
        countryOfOrigin: product.countryOfOrigin || '',
        leadTime: product.leadTime || '',
        businessType: product.businessType || '',
        paymentTerms: product.paymentTerms || '',
        phone: product.phone || '',
        email: product.email || '',
        website: product.website || '',
        socialLinks: (product.socialLinks || []).join('; '),
        createdAt: product.createdAt ? product.createdAt.toISOString() : '',
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : ''
      }));
      
      downloadCSV(exportData, 'b2b-products-export.csv');
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
        postAs: row.postAs || 'seller',
        moq: row.moq ? parseInt(row.moq) : null,
        destination: row.destination || null,
        countryOfOrigin: row.countryOfOrigin || null,
        leadTime: row.leadTime ? parseInt(row.leadTime) : null,
        businessType: row.businessType || null,
        paymentTerms: row.paymentTerms || '',
        phone: row.phone || '',
        email: row.email || '',
        website: row.website || '',
        socialLinks: row.socialLinks ? row.socialLinks.split('; ') : [],
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      }));
      
      // Create products via API
      const createdProducts = [];
      for (const productData of importedProducts) {
        try {
          const product = await createProduct({
            ...productData,
            productType: 'B2B'
          });
          createdProducts.push(product);
        } catch (error) {
          console.error(`Error importing product ${productData.name}:`, error);
        }
      }
      
      setProducts([...products, ...createdProducts]);
      alert(`Successfully imported ${createdProducts.length} products.`);
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error importing products:', error);
      setImportError(error.message || 'Failed to import products. Please check the file format and try again.');
    }
  };

  // Add bulk pricing tier
  const addBulkTier = () => {
    if (bulkTier.quantity && bulkTier.price) {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          bulkPricing: [...editingProduct.bulkPricing, {
            quantity: parseInt(bulkTier.quantity),
            price: parseFloat(bulkTier.price)
          }]
        });
      } else {
        setNewProduct({
          ...newProduct,
          bulkPricing: [...newProduct.bulkPricing, {
            quantity: parseInt(bulkTier.quantity),
            price: parseFloat(bulkTier.price)
          }]
        });
      }
      setBulkTier({ quantity: '', price: '' });
    }
  };

  // Remove bulk pricing tier
  const removeBulkTier = (index) => {
    if (editingProduct) {
      const updatedBulkPricing = [...editingProduct.bulkPricing];
      updatedBulkPricing.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        bulkPricing: updatedBulkPricing
      });
    } else {
      const updatedBulkPricing = [...newProduct.bulkPricing];
      updatedBulkPricing.splice(index, 1);
      setNewProduct({
        ...newProduct,
        bulkPricing: updatedBulkPricing
      });
    }
  };

  // Add certification
  const addCertification = () => {
    if (certificationInput.trim()) {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          certifications: [...editingProduct.certifications, certificationInput.trim()]
        });
      } else {
        setNewProduct({
          ...newProduct,
          certifications: [...newProduct.certifications, certificationInput.trim()]
        });
      }
      setCertificationInput('');
    }
  };

  // Remove certification
  const removeCertification = (index) => {
    if (editingProduct) {
      const updatedCertifications = [...editingProduct.certifications];
      updatedCertifications.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        certifications: updatedCertifications
      });
    } else {
      const updatedCertifications = [...newProduct.certifications];
      updatedCertifications.splice(index, 1);
      setNewProduct({
        ...newProduct,
        certifications: updatedCertifications
      });
    }
  };

  // Add shipping option
  const addShippingOption = () => {
    if (shippingOptionInput.trim()) {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          shippingOptions: [...editingProduct.shippingOptions, shippingOptionInput.trim()]
        });
      } else {
        setNewProduct({
          ...newProduct,
          shippingOptions: [...newProduct.shippingOptions, shippingOptionInput.trim()]
        });
      }
      setShippingOptionInput('');
    }
  };

  // Remove shipping option
  const removeShippingOption = (index) => {
    if (editingProduct) {
      const updatedShippingOptions = [...editingProduct.shippingOptions];
      updatedShippingOptions.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        shippingOptions: updatedShippingOptions
      });
    } else {
      const updatedShippingOptions = [...newProduct.shippingOptions];
      updatedShippingOptions.splice(index, 1);
      setNewProduct({
        ...newProduct,
        shippingOptions: updatedShippingOptions
      });
    }
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'postAs':
        aValue = a.postAs || '';
        bValue = b.postAs || '';
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>B2B Products Management | Admin Dashboard</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">B2B Products Management</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Manage your B2B products, including bulk pricing, MOQ, and supplier information.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              onClick={() => setShowAddForm(true)}
            >
              Add B2B Product
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Search B2B products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm dark:bg-gray-800">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 dark:hover:bg-gray-700"
                    onClick={() => applySuggestion(product)}
                  >
                    <div className="flex items-center">
                      <span className="font-normal truncate">{product.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
              <option value="postAs-asc">Post Type (A-Z)</option>
              <option value="postAs-desc">Post Type (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            onClick={handleExportProducts}
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export
          </button>
          
          <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Import
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleImportProducts}
            />
          </label>
          
          {importError && (
            <div className="text-red-600 text-sm mt-2">{importError}</div>
          )}
        </div>

        {/* Products Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                        Product
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Price
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Post Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Stock
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No B2B products found.{' '}
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => setShowAddForm(true)}
                          >
                            Add your first B2B product
                          </button>
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            <div className="flex items-center">
                              {product.thumbnail ? (
                                <img className="h-10 w-10 rounded-md object-cover" src={product.thumbnail} alt={product.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-gray-500 dark:text-gray-400">{product.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {product.category}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {product.postAs === 'buyer' ? 'Buyer' : 'Seller'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {product.postAs === 'buyer' ? (product.destination || '-') : (product.countryOfOrigin || '-')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className={product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
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
          </div>
        </div>

        {/* Add/Edit Product Form Modal */}
        {(showAddForm || editingProduct) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingProduct ? 'Edit B2B Product' : 'Add New B2B Product'}
                </h3>
                
                <div className="space-y-6">
                  {/* Post Type Selection */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Post As</h4>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          name="post-as"
                          checked={editingProduct ? editingProduct.postAs === 'seller' : newProduct.postAs === 'seller'}
                          onChange={() => 
                            editingProduct 
                              ? setEditingProduct({...editingProduct, postAs: 'seller'})
                              : setNewProduct({...newProduct, postAs: 'seller'})
                          }
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Seller</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          name="post-as"
                          checked={editingProduct ? editingProduct.postAs === 'buyer' : newProduct.postAs === 'buyer'}
                          onChange={() => 
                            editingProduct 
                              ? setEditingProduct({...editingProduct, postAs: 'buyer'})
                              : setNewProduct({...newProduct, postAs: 'buyer'})
                          }
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Buyer</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Core Product Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Product Information</h4>
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
                      
                      {/* Conditional fields based on post type */}
                      {editingProduct ? 
                        (editingProduct.postAs === 'buyer' ? (
                          <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Destination *
                            </label>
                            <input
                              type="text"
                              id="destination"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter destination"
                              value={editingProduct.destination || ''}
                              onChange={(e) => setEditingProduct({...editingProduct, destination: e.target.value})}
                            />
                          </div>
                        ) : (
                          <div>
                            <label htmlFor="country-of-origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Country of Origin *
                            </label>
                            <input
                              type="text"
                              id="country-of-origin"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter country of origin"
                              value={editingProduct.countryOfOrigin || ''}
                              onChange={(e) => setEditingProduct({...editingProduct, countryOfOrigin: e.target.value})}
                            />
                          </div>
                        )) : 
                        (newProduct.postAs === 'buyer' ? (
                          <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Destination *
                            </label>
                            <input
                              type="text"
                              id="destination"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter destination"
                              value={newProduct.destination || ''}
                              onChange={(e) => setNewProduct({...newProduct, destination: e.target.value})}
                            />
                          </div>
                        ) : (
                          <div>
                            <label htmlFor="country-of-origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Country of Origin *
                            </label>
                            <input
                              type="text"
                              id="country-of-origin"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter country of origin"
                              value={newProduct.countryOfOrigin || ''}
                              onChange={(e) => setNewProduct({...newProduct, countryOfOrigin: e.target.value})}
                            />
                          </div>
                        ))
                      }
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Product Details
                        </label>
                        <textarea
                          id="product-description"
                          rows={4}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="Enter detailed product information"
                          value={editingProduct ? editingProduct.description : newProduct.description}
                          onChange={(e) => 
                            editingProduct 
                              ? setEditingProduct({...editingProduct, description: e.target.value})
                              : setNewProduct({...newProduct, description: e.target.value})
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information - Collapsible Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      type="button"
                      className="flex justify-between items-center w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg"
                      onClick={() => setShowContactInfo(!showContactInfo)}
                    >
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Contact Information</h4>
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${showContactInfo ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showContactInfo && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="payment-terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Payment Terms
                            </label>
                            <input
                              type="text"
                              id="payment-terms"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter payment terms"
                              value={editingProduct ? editingProduct.paymentTerms : newProduct.paymentTerms}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, paymentTerms: e.target.value})
                                  : setNewProduct({...newProduct, paymentTerms: e.target.value})
                              }
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Phone
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter phone number"
                              value={editingProduct ? editingProduct.phone : newProduct.phone}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, phone: e.target.value})
                                  : setNewProduct({...newProduct, phone: e.target.value})
                              }
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email *
                            </label>
                            <input
                              type="email"
                              id="email"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter email address"
                              value={editingProduct ? editingProduct.email : newProduct.email}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, email: e.target.value})
                                  : setNewProduct({...newProduct, email: e.target.value})
                              }
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Website
                            </label>
                            <input
                              type="url"
                              id="website"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="https://example.com"
                              value={editingProduct ? editingProduct.website : newProduct.website}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, website: e.target.value})
                                  : setNewProduct({...newProduct, website: e.target.value})
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bulk Pricing */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Bulk Pricing</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="bulk-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="bulk-quantity"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="Quantity"
                          value={bulkTier.quantity}
                          onChange={(e) => setBulkTier({...bulkTier, quantity: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="bulk-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          id="bulk-price"
                          step="0.01"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="Price"
                          value={bulkTier.price}
                          onChange={(e) => setBulkTier({...bulkTier, price: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={addBulkTier}
                        >
                          Add Tier
                        </button>
                      </div>
                    </div>
                    
                    {/* Display existing bulk pricing tiers */}
                    {(editingProduct ? editingProduct.bulkPricing : newProduct.bulkPricing).length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Tiers</h5>
                        <div className="space-y-2">
                          {(editingProduct ? editingProduct.bulkPricing : newProduct.bulkPricing).map((tier, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <span className="text-sm">
                                {tier.quantity}+ units at ${tier.price.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => removeBulkTier(index)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Links - Collapsible Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      type="button"
                      className="flex justify-between items-center w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg"
                      onClick={() => setShowSocialLinks(!showSocialLinks)}
                    >
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Social Media Links</h4>
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${showSocialLinks ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showSocialLinks && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter social media link"
                              value={socialLinkInput}
                              onChange={(e) => setSocialLinkInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => {
                                if (socialLinkInput.trim()) {
                                  const links = editingProduct ? [...editingProduct.socialLinks] : [...newProduct.socialLinks];
                                  links.push(socialLinkInput.trim());
                                  editingProduct 
                                    ? setEditingProduct({...editingProduct, socialLinks: links})
                                    : setNewProduct({...newProduct, socialLinks: links});
                                  setSocialLinkInput('');
                                }
                              }}
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Display existing social links */}
                          {(editingProduct ? editingProduct.socialLinks : newProduct.socialLinks).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(editingProduct ? editingProduct.socialLinks : newProduct.socialLinks).map((link, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                  {link}
                                  <button
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white dark:hover:bg-purple-800 dark:hover:text-purple-200"
                                    onClick={() => {
                                      const links = editingProduct ? [...editingProduct.socialLinks] : [...newProduct.socialLinks];
                                      links.splice(index, 1);
                                      editingProduct 
                                        ? setEditingProduct({...editingProduct, socialLinks: links})
                                        : setNewProduct({...newProduct, socialLinks: links});
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Advanced Options - Collapsible Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      type="button"
                      className="flex justify-between items-center w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Advanced Options</h4>
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showAdvancedOptions && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
                        {/* MOQ and Lead Time */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="product-moq" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Minimum Order Quantity (MOQ)
                            </label>
                            <input
                              type="number"
                              id="product-moq"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter MOQ"
                              value={editingProduct ? editingProduct.moq : newProduct.moq}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, moq: e.target.value})
                                  : setNewProduct({...newProduct, moq: e.target.value})
                              }
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="product-lead-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Lead Time (days)
                            </label>
                            <input
                              type="number"
                              id="product-lead-time"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter lead time"
                              value={editingProduct ? editingProduct.leadTime : newProduct.leadTime}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, leadTime: e.target.value})
                                  : setNewProduct({...newProduct, leadTime: e.target.value})
                              }
                            />
                          </div>
                        </div>
                        
                        {/* Business Type and IDs */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="product-business-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Business Type
                            </label>
                            <select
                              id="product-business-type"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              value={editingProduct ? editingProduct.businessType : newProduct.businessType}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, businessType: e.target.value})
                                  : setNewProduct({...newProduct, businessType: e.target.value})
                              }
                            >
                              <option value="">Select business type</option>
                              <option value="manufacturer">Manufacturer</option>
                              <option value="distributor">Distributor</option>
                              <option value="wholesaler">Wholesaler</option>
                              <option value="retailer">Retailer</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="product-supplier-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Supplier ID
                            </label>
                            <input
                              type="text"
                              id="product-supplier-id"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter supplier ID"
                              value={editingProduct ? editingProduct.supplierId : newProduct.supplierId}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, supplierId: e.target.value})
                                  : setNewProduct({...newProduct, supplierId: e.target.value})
                              }
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="product-company-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Company ID
                            </label>
                            <input
                              type="text"
                              id="product-company-id"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter company ID"
                              value={editingProduct ? editingProduct.companyId : newProduct.companyId}
                              onChange={(e) => 
                                editingProduct 
                                  ? setEditingProduct({...editingProduct, companyId: e.target.value})
                                  : setNewProduct({...newProduct, companyId: e.target.value})
                              }
                            />
                          </div>
                        </div>
                        
                        {/* Bulk Pricing */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Bulk Pricing</h5>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                              <label htmlFor="bulk-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quantity
                              </label>
                              <input
                                type="number"
                                id="bulk-quantity"
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                placeholder="Quantity"
                                value={bulkTier.quantity}
                                onChange={(e) => setBulkTier({...bulkTier, quantity: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="bulk-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Price ($)
                              </label>
                              <input
                                type="number"
                                id="bulk-price"
                                step="0.01"
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                placeholder="Price"
                                value={bulkTier.price}
                                onChange={(e) => setBulkTier({...bulkTier, price: e.target.value})}
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <button
                                type="button"
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={addBulkTier}
                              >
                                Add Tier
                              </button>
                            </div>
                          </div>
                          
                          {/* Display existing bulk pricing tiers */}
                          {(editingProduct ? editingProduct.bulkPricing : newProduct.bulkPricing).length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Tiers</h6>
                              <div className="space-y-2">
                                {(editingProduct ? editingProduct.bulkPricing : newProduct.bulkPricing).map((tier, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <span className="text-sm">
                                      {tier.quantity}+ units at ${tier.price.toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      onClick={() => removeBulkTier(index)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Certifications */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Certifications</h5>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter certification"
                              value={certificationInput}
                              onChange={(e) => setCertificationInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={addCertification}
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Display existing certifications */}
                          {(editingProduct ? editingProduct.certifications : newProduct.certifications).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(editingProduct ? editingProduct.certifications : newProduct.certifications).map((cert, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                  {cert}
                                  <button
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white dark:hover:bg-blue-800 dark:hover:text-blue-200"
                                    onClick={() => removeCertification(index)}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Shipping Options */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Shipping Options</h5>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              placeholder="Enter shipping option"
                              value={shippingOptionInput}
                              onChange={(e) => setShippingOptionInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={addShippingOption}
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Display existing shipping options */}
                          {(editingProduct ? editingProduct.shippingOptions : newProduct.shippingOptions).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(editingProduct ? editingProduct.shippingOptions : newProduct.shippingOptions).map((option, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  {option}
                                  <button
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white dark:hover:bg-green-800 dark:hover:text-green-200"
                                    onClick={() => removeShippingOption(index)}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Visibility Options */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Product Visibility Options</h4>
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
                  <div>
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
                  <div>
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
      </div>
    </AdminLayout>
  );
}