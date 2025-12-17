import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories as getCategoriesData } from '../../utils/heroDataService';
import FilterSidebar from './FilterSidebar';
import ProductGrid from './ProductGrid';

export default function B2BMarketplace() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navbarLinks, setNavbarLinks] = useState([]);
  
  // Enhanced filter states
  const [filters, setFilters] = useState({
    search: '',
    categories: [], // Changed from single category to array
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'name',
    inStock: false,
    minRating: 0,
    hasDiscount: false,
    isNew: false,
    businessType: '',
    country: '',
    maxLeadTime: '',
    certifications: ''
  });

  // Items per page for infinite scrolling
  const ITEMS_PER_PAGE = 12;

  // Load navbar links
  useEffect(() => {
    const loadNavbarLinks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/navbar-links');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const links = await response.json();
        setNavbarLinks(links);
      } catch (error) {
        console.error('Error loading navbar links from API:', error);
        // Fallback to default links
        setNavbarLinks([
          { id: 1, title: 'Marketplace', url: '/marketplace', type: 'internal', enabled: true, order: 1 },
          { id: 2, title: 'Products', url: '/products', type: 'internal', enabled: true, order: 2 },
          { id: 3, title: 'Suppliers', url: '/suppliers', type: 'internal', enabled: true, order: 3 },
          { id: 4, title: 'Deals', url: '/deals', type: 'internal', enabled: true, order: 4 },
          { id: 5, title: 'Ready to Ship', url: '/ready-to-ship', type: 'internal', enabled: true, order: 5 },
          { id: 6, title: 'Trade Shows', url: '/trade-shows', type: 'internal', enabled: true, order: 6 }
        ]);
      }
    };
    
    loadNavbarLinks();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategoriesData()
        ]);
        
        // Filter for B2B products only
        const b2bProducts = fetchedProducts.filter(product => product.productType === 'B2B');
        
        // Convert MongoDB _id to id for frontend compatibility
        const convertedProducts = b2bProducts.map(product => ({
          ...product,
          id: product._id || product.id
        }));
        
        const convertedCategories = fetchedCategories.map(category => ({
          ...category,
          id: category._id || category.id
        }));
        
        setProducts(convertedProducts);
        setCategories(convertedCategories);
        // Set initial displayed products
        setDisplayedProducts(convertedProducts.slice(0, ITEMS_PER_PAGE));
        setHasMore(convertedProducts.length > ITEMS_PER_PAGE);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter and sort products
  const getFilteredProducts = useCallback(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = filters.search === '' || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase());
      
      // Category filter (multi-select)
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category);
      
      // Price filter
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      
      // Stock filter
      const matchesStock = !filters.inStock || product.inStock;
      
      // Rating filter
      const matchesRating = !filters.minRating || (product.rating && product.rating >= filters.minRating);
      
      // Discount filter
      const matchesDiscount = !filters.hasDiscount || (product.discountPercentage && product.discountPercentage > 0);
      
      // New arrival filter
      const matchesNew = !filters.isNew || product.isNew;
      
      // B2B-specific filters
      const matchesBusinessType = !filters.businessType || product.businessType === filters.businessType;
      
      const matchesCountry = !filters.country || 
        (product.country && product.country.toLowerCase().includes(filters.country.toLowerCase()));
      
      const matchesLeadTime = !filters.maxLeadTime || 
        (product.leadTime !== undefined && product.leadTime <= parseInt(filters.maxLeadTime));
      
      const matchesCertifications = !filters.certifications || 
        (product.certifications && product.certifications.some(cert => 
          cert.toLowerCase().includes(filters.certifications.toLowerCase())));
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating && 
        matchesDiscount && matchesNew && matchesBusinessType && matchesCountry && 
        matchesLeadTime && matchesCertifications;
    }).sort((a, b) => {
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'price-low') {
        return a.price - b.price;
      } else if (filters.sortBy === 'price-high') {
        return b.price - a.price;
      } else if (filters.sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (filters.sortBy === 'newest') {
        // Assuming products have a date field, using id as proxy for creation time
        return (b._id || b.id).localeCompare(a._id || a.id);
      } else if (filters.sortBy === 'discount') {
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      }
      return 0;
    });
  }, [products, filters]);

  // Update displayed products when filters change
  useEffect(() => {
    const filtered = getFilteredProducts();
    setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [filters, getFilteredProducts]);

  // Load more products for infinite scrolling
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const filteredProducts = getFilteredProducts();
    const nextProducts = filteredProducts.slice(0, nextPage * ITEMS_PER_PAGE);
    
    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setPage(nextPage);
      setHasMore(nextProducts.length < filteredProducts.length);
      setIsLoadingMore(false);
    }, 500); // Simulate network delay
  }, [page, hasMore, isLoadingMore, getFilteredProducts]);

  // Handle scroll for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'name',
      inStock: false,
      minRating: 0,
      hasDiscount: false,
      isNew: false,
      businessType: '',
      country: '',
      maxLeadTime: '',
      certifications: ''
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
          <p className="text-gray-600">{error}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>B2B Marketplace | TradeEthiopia</title>
        <meta name="description" content="Connect with verified suppliers and buyers for bulk orders" />
      </Head>

      {/* Custom Header without TopBar */}
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
                <span className="text-white">TradeEthiopia B2B</span>
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
              <div className="text-xl font-bold text-white">TradeEthiopia B2B</div>
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
        
        {/* Mobile Menu */}
        {isMenuOpen && (
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
        )}
      </header>

      {/* Modern Breadcrumb with Hero Section-like Imagery */}
      <div className="relative h-32 md:h-40 lg:h-48 overflow-hidden">
        {/* Background image with gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-background.jpg')"
          }}
        >
          {/* Gradient overlay similar to hero section */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900/70 to-indigo-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-indigo-900/10"></div>
        </div>
        
        {/* Breadcrumb content */}
        <div className="container mx-auto px-4 md:px-6 flex flex-col justify-center relative z-10 h-full">
          <div className="text-white max-w-3xl">
            {/* Breadcrumb navigation */}
            <nav className="flex items-center text-sm font-medium mb-3 md:mb-4">
              <Link href="/" className="hover:text-blue-200 transition-colors duration-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Home
              </Link>
              <svg className="w-4 h-4 mx-2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              <span className="text-blue-200">B2B Marketplace</span>
            </nav>
            
            {/* Page title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent inline-block drop-shadow-lg">
                B2B Marketplace
              </span>
            </h1>
            
            {/* Decorative line */}
            <div className="mt-2 md:mt-3">
              <div className="w-10 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Hidden on mobile by default */}
          <div className="lg:w-1/5">
            <FilterSidebar 
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-4/5">
            {/* Products Grid */}
            <ProductGrid 
              products={displayedProducts} 
              loading={loading}
              onFilterChange={handleFilterChange}
              currentSort={filters.sortBy}
            />

            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* End of results message */}
            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                You've reached the end of the products
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}