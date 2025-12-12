import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import CategoryMap from '../components/CategoryMap';
import IconPicker from '../components/IconPicker';
import { getCategories, getProducts, createCategory, updateCategory, deleteCategory } from '../utils/mongoService';
// Import drag and drop utilities
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Import CSV utilities
import { downloadCSV, readCSVFile } from '../utils/csvUtils';
// Import AI service
import { getCategorySuggestions } from '../utils/aiService';

// Draggable Category Item Component
function DraggableCategoryItem({ category, index, moveCategory, onEdit, onDelete, onToggleExpand, isExpanded, subcategories }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CATEGORY',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCategory(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow mb-2 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ cursor: 'move' }}
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mr-3">
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-medium text-gray-900 dark:text-white truncate">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {category.description}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {category.count} products
        </p>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onToggleExpand(category.id)}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {subcategories.length > 0 ? (isExpanded ? '▼' : '►') : ''}
        </button>
        <button 
          onClick={() => onEdit({...category})}
          className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(category.id)}
          className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Category Tree Component with Drag and Drop
function CategoryTree({ categories, expandedCategories, onToggleExpand, onEdit, onDelete, onReorder }) {
  const moveCategory = (fromIndex, toIndex) => {
    const updatedCategories = [...categories];
    const [movedItem] = updatedCategories.splice(fromIndex, 1);
    updatedCategories.splice(toIndex, 0, movedItem);
    onReorder(updatedCategories);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const renderCategoryTree = (category, level = 0) => {
    const subcategories = getSubcategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <div key={category.id} className="mb-2">
        <DraggableCategoryItem
          category={category}
          index={categories.findIndex(c => c.id === category.id)}
          moveCategory={moveCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpand={onToggleExpand}
          isExpanded={isExpanded}
          subcategories={subcategories}
        />
        
        {isExpanded && subcategories.length > 0 && (
          <div className="mt-2 ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {subcategories.map(subcat => renderCategoryTree(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelCategories = categories.filter(cat => !cat.parentId);
  
  return (
    <div>
      {topLevelCategories.map(category => renderCategoryTree(category))}
    </div>
  );
}



export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', description: '', parentId: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [importError, setImportError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerFor, setIconPickerFor] = useState(null); // 'new' or 'edit'
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      loadCategories();
    }
  }, [router]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Load both categories and products to calculate accurate counts
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      
      // Calculate product counts for each category
      const categoriesWithCounts = categoriesData.map(category => {
        const productCount = productsData.filter(product => product.category === category.name).length;
        return {
          ...category,
          count: productCount
        };
      });
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        const categoryData = {
          name: newCategory.name,
          icon: newCategory.icon || '🏷️',
          description: newCategory.description || '',
          parentId: newCategory.parentId,
          count: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Call the actual API to create the category
        const category = await createCategory(categoryData);
        
        setCategories([...categories, category]);
        setNewCategory({ name: '', icon: '', description: '', parentId: null });
      } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category. Please try again.');
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        const updatedCategory = {
          ...editingCategory,
          updatedAt: new Date()
        };
        
        // Call the actual API to update the category
        const result = await updateCategory(editingCategory.id, updatedCategory);
        
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? result : cat
        ));
        
        setEditingCategory(null);
      } catch (error) {
        console.error('Error updating category:', error);
        alert('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        // Call the actual API to delete the category
        const result = await deleteCategory(categoryId);
        
        if (result.success) {
          const deleteCategoryAndChildren = (cats, id) => {
            return cats.filter(cat => {
              // Remove the category and all its children
              if (cat.id === id) return false;
              if (cat.parentId === id) return false;
              return true;
            });
          };
          
          setCategories(deleteCategoryAndChildren(categories, categoryId));
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleReorderCategories = async (reorderedCategories) => {
    try {
      // Update each category's order in the database
      const updatePromises = reorderedCategories.map((category, index) => {
        return updateCategory(category.id, { ...category, order: index });
      });
      
      await Promise.all(updatePromises);
      
      setCategories(reorderedCategories);
      console.log('Categories reordered successfully');
    } catch (error) {
      console.error('Error reordering categories:', error);
      alert('Failed to reorder categories. Please try again.');
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Icon picker handlers
  const openIconPicker = (forCategory) => {
    setIconPickerFor(forCategory);
    setShowIconPicker(true);
  };

  const handleIconSelect = (icon) => {
    if (iconPickerFor === 'new') {
      setNewCategory({...newCategory, icon});
    } else if (iconPickerFor === 'edit') {
      setEditingCategory({...editingCategory, icon});
    }
    setShowIconPicker(false);
    setIconPickerFor(null);
  };

  const closeIconPicker = () => {
    setShowIconPicker(false);
    setIconPickerFor(null);
  };


  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getCategoryDepth = (category, categories, depth = 0) => {
    if (!category.parentId) return depth;
    const parent = categories.find(cat => cat.id === category.parentId);
    return parent ? getCategoryDepth(parent, categories, depth + 1) : depth;
  };

  // Handle search input with AI suggestions
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      try {
        const aiSuggestions = await getCategorySuggestions(value, categories);
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
  const applySuggestion = (category) => {
    setSearchTerm(category.name);
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

  // Export categories to CSV
  const handleExportCategories = () => {
    try {
      // Prepare data for export (flatten the hierarchy)
      const exportData = categories.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        parentId: category.parentId || '',
        count: category.count,
        createdAt: category.createdAt ? category.createdAt.toISOString() : '',
        updatedAt: category.updatedAt ? category.updatedAt.toISOString() : ''
      }));
      
      downloadCSV(exportData, 'categories-export.csv');
    } catch (error) {
      console.error('Error exporting categories:', error);
      alert('Failed to export categories. Please try again.');
    }
  };

  // Import categories from CSV
  const handleImportCategories = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setImportError('');
      const csvData = await readCSVFile(file);
      
      // Validate required fields
      const requiredFields = ['name'];
      const missingFields = requiredFields.filter(field => !csvData[0] || !(field in csvData[0]));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Process imported data
      const importedCategories = csvData.map((row, index) => ({
        id: row.id || Date.now() + index,
        name: row.name,
        icon: row.icon || '🏷️',
        description: row.description || '',
        parentId: row.parentId || null,
        count: parseInt(row.count) || 0,
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      }));
      
      // Create categories via API
      const createdCategories = [];
      for (const categoryData of importedCategories) {
        try {
          const createdCategory = await createCategory(categoryData);
          createdCategories.push(createdCategory);
        } catch (error) {
          console.error('Error creating category:', error);
        }
      }
      
      setCategories(prev => [...prev, ...createdCategories]);
      alert(`Successfully imported ${createdCategories.length} categories.`);
    } catch (error) {
      console.error('Error importing categories:', error);
      setImportError(error.message || 'Failed to import categories. Please check the file format.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const topLevelCategories = categories.filter(cat => !cat.parentId);
  const filteredCategories = topLevelCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <AdminLayout title="Advanced Categories Management">
        <Head>
          <title>Advanced Categories Management</title>
        </Head>
        
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                  Advanced Categories Management
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Organize your products with hierarchical categories
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'map' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Visual Map
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
                  placeholder="Search categories... (AI-powered suggestions available)"
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
                    {suggestions.map((category) => (
                      <button
                        key={category.id}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => applySuggestion(category)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        {category.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {category.description}
                          </div>
                        )}
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
                onClick={handleExportCategories}
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
                onChange={handleImportCategories}
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

            {/* Add New Category Form */}
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="category-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="Enter category name"
                      value={editingCategory ? editingCategory.name : newCategory.name}
                      onChange={(e) => 
                        editingCategory 
                          ? setEditingCategory({...editingCategory, name: e.target.value})
                          : setNewCategory({...newCategory, name: e.target.value})
                      }
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Emoji Icon
                    </label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        id="category-icon"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md"
                        placeholder="Enter emoji (e.g., 📱) or click picker"
                        value={editingCategory ? editingCategory.icon : newCategory.icon}
                        onChange={(e) => 
                          editingCategory 
                            ? setEditingCategory({...editingCategory, icon: e.target.value})
                            : setNewCategory({...newCategory, icon: e.target.value})
                        }
                      />
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onClick={() => openIconPicker(editingCategory ? 'edit' : 'new')}
                      >
                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    {(editingCategory ? editingCategory.icon : newCategory.icon) && (
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Preview:</span>
                        <span className="text-2xl">{editingCategory ? editingCategory.icon : newCategory.icon}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="category-description"
                      rows={3}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="Enter category description"
                      value={editingCategory ? editingCategory.description : newCategory.description}
                      onChange={(e) => 
                        editingCategory 
                          ? setEditingCategory({...editingCategory, description: e.target.value})
                          : setNewCategory({...newCategory, description: e.target.value})
                      }
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="parent-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parent Category (Optional)
                    </label>
                    <select
                      id="parent-category"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      value={editingCategory ? editingCategory.parentId || '' : newCategory.parentId || ''}
                      onChange={(e) => 
                        editingCategory 
                          ? setEditingCategory({...editingCategory, parentId: e.target.value || null})
                          : setNewCategory({...newCategory, parentId: e.target.value || null})
                      }
                    >
                      <option value="">None (Top-level category)</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-3">
                  {editingCategory ? (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleUpdateCategory}
                      >
                        Update Category
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handleCreateCategory}
                    >
                      Add Category
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories View (List or Map) */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {viewMode === 'list' ? 'Category Hierarchy' : 'Visual Category Map'}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {categories.length} categories
                </span>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : viewMode === 'list' ? (
                  filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No categories match your search' : 'No categories found'}
                    </div>
                  ) : (
                    <CategoryTree
                      categories={categories}
                      expandedCategories={expandedCategories}
                      onToggleExpand={toggleCategoryExpansion}
                      onEdit={setEditingCategory}
                      onDelete={handleDeleteCategory}
                      onReorder={handleReorderCategories}
                    />
                  )
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-inner p-6">
                    <CategoryMap 
                      categories={categories}
                      onCategorySelect={setEditingCategory}
                      onCategoryEdit={(category) => {
                        const fullCategory = categories.find(c => c.id === category.id);
                        if (fullCategory) setEditingCategory(fullCategory);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category Analytics */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Category Insights
              </h2>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Total Categories
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {categories.length}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Top Category
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {categories.length > 0 ? categories.reduce((max, cat) => cat.count > max.count ? cat : max, categories[0]).name : 'N/A'}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Avg. Products
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length) : 0}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Hierarchical Levels
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {Math.max(...categories.map(cat => getCategoryDepth(cat, categories)), 0)}
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
        
        {/* Icon Picker Modal */}
        {showIconPicker && (
          <IconPicker 
            selectedIcon={iconPickerFor === 'new' ? newCategory.icon : editingCategory?.icon}
            onIconSelect={handleIconSelect}
            onClose={closeIconPicker}
          />
        )}
      </AdminLayout>
    </DndProvider>
  );
}
