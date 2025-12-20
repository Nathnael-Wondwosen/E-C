import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header({ isMenuOpen, setIsMenuOpen, categories }) {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-gray-300 text-sm py-2 px-4 hidden md:block border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full hover:bg-opacity-70 transition-all duration-300">
              <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">24/7 Global Support</span>
            </div>
            <div className="flex items-center bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full hover:bg-opacity-70 transition-all duration-300">
              <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="font-medium">AI-Powered Security</span>
            </div>
            <div className="flex items-center bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full hover:bg-opacity-70 transition-all duration-300">
              <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">Express Delivery</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
            
            <div className="h-4 w-px bg-gray-600 mx-2"></div>
            
<div className="flex space-x-6">
              <a href="#" className="hover:text-blue-300 transition-colors duration-300 flex items-center group">
                <svg className="w-4 h-4 mr-1 group-hover:text-blue-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="font-medium">Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <img 
                  src="/TE-logo.png" 
                  alt="TradeEthiopia Logo" 
                  className="h-10 w-auto mr-3"
                />
<span className="text-white">TradeEthiopia</span>
              </h1>
            </div>            
            {/* Search Bar */}
            <div className="flex-1 mx-10">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for products, suppliers & more..." 
                  className="w-full py-3 px-4 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <button className="absolute right-0 top-0 h-full px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-r-full hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md">
                  Search
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/favorites" className="flex flex-col items-center text-gray-300 hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span className="text-xs mt-1">Favorites</span>
              </Link>
              
              <Link href="/cart" className="flex flex-col items-center text-gray-300 hover:text-white transition-colors duration-300">
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </div>
                <span className="text-xs mt-1">Cart</span>
              </Link>
              
              <Link href="/login" className="flex flex-col items-center text-gray-300 hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="text-xs mt-1">Account</span>
              </Link>
            </div>
          </div>          
          {/* Mobile Header */}
          <div className="md:hidden py-3 flex items-center justify-between">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-300 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <div className="flex items-center">
              <img 
                src="/TE-logo.png" 
                alt="TradeEthiopia Logo" 
                className="h-8 w-auto mr-2"
              />
<div className="text-xl font-bold text-white">TradeEthiopia</div>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/cart" className="relative p-2">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Link>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full py-2 px-4 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-r-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu - Desktop */}
        <Navbar categories={categories} />
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <MobileMenu setIsMenuOpen={setIsMenuOpen} />
        )}
      </header>
    </>
  );
}

function Navbar({ categories }) {
  const [navbarLinks, setNavbarLinks] = useState([]);

  useEffect(() => {
    // Load navbar links from API
    const loadNavbarLinks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/navbar-links`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const links = await response.json();

        setNavbarLinks(links);
      } catch (error) {
        console.error('Error loading navbar links from API:', error);
        // Fallback to localStorage and then default links
        try {
          const storedLinks = localStorage.getItem('navbarLinks');
          if (storedLinks) {
            const parsedLinks = JSON.parse(storedLinks);
            setNavbarLinks(parsedLinks);
          } else {
            setNavbarLinks([
              { id: 1, title: 'Marketplace', url: '/marketplace', type: 'internal', enabled: true, order: 1 },
              { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
              { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
              { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
              { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
              { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 }
            ]);
          }
        } catch (localStorageError) {
          console.error('Error loading navbar links from localStorage:', localStorageError);
          setNavbarLinks([
            { id: 1, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 1 },
            { id: 2, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 2 },
            { id: 3, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 3 },
            { id: 4, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 4 },
            { id: 5, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 5 }
          ]);
        }
      }
    };
    
    loadNavbarLinks();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadNavbarLinks, 30000);
    
    // Cleanup interval
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="hidden md:block bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex">
          <div className="relative group">
            <button className="flex items-center py-3 px-4 hover:bg-blue-800 hover:bg-opacity-50 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Categories
            </button>
            {/* Dropdown for categories */}
            <div className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-lg rounded-b-lg hidden group-hover:block z-50">
              <div className="py-2">
                {categories && Array.isArray(categories) && categories.slice(0, 6).map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/categories/${category.id}`}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
                <Link href="/categories" className="block px-4 py-2 text-center text-blue-600 hover:bg-gray-100 border-t transition-colors duration-200">
                  View All Categories
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1">
            {navbarLinks
              .filter(link => link.enabled)
              .sort((a, b) => a.order - b.order)
              .map(link => (
                link.type === 'external' ? (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="py-3 px-4 hover:bg-blue-800 hover:bg-opacity-50 transition-all duration-300"
                  >
                    {link.title}
                  </a>
                ) : (
                  <Link 
                    key={link.id} 
                    href={link.url}
                    className="py-3 px-4 hover:bg-blue-800 hover:bg-opacity-50 transition-all duration-300"
                  >
                    {link.title}
                  </Link>
                )
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ setIsMenuOpen }) {
  const [navbarLinks, setNavbarLinks] = useState([]);

  useEffect(() => {
    // Load navbar links from API
    const loadNavbarLinks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/navbar-links`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const links = await response.json();
        setNavbarLinks(links);
      } catch (error) {
        console.error('Error loading navbar links from API:', error);
        // Fallback to localStorage and then default links
        try {
          const storedLinks = localStorage.getItem('navbarLinks');
          
          if (storedLinks) {
            const parsedLinks = JSON.parse(storedLinks);
            
            setNavbarLinks(parsedLinks);
          } else {
            
            setNavbarLinks([
              { id: 1, title: 'Marketplace', url: '/marketplace', type: 'internal', enabled: true, order: 1 },
              { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
              { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
              { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
              { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
              { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 }
            ]);
          }
        } catch (localStorageError) {
          console.error('Error loading navbar links from localStorage:', localStorageError);
          setNavbarLinks([
            { id: 1, title: 'Marketplace', url: '/marketplace', type: 'internal', enabled: true, order: 1 },
            { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
            { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
            { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
            { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
            { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 }
          ]);
        }
      }
    };
    
    loadNavbarLinks();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadNavbarLinks, 30000);
    
    // Cleanup interval
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="md:hidden bg-white shadow-lg absolute w-full z-40">
      <div className="py-2 border-b">
        <Link 
          href="/categories" 
          className="block px-4 py-3 hover:bg-gray-100 flex items-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          All Categories
        </Link>
        
        {navbarLinks
          .filter(link => link.enabled)
          .sort((a, b) => a.order - b.order)
          .map(link => (
            link.type === 'external' ? (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </a>
            ) : (
              <Link 
                key={link.id} 
                href={link.url}
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            )
          ))}
      </div>
      
      <div className="py-2">
        <Link 
          href="/login" 
          className="block px-4 py-3 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign In
        </Link>
        <Link 
          href="/register" 
          className="block px-4 py-3 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Register
        </Link>
      </div>
    </div>
  );
}