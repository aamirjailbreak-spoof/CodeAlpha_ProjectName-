

# CodeAlpha E-Commerce Store

A full-stack e-commerce web application developed as part of the **CodeAlpha Full Stack Development Internship**.

The project is designed to provide a complete online shopping experience, including user authentication, product browsing, shopping cart functionality, and order processing.

---

## 📌 Internship Task

**CodeAlpha Full Stack Development Internship**

**Task:** Task 1 — Simple E-Commerce Store

**Repository:** `CodeAlpha_EcommerceStore`

---

## 🎯 Project Objective

The goal of this project is to develop a functional full-stack e-commerce application while gaining practical experience in:

* Frontend development
* Backend development
* RESTful API development
* Database integration
* User authentication
* CRUD operations
* Order processing
* Full-stack application deployment

---

## 🛠️ Technologies

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* Vercel Web Interface Guidelines Compliance (ARIA accessibility, focus-visible states, reduced motion, tabular numerals)

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

## ✨ Planned Features

### 👤 User Authentication

* User registration
* User login
* User logout
* Secure authentication
* User account management

### 🛍️ Products

* View all products
* Product details
* Product categories
* Product search
* Product filtering
* Admin product management

### 🛒 Shopping Cart

* Add products to cart
* Remove products from cart
* Update product quantity
* View cart total
* Cart persistence

### 📦 Orders

* Checkout
* Create orders
* View order history
* View order details
* Order status

### 👨‍💼 Admin

* Admin authentication
* Add products
* Update products
* Delete products
* Manage product inventory
* View customer orders

---

## 🏗️ Application Architecture

The application follows a three-layer full-stack architecture:

```text
┌─────────────────────────┐
│        React.js         │
│       Frontend/UI       │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│   Node.js + Express.js  │
│       Backend/API       │
└────────────┬────────────┘
             │
             │ SQL Queries
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│        Database         │
└─────────────────────────┘
```

---

## 📁 Planned Project Structure

```text
CodeAlpha_EcommerceStore/
│
├── .agents/
│   └── skills/
│       └── code-review/
│           └── SKILL.md
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── app.js
│   └── server.js
│
├── database/
│   ├── migrations/
│   │   └── 001_add_checkout_fields.sql
│   ├── schema.sql
│   └── seed_curated_catalog.js
│
├── .gitignore
├── README.md
└── package.json
```

> The structure may be updated during development as the application architecture evolves.

---

## 🗄️ Database Schema & Data Model (Phase 3 ✅)

The application uses PostgreSQL (`codealpha_ecommerce`) with relational integrity, constraints, and indexed foreign keys defined in [`database/schema.sql`](database/schema.sql).

### Core Tables & Structure

```text
users
  │
  ├── cart (1:1 per user)
  │     │
  │     └── cart_items ─── products ─── categories
  │
  └── orders (1:N, protected against user deletion)
        │
        └── order_items ─── products (protected against product deletion)
```

1. **`users`**
   - `id` — SERIAL PRIMARY KEY
   - `name` — VARCHAR(255) NOT NULL
   - `email` — VARCHAR(255) NOT NULL UNIQUE
   - `password_hash` — VARCHAR(255) NOT NULL
   - `created_at` / `updated_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

2. **`categories`**
   - `id` — SERIAL PRIMARY KEY
   - `name` — VARCHAR(100) NOT NULL UNIQUE
   - `description` — TEXT
   - `created_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

3. **`products`**
   - `id` — SERIAL PRIMARY KEY
   - `category_id` — INT REFERENCES categories(id) ON DELETE SET NULL
   - `name` — VARCHAR(255) NOT NULL
   - `description` — TEXT
   - `price` — NUMERIC(10, 2) NOT NULL (CHECK: `price > 0`)
   - `stock_quantity` — INT NOT NULL DEFAULT 0 (CHECK: `stock_quantity >= 0`)
   - `image_url` — VARCHAR(500)
   - `created_at` / `updated_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

4. **`cart`**
   - `id` — SERIAL PRIMARY KEY
   - `user_id` — INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
   - `created_at` / `updated_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

5. **`cart_items`**
   - `id` — SERIAL PRIMARY KEY
   - `cart_id` — INT NOT NULL REFERENCES cart(id) ON DELETE CASCADE
   - `product_id` — INT NOT NULL REFERENCES products(id) ON DELETE CASCADE
   - `quantity` — INT NOT NULL DEFAULT 1 (CHECK: `quantity > 0`)
   - `created_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)`

