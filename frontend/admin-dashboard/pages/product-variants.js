import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import { getProducts, updateProduct } from '../utils/mongoService';

export default function ProductVariants() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [variantGroups, setVariantGroups] = useState([]);
  const [newVariantGroup, setNewVariantGroup] = useState({
    name: '',
    attributes: [{ name: '', values: [''] }]
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonAttributes, setComparisonAttributes] = useState([
    'name', 'price', 'category', 'stock', 'description'
  ]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      loadProducts();
    }
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection for comparison
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Add attribute to variant group
  const addAttribute = () => {
    setNewVariantGroup(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', values: [''] }]
    }));
  };

  // Add value to attribute
  const addAttributeValue = (attrIndex) => {
    setNewVariantGroup(prev => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[attrIndex].values.push('');
      return { ...prev, attributes: updatedAttributes };
    });
  };

  // Update attribute name
  const updateAttributeName = (attrIndex, name) => {
    setNewVariantGroup(prev => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[attrIndex].name = name;
      return { ...prev, attributes: updatedAttributes };
    });
  };

  // Update attribute value
  const updateAttributeValue = (attrIndex, valIndex, value) => {
    setNewVariantGroup(prev => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[attrIndex].values[valIndex] = value;
      return { ...prev, attributes: updatedAttributes };
    });
  };

  // Remove attribute
  const removeAttribute = (attrIndex) => {
    setNewVariantGroup(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, index) => index !== attrIndex)
    }));
  };

  // Remove attribute value
  const removeAttributeValue = (attrIndex, valIndex) => {
    setNewVariantGroup(prev => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[attrIndex].values = updatedAttributes[attrIndex].values.filter((_, index) => index !== valIndex);
      return { ...prev, attributes: updatedAttributes };
    });
  };

  // Save variant group
  const saveVariantGroup = () => {
    if (newVariantGroup.name && newVariantGroup.attributes.length > 0) {
      setVariantGroups(prev => [...prev, { ...newVariantGroup, id: Date.now() }]);
      setNewVariantGroup({
        name: '',
        attributes: [{ name: '', values: [''] }]
      });
    }
  };

  // Generate product variants
  const generateVariants = (groupId) => {
    const group = variantGroups.find(g => g.id === groupId);
    if (!group) return;

    // In a real implementation, this would create actual product variants
    alert(`Would generate ${group.attributes.reduce((total, attr) => total * attr.values.length, 1)} variants for ${group.name}`);
  };

  // Toggle comparison attribute
  const toggleComparisonAttribute = (attribute) => {
    setComparisonAttributes(prev => {
      if (prev.includes(attribute)) {
        return prev.filter(attr => attr !== attribute);
      } else {
        return [...prev, attribute];
      }
    });
  };

  // Get selected products data
  const selectedProductsData = products.filter(product => selectedProducts.includes(product.id));

  return (
    <AdminLayout title="Product Variants & Comparison">
      <Head>
        <title>Product Variants & Comparison</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Product Variants & Comparison
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage product variants and compare products side-by-side
              </p>
            </div>
          </div>

          {/* Variant Groups Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Variant Groups
              </h2>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={saveVariantGroup}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Save Group
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* New Variant Group Form */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Create New Variant Group
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Group Name
                    </label>
                    <input
                      type="text"
                      id="group-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="e.g., T-Shirt Variants"
                      value={newVariantGroup.name}
                      onChange={(e) => setNewVariantGroup({...newVariantGroup, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Attributes
                      </label>
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={addAttribute}
                      >
                        Add Attribute
                      </button>
                    </div>
                    
                    {newVariantGroup.attributes.map((attribute, attrIndex) => (
                      <div key={attrIndex} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-center mb-2">
                          <input
                            type="text"
                            className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md"
                            placeholder="Attribute name (e.g., Size, Color)"
                            value={attribute.name}
                            onChange={(e) => updateAttributeName(attrIndex, e.target.value)}
                          />
                          <button
                            type="button"
                            className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => removeAttribute(attrIndex)}
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Values</span>
                            <button
                              type="button"
                              className="text-xs text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => addAttributeValue(attrIndex)}
                            >
                              Add Value
                            </button>
                          </div>
                          
                          {attribute.values.map((value, valIndex) => (
                            <div key={valIndex} className="flex items-center mb-1">
                              <input
                                type="text"
                                className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md"
                                placeholder="Value"
                                value={value}
                                onChange={(e) => updateAttributeValue(attrIndex, valIndex, e.target.value)}
                              />
                              <button
                                type="button"
                                className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => removeAttributeValue(attrIndex, valIndex)}
                              >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Existing Variant Groups */}
                {variantGroups.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Saved Variant Groups
                    </h3>
                    
                    <div className="space-y-4">
                      {variantGroups.map(group => (
                        <div key={group.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </h4>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => generateVariants(group.id)}
                            >
                              Generate Variants
                            </button>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {group.attributes.length} attributes
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-1">
                              {group.attributes.map((attr, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {attr.name}: {attr.values.length} values
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Selection for Comparison */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Compare Products
              </h2>
              <button
                type="button"
                disabled={selectedProducts.length < 2}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  selectedProducts.length < 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={() => setShowComparison(true)}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Compare Selected ({selectedProducts.length})
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="border-t border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedProducts.length === products.length && products.length > 0}
                              onChange={() => {
                                if (selectedProducts.length === products.length) {
                                  setSelectedProducts([]);
                                } else {
                                  setSelectedProducts(products.map(p => p.id));
                                }
                              }}
                            />
                          </th>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                          <tr 
                            key={product.id} 
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              selectedProducts.includes(product.id) ? 'bg-blue-50 dark:bg-blue-900' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                                  {product.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {product.category}
                              </div>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Comparison Modal */}
          {showComparison && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-5/6 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Product Comparison
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                      onClick={() => setShowComparison(false)}
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Comparison Settings */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Select Attributes to Compare
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['name', 'price', 'category', 'stock', 'description', 'sku'].map(attr => (
                        <button
                          key={attr}
                          type="button"
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            comparisonAttributes.includes(attr)
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}
                          onClick={() => toggleComparisonAttribute(attr)}
                        >
                          {attr.charAt(0).toUpperCase() + attr.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Attribute
                          </th>
                          {selectedProductsData.map(product => (
                            <th key={product.id} scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-2">
                                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                  {product.name}
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {comparisonAttributes.map(attribute => (
                          <tr key={attribute} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                              {attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                            </td>
                            {selectedProductsData.map(product => (
                              <td key={`${product.id}-${attribute}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {attribute === 'price' 
                                  ? `$${product[attribute]?.toFixed(2) || 'N/A'}` 
                                  : attribute === 'stock' 
                                    ? (
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product[attribute] > 50 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                          : product[attribute] > 10 
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                        {product[attribute] || 0} in stock
                                      </span>
                                    )
                                    : product[attribute] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => setShowComparison(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}