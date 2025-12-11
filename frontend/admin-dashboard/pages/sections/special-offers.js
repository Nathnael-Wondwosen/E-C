import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function SpecialOffersManagement() {
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "Flash Sale - 24 Hours Only",
      description: "Up to 70% off on selected electronics",
      imageUrl: "/images/flash-sale.jpg",
      discount: "70%",
      expiryDate: "2025-12-15",
      isActive: true
    },
    {
      id: 2,
      title: "Buy 1 Get 1 Free",
      description: "On all clothing items this week",
      imageUrl: "/images/bogo.jpg",
      discount: "50%",
      expiryDate: "2025-12-20",
      isActive: true
    },
    {
      id: 3,
      title: "Free Gift with Purchase",
      description: "Free gift on orders over $150",
      imageUrl: "/images/free-gift.jpg",
      discount: "Free",
      expiryDate: "2025-12-25",
      isActive: false
    }
  ]);

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    imageUrl: '',
    discount: '',
    expiryDate: ''
  });

  const handleAddOffer = () => {
    if (newOffer.title && newOffer.discount) {
      const offer = {
        id: offers.length + 1,
        ...newOffer,
        isActive: true
      };
      setOffers([...offers, offer]);
      setNewOffer({
        title: '',
        description: '',
        imageUrl: '',
        discount: '',
        expiryDate: ''
      });
    }
  };

  const handleDeleteOffer = (id) => {
    setOffers(offers.filter(offer => offer.id !== id));
  };

  const toggleOfferStatus = (id) => {
    setOffers(offers.map(offer => 
      offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
    ));
  };

  return (
    <AdminLayout title="Special Offers Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Special Offers Management
              </h1>
            </div>
          </div>

          <div className="mt-6">
            {/* Add New Offer Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Offer</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Offer title"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount (% or Free)
                  </label>
                  <input
                    type="text"
                    id="discount"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., 50% or Free"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Offer description"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="/images/offer.jpg"
                    value={newOffer.imageUrl}
                    onChange={(e) => setNewOffer({...newOffer, imageUrl: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    value={newOffer.expiryDate}
                    onChange={(e) => setNewOffer({...newOffer, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleAddOffer}
                >
                  Add Offer
                </button>
              </div>
            </div>

            {/* Offers List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Current Offers</h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {offers.map((offer) => (
                  <li key={offer.id} className={`${offer.isActive ? '' : 'opacity-60'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                    <div className="block">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                              <img 
                                src={offer.imageUrl} 
                                alt={offer.title} 
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
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{offer.title}</p>
                              <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span>{offer.description}</span>
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  Discount: <span className="font-medium">{offer.discount}</span>
                                </p>
                                <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <span>Expires: {offer.expiryDate}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {offer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleOfferStatus(offer.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {offer.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
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