6. **`orders`**
   - `id` — SERIAL PRIMARY KEY
   - `user_id` — INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT (preserves financial order history)
   - `status` — VARCHAR(50) NOT NULL DEFAULT 'pending' (CHECK: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
   - `total_amount` — NUMERIC(10, 2) NOT NULL DEFAULT 0.00 (CHECK: `total_amount >= 0`)
   - `customer_name` — VARCHAR(150) (Validated 2–150 characters, nullable for historical orders)
   - `phone` — VARCHAR(30) (Validated phone format, nullable for historical orders)
   - `shipping_address` — VARCHAR(255) (Street address, nullable for historical orders)
   - `shipping_city` — VARCHAR(100) (Delivery city, nullable for historical orders)
   - `shipping_postal_code` — VARCHAR(20) (Postal/ZIP code, nullable for historical orders)
   - `delivery_method` — VARCHAR(50) (CHECK: `standard`, `express`; nullable for historical orders, explicitly supplied at checkout)
   - `delivery_fee` — NUMERIC(10, 2) (CHECK: `delivery_fee >= 0`; nullable for historical orders, calculated server-side at checkout)
   - `payment_method` — VARCHAR(50) (CHECK: `cash_on_delivery`, `online`; nullable for historical orders, explicitly supplied at checkout)
   - `payment_status` — VARCHAR(50) (CHECK: `pending`, `paid`, `failed`, `cancelled`; nullable for historical orders, explicitly supplied as 'pending' at checkout)
   - `created_at` / `updated_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

> **Historical Order Preservation & Schema Integrity**:
> The checkout fields (`delivery_method`, `delivery_fee`, `payment_method`, `payment_status`, and contact/address fields) are nullable with no database-level defaults. This ensures that legacy orders created before Phase 9 remain accurately recorded as unassigned (`NULL`) without inheriting artificial or misleading default values. All new orders created via the backend checkout API (`POST /api/orders`) explicitly supply verified values for these fields.
> A permanent non-destructive migration script is provided in [`database/migrations/001_add_checkout_fields.sql`](database/migrations/001_add_checkout_fields.sql).


7. **`order_items`**
   - `id` — SERIAL PRIMARY KEY
   - `order_id` — INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE
   - `product_id` — INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT (preserves historical purchase records)
   - `quantity` — INT NOT NULL (CHECK: `quantity > 0`)
   - `unit_price` — NUMERIC(10, 2) NOT NULL (CHECK: `unit_price > 0`, historical snapshot)
   - `created_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

### Performance Indexes
- `idx_products_category_id` on `products(category_id)`
- `idx_cart_items_product_id` on `cart_items(product_id)`
- `idx_orders_user_id` on `orders(user_id)`
- `idx_order_items_order_id` on `order_items(order_id)`
- `idx_order_items_product_id` on `order_items(product_id)`

### Seed Data
Safe initial test data (2 categories, 3 products, 1 development test user) is provided in `database/schema.sql` with `ON CONFLICT DO NOTHING`.


---

## 🔌 API Endpoints

The backend follows a lightweight modular Express architecture:
`routes → controllers → PostgreSQL` with centralized error handling.

### System & Health Endpoints
```text
GET    /api/health            - Server health check
GET    /api/db-test           - PostgreSQL connectivity test
```

### Categories Endpoints (Phase 4 ✅)
```text
GET    /api/categories        - Retrieve all categories
GET    /api/categories/:id    - Retrieve category by ID
```

### Products Endpoints (Phase 4 ✅)
```text
GET    /api/products          - Retrieve products (supports ?category_id=, ?search=, ?page=, ?limit=)
GET    /api/products/:id      - Retrieve product by ID
POST   /api/products          - Create new product (name, price, stock_quantity, category_id, image_url)
PUT    /api/products/:id      - Update existing product
DELETE /api/products/:id      - Delete unreferenced product
```

### Authentication & Users Endpoints (Phase 5 ✅)
```text
POST   /api/auth/register     - Register a new user account
POST   /api/auth/login        - Authenticate credentials and receive a signed JWT
GET    /api/users/me          - Retrieve authenticated user profile (requires Bearer token)
```

#### Authentication Header Format
Protected endpoints require the standard `Authorization` header:
```text
Authorization: Bearer <your_jwt_token>
```

#### Example Payloads
**Register Request (`POST /api/auth/register`)**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Login Request (`POST /api/auth/login`)**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Protected Profile Response (`GET /api/users/me`)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-09-26T04:00:00.000Z",
    "updated_at": "2026-09-26T04:00:00.000Z"
  }
}
```

### Cart Endpoints (Phase 6 ✅)
All cart endpoints require authentication (`Authorization: Bearer <token>`).
```text
GET    /api/cart              - Retrieve authenticated user's cart with items and subtotal
POST   /api/cart/items        - Add product to cart (body: { product_id, quantity })
PUT    /api/cart/items/:id    - Update item quantity in cart (body: { quantity })
DELETE /api/cart/items/:id    - Remove item from cart
```

### Orders & Checkout Endpoints (Phase 7 & 9 ✅)
All order endpoints require authentication (`Authorization: Bearer <token>`).
```text
POST   /api/orders            - Create order from active cart with delivery and payment metadata
GET    /api/orders            - View authenticated user's order history with summary stats
GET    /api/orders/:id        - View order details with line items and fulfillment metadata (user-isolated)
```

#### Checkout Request Payload (`POST /api/orders`)
```json
{
  "customer_name": "Jane Doe",
  "phone": "+1 555-0199",
  "shipping_address": "123 Artisan Way, Apt 4B",
  "shipping_city": "New York",
  "shipping_postal_code": "10001",
  "delivery_instructions": "Gate code #401",
  "delivery_method": "standard",
  "payment_method": "cash_on_delivery"
}
```

#### Centralized Server-Side Delivery Fee Rules
Delivery fees are strictly evaluated on the server side:
- **Standard Delivery**: `$4.95` (ETA 3–5 business days)
- **Express Delivery**: `$14.95` (ETA 1–2 business days)
- **Trusted Total Formula**: `total_amount = subtotal + delivery_fee`

#### Order Response Example (`POST /api/orders` / `GET /api/orders/:id`)
```json
{
  "success": true,
  "data": {
    "id": 19,
    "user_id": 2,
    "status": "pending",
    "subtotal": "490.00",
    "delivery_fee": "14.95",
    "total_amount": "504.95",
    "customer_name": "Jane Doe",
    "phone": "+1 555-0199",
    "shipping_address": "123 Artisan Way, Apt 4B",
    "shipping_city": "New York",
    "shipping_postal_code": "10001",
    "delivery_instructions": "Gate code #401",
    "delivery_method": "express",
    "payment_method": "online",
    "payment_status": "pending",
    "items": [
      {
        "id": 25,
        "order_id": 19,
        "product_id": 1,
        "product_name": "Studio Master Reference Headphones",
        "quantity": 2,
        "unit_price": "245.00",
        "item_total": "490.00",
        "created_at": "2026-09-28T10:28:40.000Z"
      }
    ],
    "created_at": "2026-09-28T10:28:40.000Z",
    "updated_at": "2026-09-28T10:28:40.000Z"
  }
}
```

---

## 🔐 Security

The application follows secure backend development practices:

* **Authentication & User Isolation**: Orders and Cart operations are strictly scoped to the authenticated user ID extracted from verified JWT tokens. Users cannot access, modify, or delete another user's cart or orders. Cross-user order access returns a safe 404 Not Found to prevent data enumeration.
* **Transactional Checkout & Concurrency**: Checkout uses PostgreSQL transactions (`BEGIN ... COMMIT / ROLLBACK`) with row-level locking (`FOR UPDATE OF p` sorted deterministically by `id ASC`) and atomic conditional stock deduction (`WHERE stock_quantity >= $quantity`). This eliminates race conditions and overselling.
* **Price Snapshotting**: Order items permanently store the checkout-time price in `unit_price`, protecting against future catalog price fluctuations.
* **Password Hashing**: Passwords hashed with `bcrypt` (10 salt rounds); plaintext passwords and `password_hash` are never stored plaintext or exposed in API responses.
* **Token Authentication**: Signed JSON Web Tokens (`jsonwebtoken`) containing minimal payload (`{ userId }`) with expiration (`JWT_EXPIRES_IN`).
* **Timing & Enumeration Defense**: Generic 401 error message ("Invalid email or password") used for both non-existent users and invalid passwords.
* **Input Normalization & Validation**: Email addresses trimmed and lowercased; passwords constrained between 8 and 72 characters; names capped at 255 characters; numeric IDs and quantities strictly validated.
* **SQL Injection Defense**: 100% parameterized PostgreSQL queries (`$1, $2, ...`) via `pg`.
* **Centralized Error Handling**: Database errors, stack traces, and credentials are intercepted and sanitized before returning responses.
* **DoS Mitigation**: Bounded JSON request body limit (`100kb`) via `express.json()`.
* **Environment Segregation**: Secrets (`DB_PASSWORD`, `JWT_SECRET`) remain exclusively in untracked `backend/.env`.

---

## 🚀 Development Roadmap

### Phase 1 — Planning (Completed ✅)

* [x] Define requirements
* [x] Design application flow
* [x] Design database
* [x] Design API structure

### Phase 2 — Project Setup (Completed ✅)

* [x] Initialize React frontend
* [x] Initialize Express backend
* [x] Configure PostgreSQL
* [x] Configure Git/GitHub

### Phase 3 — Database (Completed ✅)

* [x] Create database (`codealpha_ecommerce`)
* [x] Create tables (`users`, `categories`, `products`, `cart`, `cart_items`, `orders`, `order_items`)
* [x] Define relationships and foreign key delete rules
* [x] Add database-level check and unique constraints
* [x] Add performance indexes
* [x] Add initial test seed data

### Phase 4 — Backend: Products & Categories REST API (Completed ✅)

* [x] Establish modular Express architecture (`routes → controllers → PostgreSQL`)
* [x] Implement Categories endpoints (`GET /api/categories`, `GET /api/categories/:id`)
* [x] Implement Products endpoints (`GET`, `POST`, `PUT`, `DELETE /api/products`)
* [x] Add category filtering, case-insensitive keyword search, and pagination
* [x] Implement centralized error handler and bounded request limits
* [x] Ensure regression preservation for `/api/health` and `/api/db-test`

### Phase 5 — Authentication & Users (Completed ✅)

* [x] Integrate `bcrypt` and `jsonwebtoken`
* [x] Implement user registration (`POST /api/auth/register`) with duplicate email defense
* [x] Implement user login (`POST /api/auth/login`) with generic credential error handling
* [x] Implement `authMiddleware` for Bearer token validation
* [x] Implement authenticated user profile (`GET /api/users/me`)
* [x] Add `JWT_SECRET` and `JWT_EXPIRES_IN` configuration
* [x] Full regression preservation of Phase 1–4 endpoints

### Phase 6 — Cart & Cart Items (Completed ✅)

* [x] Implement cart retrieval with calculated subtotal (`GET /api/cart`)
* [x] Implement add-to-cart with conflict handling and stock checking (`POST /api/cart/items`)
* [x] Implement cart item quantity update with user isolation (`PUT /api/cart/items/:id`)
* [x] Implement cart item deletion with user isolation (`DELETE /api/cart/items/:id`)
* [x] Protect all cart endpoints with JWT authentication middleware
* [x] Full regression preservation of Phase 1–5 functionality

### Phase 7 — Orders & Checkout (Completed ✅)

* [x] Implement transactional order creation with atomic stock decrement (`POST /api/orders`)
* [x] Snapshot checkout unit price in `order_items`
* [x] Automatic cart clearing upon successful checkout
* [x] Implement order history retrieval with summary stats (`GET /api/orders`)
* [x] Implement single order details retrieval with line items (`GET /api/orders/:id`)
* [x] Strict user isolation on all order endpoints
* [x] Protect against concurrent checkout overselling and race conditions
* [x] Full regression preservation of Phase 1–6 functionality

### Phase 8 — Frontend Integration (Completed ✅)

* [x] Establish modular frontend structure (`components`, `context`, `services`)
* [x] Configure Vite dev proxy forwarding `/api` to verified backend port 5000
* [x] Build application layout and navigation bar (`Navbar.jsx`)
* [x] Real-time product browsing, category filtering pills, and keyword search (`ProductGrid.jsx`, `ProductCard.jsx`)
* [x] Slide-out cart drawer with quantity steppers and subtotal calculations (`CartDrawer.jsx`)
* [x] User registration, sign-in, and authentication modal (`AuthModal.jsx`)
* [x] Transactional checkout integration with error handling for stock limits
* [x] Order history and itemized line item modal (`OrdersModal.jsx`)
* [x] User profile overview (`ProfileModal.jsx`)
* [x] Centralized API client service (`api.js`) and JWT token lifecycle management (`AuthContext.jsx`)
* [x] Full regression preservation of backend APIs (Phases 1–7)

### Phase 8.1 — Premium Editorial Retail Redesign & Catalog Expansion (Completed ✅)

* [x] **Premium Editorial Retail Design System (`index.css` & `App.css`)**:
  * Established a restrained editorial palette: warm ivory/off-white surfaces (`#faf9f6`), deep charcoal typography (`#161513`), warm secondary text (`#54514a`), subtle hairline borders (`#ebe7de`), and a single restrained warm cognac accent (`#8a542b`).
  * Replaced all tech-dashboard patterns (radial glow blobs, neon indigo gradients, floating pill widgets, glassmorphism) with crisp architectural retail layouts and Google Font pairings (`Instrument Serif` & `Inter`).
  * Enforced accessible `:focus-visible` outlines, `tabular-nums` numeric alignments, and delicate 2px–4px geometry.
