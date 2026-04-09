import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import { withAdminScopeUrl } from '../utils/scopeApi';
import { requestJson } from '../utils/httpClient';

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: '',
    isActive: true,
    order: 0
  });
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    loadServices();
  }, [router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      const { ok, payload, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/services/all`), {
        retries: 1
      });
      if (!ok) {
        throw new Error(message || 'Failed to load services');
      }
      setServices(Array.isArray(payload) ? payload : payload?.items || []);
    } catch (loadError) {
      console.error('Error loading services:', loadError);
      setServices([]);
      setError(loadError.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      icon: '',
      isActive: true,
      order: 0
    });
    setShowForm(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      if (editingService) {
        const serviceId = editingService._id || editingService.id;
        const { ok, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/services/${serviceId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!ok) {
          throw new Error(message || 'Failed to update service');
        }
      } else {
        const { ok, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/services`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            id: Date.now(),
            order: Number(formData.order || services.length + 1),
          }),
        });
        if (!ok) {
          throw new Error(message || 'Failed to create service');
        }
      }

      await loadServices();
      resetForm();
    } catch (submitError) {
      console.error('Error saving service:', submitError);
      setError(submitError.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      ...service,
      order: Number(service.order || 0)
    });
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (service) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setError('');
      const serviceId = service._id || service.id;
      const { ok, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/services/${serviceId}`), {
        method: 'DELETE',
      });
      if (!ok) {
        throw new Error(message || 'Failed to delete service');
      }
      await loadServices();
    } catch (deleteError) {
      console.error('Error deleting service:', deleteError);
      setError(deleteError.message || 'Failed to delete service');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      setError('');
      const serviceId = service._id || service.id;
      const { ok, message } = await requestJson(withAdminScopeUrl(`${API_BASE_URL}/api/services/${serviceId}/toggle`), {
        method: 'PATCH',
      });
      if (!ok) {
        throw new Error(message || 'Failed to update service status');
      }
      await loadServices();
    } catch (toggleError) {
      console.error('Error toggling service:', toggleError);
      setError(toggleError.message || 'Failed to update service status');
    }
  };

  const handleAddNew = () => {
    setError('');
    setFormData({
      id: '',
      title: '',
      description: '',
      icon: '',
      isActive: true,
      order: services.length + 1
    });
    setEditingService(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Services Management">
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
    <AdminLayout title="Services Management">
      <Head>
        <title>Services Management | Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Services Management</h1>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Service
            </button>
          </div>

          {error ? (
            <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-none">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Services</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage the services that appear on the customer portal
                </p>
              </div>

              {showForm ? (
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
                        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Icon
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="icon"
                            id="icon"
                            value={formData.icon}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
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

                      <div className="sm:col-span-3">
                        <div className="flex items-center mt-6">
                          <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                          />
                          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                            Active
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingService ? 'Update Service' : 'Create Service'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Icon
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
                    {[...services]
                      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                      .map((service) => (
                        <tr key={service.id || service._id} className={service.isActive ? '' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {service.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                            {service.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className="text-2xl">{service.icon}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {service.order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleToggleActive(service)}
                              className={`mr-3 ${
                                service.isActive
                                  ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                  : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                            >
                              {service.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleEdit(service)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
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
