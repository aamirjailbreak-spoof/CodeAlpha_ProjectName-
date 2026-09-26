-- =============================================================================
-- CodeAlpha E-Commerce Store - Database Schema (Phase 3)
-- Database: codealpha_ecommerce (PostgreSQL 18)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Categories Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Products Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. Cart Table
-- A user has at most one active cart.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. Cart Items Table
-- Ensures each product appears at most once per cart.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- -----------------------------------------------------------------------------
-- 6. Orders Table
-- Protected against cascading deletes on user deletion to preserve history.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. Order Items Table
-- Preserves historical unit_price and prevents deleting referenced products.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Indexes for Performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- -----------------------------------------------------------------------------
-- Sample / Test Data (Development and Verification Only)
-- -----------------------------------------------------------------------------

-- 2 Categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices, gadgets, and computing accessories'),
    ('Apparel', 'Clothing, footwear, and wearable fashion accessories')
ON CONFLICT (name) DO NOTHING;

-- 3 Products (category IDs resolved dynamically by category name)
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url) VALUES
    (
        (SELECT id FROM categories WHERE name = 'Electronics'),
        'Wireless Noise-Canceling Headphones',
        'Over-ear Bluetooth headphones with active noise cancellation',
        99.99,
        50,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    ),
    (
        (SELECT id FROM categories WHERE name = 'Electronics'),
        'Mechanical Gaming Keyboard',
        'RGB backlit mechanical keyboard with tactile switches',
        69.99,
        35,
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3'
    ),
    (
        (SELECT id FROM categories WHERE name = 'Apparel'),
        'Classic Cotton T-Shirt',
        '100% premium combed cotton unisex crewneck t-shirt',
        19.99,
        100,
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'
    )
ON CONFLICT DO NOTHING;

-- 1 Test User (Development/Test Only - dummy hash placeholder, no real personal data)
INSERT INTO users (name, email, password_hash) VALUES
    ('Test User', 'testuser@example.com', '$2b$10$devonlytestpasswordhashplaceholderforphase3')
ON CONFLICT (email) DO NOTHING;