* [x] **Catalog Expansion across Real Database (26 Products, 4 Categories)**:
  * Expanded the live PostgreSQL catalog from 3 items to 26 realistic, thoughtfully curated products with high-resolution imagery, realistic pricing ($34.00 – $340.00), and believable inventory quantities.
  * Distributed naturally across 4 core departments: **Electronics** (7), **Apparel** (8), **Footwear & Leather** (5), and **Living & Objects** (6).
  * Maintained 100% compliance with existing backend schema, constraints, and REST API contracts.
* [x] **Editorial Retail Storefront & Hero (`HeroSection.jsx`)**:
  * Designed an editorial retail introduction with typographic hierarchy, collection metadata (`COLLECTION № 04 • 2026`), and generous whitespace.
  * Removed gimmicky animations from the hero for a calm, expensive, product-first retail atmosphere.
* [x] **Architectural Retail Navigation (`Navbar.jsx`)**:
  * Wordmark branding (`CODEALPHA EDITIONS`), clean department navigation links with active underlines, search trigger, client account actions, and minimal bag counter (`Bag (X)`).
* [x] **Retail Product Grid & Portrait Cards (`ProductGrid.jsx`, `ProductCard.jsx`)**:
  * Fashion/lifestyle standard 3:4 portrait image framing with warm neutral backgrounds and subtle hover zoom (`scale(1.025)`).
  * Minimalist hover Quick View action, understated stock flags (e.g. `Only 2 Left` or `Sold Out`), and clean `+ Add to Bag` action.
  * Integrated multi-sort controls (Featured, Price: Low-to-High, Price: High-to-Low, Alphabetical A–Z) and instant debounced search.
