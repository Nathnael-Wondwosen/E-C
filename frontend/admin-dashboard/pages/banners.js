import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import ImageUploader from '../components/ImageUploader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function BannersManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  // Form state for new banner
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    imageUrl: '',
    cta: '',
    link: '',
    isActive: true
  });

  // Fetch banners from API
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/banners`);
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      const data = await response.json();
      setBanners(data);
    } catch (err) {
      setError('Failed to load banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for new banner
  const handleImageUpload = (images) => {
    if (images.length > 0) {
      setNewBanner({ ...newBanner, imageUrl: images[0].url });
    }
  };

  // Start editing a banner
  const startEditing = (banner) => {
    setEditingBanner(banner._id);
    setNewBanner({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl || '',
      cta: banner.cta,
      link: banner.link,
      isActive: banner.isActive
    });
    setIsAdding(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsAdding(false);
    setEditingBanner(null);
    setNewBanner({
      title: '',
      description: '',
      imageUrl: '',
      cta: '',
      link: '',
      isActive: true
    });
  };

  // Add new banner
  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBanner),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add banner');
      }
      
      const addedBanner = await response.json();
      setBanners([...banners, addedBanner]);
      setSuccess('Banner added successfully!');
      setNewBanner({
        title: '',
        description: '',
        imageUrl: '',
        cta: '',
        link: '',
        isActive: true
      });
      setIsAdding(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add banner: ' + err.message);
    }
  };

  // Update existing banner
  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${editingBanner}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBanner),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update banner');
      }
      
      const updatedBanner = await response.json();
      setBanners(banners.map(banner => 
        banner._id === editingBanner ? updatedBanner : banner
      ));
      setSuccess('Banner updated successfully!');
      setNewBanner({
        title: '',
        description: '',
        imageUrl: '',
        cta: '',
        link: '',
        isActive: true
      });
      setIsAdding(false);
      setEditingBanner(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update banner: ' + err.message);
    }
  };

  // Update banner status
  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${id}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update banner');
      }
      
      const updatedBanner = await response.json();
      setBanners(banners.map(banner => 
        banner._id === id ? updatedBanner : banner
      ));
      setSuccess('Banner updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update banner: ' + err.message);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }
      
      setBanners(banners.filter(banner => banner._id !== id));
      setSuccess('Banner deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete banner: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Full Width Banners</h1>
          <button
            onClick={() => {
              cancelEditing();
              setIsAdding(!isAdding);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {isAdding ? 'Cancel' : 'Add New Banner'}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add/Edit Banner Form */}
        {isAdding && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </h2>
            <form onSubmit={editingBanner ? handleUpdateBanner : handleAddBanner}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="3"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Call to Action</label>
                    <input
                      type="text"
                      value={newBanner.cta}
                      onChange={(e) => setNewBanner({ ...newBanner, cta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Link</label>
                    <input
                      type="text"
                      value={newBanner.link}
                      onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="/marketplace"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                    <ImageUploader 
                      onImagesChange={handleImageUpload} 
                      maxImages={1}
                      initialImages={newBanner.imageUrl ? [{ url: newBanner.imageUrl }] : []}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newBanner.isActive}
                        onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Existing Banners</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No banners found. Add your first banner above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {banners.map((banner) => (
                <div key={banner._id} className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 mb-4 md:mb-0">
                      {banner.imageUrl ? (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg w-full h-32 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-3/4 md:pl-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{banner.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{banner.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {banner.cta}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {banner.link}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(banner)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                            title="Edit banner"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => toggleBannerStatus(banner._id, banner.isActive)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              banner.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteBanner(banner._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                            title="Delete banner"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}