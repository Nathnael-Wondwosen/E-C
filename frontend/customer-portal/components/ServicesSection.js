import { useState, useEffect } from 'react';
import { getServices } from '../../utils/heroDataService';

export default function ServicesSection() {
  const [services, setServices] = useState([]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await getServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to mock data
        const mockServices = [
          { 
            id: 1, 
            title: 'Product Sourcing', 
            description: 'Find and source quality products from verified suppliers worldwide', 
            icon: '🔍',
            isActive: true, 
            order: 1 
          },
          { 
            id: 2, 
            title: 'Logistics', 
            description: 'End-to-end shipping and logistics solutions for international trade', 
            icon: '🚚',
            isActive: true, 
            order: 2 
          },
          { 
            id: 3, 
            title: 'Payment Solutions', 
            description: 'Secure and reliable payment processing for B2B transactions', 
            icon: '💳',
            isActive: true, 
            order: 3 
          },
          { 
            id: 4, 
            title: 'Market Analysis', 
            description: 'Comprehensive market research and competitive intelligence', 
            icon: '📊',
            isActive: true, 
            order: 4 
          }
        ];
        setServices(mockServices);
      }
    };

    fetchServices();
  }, []);

  // Sort services by order
  const sortedServices = services
    .filter(service => service.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive solutions to help your business thrive in the global marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sortedServices.map((service) => (
            <div 
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-2xl mb-4 mx-auto shadow-sm">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}