* [x] **Quick View Modal & Checkout Drawer (`ProductDetailModal.jsx`, `CartDrawer.jsx`)**:
  * Architectural 2-column detail modal with large portrait photography, quantity steppers, and direct add-to-bag.
  * Slide-over checkout drawer with item thumbnails, stepper quantity controls, complimentary delivery indicator, and clear purchase summary.
* [x] **Client Auth, Orders & Profile (`AuthModal.jsx`, `OrdersModal.jsx`, `ProfileModal.jsx`)**:
  * Cohesive warm ivory surfaces, hairline dividers, itemized order receipts with status badges, and account metadata.
* [x] **Vercel Web Interface Guidelines Compliance**:
  * Hardware-accelerated transitions, zero `transition: all`, complete reduced-motion support via `@media (prefers-reduced-motion: reduce)`, and touch targets ≥ 44px.

### Phase 8.2 — Professional Quality-Control, Visual Polish & Content Audit (Completed ✅)

* [x] **Product Content & Imagery Quality Audit**:
  * Audited and resolved all catalog discrepancies identified during visual QA:
    * Eliminated duplicate product photography (duplicate t-shirt portrait and duplicate chiclet keyboards).
    * Replaced all mismatched imagery (e.g. plastic ocean waste replaced with authentic smoked oak organizer tray; bathroom tub replaced with cast iron incense burner; casual portrait replaced with tailored wool overcoat).
    * Replaced broken 404 image URLs with verified, high-resolution lifestyle photography.
  * Verified 100% image-to-title-to-category relevance across all products.
