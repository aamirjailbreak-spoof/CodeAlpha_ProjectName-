

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
│   └── schema.sql
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
   - `created_at` / `updated_at` — TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

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

### Planned Future Endpoints
```text
Orders (Phase 7)
POST   /api/orders            - Checkout / create order
GET    /api/orders            - View order history
GET    /api/orders/:id        - View order details
```

---

## 🔐 Security

The application follows secure backend development practices:

* **Authentication & User Isolation**: Cart operations are strictly scoped to the authenticated user ID extracted from verified JWT tokens. Users cannot access, modify, or delete another user's cart or cart items.
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

### Phase 7 — Orders & Checkout

* [ ] Checkout & order creation endpoints
* [ ] Order history and details endpoints

### Phase 8 — Frontend Development

* [ ] Build application layout and navigation
* [ ] Product browsing and search UI
* [ ] Cart and checkout views
* [ ] Authentication forms (Login/Register)


### Phase 7 — Admin Features

* Product management
* Inventory management
* Order management

### Phase 8 — Testing

* Frontend testing
* API testing
* Authentication testing
* Database testing
* Error handling

### Phase 9 — Deployment

* Deploy frontend
* Deploy backend
* Configure production database
* Configure environment variables

### Phase 10 — Documentation

* Update README
* Add screenshots
* Add live demo
* Prepare project explanation video

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

Create a `.env` file inside the `backend` directory (refer to `backend/.env.example`):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codealpha_ecommerce
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

Never commit the `.env` file to GitHub.

### Initialize Database Schema

Apply the database schema and initial seed data using `psql` or PostgreSQL client:

```bash
psql -U postgres -d codealpha_ecommerce -f database/schema.sql
```


---

## 🧪 Testing

API testing will be performed using **Postman**.

The application will be tested for:

* Authentication
* Product operations
* Cart operations
* Order processing
* Authorization
* Invalid requests
* Database operations

---

## 📸 Screenshots

Screenshots will be added after the frontend implementation is completed.

---

## 🌐 Live Demo

**Coming soon**

---

## 👨‍💻 Developer

**Spoof**

Developed as part of the **CodeAlpha Full Stack Development Internship**.

---

## 📄 License

This project is developed for educational and internship purposes.


