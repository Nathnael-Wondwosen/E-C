import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getCachedHeroSlides, getCloudinaryImageUrlFromFileId, getGlobalBackgroundImage, getCategories, getProducts, getSpecialOffers } from '../utils/heroDataService';

// Import section components
import HeroCarousel from './sections/HeroCarousel';
import CategoriesSection from './sections/CategoriesSection';
import ServicesSection from './sections/ServicesSection';
import HotDealsSection from './sections/HotDealsSection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import PromotionalSection from './sections/PromotionalSection';
import TrendingProductsSection from './sections/TrendingProductsSection';
import FullWidthBannerSection from './sections/FullWidthBannerSection';
import RandomProductsSection from './sections/RandomProductsSection';
import NewsBlogSection from './sections/NewsBlogSection';
import Header from './header/Header';export default function Home() {
  // Add CSS animations to head
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideLeft {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
      
      @keyframes slideRight {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0); }
      }
      
      .animate-slide-left {
        animation: slideLeft 30s linear infinite;
      }
      
      .animate-slide-right {
        animation: slideRight 30s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Define API base URL for client-side requests
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // State hooks - must be declared before any useEffect hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const [loadingHeroSlides, setLoadingHeroSlides] = useState(true);
  const [globalBackgroundImage, setGlobalBackgroundImage] = useState('/hero-background.jpg');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentNewCategoryIndex, setCurrentNewCategoryIndex] = useState(0);
  const [currentHeroCategoryIndex, setCurrentHeroCategoryIndex] = useState(0);
  const [currentViralProductIndex, setCurrentViralProductIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const categoryContainerRef = useRef(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [fetchedHotDeals, setFetchedHotDeals] = useState([]);
  const [premiumProducts, setPremiumProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // Add state for news and blog posts
  const [newsBlogPosts, setNewsBlogPosts] = useState([]);
  const [loadingNewsBlog, setLoadingNewsBlog] = useState(true);

  // Add state for partners
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Load hero slides on component mount
  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        const fetchedSlides = await getCachedHeroSlides();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedSlides = fetchedSlides.map(slide => ({
          ...slide,
          id: slide._id || slide.id
        }));
        setHeroSlides(convertedSlides);
        setLoadingHeroSlides(false);
      } catch (error) {
        console.error('Error loading hero slides:', error);
        setLoadingHeroSlides(false);
      }
    };
    
    loadHeroSlides();
  }, []);
  
  // Load global background image on component mount
  useEffect(() => {
    const loadGlobalBackgroundImage = async () => {
      try {
        const imageUrl = await getGlobalBackgroundImage();
        setGlobalBackgroundImage(imageUrl);
      } catch (error) {
        console.error('Error loading global background image:', error);
      }
    };
    
    loadGlobalBackgroundImage();
  }, []);
  
  // Load special offers on component mount
  useEffect(() => {
    const loadSpecialOffers = async () => {
      try {
        const fetchedOffers = await getSpecialOffers();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedOffers = fetchedOffers.map(offer => ({
          ...offer,
          id: offer._id || offer.id
        }));
        setSpecialOffers(convertedOffers);
      } catch (error) {
        console.error('Error loading special offers:', error);
      }
    };
    
    loadSpecialOffers();
  }, []);
  
  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedCategories = fetchedCategories.map(category => ({
          ...category,
          id: category._id || category.id
        }));
        setCategories(convertedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const fetchedProducts = await getProducts();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedProducts = fetchedProducts.map(product => ({
          ...product,
          id: product._id || product.id
        }));
        
        // Set featured products (limit to 6)
        const featured = convertedProducts
          .filter(product => product.isFeatured)
          .slice(0, 6)
          .map(product => ({
            ...product,
            price: `$${product.price.toFixed(2)}`,
            originalPrice: product.discountPercentage ? `$${(product.price * 100 / (100 - product.discountPercentage)).toFixed(2)}` : null
          }));
        setFeaturedProducts(featured);
        
        // Set hot deals products (products marked as hot deal or with significant discount)
        const hotDeals = convertedProducts
          .filter(product => product.isHotDeal || (product.discountPercentage && product.discountPercentage >= 20))
          .slice(0, 8)
          .map(product => ({
            ...product,
            discountedPrice: `$${(product.price * (100 - product.discountPercentage) / 100).toFixed(2)}`,
            originalPrice: `$${product.price.toFixed(2)}`,
            discount: product.discountPercentage ? `${Math.round(product.discountPercentage)}% OFF` : null
          }));
        setFetchedHotDeals(hotDeals);
        
        // Set premium products (products marked as premium)
        const premium = convertedProducts
          .filter(product => product.isPremium)
          .slice(0, 6)
          .map(product => ({
            ...product,
            price: `$${product.price.toFixed(2)}`,
            originalPrice: product.discountPercentage ? `$${(product.price * 100 / (100 - product.discountPercentage)).toFixed(2)}` : null
          }));
        setPremiumProducts(premium);
        
        // Set random products (limit to 8)
        const shuffled = [...convertedProducts].sort(() => 0.5 - Math.random());
        const random = shuffled.slice(0, 8).map(product => ({
          ...product,
          price: `$${product.price.toFixed(2)}`,
          originalPrice: product.discountPercentage ? `$${(product.price * 100 / (100 - product.discountPercentage)).toFixed(2)}` : null
        }));
        setRandomProducts(random);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    loadProducts();
  }, []);

  // Load banners on component mount
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/banners/active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedBanners = await response.json();
        // Convert MongoDB _id to id for frontend compatibility
        const convertedBanners = fetchedBanners.map(banner => ({
          ...banner,
          id: banner._id || banner.id
        }));
        setBanners(convertedBanners);
      } catch (error) {
        console.error('Error loading banners:', error);
      }
    };
    
    loadBanners();
  }, []);

  // Load news and blog posts on component mount
  useEffect(() => {
    const loadNewsBlogPosts = async () => {
      try {
        setLoadingNewsBlog(true);
        const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedPosts = await response.json();
        setNewsBlogPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading news and blog posts:', error);
      } finally {
        setLoadingNewsBlog(false);
      }
    };
    
    loadNewsBlogPosts();
  }, []);

  // Load partners on component mount
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoadingPartners(true);
        const response = await fetch(`${API_BASE_URL}/api/partners/active`);
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
      } finally {
        setLoadingPartners(false);
      }
    };
    
    loadPartners();
  }, []);

  const fallbackCarouselSlides = [
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

  // Use hero slides from API or fallback data
  const carouselSlides = loadingHeroSlides ? fallbackCarouselSlides : (heroSlides.length > 0 ? heroSlides : fallbackCarouselSlides);

  // Sample featured products (fallback if API fails)
  const fallbackFeaturedProducts = [
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
    { id: 3, name: 'Portable Bluetooth Speaker with 360Â° Sound', price: '$49.99', originalPrice: '$79.99', trendType: 'Trending', image: '/placeholder-product.jpg' },
    { id: 4, name: 'Ergonomic Mechanical Gaming Keyboard RGB', price: '$89.99', originalPrice: '$129.99', trendType: 'Popular', image: '/placeholder-product.jpg' },
    { id: 5, name: '4K Ultra HD Action Camera with Waterproof Case', price: '$149.99', originalPrice: '$249.99', trendType: 'Viral', image: '/placeholder-product.jpg' },
    { id: 6, name: 'Smart Home Security Camera System 4 Pack', price: '$199.99', originalPrice: '$299.99', trendType: 'Hot', image: '/placeholder-product.jpg' },
    { id: 7, name: 'Premium Coffee Bean Grinder Electric', price: '$59.99', originalPrice: '$89.99', trendType: 'Trending', image: '/placeholder-product.jpg' },
    { id: 8, name: 'Wireless Charging Pad for Smartphones', price: '$24.99', originalPrice: '$39.99', trendType: 'Popular', image: '/placeholder-product.jpg' },
  ];

  // Banner slides for full width section - loaded from API with fallback
  const bannerSlides = banners.length > 0 ? banners : [
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
      description: "Up to 70% off on selected categories. Limited time offer on electronics, fashion and industrial supplies.",
      image: "/placeholder-banner-3.jpg",
      cta: "Shop Now",
      link: "/deals"
    }
  ];

  // Random products for featured section (fallback if API fails)
  const fallbackRandomProducts = [
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

  // Separate news and blog posts - show all instead of limiting to 3
  const industryNews = newsBlogPosts
    .filter(post => post.type === 'news');

  const businessInsights = newsBlogPosts
    .filter(post => post.type === 'blog');

  // Promotional banners with sliding images
  const promoBanners = specialOffers.length > 0 ? specialOffers.map(offer => ({
    id: offer.id,
    title: offer.title,
    subtitle: offer.subtitle || '',
    description: offer.description || '',
    image: offer.imageUrl || '/placeholder-promo.jpg',
    cta: offer.cta || 'Learn More',
    bgColor: offer.bgColor || 'from-blue-500 to-indigo-600',
    discount: offer.discount || ''
  })) : [
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

  // Use fetched hot deals or fallback data
  const displayedHotDeals = loadingProducts ? [
    { id: 1, name: 'Smart Home Kit', discount: '30% OFF', originalPrice: '$199.99', discountedPrice: '$139.99', image: '/placeholder-product.jpg', isPremium: true, isHot: true },
    { id: 2, name: 'Wireless Earbuds', discount: '25% OFF', originalPrice: '$89.99', discountedPrice: '$67.49', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 3, name: 'Coffee Maker', discount: '40% OFF', originalPrice: '$129.99', discountedPrice: '$77.99', image: '/placeholder-product.jpg', isPremium: true, isHot: false },
    { id: 4, name: 'Backpack Travel', discount: '20% OFF', originalPrice: '$59.99', discountedPrice: '$47.99', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 5, name: 'Bluetooth Speaker', discount: '15% OFF', originalPrice: '$79.99', discountedPrice: '$67.99', image: '/placeholder-product.jpg', isPremium: true, isHot: false },
    { id: 6, name: 'Electric Kettle', discount: '35% OFF', originalPrice: '$49.99', discountedPrice: '$32.49', image: '/placeholder-product.jpg', isPremium: false, isHot: true },
    { id: 7, name: 'Desk Organizer', discount: '50% OFF', originalPrice: '$39.99', discountedPrice: '$19.99', image: '/placeholder-product.jpg', isPremium: true, isHot: true },
    { id: 8, name: 'USB Charging Hub', discount: '20% OFF', originalPrice: '$54.99', discountedPrice: '$43.99', image: '/placeholder-product.jpg', isPremium: false, isHot: false },
  ] : fetchedHotDeals;

  // Group categories into chunks for sliding
  const categoryGroups = [];
  if (categories && Array.isArray(categories)) {
    for (let i = 0; i < categories.length; i += 6) {
      categoryGroups.push(categories.slice(i, i + 6));
    }
  }

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
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-slide-left {
              animation: slide-left 30s linear infinite;
            }
            
            .animate-slide-right {
              animation: slide-right 30s linear infinite;
            }
            
            .fade-in-up {
              animation: fadeInUp 0.6s ease-out forwards;
            }
            
            /* Hide scrollbar for Chrome, Safari and Opera */
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            
            /* Hide scrollbar for IE, Edge and Firefox */
            .scrollbar-hide {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
            
            /* Remove default focus outlines for consistent appearance across browsers */
            .category-card:focus, .category-card:hover, .category-card:active {
              outline: none;
            }
            
            /* Custom focus style for accessibility */
            .category-card:focus-visible {
              outline: 2px solid #3b82f6;
              outline-offset: 2px;
            }
            
            /* Ensure consistent styling across browsers */
            * {
              -webkit-tap-highlight-color: transparent;
            }
          `}
        </style>
      </Head>

      <main>
        <Header 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          categories={categories}
        />
        
        <HeroCarousel 
          carouselSlides={carouselSlides}
          globalBackgroundImage={globalBackgroundImage}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />

        <CategoriesSection 
          categories={categories}
          currentHeroCategoryIndex={currentHeroCategoryIndex}
          setCurrentHeroCategoryIndex={setCurrentHeroCategoryIndex}
        />

        <ServicesSection />

        <HotDealsSection 
          displayedHotDeals={displayedHotDeals}
          currentDealIndex={currentDealIndex}
          setCurrentDealIndex={setCurrentDealIndex}
        />

        <FeaturedProductsSection 
          loadingProducts={loadingProducts}
          fallbackFeaturedProducts={fallbackFeaturedProducts}
          premiumProducts={premiumProducts}
        />

        <PromotionalSection 
          promoBanners={promoBanners}
          currentPromoIndex={currentPromoIndex}
          setCurrentPromoIndex={setCurrentPromoIndex}
        />

        <TrendingProductsSection 
          loadingProducts={loadingProducts}
          fallbackRandomProducts={fallbackRandomProducts}
          randomProducts={randomProducts}
        />

        <FullWidthBannerSection 
          bannerSlides={bannerSlides}
          currentBannerIndex={currentBannerIndex}
          setCurrentBannerIndex={setCurrentBannerIndex}
        />

        <RandomProductsSection 
          loadingProducts={loadingProducts}
          fallbackRandomProducts={fallbackRandomProducts}
          randomProducts={randomProducts}
        />

        <NewsBlogSection 
          industryNews={industryNews}
          businessInsights={businessInsights}
          partners={partners}
          currentNewsIndex={currentNewsIndex}
          setCurrentNewsIndex={setCurrentNewsIndex}
          currentBlogIndex={currentBlogIndex}
          setCurrentBlogIndex={setCurrentBlogIndex}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <img 
                  src="/TE-logo.png" 
                  alt="TradeEthiopia Logo" 
                  className="h-10 w-auto mr-3"
                />
                TradeEthiopia
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
                <li><Link href="/join" className="hover:text-white transition">Join TradeEthiopia</Link></li>
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
            <p>&copy; {new Date().getFullYear()} TradeEthiopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