* [x] **Curated 24-Product Real Database Catalog**:
  * Seeded 24 authentic, balanced products evenly distributed across 4 departments (6 per category: Electronics, Apparel, Footwear & Leather, Living & Objects).
  * Professional editorial naming and believable retail pricing ($32.00 – $340.00).
  * Real PostgreSQL persistence via `database/seed_curated_catalog.js` and synchronized `database/schema.sql` (no fake React-only data).
* [x] **Product Card Geometry & Grid Rhythm Polish (`ProductCard.jsx`, `App.css`)**:
  * Fixed card height and grid alignment by constraining title blocks to uniform two-line heights (`min-height: 2.7em`).
  * Replaced detached, asymmetric inline buttons with clean, full-width `Add to Bag` action buttons aligned to the base of every card.
  * Redesigned the Quick View trigger into a floating, centered pill overlay on hover with smooth opacity transitions that never covers the product photography.
  * Polished typographic hierarchy: `Category (11px, uppercase, 0.08em tracking)` → `Product Title (15px, medium, 2-line clamp)` → `Price (15px, tabular numerals)` → `Action Button`.
* [x] **Category Flow & Filtering Resolution**:
  * Corrected category mapping disconnect between the client navigation and backend database: replaced static hardcoded IDs in `Navbar.jsx` with dynamic database-driven categories loaded from `/api/categories`.
  * Normalized database categories with clean sequential IDs (1: Electronics, 2: Apparel, 3: Footwear & Leather, 4: Living & Objects) with 6 products each.
  * Enhanced `ProductGrid.jsx` to resolve both numeric IDs and textual category names seamlessly.
  * Eliminated visual tab cramping and merging by enforcing `flex-shrink: 0`, minimum 40px touch targets, and a responsive two-row toolbar layout on tablets and mobile screens (`@media (max-width: 980px)`).
* [x] **End-to-End Automated Integration Verification (`backend/test_flows.js`, `backend/test_categories.js`)**:
  * Built and executed full-suite integration tests verifying `/health`, category filtering, search, user registration & login, cart operations, transactional order creation, and order retrieval against live PostgreSQL and Express backend.
* [x] **Production Build & Lint Validation**:
  * Zero build errors via Vite (`npm run build`) and clean static analysis via oxlint (`npm run lint`).

### Phase 8.3 — Modern Frontend UI/UX Upgrade: Curated Lifestyle & Design System (Completed ✅)

* [x] **Brand Identity & Favicon Transformation**:
  * Replaced the default Vite/React lightning bolt favicon with a custom-engineered **Brand Geometric Emblem SVG Favicon** (`frontend/public/favicon.svg`) featuring warm amber/saffron gradients, high contrast against dark and light browser tabs (optimized for 16×16, 32×32, and high-res display).
  * Updated `index.html` page title to **`CodeAlpha Store • Curated Electronics, Apparel & Living Objects`** with descriptive metadata and theme color.
  * Integrated modern Google Fonts: **Plus Jakarta Sans** and **Outfit** alongside Instrument Serif for an editorial, premium design-system typography hierarchy.
