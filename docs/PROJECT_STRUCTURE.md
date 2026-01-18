# Tech-Hub E-Commerce - Project Structure

This document provides a comprehensive overview of the project's folder structure and organization.

## Table of Contents
- [Overview](#overview)
- [Complete Directory Tree](#complete-directory-tree)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Key Entry Points](#key-entry-points)

---

## Overview

**Architecture:** MERN Stack Monorepo (MongoDB, Express, React, Node.js)
- **Backend:** RESTful API server (Express.js + MongoDB)
- **Frontend:** React SPA with React Router
- **Project Type:** Client-Server Monorepo

---

## Complete Directory Tree

```
clz/
│
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   │   ├── images/                  # Static images
│   │   ├── favicon.ico
│   │   ├── index.html               # HTML template
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/                         # React source code
│   │   ├── components/              # Reusable components
│   │   │   ├── Form/
│   │   │   │   ├── CategoryForm.js  # Category input form
│   │   │   │   └── SearchInput.js   # Search bar component
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── AdminMenu.js     # Admin sidebar navigation
│   │   │   │   ├── Footer.js        # Footer component
│   │   │   │   ├── Header.js        # Navigation bar
│   │   │   │   ├── Layout.js        # Main layout wrapper
│   │   │   │   └── UserMenu.js      # User dashboard sidebar
│   │   │   │
│   │   │   ├── Routes/
│   │   │   │   ├── AdminRoute.js    # Admin-only protected route
│   │   │   │   └── Private.js       # User protected route
│   │   │   │
│   │   │   ├── AuthDebugPanel.js    # Auth debugging component
│   │   │   ├── Prices.js            # Price range filters
│   │   │   └── Spinner.js           # Loading spinner
│   │   │
│   │   ├── config/
│   │   │   └── axios.js             # Axios configuration & interceptors
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── auth.js              # Authentication state
│   │   │   ├── cart.js              # Shopping cart state
│   │   │   └── search.js            # Search state
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useCategory.js       # Fetch categories hook
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── Admin/               # Admin dashboard pages
│   │   │   │   ├── AdminDashboard.js    # Admin home with stats
│   │   │   │   ├── AdminOrders.js       # Order management
│   │   │   │   ├── CreateCategory.js    # Category management
│   │   │   │   ├── CreateProduct.js     # Create new product
│   │   │   │   ├── Products.js          # Product list
│   │   │   │   ├── UpdateProduct.js     # Edit product
│   │   │   │   └── Users.js             # User management
│   │   │   │
│   │   │   ├── Auth/                # Authentication pages
│   │   │   │   ├── ForgotPassword.js    # Password reset
│   │   │   │   ├── Login.js             # Login page
│   │   │   │   └── Register.js          # Registration page
│   │   │   │
│   │   │   ├── user/                # User dashboard pages
│   │   │   │   ├── Dashboard.js         # User dashboard home
│   │   │   │   ├── Orders.js            # User order history
│   │   │   │   └── Profile.js           # User profile edit
│   │   │   │
│   │   │   ├── About.js             # About page
│   │   │   ├── CartPage.js          # Shopping cart & checkout
│   │   │   ├── Categories.js        # All categories list
│   │   │   ├── CategoryProduct.js   # Products by category
│   │   │   ├── Contact.js           # Contact page
│   │   │   ├── HomePage.js          # Landing page
│   │   │   ├── Pagenotfound.js      # 404 page
│   │   │   ├── Policy.js            # Privacy policy
│   │   │   ├── ProductDetails.js    # Single product view
│   │   │   └── Search.js            # Search results
│   │   │
│   │   ├── styles/                  # CSS files
│   │   │   ├── AuthStyles.css       # Auth pages styles
│   │   │   └── ...
│   │   │
│   │   ├── App.css                  # App-level styles
│   │   ├── App.js                   # Main app component & routes
│   │   ├── index.css                # Global styles
│   │   ├── index.js                 # React entry point
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   │
│   ├── .env                         # Frontend environment variables
│   ├── .gitignore
│   ├── package.json                 # Frontend dependencies
│   └── package-lock.json
│
├── config/                          # Backend Configuration
│   └── db.js                        # MongoDB connection setup
│
├── controllers/                     # API Controllers (Business Logic)
│   ├── authController.js            # Authentication & user management
│   ├── categoryController.js        # Category CRUD operations
│   └── productController.js         # Product CRUD & recommendations
│
├── docs/                            # Project Documentation
│   ├── Admin_redirect_to_login_fix_AUTHENTICATION_FIX_DOCUMENTATION.md
│   └── PROJECT_STRUCTURE.md         # This file
│
├── helpers/                         # Utility Functions
│   ├── authHelper.js                # Password hashing & comparison
│   └── jaccard.js                   # Jaccard similarity algorithm
│
├── middlewares/                     # Express Middlewares
│   └── authmiddleware.js            # JWT verification & role checks
│
├── models/                          # Mongoose Database Models
│   ├── categoryModel.js             # Category schema
│   ├── orderModel.js                # Order schema
│   ├── productModel.js              # Product schema
│   └── userModel.js                 # User schema
│
├── routes/                          # API Route Definitions
│   ├── authRoutes.js                # Authentication & user routes
│   ├── categoryRoutes.js            # Category routes
│   └── productRoutes.js             # Product & payment routes
│
├── scripts/                         # Utility Scripts
│   ├── backfill_product_slugs.js    # Add slugs to existing products
│   ├── generate_keywords.js         # Auto-generate product keywords
│   ├── smoke_related.js             # Test product similarity
│   ├── test_jaccard.js              # Unit tests for Jaccard
│   └── watch_recommendation_demo.js # Demo for recommendations
│
├── node_modules/                    # Backend dependencies
│
├── .env                             # Backend environment variables
├── .gitignore                       # Git ignore rules
├── auth-fix-test.html               # Auth testing utility
├── index.js                         # Backend server entry point
├── JACCARD_TESTING.md               # Jaccard testing guide
├── package.json                     # Backend dependencies & scripts
├── package-lock.json
└── README.md                        # Project documentation
```

---

## Backend Structure

### Root Level Files

#### `index.js` - Server Entry Point
- Express server initialization
- Database connection via `connectDB()`
- Middleware setup (CORS, JSON parsing, Morgan logging)
- API route mounting (`/api/v1/*`)
- Server listens on `PORT` (default: 8080)

#### `package.json` - Backend Configuration
**Key Scripts:**
- `npm start` - Start production server
- `npm run server` - Development with nodemon
- `npm run client` - Start frontend
- `npm run dev` - Run both concurrently
- `npm run demo:watch` - Recommendation demo
- `npm run backfill:slugs` - Database utility
- `npm run generate:keywords` - Generate keywords

**Key Dependencies:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `braintree` - Payment gateway
- `cors` - Cross-origin support
- `express-formidable` - File upload handling
- `slugify` - URL-friendly slugs

### Configuration (`config/`)

#### `db.js`
- MongoDB connection using Mongoose
- Uses `MONGO_URL` from environment variables
- Color-coded console logging for connection status

### Models (`models/`)

Database schemas using Mongoose:

#### `userModel.js`
- Fields: name, email, password, phone, address, answer, role
- role: 0 (user) / 1 (admin)
- Timestamps enabled

#### `productModel.js`
- Fields: name, slug, description, keywords[], price, category, quantity, photo, shipping
- Category reference (ObjectId)
- Photo stored as Buffer (binary data)
- Keywords array for Jaccard similarity

#### `categoryModel.js`
- Fields: name (unique), slug
- Simple validation (2-50 chars)

#### `orderModel.js`
- Fields: products[], payment {}, buyer, status
- Status enum: "Not Process", "Processing", "Shipped", "deliverd", "cancel"
- References to Product and User models

### Controllers (`controllers/`)

Business logic for API endpoints:

#### `authController.js`
- User registration & login
- JWT token generation
- Password reset with security question
- Profile management
- Order management (user & admin)
- User management (admin only)

#### `productController.js`
- CRUD operations for products
- Image upload & retrieval
- Search & filtering
- Pagination
- **Jaccard-based product recommendations**
- Braintree payment processing

#### `categoryController.js`
- CRUD operations for categories
- Slug-based retrieval

### Middlewares (`middlewares/`)

#### `authmiddleware.js`
- `requireSignIn` - Validates JWT tokens
- `isAdmin` - Checks admin role (role=1)
- Detailed logging for debugging
- Error handling for expired/invalid tokens

### Routes (`routes/`)

API endpoint definitions:

#### `authRoutes.js` - `/api/v1/auth/*`
- POST `/register` - User registration
- POST `/login` - User login
- POST `/forgot-password` - Password reset
- GET `/user-auth` - Protected user route
- GET `/admin-auth` - Protected admin route
- PUT `/profile` - Update profile
- GET `/orders` - User orders
- GET `/all-orders` - Admin: all orders
- GET `/all-users` - Admin: list users
- PUT `/update-user/:id` - Admin: update user
- DELETE `/delete-user/:id` - Admin: delete user

#### `categoryRoutes.js` - `/api/v1/category/*`
- POST `/create-category` - Create category (admin)
- PUT `/update-category/:id` - Update category (admin)
- GET `/get-category` - Get all categories
- GET `/single-category/:slug` - Get single category
- DELETE `/delete-category/:id` - Delete category (admin)

#### `productRoutes.js` - `/api/v1/product/*`
- POST `/create-product` - Create product (admin)
- PUT `/update-product/:pid` - Update product (admin)
- GET `/get-product` - Get all products
- GET `/get-product/:slug` - Get single product
- GET `/product-photo/:pid` - Get product image
- DELETE `/delete-product/:pid` - Delete product (admin)
- POST `/product-filters` - Filter products
- GET `/product-count` - Total product count
- GET `/product-list/:page` - Paginated list
- GET `/search/:keyword` - Search products
- GET `/related-product/:pid/:cid` - Similar products (Jaccard)
- GET `/product-category/:slug` - Category products
- GET `/braintree/token` - Payment token
- POST `/braintree/payment` - Process payment

### Helpers (`helpers/`)

#### `authHelper.js`
- `hashPassword()` - Bcrypt hashing (10 salt rounds)
- `comparePassword()` - Compare plain password with hash

#### `jaccard.js`
- `tokenize()` - Convert text to token array
- `jaccardDetailed()` - Similarity with detailed info
- `jaccard()` - Simple similarity score (0-1)
- Used for intelligent product recommendations

### Scripts (`scripts/`)

Utility and testing scripts:

- `generate_keywords.js` - Auto-generate keywords from product descriptions
- `backfill_product_slugs.js` - Add slugs to existing products
- `watch_recommendation_demo.js` - Demo Jaccard similarity
- `test_jaccard.js` - Unit tests for Jaccard algorithm
- `smoke_related.js` - Smoke tests for product similarity

---

## Frontend Structure

### React Application (`client/src/`)

#### Entry Points

**`index.js`**
- React app initialization
- Wraps app with context providers (Auth, Search, Cart)
- Uses HelmetProvider for meta tags
- Renders to DOM

**`App.js`**
- Main component with React Router
- Route definitions for all pages
- Nested routes for user/admin dashboards

#### Components (`components/`)

**Form Components:**
- `CategoryForm.js` - Reusable category input form
- `SearchInput.js` - Search bar with autocomplete

**Layout Components:**
- `Layout.js` - Main wrapper (Header + children + Footer)
- `Header.js` - Navigation with auth state, cart badge
- `Footer.js` - Footer with links
- `AdminMenu.js` - Admin sidebar navigation
- `UserMenu.js` - User dashboard sidebar

**Route Protection:**
- `Private.js` - Protected route for authenticated users
- `AdminRoute.js` - Protected route for admin users
- Both implement token verification and redirects

**Utility Components:**
- `Spinner.js` - Loading spinner with countdown
- `Prices.js` - Predefined price range filters
- `AuthDebugPanel.js` - Development debugging tool

#### Context (`context/`)

Global state management using React Context:

**`auth.js`** - Authentication Context
- User object and JWT token
- Persists to localStorage
- Auto-syncs axios Authorization header
- Loading state tracking

**`cart.js`** - Shopping Cart Context
- Cart items array
- Persists to localStorage

**`search.js`** - Search Context
- Search keyword and results
- Global search state

#### Configuration (`config/`)

**`axios.js`**
- Sets base URL from `REACT_APP_API`
- Request interceptor: Logs all API calls
- Response interceptor:
  - Logs responses
  - Handles 401 errors globally
  - Auto-clears invalid auth
  - Redirects to login on unauthorized

#### Hooks (`hooks/`)

**`useCategory.js`**
- Custom hook to fetch all categories
- Auto-loads on component mount

#### Pages (`pages/`)

**Public Pages:**
- `HomePage.js` - Landing page with product grid, filters
- `ProductDetails.js` - Single product view with related products
- `Categories.js` - All categories list
- `CategoryProduct.js` - Products by category
- `Search.js` - Search results page
- `CartPage.js` - Shopping cart with Braintree checkout
- `About.js`, `Contact.js`, `Policy.js` - Info pages
- `Pagenotfound.js` - 404 error page

**Auth Pages:**
- `Login.js` - Login form with JWT
- `Register.js` - Registration form
- `ForgotPassword.js` - Password reset

**User Dashboard:**
- `Dashboard.js` - User home
- `Profile.js` - Edit profile
- `Orders.js` - Order history

**Admin Dashboard:**
- `AdminDashboard.js` - Admin home with summary stats
- `CreateCategory.js` - Create/manage categories
- `CreateProduct.js` - Create product with image upload
- `Products.js` - List all products with edit/delete
- `UpdateProduct.js` - Edit existing product
- `Users.js` - User management (list, edit, delete)
- `AdminOrders.js` - Order management with status updates

#### Styles (`styles/`)
- `AuthStyles.css` - Authentication page styles
- Component-specific CSS files
- `index.css` - Global styles
- `App.css` - App-level styles

---

## Key Entry Points

### Backend
1. **Server Start:** `index.js` (port 8080)
2. **Database:** `config/db.js`
3. **API Routes:** Mounted at `/api/v1/*`

### Frontend
1. **React Start:** `client/src/index.js`
2. **Main App:** `client/src/App.js`
3. **Dev Server:** Port 3000 (Create React App)

### Environment Variables

**Backend (`.env`):**
```
PORT=8080
DEV_MODE=development
MONGO_URL=mongodb+srv://...
JWT_SECRET=...
BRAINTREE_MERCHANT_ID=...
BRAINTREE_PUBLIC_ID=...
BRAINTREE_PRIVATE_ID=...
```

**Frontend (`client/.env`):**
```
REACT_APP_API=http://localhost:8080
```

---

## Quick Reference

### Running the Application

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install

# Run both servers concurrently
npm run dev

# Backend only (with nodemon)
npm run server

# Frontend only
npm run client
```

### Database Collections
- `users` - User accounts
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders

### Key Features
- JWT Authentication with role-based access
- Product recommendations using Jaccard similarity
- Image upload and storage in MongoDB
- Braintree payment integration
- Shopping cart with localStorage
- Admin dashboard with full CRUD
- Search and filtering
- SEO-friendly slugs

---

**Last Updated:** 2025-11-23
