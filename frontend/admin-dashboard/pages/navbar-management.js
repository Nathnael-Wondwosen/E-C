import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';

export default function NavbarManagement() {
  const [navbarLinks, setNavbarLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    url: '',
    type: 'internal', // 'internal' or 'external'
    enabled: true,
    order: 0
  });
  const router = useRouter();

  // Mock data for demonstration
  const mockNavbarLinks = [
    { id: 1, title: 'Home', url: '/', type: 'internal', enabled: true, order: 1 },
    { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
    { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
    { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
    { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
    { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 },
    { id: 7, title: 'External Link', url: 'https://example.com', type: 'external', enabled: false, order: 7 }
  ];
  
  // Save initial mock data to API if it doesn't exist
  useEffect(() => {
    const initializeNavbarLinks = async () => {
      try {
        // Check if navbar links already exist in the database
        const response = await fetch('http://localhost:3000/api/navbar-links');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const links = await response.json();
        
        if (links.length === 0) {
          // No links exist, initialize with mock data
          
          
          // Create each mock link
          for (const link of mockNavbarLinks) {
            try {
              const createResponse = await fetch('http://localhost:3000/api/navbar-links', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(link),
              });
              
              if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`);
              }
              
              const createdLink = await createResponse.json();
              
            } catch (createError) {
              console.error('Error creating navbar link:', createError);
            }
          }
          
          // Reload links
          loadNavbarLinks();
        } else {
          
        }
      } catch (error) {
        console.error('Error initializing navbar links:', error);
        // Fallback to localStorage
        const storedLinks = localStorage.getItem('navbarLinks');
        
        if (!storedLinks) {
          // Saving initial navbar links to localStorage
          localStorage.setItem('navbarLinks', JSON.stringify(mockNavbarLinks));
        } else {
          // Navbar links already exist in localStorage
        }
      }
    };
    
    initializeNavbarLinks();
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      // Load navbar links
      loadNavbarLinks();
    }
  }, [router]);

  const loadNavbarLinks = async () => {
    try {
      setLoading(true);
      // Load navbar links from API
      const response = await fetch('http://localhost:3000/api/navbar-links');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const links = await response.json();
      
      setNavbarLinks(links);
    } catch (error) {
      console.error('Error loading navbar links from API:', error);
      // Fallback to localStorage and then mock data
      try {
        const storedLinks = localStorage.getItem('navbarLinks');

        if (storedLinks) {
          const parsedLinks = JSON.parse(storedLinks);

          setNavbarLinks(parsedLinks);
        } else {

          setNavbarLinks(mockNavbarLinks);
        }
      } catch (localStorageError) {
        console.error('Error loading navbar links from localStorage:', localStorageError);
        setNavbarLinks(mockNavbarLinks);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save to API
    try {
      if (editingLink) {
        // Update existing link
        const response = await fetch(`http://localhost:3000/api/navbar-links/${editingLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedLink = await response.json();

      } else {
        // Add new link
        const response = await fetch('http://localhost:3000/api/navbar-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            id: Date.now(), // Simple ID generation
            order: navbarLinks.length + 1
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newLink = await response.json();

      }
      
      // Reload links from API
      loadNavbarLinks();
    } catch (error) {
      console.error('Error saving navbar link via API:', error);
      // Fallback to localStorage
      let updatedLinks;
      if (editingLink) {
        // Update existing link
        updatedLinks = navbarLinks.map(link => 
          link.id === editingLink.id ? { ...formData } : link
        );
        setNavbarLinks(updatedLinks);
      } else {
        // Add new link
        const newLink = {
          ...formData,
          id: Date.now(), // Simple ID generation
          order: navbarLinks.length + 1
        };
        updatedLinks = [...navbarLinks, newLink];
        setNavbarLinks(updatedLinks);
      }

      localStorage.setItem('navbarLinks', JSON.stringify(updatedLinks));
    }
    
    // Reset form
    setFormData({
      id: '',
      title: '',
      url: '',
      type: 'internal',
      enabled: true,
      order: 0
    });
    setShowForm(false);
    setEditingLink(null);
  };

  const handleEdit = (link) => {
    setFormData(link);
    setEditingLink(link);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this navbar link?')) {
      // Save to API
      try {
        const response = await fetch(`http://localhost:3000/api/navbar-links/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        

        // Reload links from API
        loadNavbarLinks();
      } catch (error) {
        console.error('Error deleting navbar link via API:', error);
        // Fallback to localStorage
        const updatedLinks = navbarLinks.filter(link => link.id !== id);
        setNavbarLinks(updatedLinks);

        localStorage.setItem('navbarLinks', JSON.stringify(updatedLinks));
      }
    }
  };

  const handleToggleEnabled = async (id) => {
    // Save to API
    try {
      const response = await fetch(`http://localhost:3000/api/navbar-links/${id}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedLink = await response.json();

      // Reload links from API
      loadNavbarLinks();
    } catch (error) {
      console.error('Error toggling navbar link via API:', error);
      // Fallback to localStorage
      const updatedLinks = navbarLinks.map(link => 
        link.id === id ? { ...link, enabled: !link.enabled } : link
      );
      setNavbarLinks(updatedLinks);

      localStorage.setItem('navbarLinks', JSON.stringify(updatedLinks));
    }
  };

  const handleAddNew = () => {
    setFormData({
      id: '',
      title: '',
      url: '',
      type: 'internal',
      enabled: true,
      order: navbarLinks.length + 1
    });
    setEditingLink(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Navbar Management">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Navbar Management">
      <Head>
        <title>Navbar Management | Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Navbar Management</h1>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Link
            </button>
          </div>

          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-none">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Navbar Links
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage the navigation links that appear in the customer portal header
                </p>
              </div>
              
              {showForm && (
                <div className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          URL
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="url"
                            id="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Type
                        </label>
                        <div className="mt-1">
                          <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          >
                            <option value="internal">Internal Page</option>
                            <option value="external">External Link</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Order
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="order"
                            id="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            min="0"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <div className="flex items-center">
                          <input
                            id="enabled"
                            name="enabled"
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                          />
                          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Enabled
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingLink(null);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingLink ? 'Update Link' : 'Create Link'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {navbarLinks
                      .sort((a, b) => a.order - b.order)
                      .map((link) => (
                        <tr key={link.id} className={link.enabled ? '' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {link.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {link.url}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              link.type === 'internal' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {link.type === 'internal' ? 'Internal' : 'External'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {link.order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              link.enabled 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {link.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleToggleEnabled(link.id)}
                              className={`mr-3 ${
                                link.enabled 
                                  ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                  : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                            >
                              {link.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleEdit(link)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}