* [x] **Modern Hero Section (`HeroSection.jsx`)**:
  * Designed an elevated, high-impact editorial hero section with edition badges (`CURATED EDITION • 2026`), display headline, and descriptive narrative.
  * Dual CTAs: *Explore Collection* (smooth scroll to catalog) and *Our Quality Standards* (smooth scroll to brand values).
  * Trust proof badges: 100% Authenticity Guaranteed and Complimentary Shipping Over $75.
  * Interactive featured showcase preview card with subtle warm glow, badge, and verified star rating.
* [x] **Premium Liquid Glass Cart Button (`Navbar.jsx`, `App.css`)**:
  * Replaced standard cart action with a liquid glassmorphic pill button inspired by modern 21st.dev UI patterns.
  * Formatted as a horizontal oval pill with subtle backdrop blur (`backdrop-filter: blur(12px)`), translucent amber gradient, specular light reflection overlay (`.glass-btn-reflection`), and dual-layer inset & ambient shadows derived from the existing warm brand palette.
  * Replaced the shopping bag icon with a proper accessible `CartIcon` and updated text label to *Cart*.
  * Preserved full functionality and state integration, smoothly opening the existing cart drawer without touching backend or context logic.
  * Tactile hover lift, pressed state (`transform: scale(0.97)`), and accessible `:focus-visible` ring.
* [x] **21st.dev-Inspired Spotlight Product Cards (`ProductCard.jsx`, `App.css`)**:
  * Integrated a lightweight cursor-tracking radial spotlight (`.card-spotlight-glow`) and illuminated perimeter glow (`.card-spotlight-border`) using CSS custom properties (`--mouse-x`, `--mouse-y`) updated directly on mouse move.
  * Achieves 60/120fps hardware-accelerated spotlight illumination without causing React re-renders.
  * Palette-aligned illumination using warm amber/saffron gradients (`rgba(217, 107, 39, ...)` and `rgba(245, 166, 35, ...)`), keeping product titles and descriptions 100% legible.
  * Gracefully disabled on touch devices (`@media (hover: none)`) and for reduced-motion preferences (`@media (prefers-reduced-motion: reduce)`).
  * Maintained all existing product data, image presentation, prices, ratings, and Add to Cart flows.
* [x] **Catalog Toolbar & Filter Controls (`ProductGrid.jsx`)**:
  * Active pill-shaped category tabs with smooth transitions and hover states.
  * Search bar with debounced filtering, clear action, and search icon.
  * Custom styled sort selector (Featured, Price: Low to High, Price: High to Low, Alphabetical).
  * Responsive catalog item counter badge.
  * Polished empty state with search reset button and custom error state with retry connection trigger.
* [x] **Brand Values & Final CTA Section (`BrandValues.jsx`)**:
  * 4-pillar brand commitment grid: *Curated Product Quality*, *Trusted Product Selection*, *Secure & Reliable Shopping*, and *Reliable Delivery*.
  * Editorial customer praise block with 5-star rating and quote.
  * High-contrast final CTA banner with rich espresso background, golden ambient glow, and *Browse Full Collection* button.
* [x] **Slide-Over Cart Drawer (`CartDrawer.jsx`)**:
  * Integrated dynamic **Free Shipping Progress Meter** ($45 threshold) that updates live with subtotal changes.
  * Tactile `+` and `-` quantity steppers with min/max stock awareness.
  * Item remove action with custom notification toast.
  * Fixed sticky checkout footer with cost breakdown and SSL-guarantee note.
  * Body scroll locking (`document.body.classList.add('modal-open')`) when drawer is active.
* [x] **Floating Toast Notifications (`App.jsx`)**:
  * Reusable floating toast notification system with animated slide-up, status icon, and dismiss button.
  * Integrated for add to bag, remove from bag, order completion, and newsletter subscription.
* [x] **Polished Multi-Column Footer (`App.jsx`)**:
  * Interactive newsletter subscription form with email validation and instant confirmation state.
  * Brand manifesto, small-batch guarantees, and deep-link category filters.
  * Technical attribution to PostgreSQL 18, Express REST API, and React 19.
* [x] **Responsive Mobile Layout & Accessibility**:
  * Implemented responsive mobile drawer navigation menu with hamburger toggle for devices under 768px.
  * Full adherence to Vercel Web Interface Guidelines: keyboard Escape key handlers on all modals, accessible `:focus-visible` rings with offset, minimum 44px touch targets, and `prefers-reduced-motion` compliance.
  * Tested across breakpoints: 320px, 375px, 425px, 768px, 1024px, 1440px+.

### Phase 8.4 — Clean Minimal Sign-In & Authentication Experience (Completed ✅)

* [x] **Clean Minimal Authentication Card Architecture (`AuthModal.jsx`)**:
  * Centered authentication dialog with modern 20px curvature, subtle perimeter border, and multi-layered ambient depth shadow (`box-shadow: 0 20px 48px -10px rgba(25, 21, 18, 0.22)`).
  * Centered brand mark emblem header with welcoming typography ("Welcome back" / "Create an account") and clear contextual subheadings.
