# B2B E-Commerce Platform - Comprehensive Codebase Map

**Last Updated:** April 6, 2026  
**Project Type:** Microservices Architecture with Next.js Frontend  
**Team Structure:** Multi-market scalability with admin scoping  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Services Details](#services-details)
6. [Frontend Applications](#frontend-applications)
7. [Database Design](#database-design)
8. [API Route Ownership](#api-route-ownership)
9. [Deployment Configurations](#deployment-configurations)
10. [Development Workflow](#development-workflow)
11. [Key Features](#key-features)
12. [Environment Variables](#environment-variables)

---

## Project Overview

This is a **B2B E-Commerce Platform** designed for enterprise-scale multi-market commerce. It supports:

- **Multiple Markets:** Local, Global, Africa, China, B2B
- **Admin Scopes:** Isolated admin contexts per market
- **Microservices:** Modular backend services with API gateway
- **Scalability:** AWS-ready with Render/Railway alternatives

### Current Production Status
- ✅ API Gateway operational
- ✅ Identity Service fully implemented
- ✅ Customer Portal live (customer-facing)
- ✅ Admin Dashboard active with scope-based permissions
- ⚠️ User Service (minimal, shell placeholder)

---

## Architecture

### High-Level Request Flow

```
Browser / Client
    ↓
API Gateway (3000)
    ↓
├─→ Identity Service (3015) [Auth/User Auth]
├─→ MongoDB [Product/Content/Commerce Data]
└─→ External Services [Cloudinary, Algolia, etc.]
```

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer / Gateway          │
└─────────────────────────────────────────┘
    ↓                    ↓               ↓
┌──────────────┐  ┌────────────┐  ┌──────────────┐
│ API Gateway  │  │Admin Dash  │  │Customer Site │
│   (3000)     │  │  (3006)    │  │   (3005)     │
└──────────────┘  └────────────┘  └──────────────┘
    ↓
┌────────────────────────────────────────┐
│        Identity Service (3015)         │
│        User Service (3007)             │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│          MongoDB (Database)            │
└────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 12+
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **3D Graphics:** Three.js (optional)
- **Deployment:** Vercel, Render

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB / DocumentDB
- **Authentication:** JWT + Google OAuth 2.0
- **File Storage:** Cloudinary
- **Search:** Algolia (optional)
- **Deployment:** Render, Railway, AWS ECS Fargate

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose, AWS ECS
- **CI/CD:** GitHub Actions, AWS CodePipeline
- **Monitoring:** CloudWatch, Render logs

---

## Project Structure

### Root-Level Organization

```
E-C (Root)
├── services/                    # Backend microservices
│   ├── api-gateway/            # Main gateway (Express)
│   ├── identity-service/       # Auth & user profiles
│   ├── user-service/           # Placeholder service
│   └── template.Dockerfile     # Base Docker config
├── frontend/                    # Next.js applications
│   ├── admin-dashboard/        # Admin panel (port 3006)
│   └── customer-portal/        # Customer site (port 3005)
├── shared/                      # Shared code
│   ├── schemas/               # MongoDB schemas
│   ├── utils/                 # Helper functions
│   └── index.js               # Shared exports
├── docs/                        # Documentation
│   ├── CODEBASE_FULL_MAP.md
│   ├── getting-started.md
│   ├── render-deployment-guide.md
│   └── vercel-deployment-guide.md
├── package.json                 # Monorepo config (npm workspaces)
├── docker-compose.yml           # Development env
├── render.yaml                  # Render deployment
├── vercel.json                  # Vercel frontend config
└── [Multiple deployment scripts] # AWS, Render, etc.
```

### Root Package Configuration

**File:** `package.json`

```json
{
  "name": "b2b-ecommerce-platform",
  "workspaces": [
    "frontend/*",
    "services/*",
    "shared"
  ],
  "scripts": {
    "dev": "concurrently start all services + frontends",
    "dev:backend": "API Gateway + Identity Service",
    "dev:identity": "Identity Service only",
    "build:services": "Build all backend services",
    "build:frontend": "Build all frontend apps"
  }
}
```

---

## Services Details

### 1. API Gateway (`services/api-gateway/`)

**Purpose:** Central routing and orchestration layer  
**Port:** 3000 (default)  
**Technology:** Express.js + MongoDB driver

#### Key Files

| File | Purpose |
|------|---------|
| `server.js` | Entry point, starts Express server |
| `app.js` | App factory, middleware setup, route registration |
| `config/env.js` | Environment variable loader |
| `config/database.js` | MongoDB connection manager |
| `config/cors.js` | CORS policy configuration |
| `middleware/authMiddleware.js` | JWT validation and admin checks |
| `middleware/requestLogger.js` | Request/response logging |
| `middleware/rateLimit.js` | Rate limiting |
| `middleware/metrics.js` | Performance metrics collection |
| `routes/authRoutes.js` | `/api/auth/*` endpoints |
| `routes/userCommerceRoutes.js` | Cart, wishlist, orders |
| `routes/catalogRoutes.js` | Products and categories |
| `routes/contentRoutes.js` | CMS content endpoints |
| `routes/uploadRoutes.js` | Cloudinary file uploads |
| `helpers/scopeHelpers.js` | Market scope resolution |
| `helpers/idLookupHelpers.js` | Flexible ID lookup (MongoDB ObjectId, custom IDs) |
| `helpers/responseHelpers.js` | Optimized JSON response formatting |
| `services/identityProxy.js` | Delegates auth to Identity Service when configured |

#### Environment Variables

```bash
# Core
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce_platform
MONGODB_DB_NAME=ecommerce_platform

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Service Integration
IDENTITY_SERVICE_URL=http://localhost:3015 (optional)
ENFORCE_IDENTITY_BOUNDARY=false (optional)
USER_SERVICE_URL=http://localhost:3007
PRODUCT_SERVICE_URL=http://localhost:3001

# CORS
CORS_ORIGIN=http://localhost:3005,http://localhost:3006

# Algolia Search (optional)
ALGOLIA_APP_ID=your-app-id
ALGOLIA_API_KEY=your-api-key
```

#### Authentication Flow

1. **Register/Login Attempt:**
   - If `IDENTITY_SERVICE_URL` configured → delegate to Identity Service
   - Otherwise → handle locally with JWT

2. **Protected Routes:**
   - Extract JWT from `Authorization: Bearer <token>`
   - Validate signature with `JWT_SECRET`
   - Verify user exists in database
   - Check admin role if admin-only route

#### Route Ownership

**API Gateway Owns:**
- `POST /api/auth/register` (delegates to Identity Service if available)
- `POST /api/auth/login` (delegates to Identity Service if available)
- `POST /api/auth/google` (delegates to Identity Service if available)
- `GET/POST/DELETE /api/users/:id/cart*` (commerce aggregate)
- `GET/POST/DELETE /api/users/:id/wishlist*` (commerce aggregate)
- `GET/POST /api/users/:id/orders*` (commerce aggregate)
- `GET /api/products/*` (catalog)
- `GET /api/categories/*` (content)
- `POST /api/upload` (file uploads)

---

### 2. Identity Service (`services/identity-service/`)

**Purpose:** Canonical authentication and user identity service  
**Port:** 3015 (default)  
**Technology:** Express.js + Mongoose + MongoDB

#### Key Features

- User registration with email/password
- JWT-based authentication
- Google OAuth 2.0 integration
- Password reset flow
- User profile management
- Admin authentication

#### Key Files

| File | Purpose |
|------|---------|
| `server.js` | Entry point |
| `app.js` | Express app factory |
| `models/User.js` | Mongoose user schema |
| `routes/authRoutes.js` | Register, login, password reset |
| `middleware/auth.js` | JWT validation |
| `helpers/tokenManager.js` | Token generation and verification |
| `config/database.js` | MongoDB/Mongoose connection |

#### API Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login by email/password
POST   /api/auth/google            - Google OAuth flow
POST   /api/auth/admin/login       - Admin authentication
GET    /api/auth/me                - Get current user profile
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/logout            - Logout (client-side primarily)
POST   /api/auth/password-reset    - Request password reset
POST   /api/auth/reset/:token      - Complete password reset
GET    /api/users/:id              - Get user by ID
PUT    /api/users/:id              - Update user profile
DELETE /api/users/:id              - Delete user
GET    /health                     - Health check
```

#### Authentication Contract

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "role": "customer"
  }
}
```

---

### 3. User Service (`services/user-service/`)

**Purpose:** Minimal placeholder; not currently in production path  
**Status:** ⚠️ Placeholder  
**Endpoints:**
- `GET /` - Landing page
- `GET /health` - Health check

**Note:** This service is scaffolded for future expansion. Current user-related operations are handled by the API Gateway and Identity Service.

---

## Frontend Applications

### 1. Customer Portal (`frontend/customer-portal/`)

**Purpose:** Customer-facing e-commerce interface  
**Port:** 3005 (development)  
**Framework:** Next.js with Tailwind CSS

#### Key URLs

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/markets/[scope]` | Market home (local, global, africa, china, b2b) |
| `/products/[id]` | Product details |
| `/cart` | Shopping cart |
| `/wishlist` | Saved items |
| `/orders` | Order history |
| `/account/profile` | User profile |
| `/account/settings` | Account settings |
| `/login` | Customer login |
| `/signup` | Customer registration |
| `/forgot-password` | Password reset |

#### Directory Structure

```
customer-portal/
├── pages/                        # Next.js routes
│   ├── _app.js                  # App wrapper
│   ├── _document.js             # HTML template
│   ├── index.js                 # Home page
│   ├── login.js                 # Login page
│   ├── signup.js                # Registration
│   ├── cart.js                  # Shopping cart
│   ├── wishlist.js              # Wishlist
│   ├── orders.js                # Order history
│   ├── products/
│   │   └── [id].js              # Product detail
│   ├── markets/
│   │   └── [scope].js           # Market landing (local, global, b2b, etc.)
│   └── account/
│       ├── profile.js
│       ├── settings.js
│       └── password.js
├── components/                   # Reusable React components
│   ├── Header.js                # Navigation header
│   ├── Footer.js                # Footer
│   ├── Navigation.js            # Nav menu
│   ├── ProductCard.js           # Product listing card
│   ├── CartItem.js              # Cart line item
│   ├── MarketLandingPage.js     # Market template
│   └── AuthGuard.js             # Protected routes
├── features/                     # Feature-specific modules
│   ├── markets/
│   │   ├── local.js             # Local market config
│   │   ├── global.js
│   │   ├── africa.js
│   │   ├── china.js
│   │   ├── b2b.js
│   │   └── registry.js          # Market registry
│   └── auth/
│       └── [auth-related features]
├── utils/                        # Utility functions
│   ├── session.js               # Session storage centralization
│   ├── api.js                   # API client wrapper
│   ├── auth.js                  # Auth helpers
│   └── validation.js
├── styles/                       # Tailwind CSS
│   ├── globals.css
│   └── [component-specific].module.css
├── public/                       # Static assets
├── next.config.js               # Next.js configuration
├── package.json
└── .env.local                   # Environment variables
```

#### Session Management

**File:** `utils/session.js`

Centralized session storage handling:
- Stores JWT token in localStorage
- Manages user context globally
- Handles logout cleanup
- Session persistence across page reloads

#### Market Scopes

The platform supports multiple concurrent markets:

- **local** - Domestic market
- **global** - International/global market
- **africa** - African market
- **china** - China-specific market
- **b2b** - B2B marketplace

Each market has isolated product catalogs, pricing, and user roles configured in `features/markets/`.

#### API Integration

```javascript
// utils/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Example: Fetch products for scope
GET ${API_BASE}/api/products?scope=local

// Example: User login
POST ${API_BASE}/api/auth/login
```

---

### 2. Admin Dashboard (`frontend/admin-dashboard/`)

**Purpose:** Administrator interface for platform management  
**Port:** 3006 (development)  
**Framework:** Next.js with Tailwind CSS

#### Admin Scopes

The admin dashboard supports **scope-based permissions**:

| Scope | Access Level | Markets |
|-------|---|---------|
| `local` | Regional admin | Local market only |
| `global` | Worldwide admin | Global market |
| `africa` | Regional admin | Africa market |
| `china` | Regional admin | China market |
| `b2b` | B2B platform admin | B2B marketplace |
| `system` | Super admin | All markets + system config |

#### Key Configuration Files

| File | Purpose |
|------|---------|
| `config/adminScopes.js` | Scope definitions and hierarchy |
| `config/adminScopePermissions.js` | Route access per scope |
| `utils/adminScopeService.js` | Local storage for active scope |
| `components/AdminScopeSwitcher.js` | Scope selector UI |

#### Admin Routes

```
/admin/[scope]/
├── dashboard         - Overview & KPIs
├── products         - Product management
├── categories       - Category management
├── orders           - Order management
├── users            - User management
├── content          - CMS content management
├── reports          - Analytics & reporting
├── settings         - Scope-specific settings
└── partners         - Partner/vendor management
```

#### Directory Structure

```
admin-dashboard/
├── pages/
│   ├── admin/
│   │   ├── [scope].js           # Scope entry route
│   │   └── [scope]/[...slug].js # Scoped routes
│   ├── _app.js
│   └── dashboard.js             # Scope-aware dashboard
├── components/
│   ├── AdminScopeSwitcher.js    # Scope selector
│   ├── AdminLayout.js           # Admin wrapper
│   ├── ProductForm.js           # Product editor
│   ├── CategoryManager.js       # Category CRUD
│   └── OrderManager.js          # Order operations
├── config/
│   ├── adminScopes.js           # Scope definitions
│   └── adminScopePermissions.js # Permission boundaries
├── services/
│   ├── adminScopeApiMap.js      # Endpoint ownership per scope
│   └── adminApi.js              # Admin API client
├── utils/
│   └── adminScopeService.js     # Scope persistence
└── styles/
```

#### Scope Access Flow

1. **Admin Logs In** → Identity Service validates credentials
2. **Frontend Loads** → Checks `localStorage` for active scope
3. **Displays Scope Switcher** → Lists available scopes based on user role
4. **Admin Selects Scope** → Routes to `/admin/[scope]`
5. **Scope-Aware UI Loads** → Displays products, users, orders for that scope only

#### Example: Scope-Aware Product Listing

```javascript
// services/adminScopeApiMap.js - Maps endpoints to scopes
const scopeApiMap = {
  local: {
    products: 'GET /api/products?scope=local',
    orders: 'GET /api/orders?scope=local'
  },
  global: {
    products: 'GET /api/products?scope=global',
    orders: 'GET /api/orders?scope=global'
  }
};

// Usage in component
const scope = getActiveAdminScope();
const apiEndpoint = scopeApiMap[scope].products;
```

---

## Database Design

### Technology: MongoDB

**Connection:** Specified via `MONGODB_URI` environment variable

### Main Collections

#### Users Collection

```javascript
{
  _id: ObjectId,
  email: String,
  firstName: String,
  lastName: String,
  passwordHash: String,
  role: String, // "customer", "admin", "partner"
  adminScopes: [String], // ["local", "global", "system"]
  profile: {
    phone: String,
    address: String,
    city: String,
    country: String,
    company: String, // B2B
    tier: String // customer tier
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection

```javascript
{
  _id: ObjectId,
  sku: String,
  name: String,
  description: String,
  price: Number,
  compareAtPrice: Number,
  scope: String, // "local", "global", "africa", "china", "b2b"
  category: ObjectId,
  images: [String], // Cloudinary URLs
  tags: [String],
  inventory: {
    quantity: Number,
    reserved: Number
  },
  suppliers: [ObjectId],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Categories Collection

```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  parentId: ObjectId,
  description: String,
  images: [String],
  scope: String,
  isActive: Boolean,
  order: Number,
  createdAt: Date
}
```

#### Orders Collection

```javascript
{
  _id: ObjectId,
  orderNumber: String,
  userId: ObjectId,
  scope: String,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: String, // "pending", "confirmed", "shipped", "delivered"
  paymentStatus: String, // "pending", "completed", "failed"
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Cart Collection (Optional)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      quantity: Number
    }
  ],
  updatedAt: Date
}
```

---

## API Route Ownership

### Microservice Boundaries

| Service | Owns | Handles |
|---------|------|---------|
| **API Gateway** | Orchestration | Products, categories, content, cart, wishlist, orders (aggregation) |
| **Identity Service** | Auth & Identity | User registration, login, auth, profile management |
| **User Service** | (Placeholder) | None currently |

### Route Matrix

| Route | Service | Scope-Aware | Auth Required |
|-------|---------|-------------|---------------|
| `POST /api/auth/register` | Identity | ❌ | ❌ |
| `POST /api/auth/login` | Identity | ❌ | ❌ |
| `POST /api/auth/google` | Identity | ❌ | ❌ |
| `GET /api/auth/me` | Identity | ❌ | ✅ |
| `GET /api/users/:id` | Identity | ❌ | ✅ |
| `PUT /api/users/:id` | Identity | ❌ | ✅ (self/admin) |
| `GET /api/products` | Gateway | ✅ | ❌ |
| `POST /api/products` | Gateway | ✅ | ✅ (admin) |
| `GET /api/users/:id/cart` | Gateway | ✅ | ✅ |
| `POST /api/users/:id/cart` | Gateway | ✅ | ✅ |
| `GET /api/users/:id/orders` | Gateway | ✅ | ✅ |
| `POST /api/users/:id/orders` | Gateway | ✅ | ✅ |
| `POST /api/upload` | Gateway | ❌ | ✅ |

---

## Deployment Configurations

### 1. Docker Compose Development

**File:** `docker-compose.yml`

```yaml
Services:
  mongodb    - Database (port 27017)
  api-gateway - API Gateway (port 3000)
  user-service - User Service (port 3007)
  customer-portal - Frontend (port 3005)
```

**Start:** `docker-compose up`

### 2. Render Deployment

**File:** `render.yaml`

Automatic deployment configuration for Render.com with:
- ecommerce-identity-service
- ecommerce-api-gateway
- Customer Portal (via integration)
- Admin Dashboard (via integration)

**Key Env Vars:**
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Signing secret
- `ADMIN_PASSWORD` - Initial admin password

### 3. Vercel Frontend

**File:** `vercel.json`

Deploys frontend applications:
- Customer Portal
- Admin Dashboard

### 4. AWS Deployment (Enterprise)

**Files:**
- `aws-task-definitions.json` - ECS task definitions
- `aws-iam-roles.json` - IAM permissions
- `buildspec-api-gateway.yml` - CodeBuild spec
- `complete-aws-deployment.ps1` - Automated PowerShell script
- `deploy-from-github-to-aws.ps1` - GitHub → AWS pipeline

**Architecture:**
- ECS Fargate for microservices
- ALB for load balancing
- DocumentDB for database
- CloudFront for CDN
- S3 for assets
- RDS for relational data (if needed)

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repo-url>
   cd E-C
   ```

2. **Install Dependencies** (Root Level)
   ```bash
   npm install
   ```

3. **Create .env File** (Root Directory)
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment** - Edit `.env` with:
   - `MONGODB_URI=mongodb://localhost:27017/ecommerce_platform`
   - `JWT_SECRET=dev-secret-key`
   - `GOOGLE_CLIENT_ID=<your-google-oauth-id>`
   - `CLOUDINARY_CLOUD_NAME=<your-cloudinary>`
   - etc.

5. **Start MongoDB** (Local)
   ```bash
   mongod
   ```
   OR via Docker:
   ```bash
   docker run -d -p 27017:27017 mongo:5.0
   ```

6. **Start All Services**
   ```bash
   npm run dev
   ```
   This concurrently starts:
   - API Gateway (3000)
   - Identity Service (3015)
   - Customer Portal (3005)
   - Admin Dashboard (3006)

7. **Access Applications**
   - Customer Portal: http://localhost:3005
   - Admin Dashboard: http://localhost:3006
   - API Gateway: http://localhost:3000
   - Identity Service: http://localhost:3015

### Development Scripts

```bash
# Full stack
npm run dev
npm run dev:current

# Backend only
npm run dev:backend
npm run dev:identity

# Build
npm run build          # All workspaces
npm run build:services # Backend services only
npm run build:frontend # Frontend apps only

# Start production
npm run start:services
npm run start:frontend
```

### Git Workflow

1. **Create feature branch** from `main`
2. **Make changes** in isolated workspace
3. **Test locally** with `npm run dev`
4. **Commit** with clear messages
5. **Push** and create pull request
6. **Code review** and merge

---

## Key Features

### User Authentication
- Email/password registration and login
- Google OAuth 2.0 single sign-on
- JWT-based session management
- Admin authentication with scope-based access
- Password reset flow via email

### E-Commerce Core
- Product catalog with multiple scopes (markets)
- Advanced search with Algolia
- Shopping cart management
- Wishlist functionality
- Order management and tracking
- Order history and status

### Admin Dashboard
- Multi-scope administration
- Product and category management
- User management
- Order management
- Analytics and reporting
- Content management
- Partner/vendor management

### Multi-Market Support
- **Local Market** - Domestic commerce
- **Global Market** - International products
- **Africa Market** - Africa-specific catalog
- **China Market** - China-specific offerings
- **B2B Marketplace** - Business-to-business commerce
- Isolated user roles and permissions per market

### File Management
- Cloudinary integration for image uploads
- Product image management
- Category banners
- User avatars
- SEO-optimized image serving

---

## Environment Variables

### API Gateway (.env)

```bash
# Server Config
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce_platform
MONGODB_DB_NAME=ecommerce_platform

# JWT Authentication
JWT_SECRET=your-secret-key-for-jwt-signing
JWT_EXPIRES_IN=7d

# Admin Default Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Service Integration
IDENTITY_SERVICE_URL=http://localhost:3015
ENFORCE_IDENTITY_BOUNDARY=false
USER_SERVICE_URL=http://localhost:3007
PRODUCT_SERVICE_URL=http://localhost:3001

# CORS Configuration
CORS_ORIGIN=http://localhost:3005,http://localhost:3006,https://yourdomain.com

# Algolia Search (Optional)
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_API_KEY=your-algolia-api-key
```

### Identity Service (.env)

```bash
NODE_ENV=development
IDENTITY_SERVICE_PORT=3015
MONGODB_URI=mongodb://localhost:27017/ecommerce_platform
MONGODB_DB_NAME=ecommerce_platform
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin-password
EXPOSE_PASSWORD_RESET_TOKEN=false
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

### Customer Portal (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Customer Portal
```

### Admin Dashboard (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Admin Dashboard
```

---

## Quick Reference: Port Assignments

| Application | Port | Purpose |
|-------------|------|---------|
| API Gateway | 3000 | Backend API |
| Identity Service | 3015 | Auth Service |
| User Service | 3007 | User Management (placeholder) |
| Customer Portal | 3005 | Customer UI |
| Admin Dashboard | 3006 | Admin UI |
| MongoDB | 27017 | Database |

---

## Common Tasks

### Add New Admin Scope

1. **Define Scope** in `admin-dashboard/config/adminScopes.js`
2. **Set Permissions** in `admin-dashboard/config/adminScopePermissions.js`
3. **Map API Routes** in `admin-dashboard/services/adminScopeApiMap.js`
4. **Add User Role** with scope in Identity Service user model

### Add New Market

1. **Create Market Config** in `features/markets/<market-name>.js`
2. **Add to Registry** in `features/markets/registry.js`
3. **Create Landing Page** template
4. **Update Scope Helpers** for scope resolution

### Deploy to Production

**Render:**
```bash
git push origin main
# Render auto-deploys via GitHub integration
```

**AWS:**
```bash
./complete-aws-deployment.ps1
# Or ./deploy-aws.sh for Linux/Mac
```

**Vercel (Frontend only):**
```bash
# Connect repo in Vercel dashboard
# Auto-deploys on push to main
```

---

## Project Statistics

- **Services:** 3 (API Gateway, Identity Service, User Service)
- **Frontend Apps:** 2 (Customer Portal, Admin Dashboard)
- **Markets Supported:** 5 (Local, Global, Africa, China, B2B)
- **Admin Scopes:** 6 (local, global, africa, china, b2b, system)
- **API Routes:** 40+
- **Collections (MongoDB):** 5+

---

## Links & References

- **Getting Started:** [docs/getting-started.md](docs/getting-started.md)
- **Render Deployment:** [docs/render-deployment-guide.md](docs/render-deployment-guide.md)
- **Vercel Deployment:** [docs/vercel-deployment-guide.md](docs/vercel-deployment-guide.md)
- **AWS EC2 Quick Deploy:** [docs/aws-ec2-monolith-quick-deploy.md](docs/aws-ec2-monolith-quick-deploy.md)
- **Architecture:** [CURRENT_ARCHITECTURE.md](CURRENT_ARCHITECTURE.md)
- **Route Ownership:** [ROUTE_OWNERSHIP_MATRIX.md](ROUTE_OWNERSHIP_MATRIX.md)

---

**Document Version:** 1.0  
**Generated:** April 6, 2026  
**Maintained By:** Development Team
