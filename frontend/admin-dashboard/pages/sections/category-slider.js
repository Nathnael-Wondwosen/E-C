import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function CategorySliderManagement() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Electronics",
      icon: "📱",
      imageUrl: "/images/electronics.jpg",
      isActive: true,
      productCount: 124
    },
    {
      id: 2,
      name: "Fashion",
      icon: "👕",
      imageUrl: "/images/fashion.jpg",
      isActive: true,
      productCount: 89
    },
    {
      id: 3,
      name: "Home & Garden",
      icon: "🏠",
      imageUrl: "/images/home-garden.jpg",
      isActive: true,
      productCount: 67
    },
    {
      id: 4,
      name: "Sports",
      icon: "⚽",
      imageUrl: "/images/sports.jpg",
      isActive: false,
      productCount: 42
    },
    {
      id: 5,
      name: "Books",
      icon: "📚",
      imageUrl: "/images/books.jpg",
      isActive: true,
      productCount: 156
    }
  ]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    imageUrl: ''
  });

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.icon) {
      const category = {
        id: categories.length + 1,
        ...newCategory,
        isActive: true,
        productCount: 0
      };
      setCategories([...categories, category]);
      setNewCategory({
        name: '',
        icon: '',
        imageUrl: ''
      });
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const toggleCategoryStatus = (id) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, isActive: !category.isActive } : category
    ));
  };

  return (
    <AdminLayout title="Category Slider Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Category Slider Management
              </h1>
            </div>
          </div>

          <div className="mt-6">
            {/* Add New Category Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    id="icon"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., 📱"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Background Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="/images/category.jpg"
                    value={newCategory.imageUrl}
                    onChange={(e) => setNewCategory({...newCategory, imageUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleAddCategory}
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Current Categories</h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <li key={category.id} className={`${category.isActive ? '' : 'opacity-60'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                    <div className="block">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                              <img 
                                src={category.imageUrl} 
                                alt={category.name} 
                                className="h-full w-full object-cover rounded-md"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                            <div>
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate flex items-center">
                                <span className="text-xl mr-2">{category.icon}</span>
                                {category.name}
                              </p>
                              <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span>{category.productCount} products</span>
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  Status: <span className="font-medium">{category.isActive ? 'Active' : 'Inactive'}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleCategoryStatus(category.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}