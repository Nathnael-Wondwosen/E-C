import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import ImageUploader from '../components/ImageUploader';

export default function PartnersManagement() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    logo: '',
    website: '',
    isActive: true,
    order: 0,
    useUrlInput: false
  });
  const router = useRouter();

  // Define API base URL for client-side requests
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      // Load partners
      loadPartners();
    }
  }, [router]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      
      // Fetch partners from API
      const response = await fetch(`${API_BASE_URL}/api/partners`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fetchedPartners = await response.json();
      // Convert MongoDB _id to id for frontend compatibility
      const convertedPartners = fetchedPartners.map(partner => ({
        ...partner,
        id: partner._id || partner.id
      }));
      setPartners(convertedPartners);
    } catch (error) {
      console.error('Error loading partners:', error);
      alert('Error loading partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (images) => {
    if (images.length > 0) {
      setFormData(prev => ({
        ...prev,
        logo: images[0].url  // Use the first image URL
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        logo: ''  // Clear the logo URL if no images
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPartner) {
        // Update existing partner
        const response = await fetch(`${API_BASE_URL}/api/partners/${editingPartner.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedPartner = await response.json();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedPartner = {
          ...updatedPartner,
          id: updatedPartner._id || updatedPartner.id
        };
        
        const updatedPartners = partners.map(partner => 
          partner.id === editingPartner.id ? convertedPartner : partner
        );
        setPartners(updatedPartners);
      } else {
        // Add new partner
        const response = await fetch(`${API_BASE_URL}/api/partners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newPartner = await response.json();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedPartner = {
          ...newPartner,
          id: newPartner._id || newPartner.id
        };
        
        setPartners([...partners, convertedPartner]);
      }
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        logo: '',
        website: '',
        isActive: true,
        order: 0
      });
      setShowForm(false);
      setEditingPartner(null);
      
      alert('Partner saved successfully!');
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Error saving partner. Please try again.');
    }
  };

  const handleEdit = (partner) => {
    // Determine if the logo looks like a URL
    const useUrlInput = partner.logo && (partner.logo.startsWith('http') || partner.logo.startsWith('https'));
    
    setFormData({
      ...partner,
      useUrlInput: !!useUrlInput
    });
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this partner?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/partners/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPartners = partners.filter(partner => partner.id !== id);
      setPartners(updatedPartners);
      alert('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Error deleting partner. Please try again.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partners/${id}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPartner = await response.json();
      // Convert MongoDB _id to id for frontend compatibility
      const convertedPartner = {
        ...updatedPartner,
        id: updatedPartner._id || updatedPartner.id
      };
      
      const updatedPartners = partners.map(partner => 
        partner.id === id ? convertedPartner : partner
      );
      setPartners(updatedPartners);
    } catch (error) {
      console.error('Error toggling partner status:', error);
      alert('Error updating partner status. Please try again.');
    }
  };

  const sortedPartners = partners.sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="py-6">
        <Head>
          <title>Partners Management | Admin Dashboard</title>
          <meta name="description" content="Manage partner logos and information" />
        </Head>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Partners Management</h1>
            <button
              onClick={() => {
                setFormData({
                  id: '',
                  name: '',
                  logo: '',
                  website: '',
                  isActive: true,
                  order: partners.length > 0 ? Math.max(...partners.map(p => p.order)) + 1 : 1,
                  useUrlInput: false
                });
                setEditingPartner(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Partner
            </button>
          </div>

          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading partners...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Partners List */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Partner Logos</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage the logos that appear in the partners section on the homepage</p>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {sortedPartners.map((partner) => (
                      <li key={partner.id}>
                        <div className="px-4 py-4 flex items-center sm:px-6">
                          <div className="min-w-0 flex-1 flex items-center">
                            <div className="flex-shrink-0">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                {partner.logo ? (
                                  <img src={partner.logo} alt={partner.name} className="max-h-12 max-w-full object-contain" />
                                ) : (
                                  <span className="text-gray-500 text-xs">No logo</span>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 md:grid md:grid-cols-3 md:gap-4 ml-4">
                              <div>
                                <p className="text-sm font-medium text-blue-600 truncate">{partner.name}</p>
                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                  <span>Order: {partner.order}</span>
                                </p>
                              </div>
                              <div className="hidden md:block">
                                <div>
                                  <p className="text-sm text-gray-900">
                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                      {partner.website}
                                    </a>
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500">
                                    {partner.isActive ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Inactive
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleToggleStatus(partner.id)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                partner.isActive ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  partner.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(partner)}
                              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(partner.id)}
                              className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Partner Form Modal */}
        {showForm && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowForm(false)}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                      </h3>
                      <div className="mt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Partner Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                              Logo
                            </label>
                            <div className="mt-1">
                              {/* Tabs for Upload vs URL */}
                              <div className="flex border-b border-gray-200 mb-4">
                                <button
                                  type="button"
                                  className={`py-2 px-4 text-sm font-medium ${!formData.useUrlInput ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                  onClick={() => setFormData(prev => ({ ...prev, useUrlInput: false }))}
                                >
                                  Upload Image
                                </button>
                                <button
                                  type="button"
                                  className={`py-2 px-4 text-sm font-medium ${formData.useUrlInput ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                  onClick={() => setFormData(prev => ({ ...prev, useUrlInput: true }))}
                                >
                                  Enter URL
                                </button>
                              </div>
                              
                              {!formData.useUrlInput ? (
                                <div>
                                  {formData.logo && (
                                    <div className="mb-3">
                                      <img 
                                        src={formData.logo} 
                                        alt="Current logo" 
                                        className="h-16 w-16 object-contain"
                                      />
                                    </div>
                                  )}
                                  <ImageUploader 
                                    onImagesChange={handleImageChange}
                                    initialImages={formData.logo ? [{ url: formData.logo }] : []}
                                    maxImages={1}
                                  />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Upload a logo image (PNG, JPG, GIF up to 5MB)
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  {formData.logo && (
                                    <div className="mb-3">
                                      <img 
                                        src={formData.logo} 
                                        alt="Current logo" 
                                        className="h-16 w-16 object-contain"
                                      />
                                    </div>
                                  )}
                                  <input
                                    type="text"
                                    name="logo"
                                    value={formData.logo}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/logo.png"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Enter the direct URL to your logo image
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                              Website URL
                            </label>
                            <input
                              type="url"
                              name="website"
                              id="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              placeholder="https://example.com"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                              Display Order
                            </label>
                            <input
                              type="number"
                              name="order"
                              id="order"
                              value={formData.order}
                              onChange={handleInputChange}
                              min="0"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              id="isActive"
                              name="isActive"
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                              Active
                            </label>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingPartner ? 'Update Partner' : 'Add Partner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
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