# Architecture Diagrams - Usage Guide

This document explains the system architecture diagrams for the TechHub E-Commerce application.

## Available Diagrams

### 1. **ARCHITECTURE_SIMPLE.puml** - Simple Overview
A clean, high-level view of the system architecture showing the main components:
- Client Browser (React Frontend)
- Web Server (Express Backend)
- Database Server (MongoDB)
- Payment Gateway (Braintree)

**Best for:** Quick presentations, onboarding new developers

### 2. **ARCHITECTURE_DIAGRAM.puml** - Component Architecture
Detailed component-level diagram showing:
- Frontend components (UI, Pages, Router, Context)
- Backend components (Routes, Controllers, Middlewares, Helpers)
- Database collections
- External services
- Technology stack for each layer

**Best for:** Technical documentation, architecture reviews

### 3. **ARCHITECTURE_DETAILED.puml** - Detailed System Architecture
Comprehensive diagram with:
- Complete data flow
- Layer-by-layer breakdown (Client, Server, Data)
- Middleware pipeline
- Authentication flow
- State management
- All technology stack details
- Jaccard algorithm integration

**Best for:** In-depth system understanding, developer reference

## Viewing the Diagrams

### Quick View (VS Code)

1. Install "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Online Viewer

1. Visit: http://www.plantuml.com/plantuml/uml/ or 
oprion 2 (selected) https://www.planttext.com/ 
2. Copy the contents of any `.puml` file
3. Paste and view instantly

### Export as Image

```bash
# Install PlantUML first
# Download from: https://plantuml.com/download

# Export all diagrams as PNG
java -jar plantuml.jar docs/ARCHITECTURE_*.puml

# Export as SVG (scalable)
java -jar plantuml.jar -tsvg docs/ARCHITECTURE_SIMPLE.puml

# Export as PDF
java -jar plantuml.jar -tpdf docs/ARCHITECTURE_DETAILED.puml
```

## System Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Tier 1)             │
│  ┌───────────────────────────────────────────┐  │
│  │   React Frontend (Port 3000)              │  │
│  │   - UI Components                         │  │
│  │   - React Router                          │  │
│  │   - Context API (State Management)        │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓ HTTP/REST API
┌─────────────────────────────────────────────────┐
│          Application Layer (Tier 2)             │
│  ┌───────────────────────────────────────────┐  │
│  │   Express Backend (Port 8080)             │  │
│  │   - API Routes                            │  │
│  │   - Controllers (Business Logic)          │  │
│  │   - Middlewares (Auth, CORS, Upload)      │  │
│  │   - Helpers (Jaccard, Password Hash)      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓ Mongoose ODM
┌─────────────────────────────────────────────────┐
│            Data Layer (Tier 3)                  │
│  ┌───────────────────────────────────────────┐  │
│  │   MongoDB Atlas                           │  │
│  │   - Users Collection                      │  │
│  │   - Products Collection                   │  │
│  │   - Categories Collection                 │  │
│  │   - Orders Collection                     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Technology Stack by Layer

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18.3, React Router 6.29, Axios, Bootstrap 5, Ant Design |
| **Backend** | Node.js, Express.js, JWT, Bcrypt, Morgan, Express Formidable |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **External** | Braintree Payment Gateway |
| **DevOps** | Concurrently, Nodemon |

## Key System Components

### Frontend (Client Browser - Port 3000)

**Component Structure:**
```
React Application
├── Pages (Landing, Product Details, Cart, etc.)
├── Components (Layout, Forms, Routes Protection)
├── React Router (Navigation)
└── Context Providers
    ├── Auth Context (User & JWT Token)
    ├── Cart Context (Shopping Cart State)
    └── Search Context (Search State)
```

**Communication:**
- Uses Axios for HTTP requests
- Base URL: `http://localhost:8080` (from .env)
- Sends JWT token in Authorization header
- Handles 401 errors globally via interceptors

### Backend (Web Server - Port 8080)

**Layer Architecture:**
```
Express Server
├── Routes Layer (/api/v1/*)
│   ├── Auth Routes
│   ├── Product Routes
│   └── Category Routes
├── Middleware Layer
│   ├── CORS (Cross-Origin)
│   ├── JWT Verification
│   └── File Upload (Formidable)
├── Controller Layer (Business Logic)
│   ├── Auth Controller
│   ├── Product Controller
│   └── Category Controller
└── Helper Layer
    ├── Password Hashing (Bcrypt)
    └── Jaccard Similarity Algorithm
```

**API Endpoints:**
- `/api/v1/auth/*` - Authentication & user management
- `/api/v1/product/*` - Products, search, recommendations
- `/api/v1/category/*` - Category management

### Database (MongoDB Atlas)

**Collections:**
- **users** - User accounts (customers & admins)
- **products** - Product catalog with images & keywords
- **categories** - Product categories
- **orders** - Customer orders with order lines

**Schema Management:**
- Mongoose ODM for schema validation
- ObjectId references for relationships
- Binary storage for product images
- Automatic timestamps

### External Services

**Braintree Payment Gateway:**
- Token generation for client-side
- Server-side payment processing
- Transaction management
- Secure checkout flow

## Data Flow Examples