* [x] **Dual Authentication Segmented Control**:
  * Tactile pill switcher seamlessly toggling between **Sign In** and **Register** with zero page reload or jarring layout shifts.
  * Secondary prompt switch at the base of the card ("Don't have an account? Sign up" / "Already have an account? Sign in").
* [x] **Icon-Enhanced Accessible Input Fields (`Icons.jsx`, `App.css`)**:
  * Email input with inline `MailIcon`, email format validation, and proper autocomplete/inputmode attributes.
  * Password input with inline `LockIcon` and interactive show/hide password toggle button with `EyeIcon` / `EyeOffIcon` and accessible ARIA states.
  * Full Name field with inline `UserIcon` dynamically rendered during registration.
  * 44px touch targets with smooth warm focus ring highlights (`box-shadow: 0 0 0 3px var(--accent-primary-subtle)`).
* [x] **Inline Validation & Backend Error Handling**:
  * Client-side validation for empty fields, email syntax, and minimum 8-character password length.
  * Structured error alert banner (`.auth-error-banner`) with `AlertCircleIcon` rendering both local validation and backend HTTP 401/400 error responses politely via ARIA live regions.
* [x] **Double-Submission Prevention & Loading States**:
  * Primary submit button displays hardware-accelerated animated spinner (`SpinnerIcon`) and dynamic label ("Signing In…" / "Creating Account…") while disabling inputs and preventing duplicate API calls.
* [x] **Full-Stack Auth Integration & Session Preservation**:
  * 100% preservation of existing real JWT authentication via `POST /api/auth/login` and `POST /api/auth/register` through `AuthContext.jsx` and `api.js`.
  * Seamless state propagation: successful authentication updates navigation state with user details, orders trigger, and sign-out controls; logout cleans session tokens and restores initial state.
* [x] **Keyboard Accessibility & Viewport Safety**:
  * Modal respects keyboard `Escape` dismissal, background overlay click cancellation, and locks body scrolling while open.
  * Constrained viewport height (`max-height: 90vh; overflow-y: auto`) ensuring zero overflow or clipping on mobile viewports.

### Phase 8.4 — Multi-Step E-Commerce Checkout & Fulfillment Upgrade (Completed ✅)

* [x] **Multi-Step Checkout Flow Modal (`CheckoutModal.jsx`)**:
  * Upgraded from single-click checkout to an industry-standard 3-step checkout experience:
    1. **Contact & Shipping Information**: Full name (prefilled from client account), phone number, delivery address, city, postal/ZIP code, and optional delivery instructions.
    2. **Logistics & Payment Options**: Interactive radio option cards for delivery service and payment method.
    3. **Order Review & Verification**: Complete breakdown showing itemized line items, recipient details, server-side calculated delivery fees, and clear total.
    4. **Order Confirmation Receipt**: Clean receipt view displaying order reference number, total amount, shipping destination, logistics ETA, and quick navigation to *Order History* or *Continue Shopping*.
* [x] **Centralized Server-Side Delivery Fee Engine**:
  * Delivery fees are computed exclusively by the backend source of truth:
    * **Standard Delivery**: `$4.95` (3–5 business days ground shipping)
    * **Express Delivery**: `$14.95` (1–2 business days priority air dispatch)
  * Trusted total formula: `subtotal + delivery_fee` calculated in PostgreSQL transaction.
* [x] **Non-Destructive Database Schema Migration**:
  * Live migrated PostgreSQL `orders` table without data loss or dropping tables.
  * Added 10 columns: `customer_name`, `phone`, `shipping_address`, `shipping_city`, `shipping_postal_code`, `delivery_instructions`, `delivery_method` (with `CHECK: standard, express`), `delivery_fee` (`CHECK: >= 0`), `payment_method` (`CHECK: cash_on_delivery, online`), and `payment_status` (`CHECK: pending, paid, failed, cancelled`).
  * Synchronized schema in [`database/schema.sql`](database/schema.sql).
* [x] **Preserved Transaction Atomicity & Concurrency Safety**:
  * Preserved deterministic `FOR UPDATE OF p ORDER BY p.id ASC` row-level locks, stock verification, and rollback semantics in `POST /api/orders`.
* [x] **Safe Historical Order Preservation & "Not recorded" Fallbacks**:
  * All legacy historical orders remain accessible and unaltered with zero fake backfilled data.
  * `OrdersModal.jsx` gracefully renders legacy orders by displaying `"Not recorded"` for missing customer or shipping fields.
* [x] **Order History & Previous Orders UI Modernization (`OrdersModal.jsx`, `App.css`)**:
  * Replaced compressed inline text with distinct, beautifully separated order cards.
  * Dedicated layout hierarchy: `Order #ID` and colored status pill on top row, date and item count on secondary row, isolated Total row, and explicit *"View Details"* / *"Hide Details"* button with rotating chevron.
  * Replaced raw compressed table (`ItemQtyPriceTotal`) with readable stacked product rows (`Product Title`, `Qty X × $Price`, and right-aligned line total).
  * Expanded delivery and payment sections with comfortable two-column desktop grid, responsive mobile stacking, and wrapped labels preventing broken words.
  * Clean financial breakdown with Subtotal, Delivery Fee, and Order Total.
