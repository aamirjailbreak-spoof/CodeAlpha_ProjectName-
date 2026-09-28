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
    customer_name VARCHAR(150),
    phone VARCHAR(30),
    shipping_address VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    delivery_instructions TEXT,
    delivery_method VARCHAR(50)
        CHECK (delivery_method IS NULL OR delivery_method IN ('standard', 'express')),
    delivery_fee NUMERIC(10, 2)
        CHECK (delivery_fee IS NULL OR delivery_fee >= 0),
    payment_method VARCHAR(50)
        CHECK (payment_method IS NULL OR payment_method IN ('cash_on_delivery', 'online')),
    payment_status VARCHAR(50)
        CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
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

-- 4 Core Categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices, studio audio, and computing tools'),
    ('Apparel', 'Garments, tailored knitwear, and everyday textiles'),
    ('Footwear & Leather', 'Handcrafted leather goods, footwear, and travel bags'),
    ('Living & Objects', 'Artisanal homeware, stoneware, and interior essentials')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Expanded Sample Products
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url) VALUES
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'Wireless Noise-Canceling Headphones', 'Over-ear Bluetooth headphones with hybrid active noise cancellation, custom 40mm acoustic drivers, and 30-hour battery life.', 199.00, 35, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'Mechanical Tactile Keyboard', 'Solid aluminum frame keyboard with lubed tactile switches, PBT dye-sub keycaps, and detachable braided USB-C cable.', 145.00, 22, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'Studio Active Monitor Speakers', 'Pair of nearfield acoustic studio reference monitors with precision silk dome tweeters and rear-ported composite woofers.', 280.00, 14, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'Noise-Canceling Wireless Earbuds', 'Compact in-ear monitors with transparency pass-through, IPX5 weather rating, and wireless charging case.', 129.00, 40, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'Precision Wireless Ergonomic Mouse', 'Machined metal scroll wheel, dual wireless connectivity, and high-precision sensor calibrated for creative workflows.', 89.00, 30, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Electronics'), 'CNC Anodized Laptop Stand', 'Precision milled aerospace-grade aluminum stand engineered for optimal ergonomic viewing height and passive cooling.', 64.00, 45, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Classic Combed Cotton T-Shirt', '220 GSM heavyweight combed organic cotton t-shirt with a relaxed cut and blind-stitched hem.', 36.00, 65, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Heavyweight French Terry Hoodie', '450 GSM loopback cotton fleece pullover with double-layer hood, rib-knit side gussets, and kangaroo pocket.', 110.00, 28, '/images/french_terry_hoodie.png'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Selvedge Raw Denim Trouser', '14oz shuttle-loomed Japanese selvedge denim in an unwashed indigo rinse with copper hardware and chainstitched hems.', 165.00, 18, 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Fine Merino Wool Crewneck', 'Spun from extra-fine 19.5-micron Australian merino wool offering natural temperature regulation and exceptional handfeel.', 135.00, 24, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Relaxed Washed Linen Shirt', 'Pure European flax linen garment-washed for a soft broken-in drape. Mother-of-pearl buttons and curved hem.', 92.00, 20, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Structured Canvas Chore Coat', '100% durable cotton duck canvas with triple-needle stitching, patch utility pockets, and horn button front.', 175.00, 16, 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Apparel'), 'Double-Breasted Wool Overcoat', 'Structured wool-cashmere blend overcoat tailored with peak lapels, interior welt pockets, and viscose lining.', 340.00, 9, '/images/tailored_overcoat.png'),
    ((SELECT id FROM categories WHERE name = 'Footwear & Leather'), 'Full-Grain Leather Duffle Bag', 'Handcrafted pull-up full grain cowhide with solid antique brass hardware, YKK Excella zippers, and reinforced base.', 295.00, 11, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Footwear & Leather'), 'Vegetable-Tanned Bifold Wallet', 'Artisanal Italian vegetable-tanned leather wallet with burnished edges, six card slots, and full-length cash sleeve.', 58.00, 35, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Footwear & Leather'), 'Waxed Suede Chelsea Boots', 'Weather-resistant waxed roughout suede with Goodyear-welted construction and oil-resistant rubber lug soles.', 240.00, 12, '/images/chelsea_boots.png'),
    ((SELECT id FROM categories WHERE name = 'Footwear & Leather'), 'Minimal Low-Top Leather Sneakers', 'Full-grain calfskin upper with Margom stitched rubber cupsole, calfskin lining, and waxed cotton laces.', 185.00, 26, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Footwear & Leather'), 'Minimalist Minimal Cardholder', 'Ultra-slim profile card case cut from natural bridle leather. Holds up to 6 cards with quick thumb access.', 38.00, 50, '/images/leather_cardholder.png'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Ceramic Pour-Over Coffee Set', 'Matte stoneware dripper and 600ml glass carafe designed for uniform thermal stability and balanced extraction.', 46.00, 32, '/images/ceramic_pour_over.jpg'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Machined Brass Tabletop Vessel', 'Turned from solid brass bar stock with a brushed satin exterior and protective microcrystalline wax coating.', 94.00, 15, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Woven Wool Bouclé Blanket', 'Plush virgin wool woven in a textural bouclé weave. Finished with rolled fringe edges and natural warmth.', 125.00, 14, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Sculpted Crystal Glass Ashtray', 'Heavyweight clear sculpted crystal glass valet ashtray with dual rests, polished rim, and deep dished basin.', 48.00, 20, '/images/crystal_glass_ashtray.png'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Cedar & Amber Botanical Candle', 'Hand-poured 100% natural soy wax candle featuring notes of Atlas cedarwood, warm amber, and crushed black pepper.', 36.00, 45, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'),
    ((SELECT id FROM categories WHERE name = 'Living & Objects'), 'Cast Iron Tabletop Incense Burner', 'Heavyweight sand-cast iron vessel with removable brass lid designed to capture ash while diffusing fragrant smoke.', 48.00, 19, 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

-- 1 Test User (Development/Test Only - dummy hash placeholder, no real personal data)
INSERT INTO users (name, email, password_hash) VALUES
    ('Test User', 'testuser@example.com', '$2b$10$devonlytestpasswordhashplaceholderforphase3')
ON CONFLICT (email) DO NOTHING;