### 1. User Authentication Flow

```
User Login Request
    ↓
[React Login Page]
    ↓ POST /api/v1/auth/login
[Express Auth Routes]
    ↓
[Auth Controller]
    ↓ comparePassword()
[Bcrypt Helper]
    ↓ Query user
[MongoDB Users Collection]
    ↓ User found
[Auth Controller]
    ↓ Generate JWT
[JWT Library]
    ↓ Return token & user
[React Auth Context]
    ↓ Store in localStorage
[Axios Client]
    ↓ Add to headers
All future requests include JWT token
```

### 2. Product Recommendation Flow

```
User views Product Details
    ↓
[React Product Page]
    ↓ GET /api/v1/product/related/:pid/:cid
[Express Product Routes]
    ↓
[Product Controller]
    ↓ Get current product keywords
[MongoDB Products Collection]
    ↓ Get all products in category
[MongoDB Products Collection]
    ↓ Calculate similarity
[Jaccard Algorithm Helper]
    ↓ J(A,B) = |A ∩ B| / |A ∪ B|
[Jaccard Helper]
    ↓ Sort by similarity score
[Product Controller]
    ↓ Return top 3 similar products
[React Product Page]
    ↓ Display "Related Products"
User sees recommendations
```

### 3. Payment Processing Flow

```
User adds items to cart
    ↓
[React Cart Context]
    ↓ Store in localStorage
User proceeds to checkout
    ↓
[React Cart Page]
    ↓ GET /api/v1/product/braintree/token
[Braintree Controller]
    ↓ Request token
[Braintree API]
    ↓ Return client token
[Braintree Drop-in UI]
    ↓ User enters payment info
User clicks "Pay"
    ↓ POST /api/v1/product/braintree/payment
[Braintree Controller]
    ↓ Process transaction
[Braintree API]
    ↓ Success response
[Order Controller]
    ↓ Create order record
[MongoDB Orders Collection]
    ↓ Order confirmation
[React Cart Page]
    ↓ Clear cart, show success
User receives confirmation
```

## Security Architecture

### Authentication & Authorization

**JWT Token Flow:**
1. User logs in with email/password
2. Server verifies credentials (Bcrypt)
3. Server generates JWT token
4. Token stored in client (Auth Context + localStorage)
5. All protected routes require JWT in header
6. Server validates token via middleware
7. Role-based access control (user/admin)

**Middleware Protection:**
```javascript
// Public routes - No auth required
GET /api/v1/product/get-product

// Protected routes - requireSignIn
GET /api/v1/auth/user-auth
PUT /api/v1/auth/profile

// Admin routes - requireSignIn + isAdmin
POST /api/v1/product/create-product
DELETE /api/v1/product/delete-product/:pid
```

### Password Security

- Passwords hashed with Bcrypt (10 salt rounds)
- Never stored in plain text
- Security question for password recovery
- JWT tokens expire (configured in backend)

## Performance Considerations

### Frontend Optimization
- React Context for state management (lightweight)
- Image lazy loading
- Pagination for product lists (12 per page)
- LocalStorage for cart persistence

### Backend Optimization
- MongoDB indexing on slugs and IDs
- Image storage as Buffer (no file system)
- Morgan logger for request monitoring
- Error handling with try-catch

### Database Optimization
- Mongoose schema validation
- ObjectId references (no joins)
- Efficient keyword arrays for Jaccard
- Timestamps for cache invalidation

## Deployment Architecture

### Development Environment
```
localhost:3000 (React Dev Server)
     ↓
localhost:8080 (Express with Nodemon)
     ↓
MongoDB Atlas (Cloud Database)
```

**Command:** `npm run dev` (runs both concurrently)

### Production Environment
```
Frontend: Build → Static files → CDN/Static Host
Backend: Node.js → Process Manager (PM2) → Server
Database: MongoDB Atlas → Replica Set
```

**Build:** `npm run build` (in client folder)

## Troubleshooting Architecture Issues

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend API base URL in .env

2. **Authentication Failures**
   - Check JWT token in localStorage
   - Verify Authorization header in requests
   - Check token expiration

3. **Database Connection**
   - Verify MONGO_URL in .env
   - Check MongoDB Atlas whitelist
   - Test connection with `connectDB()`

4. **File Upload Issues**
   - Check formidable middleware
   - Verify file size limits
   - Check Buffer storage in MongoDB

## Related Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Code organization
- [DATABASE_SCHEMA.puml](DATABASE_SCHEMA.puml) - Database ERD
- [DATABASE_DIAGRAM_USAGE.md](DATABASE_DIAGRAM_USAGE.md) - DB diagram guide
- [JACCARD_TESTING.md](../JACCARD_TESTING.md) - Jaccard algorithm testing

## Diagram Modification Guide

### Add New Component

```plantuml
component "New Component" as newcomp
newcomp --> existingcomp : "Interaction"
```

### Add New Node

```plantuml
node "New Server" {
  component "Service"
}
```

### Add Notes

```plantuml
note right of component
  Explanation here
end note
```

---

**Last Updated:** 2025-11-23
**Architecture Version:** 1.0
**Technology Stack:** MERN (MongoDB, Express, React, Node.js)