* [x] **Automated End-to-End Regression Verification & Idempotence**:
  * Full integration suite (`backend/test_flows.js` and `backend/test_checkout_comprehensive.js`) validates validation errors, fee calculations, atomic stock decrements, order placement, and historical record integrity.
  * **Test Isolation & Zero Database Pollution**: Automated tests deterministically clean up only their self-created QA user and order records in `finally` blocks, preserving development records.
  * **Relative Stock Restoration**: Restores only test-caused stock decrements via exact relative deltas (`UPDATE products SET stock_quantity = stock_quantity + $delta WHERE id = $target`), preventing catalog stock drifts.
* [x] **Strict Online Payment Terminology**:
  * Without an integrated payment gateway or authorization processor, online orders are accurately designated as `Payment method: Online` with `Payment status: Pending` across all UI modals, API contracts, and tests without misleading pre-auth or capture terminology.

### Phase 9 — Deployment & Production Hardening (Completed ✅)

* [x] **Product Mutation Security**: Protected mutating catalog endpoints (`POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`) with admin authorization (`x-admin-key`), blocking unauthorized public/customer mutations while keeping all `GET` catalog browsing public.
* [x] **Environment-Driven CORS Configuration**: Configured backend CORS to bind to `CLIENT_URL` with a secure default fallback to `http://localhost:5173`.
* [x] **Universal Cloud Database Connectivity**: Enhanced `backend/db.js` to support cloud deployment connection strings via `DATABASE_URL` and configurable SSL (`DB_SSL`), while preserving 100% backward compatibility with local discrete PostgreSQL credentials.
* [x] **End-to-End Suite Alignment**: Aligned integration tests and verified zero regression across all test suites, database constraints, and production Vite builds.

### Phase 10 — Documentation

* [ ] Finalize documentation
* [ ] Add live demo link
* [ ] Prepare project explanation video

---

## ▶️ Local Development

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL
* Git

### Clone the repository

```bash
git clone https://github.com/aamirjailbreak-spoof/CodeAlpha_ProjectName-.git
cd CodeAlpha_ProjectName-
```

### Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### Environment Variables

#### Backend Environment (`backend/.env`)
Create a `.env` file inside the `backend` directory (refer to `backend/.env.example`):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_API_KEY=your_secure_admin_api_key

# Database (Discrete credentials or optional DATABASE_URL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codealpha_ecommerce
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
# DATABASE_URL=postgres://user:password@localhost:5432/codealpha_ecommerce
# DB_SSL=false

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

#### Frontend Environment (`frontend/.env`)
Create a `.env` file inside the `frontend` directory (refer to `frontend/.env.example`):

```env
# API Base URL (defaults to /api routed by Vite dev proxy in local development)
VITE_API_URL=/api
```

Never commit `.env` files to GitHub.

#### Vercel Production Environment Variables
When deploying both services to Vercel:

| Project | Variable | Value | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `VITE_API_URL` | `https://code-alpha-project-name-qdg1-blond.vercel.app/api` | Full URL including `/api` to the deployed backend |
| **Backend** | `CLIENT_URL` | `https://code-alpha-project-name-blush.vercel.app` | Allowed CORS frontend origin (must include `https://`) |
| **Backend** | `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL pooled connection string with SSL |
| **Backend** | `JWT_SECRET` | *(secure 32+ char secret)* | Secret used to sign and verify user JWT tokens |
| **Backend** | `JWT_EXPIRES_IN` | `1d` | Token expiration duration |
| **Backend** | `ADMIN_API_KEY` | *(secure random key)* | Key required for admin category & catalog modifications |

### Initialize Database Schema

Apply the database schema and initial seed data using `psql` or PostgreSQL client:

```bash
psql -U postgres -d codealpha_ecommerce -f database/schema.sql
```


---

## 🧪 Testing

API testing will be performed using **Postman** and automated test suites (`backend/test_flows.js`, `backend/test_checkout_comprehensive.js`).

The application will be tested for:

* Authentication
* Product operations
* Cart operations
* Order processing
* Authorization
* Invalid requests
* Database operations

---



## 🌐 Live Demo

* **Frontend (Storefront UI)**: [https://code-alpha-project-name-blush.vercel.app](https://code-alpha-project-name-blush.vercel.app)
* **Backend (API Service)**: [https://code-alpha-project-name-qdg1-blond.vercel.app/api/health](https://code-alpha-project-name-qdg1-blond.vercel.app/api/health)


---

## 👨‍💻 Developer

**Spoof**

Developed as part of the **CodeAlpha Full Stack Development Internship**.

---

## 📄 License

This project is developed for educational and internship purposes.


