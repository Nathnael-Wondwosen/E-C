import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PageSectionsManagement() {
  const [sections, setSections] = useState([
    { id: 1, name: 'Hero Carousel', enabled: true, order: 1 },
    { id: 2, name: 'Hot Deals', enabled: true, order: 2 },
    { id: 3, name: 'Featured Products', enabled: true, order: 3 },
    { id: 4, name: 'Category Showcase', enabled: true, order: 4 },
    { id: 5, name: 'Promotional Banner', enabled: true, order: 5 },
    { id: 6, name: 'Trending Products Text', enabled: true, order: 6 },
    { id: 7, name: 'Random Products', enabled: true, order: 7 },
    { id: 8, name: 'News & Blog', enabled: true, order: 8 },
    { id: 9, name: 'Footer', enabled: true, order: 9 }
  ]);
  const [editingSection, setEditingSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);

  const handleToggle = (id) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, enabled: !section.enabled } : section
    ));
  };

  const handleMoveUp = (id) => {
    const index = sections.findIndex(s => s.id === id);
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      setSections(newSections.map((section, idx) => ({ ...section, order: idx + 1 })));
    }
  };

  const handleMoveDown = (id) => {
    const index = sections.findIndex(s => s.id === id);
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections.map((section, idx) => ({ ...section, order: idx + 1 })));
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setShowModal(true);
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    alert(`Changes saved for ${editingSection.name} section!`);
    setShowModal(false);
    setEditingSection(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Page Sections Management | Admin Dashboard</title>
        <meta name="description" content="Manage page sections for the customer portal homepage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Page Sections Management</h1>
            <button
              onClick={() => alert('Saving all changes...')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Homepage Sections</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage and reorder sections that appear on the customer portal homepage</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <li key={section.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="min-w-0 flex-1 md:grid md:grid-cols-3 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">{section.name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <span>Position: {section.order}</span>
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <div>
                            <p className={`text-sm ${section.enabled ? 'text-green-600' : 'text-red-600'}`}>
                              {section.enabled ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500">
                              Click to toggle visibility
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggle(section.id)}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          section.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            section.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleMoveUp(section.id)}
                        disabled={section.order === 1}
                        className={`p-2 rounded-full ${section.order === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(section.id)}
                        disabled={section.order === sections.length}
                        className={`p-2 rounded-full ${section.order === sections.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Preview section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Homepage Preview</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Current arrangement of sections on the homepage</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="space-y-4">
                {sections
                  .filter(section => section.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{section.order}</span>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{section.name}</h4>
                          <p className="text-sm text-gray-500">Visible on homepage</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing section */}
      {showModal && editingSection && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Section: {editingSection.name}
                    </h3>
                    <div className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Section Name
                          </label>
                          <input
                            type="text"
                            value={editingSection.name}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Position
                          </label>
                          <input
                            type="number"
                            value={editingSection.order}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Visibility
                          </label>
                          <div className="mt-1 flex items-center">
                            <button
                              onClick={() => handleToggle(editingSection.id)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                editingSection.enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  editingSection.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="ml-3 text-sm text-gray-900">
                              {editingSection.enabled ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Content Preview
                          </label>
                          <div className="mt-1 border border-gray-300 rounded-md p-4 bg-gray-50">
                            <p className="text-sm text-gray-500">
                              This section would contain editable content in a full implementation.
                              For example, you could edit carousel images, product listings, or text content.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
  );
}