import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories as getCategoriesData } from '../../utils/heroDataService';
import FilterSidebar from '../../components/FilterSidebar';
import ProductGrid from './ProductGrid';
import Header from '../../components/header/Header'; // Import the shared Header component

export default function Marketplace() {
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
    isNew: false
  });

  // Items per page for infinite scrolling
  const ITEMS_PER_PAGE = 12;

  // Load navbar links
  useEffect(() => {
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
        
        // Filter out B2B products - only show regular products in marketplace
        const regularProducts = fetchedProducts.filter(product => product.productType !== 'B2B');
        
        // Convert MongoDB _id to id for frontend compatibility
        const convertedProducts = regularProducts.map(product => ({
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
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating && matchesDiscount && matchesNew;
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
      isNew: false
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
        <title>Marketplace | TradeEthiopia</title>
        <meta name="description" content="Browse products in our marketplace" />
      </Head>

      <Header 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        categories={categories}
      />

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
              <span className="text-blue-200">Marketplace</span>
            </nav>
            
            {/* Page title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent inline-block drop-shadow-lg">
                Marketplace
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