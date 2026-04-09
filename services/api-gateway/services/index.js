// services/api-gateway/services/index.js
// Service factory - creates services with dependency injection
// UPDATED: Includes new CategoryService, DashboardService, SettingsService, UserService, WishlistService, InquiryService, AdminService

const ProductService = require('./ProductService');
const ProductServiceExtended = require('./ProductService.EXTENDED');
const OrderService = require('./OrderService');
const CartService = require('./CartService');
const CategoryService = require('./CategoryService');
const DashboardService = require('./DashboardService');
const SettingsService = require('./SettingsService');
const UserService = require('./UserService');
const WishlistService = require('./WishlistService');
const InquiryService = require('./InquiryService');
const AdminService = require('./AdminService');

const {
  ProductRepository,
  CategoryRepository,
  UserRepository,
  OrderRepository,
  CartRepository,
  WishlistRepository,
  InquiryRepository,
  IdentityUserRepository
} = require('../repositories');

/**
 * Create all service instances with dependency injection
 * 
 * Services included:
 * - product: ProductService + ProductServiceExtended (ownership validation)
 * - category: CategoryService (CRUD operations)
 * - dashboard: DashboardService (analytics + reporting)
 * - settings: SettingsService (app configuration)
 * - order: OrderService (order management)
 * - cart: CartService (shopping cart)
 * - user: UserService (user profile management)
 * - wishlist: WishlistService (wishlist operations)
 * - inquiry: InquiryService (product inquiries)
 * - admin: AdminService (admin user management)
 */
function createServices(db) {
  // Create all repositories
  const productRepository = new ProductRepository(db);
  const categoryRepository = new CategoryRepository(db);
  const userRepository = new UserRepository(db);
  const orderRepository = new OrderRepository(db);
  const cartRepository = new CartRepository(db);
  const wishlistRepository = new WishlistRepository(db);
  const inquiryRepository = new InquiryRepository(db);
  const identityUserRepository = new IdentityUserRepository(db);

  // Create ProductService and mix in extended methods
  const productService = new ProductService(productRepository, categoryRepository);
  Object.assign(productService, new ProductServiceExtended());

  // Create all services
  const services = {
    product: productService,
    category: new CategoryService(categoryRepository),
    dashboard: new DashboardService(productRepository, categoryRepository, orderRepository, userRepository),
    settings: new SettingsService(db),
    order: new OrderService(orderRepository, productRepository, userRepository),
    cart: new CartService(cartRepository, productRepository, userRepository),
    user: new UserService(userRepository, identityUserRepository),
    wishlist: new WishlistService(wishlistRepository, productRepository),
    inquiry: new InquiryService(inquiryRepository, productRepository, userRepository, identityUserRepository),
    admin: new AdminService(userRepository, identityUserRepository),
    
    // Exposed for testing/advanced usage
    repositories: {
      productRepository,
      categoryRepository,
      userRepository,
      orderRepository,
      cartRepository,
      wishlistRepository,
      inquiryRepository,
      identityUserRepository
    }
  };

  return services;
}

module.exports = { createServices };
