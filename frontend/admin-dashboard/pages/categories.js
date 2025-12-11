import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import { getCategories } from '../utils/mongoService';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
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
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: categories.length + 1,
        name: newCategory.name,
        icon: newCategory.icon || '🏷️',
        count: 0
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', icon: '' });
    }
  };

  return (
    <AdminLayout title="Categories Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Categories Management
              </h1>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h2>
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
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    id="category-icon"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Enter emoji (e.g., 📱)"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleCreateCategory}
                >
                  Add Category
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Existing Categories</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-3 flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                    No categories found
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 shadow rounded-none p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                          {category.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} products</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit
                        </button>
                        <button className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}