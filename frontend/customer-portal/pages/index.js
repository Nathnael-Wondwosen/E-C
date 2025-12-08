import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentNewCategoryIndex, setCurrentNewCategoryIndex] = useState(0);
  const [currentHeroCategoryIndex, setCurrentHeroCategoryIndex] = useState(0);
  const [currentViralProductIndex, setCurrentViralProductIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [visibleCategories, setVisibleCategories] = useState([]);

  // Sample carousel data
  const carouselSlides = [
    {
      id: 1,
      title: "Global Trade Solutions",
      subtitle: "Connect with suppliers worldwide",
      image: "/placeholder-carousel.jpg",
      cta: "Explore Marketplace"
    },
    {
      id: 2,
      title: "Wholesale Excellence",
      subtitle: "Bulk orders with competitive pricing",
      image: "/placeholder-carousel.jpg",
      cta: "View Products"
    },
    {
      id: 3,
      title: "Verified Suppliers",
      subtitle: "Trusted partners for your business",
      image: "/placeholder-carousel.jpg",
      cta: "Find Suppliers"
    }
  ];

  // Sample categories
  const categories = [
    { id: 1, name: 'Electronics', icon: '🔌', count: 12000, image: '/placeholder-category.jpg' },
    { id: 2, name: 'Fashion', icon: '👕', count: 8500, image: '/placeholder-category.jpg' },
    { id: 3, name: 'Home & Garden', icon: '🏠', count: 7200, image: '/placeholder-category.jpg' },
    { id: 4, name: 'Sports', icon: '⚽', count: 5600, image: '/placeholder-category.jpg' },
    { id: 5, name: 'Beauty', icon: '💄', count: 4800, image: '/placeholder-category.jpg' },
    { id: 6, name: 'Automotive', icon: '🚗', count: 6300, image: '/placeholder-category.jpg' },
    { id: 7, name: 'Industrial', icon: '⚙️', count: 9200, image: '/placeholder-category.jpg' },
    { id: 8, name: 'Toys', icon: '🧸', count: 3400, image: '/placeholder-category.jpg' },
    { id: 9, name: 'Books', icon: '📚', count: 5200, image: '/placeholder-category.jpg' },
    { id: 10, name: 'Health', icon: '⚕️', count: 4100, image: '/placeholder-category.jpg' },
    { id: 11, name: 'Jewelry', icon: '💍', count: 3800, image: '/placeholder-category.jpg' },
    { id: 12, name: 'Food & Beverage', icon: '🍎', count: 7600, image: '/placeholder-category.jpg' },
    { id: 13, name: 'Office Supplies', icon: '📎', count: 3200, image: '/placeholder-category.jpg' },
    { id: 14, name: 'Pet Care', icon: '🐶', count: 2900, image: '/placeholder-category.jpg' },
    { id: 15, name: 'Tools', icon: '🔧', count: 6700, image: '/placeholder-category.jpg' },
    { id: 16, name: 'Baby Products', icon: '👶', count: 4300, image: '/placeholder-category.jpg' },
    { id: 17, name: 'Furniture', icon: '🪑', count: 5100, image: '/placeholder-category.jpg' },
    { id: 18, name: 'Lighting', icon: '💡', count: 3700, image: '/placeholder-category.jpg' },
    { id: 19, name: 'Appliances', icon: 'washer', count: 4500, image: '/placeholder-category.jpg' },
    { id: 20, name: 'Computers', icon: '💻', count: 8900, image: '/placeholder-category.jpg' },
    { id: 21, name: 'Phones', icon: '📱', count: 11200, image: '/placeholder-category.jpg' },
    { id: 22, name: 'Audio', icon: '🎧', count: 3200, image: '/placeholder-category.jpg' },
    { id: 23, name: 'Cameras', icon: '📷', count: 2800, image: '/placeholder-category.jpg' },
    { id: 24, name: 'Gaming', icon: '🎮', count: 4300, image: '/placeholder-category.jpg' },
    { id: 25, name: 'Travel', icon: '🧳', count: 2100, image: '/placeholder-category.jpg' },
    { id: 26, name: 'Outdoors', icon: '⛺', count: 3500, image: '/placeholder-category.jpg' },
    { id: 27, name: 'Crafts', icon: '✂️', count: 1900, image: '/placeholder-category.jpg' },
    { id: 28, name: 'Music', icon: '🎵', count: 2700, image: '/placeholder-category.jpg' },
    { id: 29, name: 'Movies', icon: '🎬', count: 3100, image: '/placeholder-category.jpg' },
    { id: 30, name: 'Software', icon: '🖥️', count: 5600, image: '/placeholder-category.jpg' },
  ];

  // Sample featured products
  const featuredProducts = [
    { id: 1, name: 'Smartphone X Pro', price: '$299.99', moq: '100 pcs', image: '/placeholder-product.jpg' },
    { id: 2, name: 'Bluetooth Headphones', price: '$49.99', moq: '50 pcs', image: '/placeholder-product.jpg' },
    { id: 3, name: 'Office Desk Chair', price: '$89.99', moq: '20 pcs', image: '/placeholder-product.jpg' },
    { id: 4, name: 'Stainless Steel Cookware', price: '$129.99', moq: '30 pcs', image: '/placeholder-product.jpg' },
    { id: 5, name: 'Fitness Tracker Watch', price: '$39.99', moq: '100 pcs', image: '/placeholder-product.jpg' },
    { id: 6, name: 'LED Desk Lamp', price: '$24.99', moq: '50 pcs', image: '/placeholder-product.jpg' },
  ];

  // Viral/Trending products
  const viralProducts = [
    { id: 1, name: 'Wireless Noise Cancelling Headphones Pro X', price: '$129.99', originalPrice: '$199.99', trendType: 'Viral', image: '/placeholder-product.jpg' },
    { id: 2, name: 'Smart Fitness Tracker Watch Series 5', price: '$79.99', originalPrice: '$129.99', trendType: 'Hot', image: '/placeholder-product.jpg' },
    { id: 3, name: 'Portable Bluetooth Speaker with 360° Sound', price: '$49.99', originalPrice: '$79.99', trendType: 'Trending', image: '/placeholder-product.jpg' },
    { id: 4, name: 'Ergonomic Mechanical Gaming Keyboard RGB', price: '$89.99', originalPrice: '$129.99', trendType: 'Popular', image: '/placeholder-product.jpg' },
    { id: 5, name: '4K Ultra HD Action Camera with Waterproof Case', price: '$149.99', originalPrice: '$249.99', trendType: 'Viral', image: '/placeholder-product.jpg' },
    { id: 6, name: 'Smart Home Security Camera System 4 Pack', price: '$199.99', originalPrice: '$299.99', trendType: 'Hot', image: '/placeholder-product.jpg' },
    { id: 7, name: 'Premium Coffee Bean Grinder Electric', price: '$59.99', originalPrice: '$89.99', trendType: 'Trending', image: '/placeholder-product.jpg' },
    { id: 8, name: 'Wireless Charging Pad for Smartphones', price: '$24.99', originalPrice: '$39.99', trendType: 'Popular', image: '/placeholder-product.jpg' },
  ];

  // Banner slides for full width section
  const bannerSlides = [
    {
      title: "Global Trade Revolution",
      description: "Connect with verified suppliers worldwide and access exclusive deals on bulk orders. Expand your business globally with our trusted platform.",
      image: "/placeholder-banner-1.jpg",
      cta: "Explore Marketplace",
      link: "/marketplace"
    },
    {
      title: "Premium Quality Assurance",
      description: "Every product undergoes rigorous quality checks. Our verified supplier program ensures you receive only the best products.",
      image: "/placeholder-banner-2.jpg",
      cta: "Learn About QA",
      link: "/quality-assurance"
    },
    {
      title: "Seasonal Mega Sale",
      description: "Up to 70% off on selected categories. Limited time offer on electronics, fashion, and industrial supplies.",
      image: "/placeholder-banner-3.jpg",
      cta: "Shop Now",
      link: "/deals"
    }
  ];

  // Random products for featured section
  const randomProducts = [
    { id: 1, name: 'Professional Wireless Headphones', description: 'Noise cancelling headphones with 30hr battery life and premium sound quality.', price: '$129.99', originalPrice: '$199.99', rating: 4.5, reviewCount: 128, isNew: true },
    { id: 2, name: 'Ergonomic Office Chair', description: 'Adjustable lumbar support office chair with breathable mesh back.', price: '$199.99', rating: 4.2, reviewCount: 86, isNew: false },
    { id: 3, name: 'Smart Fitness Tracker', description: 'Waterproof fitness tracker with heart rate monitor and sleep tracking.', price: '$79.99', originalPrice: '$129.99', rating: 4.7, reviewCount: 245, isNew: true },
    { id: 4, name: 'Stainless Steel Cookware Set', description: '10-piece professional grade cookware set with lifetime warranty.', price: '$249.99', rating: 4.8, reviewCount: 192, isNew: false },
    { id: 5, name: '4K Ultra HD Smart TV', description: '55-inch smart TV with HDR and voice control remote.', price: '$499.99', originalPrice: '$699.99', rating: 4.6, reviewCount: 312, isNew: false },
    { id: 6, name: 'Bluetooth Portable Speaker', description: '360-degree sound with 20hr battery life and waterproof design.', price: '$89.99', rating: 4.3, reviewCount: 156, isNew: true },
    { id: 7, name: 'Organic Cotton Bed Sheets', description: 'Luxury 400-thread count organic cotton bed sheets in multiple colors.', price: '$79.99', rating: 4.4, reviewCount: 98, isNew: false },
    { id: 8, name: 'Electric Standing Desk', description: 'Height adjustable standing desk with memory presets and cable management.', price: '$349.99', originalPrice: '$449.99', rating: 4.1, reviewCount: 74, isNew: true }
  ];

  // Popular products for sliding text section
  const popularProducts = [
    { name: 'Wireless Earbuds Pro', price: '$89.99' },
    { name: 'Smart Watch Series 5', price: '$199.99' },
    { name: 'Bluetooth Speaker', price: '$59.99' },
    { name: 'Gaming Keyboard', price: '$79.99' },
    { name: '4K Webcam', price: '$129.99' },
    { name: 'Mechanical Mouse', price: '$49.99' },
    { name: 'USB-C Hub', price: '$39.99' },
    { name: 'External SSD 1TB', price: '$149.99' },
    { name: 'Wireless Charger', price: '$29.99' },
    { name: 'Noise Cancelling Headphones', price: '$159.99' }
  ];

  // Industry news data
  const industryNews = [
    {
      title: 'Global Supply Chain Recovery Accelerates',
      excerpt: 'International trade routes are showing strong recovery signs with 15% increase in shipping volumes compared to last quarter.',
      date: 'Dec 5, 2025',
      category: 'Market Trends',
      link: '/news/supply-chain-recovery'
    },
    {
      title: 'New Regulations for Cross-Border E-Commerce',
      excerpt: 'Government announces streamlined customs procedures for B2B transactions, reducing clearance times by up to 40%.',
      date: 'Nov 28, 2025',
      category: 'Regulations',
      link: '/news/new-regulations'
    },
    {
      title: 'Sustainable Packaging Becomes Industry Standard',
      excerpt: 'Leading suppliers adopt eco-friendly packaging solutions, driving industry-wide sustainability initiatives.',
      date: 'Nov 22, 2025',
      category: 'Sustainability',
      link: '/news/sustainable-packaging'
    }
  ];

  // Business insights/blog data
  const businessInsights = [
    {
      title: 'Optimizing Your Procurement Strategy',
      excerpt: 'Discover proven techniques to reduce costs while maintaining quality standards in your supply chain operations.',
      author: 'Sarah Johnson',
      date: 'Dec 3, 2025',
      tags: ['Procurement', 'Cost Reduction', 'Strategy'],
      link: '/blog/procurement-strategy'
    },
    {
      title: 'Building Strong Supplier Relationships',
      excerpt: 'Essential communication skills and practices for establishing long-term partnerships with international suppliers.',
      author: 'Michael Chen',
      date: 'Nov 29, 2025',
      tags: ['Supplier Relations', 'Communication', 'Partnerships'],
      link: '/blog/supplier-relationships'
    },
    {
      title: 'Digital Transformation in Manufacturing',
      excerpt: 'How Industry 4.0 technologies are reshaping production processes and creating new business opportunities.',
      author: 'Emma Rodriguez',
      date: 'Nov 25, 2025',
      tags: ['Digitalization', 'Manufacturing', 'Innovation'],
      link: '/blog/digital-transformation'
    }
  ];

  // Promotional banners with sliding images
  const promoBanners = [
    {
      id: 1,
      title: "Summer Sale Event",
      subtitle: "Up to 70% off on selected items",
      description: "Don't miss our biggest sale of the year. Exclusive deals on electronics, fashion, and home goods. Limited time offer - shop now!",
      image: "/placeholder-promo.jpg",
      cta: "Shop Now",
      bgColor: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "New Supplier Program",
      subtitle: "Join our verified supplier network",
      description: "Expand your business globally by joining our trusted supplier network. Access millions of buyers and grow your revenue.",
      image: "/placeholder-promo.jpg",
      cta: "Learn More",
      bgColor: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      title: "Trade Show 2025",
      subtitle: "Global B2B Exhibition",
      description: "Join industry leaders at the premier B2B trade event. Network, discover new products, and forge valuable business connections.",
      image: "/placeholder-promo.jpg",
      cta: "Register Now",
      bgColor: "from-purple-500 to-pink-600"
    }
  ];

  // Hot deals with premium indicators
  const hotDeals = [
    { id: 1, name: 'Smart Home Kit', discount: '30% OFF', originalPrice: '$199.99', discountedPrice: '$139.99', image: '/placeholder-product.jpg', isPremium: true, isHot: true },
    { id: 2, name: 'Wireless Earbuds', discount: '25% OFF', originalPrice: '$89.99', discountedPrice: '$67.49', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 3, name: 'Coffee Maker', discount: '40% OFF', originalPrice: '$129.99', discountedPrice: '$77.99', image: '/placeholder-product.jpg', isPremium: true, isHot: false },
    { id: 4, name: 'Backpack Travel', discount: '20% OFF', originalPrice: '$59.99', discountedPrice: '$47.99', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 5, name: 'Bluetooth Speaker', discount: '15% OFF', originalPrice: '$79.99', discountedPrice: '$67.99', image: '/placeholder-product.jpg', isPremium: true, isHot: false },
    { id: 6, name: 'Electric Kettle', discount: '35% OFF', originalPrice: '$49.99', discountedPrice: '$32.49', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 7, name: 'Desk Organizer', discount: '50% OFF', originalPrice: '$39.99', discountedPrice: '$19.99', image: '/placeholder-product.jpg', isPremium: true, isHot: true },
    { id: 8, name: 'USB Charging Hub', discount: '20% OFF', originalPrice: '$54.99', discountedPrice: '$43.99', image: '/placeholder-product.jpg', isPremium: false, isHot: false },
  ];

  // Group categories into chunks for sliding
  const categoryGroups = [];
  for (let i = 0; i < categories.length; i += 6) {
    categoryGroups.push(categories.slice(i, i + 6));
  }

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  // Auto-advance deals
  useEffect(() => {
    const interval = setInterval(() => {
      scrollDeals('right');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance promo banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev === promoBanners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance categories
  useEffect(() => {
    const interval = setInterval(() => {
      const totalGroups = Math.ceil(categories.length / 4);
      const currentGroup = Math.floor(currentCategoryIndex / 4);
      const newGroup = currentGroup === totalGroups - 1 ? 0 : currentGroup + 1;
      setCurrentCategoryIndex(newGroup * 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length, currentCategoryIndex]);

  // Auto-advance new category groups
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewCategoryIndex((prev) => (prev === categoryGroups.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [categoryGroups.length]);

  // Auto-advance hero categories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroCategoryIndex((prev) => (prev >= categories.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  // Auto-advance viral products
  useEffect(() => {
    const interval = setInterval(() => {
      const totalGroups = Math.ceil(viralProducts.length / 4);
      setCurrentViralProductIndex(prev => (prev === totalGroups - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  // Auto-advance news
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex(prev => (prev === industryNews.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [industryNews.length]);

  // Auto-advance blogs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlogIndex(prev => (prev === businessInsights.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [businessInsights.length]);

  // Handle horizontal scrolling for deals
  const scrollDeals = (direction) => {
    const container = document.getElementById('deals-container');
    if (container) {
      const scrollAmount = 320; // Adjusted for minimized card width
      if (direction === 'left') {
        setCurrentDealIndex(prev => (prev === 0 ? hotDeals.length - 1 : prev - 1));
      } else {
        setCurrentDealIndex(prev => (prev === hotDeals.length - 1 ? 0 : prev + 1));
      }
    }
  };

  // Handle category navigation
  const scrollCategories = (direction) => {
    const totalGroups = Math.ceil(categories.length / 4);
    const currentGroup = Math.floor(currentCategoryIndex / 4);
    
    if (direction === 'left') {
      const newGroup = currentGroup === 0 ? totalGroups - 1 : currentGroup - 1;
      setCurrentCategoryIndex(newGroup * 4);
    } else {
      const newGroup = currentGroup === totalGroups - 1 ? 0 : currentGroup + 1;
      setCurrentCategoryIndex(newGroup * 4);
    }
  };

  // Handle new category group navigation
  const navigateNewCategories = (direction) => {
    if (direction === 'left') {
      setCurrentNewCategoryIndex(prev => (prev === 0 ? categoryGroups.length - 1 : prev - 1));
    } else {
      setCurrentNewCategoryIndex(prev => (prev === categoryGroups.length - 1 ? 0 : prev + 1));
    }
  };

  // Handle viral products navigation
  const scrollViralProducts = (direction) => {
    const totalGroups = Math.ceil(viralProducts.length / 4);
    if (direction === 'left') {
      setCurrentViralProductIndex(prev => (prev === 0 ? totalGroups - 1 : prev - 1));
    } else {
      setCurrentViralProductIndex(prev => (prev === totalGroups - 1 ? 0 : prev + 1));
    }
  };

  // Handle banner navigation
  const scrollBanners = (direction) => {
    if (direction === 'left') {
      setCurrentBannerIndex(prev => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
    } else {
      setCurrentBannerIndex(prev => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }
  };

  // Handle news navigation with infinite loop
  const scrollNews = (direction) => {
    if (direction === 'up') {
      setCurrentNewsIndex(prev => (prev > 0 ? prev - 1 : industryNews.length - 1));
    } else {
      setCurrentNewsIndex(prev => (prev < industryNews.length - 1 ? prev + 1 : 0));
    }
  };

  // Handle blog navigation with infinite loop
  const scrollBlogs = (direction) => {
    if (direction === 'left') {
      setCurrentBlogIndex(prev => (prev > 0 ? prev - 1 : businessInsights.length - 1));
    } else {
      setCurrentBlogIndex(prev => (prev < businessInsights.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>B2B E-Commerce Platform | Global Trade Solutions</title>
        <meta name="description" content="Advanced B2B E-Commerce Platform for business procurement" />
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
            @keyframes slide-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            
            @keyframes slide-right {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(0);
              }
            }
            
            .animate-slide-left {
              animation: slide-left 30s linear infinite;
            }
            
            .animate-slide-right {
              animation: slide-right 30s linear infinite;
            }
          `}
        </style>
      </Head>

      {/* Top Bar */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between">
          <div>Welcome to our B2B Marketplace</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-600">Help Center</a>
            <a href="#" className="hover:text-blue-600">Buyer Protection</a>
            <a href="#" className="hover:text-blue-600">Customer Service</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 flex items-center">
                <span className="bg-blue-600 text-white rounded-lg px-2 py-1 mr-2">BC</span>
                BizCommerce
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 mx-10">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for products, suppliers & more..." 
                  className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition">
                  Search
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/favorites" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span className="text-xs mt-1">Favorites</span>
              </Link>
              
              <Link href="/cart" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </div>
                <span className="text-xs mt-1">Cart</span>
              </Link>
              
              <Link href="/login" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
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
              className="p-2 rounded-md text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <div className="text-xl font-bold text-blue-600">BizCommerce</div>
            
            <div className="flex space-x-4">
              <Link href="/cart" className="relative p-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu - Desktop */}
        <nav className="hidden md:block bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="flex">
              <div className="relative group">
                <button className="flex items-center py-3 px-4 hover:bg-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                  Categories
                </button>
                {/* Dropdown for categories */}
                <div className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-lg rounded-b-lg hidden group-hover:block z-50">
                  <div className="py-2">
                    {categories.slice(0, 6).map((category) => (
                      <Link 
                        key={category.id} 
                        href={`/categories/${category.id}`}
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <span className="mr-3 text-lg">{category.icon}</span>
                        <span>{category.name}</span>
                      </Link>
                    ))}
                    <Link href="/categories" className="block px-4 py-2 text-center text-blue-600 hover:bg-gray-100 border-t">
                      View All Categories
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-1">
                <Link href="/products" className="py-3 px-4 hover:bg-blue-700">Products</Link>
                <Link href="/suppliers" className="py-3 px-4 hover:bg-blue-700">Suppliers</Link>
                <Link href="/deals" className="py-3 px-4 hover:bg-blue-700">Deals</Link>
                <Link href="/ready-to-ship" className="py-3 px-4 hover:bg-blue-700">Ready to Ship</Link>
                <Link href="/trade-shows" className="py-3 px-4 hover:bg-blue-700">Trade Shows</Link>
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
              <Link 
                href="/products" 
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/suppliers" 
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Suppliers
              </Link>
              <Link 
                href="/deals" 
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link 
                href="/ready-to-ship" 
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Ready to Ship
              </Link>
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

      <main>
        {/* Hero Carousel */}
        <section className="relative bg-gray-200 h-64 md:h-96 overflow-hidden">
          {carouselSlides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full flex items-center">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 text-white">
                    <h2 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h2>
                    <p className="text-lg md:text-xl mb-6">{slide.subtitle}</p>
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                      {slide.cta}
                    </button>
                  </div>
                  <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center">
                    <div className="bg-white bg-opacity-20 border-2 border-dashed border-white border-opacity-30 rounded-xl w-64 h-48 md:w-80 md:h-64 flex items-center justify-center">
                      <span className="text-white text-lg">Carousel Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
            
            {/* Single Row Horizontal Scrolling Container */}
            <div className="relative">
              <div 
                id="hero-categories-container"
                className="flex overflow-x-hidden pb-4 snap-mandatory snap-x w-full"
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentHeroCategoryIndex * 150}px)` }}
                >
                  {/* Render all categories in a single row */}
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex-shrink-0 w-32 md:w-36 bg-white rounded-xl p-4 hover:bg-gray-50 transition transform hover:-translate-y-1 shadow-sm hover:shadow-md mx-2 snap-start"
                    >
                      <Link 
                        href={`/categories/${category.id}`}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{category.count.toLocaleString()} items</div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gradient Overlays for Edge Indication */}
              <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </div>
            
            {/* Category Indicators - Dots for each category */}
            <div className="flex justify-center mt-4 space-x-1 overflow-x-auto pb-2">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroCategoryIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0 ${index === currentHeroCategoryIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Hot Deals Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-0">
            <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Hot Deals</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => scrollDeals('left')}
                  className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => scrollDeals('right')}
                  className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
                <Link href="/deals" className="ml-2 text-blue-600 hover:underline flex items-center">
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Horizontal Scroll Container - Infinite Loop */}
            <div 
              id="deals-container"
              className="flex overflow-x-hidden pb-6 snap-mandatory snap-x w-full"
            >
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentDealIndex * 320}px)` }}>
                {/* Duplicate first set of cards for infinite loop effect */}
                {hotDeals.map((deal) => (
                  <div 
                    key={`first-${deal.id}`} 
                    className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition snap-start mx-2 first:ml-4"
                  >
                    <div className="relative">
                      <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-44 flex items-center justify-center">
                        <span className="text-gray-500">Product Image</span>
                      </div>
                      
                      {/* Premium Badge */}
                      {deal.isPremium && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PREMIUM
                        </div>
                      )}
                      
                      {/* Hot Badge */}
                      {deal.isHot && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          HOT
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {deal.discount && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {deal.discount}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{deal.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-bold">{deal.discountedPrice}</span>
                          <span className="text-gray-500 line-through text-xs">{deal.originalPrice}</span>
                        </div>
                        <button className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Original set of cards */}
                {hotDeals.map((deal) => (
                  <div 
                    key={`original-${deal.id}`} 
                    className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition snap-start mx-2"
                  >
                    <div className="relative">
                      <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-44 flex items-center justify-center">
                        <span className="text-gray-500">Product Image</span>
                      </div>
                      
                      {/* Premium Badge */}
                      {deal.isPremium && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PREMIUM
                        </div>
                      )}
                      
                      {/* Hot Badge */}
                      {deal.isHot && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          HOT
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {deal.discount && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {deal.discount}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{deal.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-bold">{deal.discountedPrice}</span>
                          <span className="text-gray-500 line-through text-xs">{deal.originalPrice}</span>
                        </div>
                        <button className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate last set of cards for infinite loop effect */}
                {hotDeals.map((deal) => (
                  <div 
                    key={`last-${deal.id}`} 
                    className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition snap-start mx-2 last:mr-4"
                  >
                    <div className="relative">
                      <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-44 flex items-center justify-center">
                        <span className="text-gray-500">Product Image</span>
                      </div>
                      
                      {/* Premium Badge */}
                      {deal.isPremium && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PREMIUM
                        </div>
                      )}
                      
                      {/* Hot Badge */}
                      {deal.isHot && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          HOT
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {deal.discount && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {deal.discount}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{deal.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-bold">{deal.discountedPrice}</span>
                          <span className="text-gray-500 line-through text-xs">{deal.originalPrice}</span>
                        </div>
                        <button className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Deal Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {hotDeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentDealIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full ${index === (currentDealIndex % hotDeals.length) ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Featured Products</h2>
              <Link href="/products" className="text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="bg-gray-200 border-2 border-dashed rounded-t-lg w-full h-40 flex items-center justify-center">
                    <span className="text-gray-500">Product Image</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">{product.name}</h3>
                    <p className="text-blue-600 font-bold">{product.price}</p>
                    <p className="text-gray-500 text-xs">MOQ: {product.moq}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Promotional Section with Sliding Images */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Special Offers & Events</h2>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Content Card - Left Side */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="max-w-lg">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
                      FEATURED
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                      {promoBanners[currentPromoIndex].title}
                    </h3>
                    <p className="text-lg text-blue-600 font-semibold mb-3">
                      {promoBanners[currentPromoIndex].subtitle}
                    </p>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {promoBanners[currentPromoIndex].description}
                    </p>
                    <button className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${promoBanners[currentPromoIndex].bgColor} hover:opacity-90 transition`}>
                      {promoBanners[currentPromoIndex].cta}
                    </button>
                    
                    {/* Promo Indicators */}
                    <div className="flex mt-8 space-x-2">
                      {promoBanners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPromoIndex(index)}
                          className={`w-3 h-3 rounded-full ${index === currentPromoIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Sliding Images - Right Side */}
                <div className="md:w-1/2 relative h-64 md:h-auto">
                  <div className="absolute inset-0 overflow-hidden">
                    {promoBanners.map((banner, index) => (
                      <div 
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentPromoIndex ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <div className={`h-full w-full bg-gradient-to-r ${banner.bgColor} flex items-center justify-center`}>
                          <div className="bg-white bg-opacity-20 border-2 border-dashed border-white border-opacity-30 w-4/5 h-4/5 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xl font-bold">Promotional Image</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Width Banner Graphics Section - Matches Hero Section */}
        <section className="py-0 px-0 w-full">
          <div className="w-full">
            {/* Full Width Banner Container - No container restrictions */}
            <div className="relative w-full overflow-hidden">
              {/* Banner Sliding Container */}
              <div className="relative h-64 md:h-80 lg:h-96 w-full">
                <div 
                  className="absolute inset-0 transition-transform duration-700 ease-in-out flex w-full"
                  style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                >
                  {/* Render banner slides */}
                  {bannerSlides.map((slide, index) => (
                    <div 
                      key={index} 
                      className="flex-shrink-0 w-full h-full relative"
                    >
                      {/* Background image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      ></div>
                      
                      {/* Overlay for better readability */}
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-24">
                        <div className="max-w-3xl text-white">
                          <h2 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h2>
                          <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                          <Link 
                            href={slide.link}
                            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition transform hover:scale-105 shadow-lg"
                          >
                            {slide.cta}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={() => scrollBanners('left')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition z-20"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => scrollBanners('right')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition z-20"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
                
                {/* Banner Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${currentBannerIndex === index ? 'bg-white scale-125' : 'bg-white bg-opacity-50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Sliding Product Texts Section */}
        <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Trending Products</h2>
            
            {/* Sliding Text Containers - Floating Cards */}
            <div className="space-y-4">
              {/* First Row - Slides Left with Floating Effect */}
              <div className="flex animate-slide-left whitespace-nowrap">
                {[...popularProducts, ...popularProducts].map((product, index) => (
                  <div key={index} className="inline-flex items-center mx-4">
                    <div className="bg-white rounded-xl shadow-lg px-5 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100">
                      <h3 className="font-bold text-gray-800 text-lg md:text-xl tracking-wide">{product.name}</h3>
                      <p className="text-blue-600 font-semibold text-xs mt-1 tracking-tight">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Second Row - Slides Right with Floating Effect */}
              <div className="flex animate-slide-right whitespace-nowrap">
                {[...popularProducts, ...popularProducts].map((product, index) => (
                  <div key={index} className="inline-flex items-center mx-4">
                    <div className="bg-white rounded-xl shadow-lg px-5 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100">
                      <h3 className="font-bold text-gray-800 text-lg md:text-xl tracking-wide">{product.name}</h3>
                      <p className="text-blue-600 font-semibold text-xs mt-1 tracking-tight">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Random Products Section */}
        <section className="py-12 px-0 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
              <Link href="/products" className="text-blue-600 hover:underline font-medium flex items-center">
                View All Products
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {randomProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                  <div className="bg-gray-200 border-2 border-dashed w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500">Product Image</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                      {product.isNew && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">NEW</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-800">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 text-sm line-through ml-2">{product.originalPrice}</span>
                        )}
                      </div>
                      <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </button>
                    </div>
                    {product.rating && (
                      <div className="flex items-center mt-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'stroke-current'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm ml-2">{product.rating} ({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced News and Blog Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Latest News & Insights</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">Stay updated with the latest industry trends and business strategies</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* News Section with Enhanced Design */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Industry News</h3>
                    <Link href="/news" className="text-white hover:text-blue-200 text-sm font-medium flex items-center">
                      View All
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Enhanced News Slider with Infinite Loop */}
                <div className="relative h-80 p-6 overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-transform duration-700 ease-in-out flex flex-col"
                    style={{ transform: `translateY(-${currentNewsIndex * 100}%)` }}
                  >
                    {/* Duplicate first set for infinite loop */}
                    {industryNews.map((news, index) => (
                      <div key={`first-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                            {news.category}
                          </span>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{news.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{news.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{news.date}</span>
                          <Link href={news.link} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center text-sm">
                            Read More
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {/* Original set */}
                    {industryNews.map((news, index) => (
                      <div key={`original-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                            {news.category}
                          </span>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{news.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{news.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{news.date}</span>
                          <Link href={news.link} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center text-sm">
                            Read More
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {/* Duplicate last set for infinite loop */}
                    {industryNews.map((news, index) => (
                      <div key={`last-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                            {news.category}
                          </span>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{news.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{news.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{news.date}</span>
                          <Link href={news.link} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center text-sm">
                            Read More
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Navigation */}
                <div className="flex justify-between items-center px-6 pb-6">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => scrollNews('up')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scrollNews('down')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Enhanced News Indicators */}
                  <div className="flex space-x-2">
                    {industryNews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentNewsIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentNewsIndex === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Blog Section with Enhanced Design */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Business Insights</h3>
                    <Link href="/blog" className="text-white hover:text-purple-200 text-sm font-medium flex items-center">
                      View All
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Enhanced Blog Slider with Infinite Loop */}
                <div className="relative h-80 p-6 overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-transform duration-700 ease-in-out flex"
                    style={{ transform: `translateX(-${currentBlogIndex * 100}%)` }}
                  >
                    {/* Duplicate first set for infinite loop */}
                    {businessInsights.map((blog, index) => (
                      <div key={`first-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.map((tag, tagIndex) => (
                              <span key={`first-tag-${tagIndex}`} className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{blog.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{blog.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{blog.author} • {blog.date}</span>
                          <Link href={blog.link} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center text-sm">
                            Read Article
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {/* Original set */}
                    {businessInsights.map((blog, index) => (
                      <div key={`original-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.map((tag, tagIndex) => (
                              <span key={`original-tag-${tagIndex}`} className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{blog.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{blog.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{blog.author} • {blog.date}</span>
                          <Link href={blog.link} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center text-sm">
                            Read Article
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {/* Duplicate last set for infinite loop */}
                    {businessInsights.map((blog, index) => (
                      <div key={`last-${index}`} className="flex-shrink-0 w-full h-80 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.map((tag, tagIndex) => (
                              <span key={`last-tag-${tagIndex}`} className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">{blog.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-4">{blog.excerpt}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">{blog.author} • {blog.date}</span>
                          <Link href={blog.link} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center text-sm">
                            Read Article
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Navigation */}
                <div className="flex justify-between items-center px-6 pb-6">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => scrollBlogs('left')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scrollBlogs('right')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Enhanced Blog Indicators */}
                  <div className="flex space-x-2">
                    {businessInsights.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBlogIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentBlogIndex === index ? 'bg-purple-600' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-lg px-2 py-1 mr-2">BC</span>
                BizCommerce
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">Global B2B marketplace connecting buyers and suppliers worldwide. Trusted by millions of businesses.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/submit-rfq" className="hover:text-white transition">Submit RFQ</Link></li>
                <li><Link href="/browse-products" className="hover:text-white transition">Browse Products</Link></li>
                <li><Link href="/trade-services" className="hover:text-white transition">Trade Services</Link></li>
                <li><Link href="/logistics" className="hover:text-white transition">Logistics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/join" className="hover:text-white transition">Join BizCommerce</Link></li>
                <li><Link href="/supplier-membership" className="hover:text-white transition">Supplier Membership</Link></li>
                <li><Link href="/learning-center" className="hover:text-white transition">Learning Center</Link></li>
                <li><Link href="/partner-program" className="hover:text-white transition">Partner Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help-center" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/contact-us" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link href="/report-abuse" className="hover:text-white transition">Report Abuse</Link></li>
                <li><Link href="/submit-complaint" className="hover:text-white transition">Submit a Complaint</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} BizCommerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
