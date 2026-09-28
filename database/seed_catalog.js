const db = require('../backend/db');

async function seed() {
  console.log('Seeding expanded catalog...');

  // Ensure new categories exist
  await db.query(`
    INSERT INTO categories (name, description) VALUES
      ('Electronics', 'Electronic devices, studio audio, and computing tools'),
      ('Apparel', 'Garments, tailored knitwear, and everyday textiles'),
      ('Footwear & Leather', 'Handcrafted leather goods, footwear, and travel bags'),
      ('Living & Objects', 'Artisanal homeware, stoneware, and interior essentials')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
  `);

  const categoryRows = (await db.query('SELECT id, name FROM categories')).rows;
  const catMap = {};
  for (const c of categoryRows) {
    catMap[c.name] = c.id;
  }

  const newProducts = [
    {
      category: 'Electronics',
      name: 'Wireless Noise-Canceling Headphones',
      description: 'Over-ear Bluetooth headphones with hybrid active noise cancellation, custom 40mm acoustic drivers, and 30-hour battery life.',
      price: 199.00,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Mechanical Tactile Keyboard',
      description: 'Solid aluminum frame keyboard with lubed tactile switches, PBT dye-sub keycaps, and detachable braided USB-C cable.',
      price: 145.00,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Studio Active Monitor Speakers',
      description: 'Pair of nearfield acoustic studio reference monitors with precision silk dome tweeters and rear-ported composite woofers.',
      price: 280.00,
      stock: 14,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Noise-Canceling Wireless Earbuds',
      description: 'Compact in-ear monitors with transparency pass-through, IPX5 weather rating, and wireless charging case.',
      price: 129.00,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Precision Wireless Ergonomic Mouse',
      description: 'Machined metal scroll wheel, dual wireless connectivity, and high-precision sensor calibrated for creative workflows.',
      price: 89.00,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'CNC Anodized Laptop Stand',
      description: 'Precision milled aerospace-grade aluminum stand engineered for optimal ergonomic viewing height and passive cooling.',
      price: 64.00,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Classic Combed Cotton T-Shirt',
      description: '220 GSM heavyweight combed organic cotton t-shirt with a relaxed cut and blind-stitched hem.',
      price: 36.00,
      stock: 65,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Heavyweight French Terry Hoodie',
      description: '450 GSM loopback cotton fleece pullover with double-layer hood, rib-knit side gussets, and kangaroo pocket.',
      price: 110.00,
      stock: 28,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Selvedge Raw Denim Trouser',
      description: '14oz shuttle-loomed Japanese selvedge denim in an unwashed indigo rinse with copper hardware and chainstitched hems.',
      price: 165.00,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Fine Merino Wool Crewneck',
      description: 'Spun from extra-fine 19.5-micron Australian merino wool offering natural temperature regulation and exceptional handfeel.',
      price: 135.00,
      stock: 24,
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Relaxed Washed Linen Shirt',
      description: 'Pure European flax linen garment-washed for a soft broken-in drape. Mother-of-pearl buttons and curved hem.',
      price: 92.00,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Structured Canvas Chore Coat',
      description: '100% durable cotton duck canvas with triple-needle stitching, patch utility pockets, and horn button front.',
      price: 175.00,
      stock: 16,
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Double-Breasted Wool Overcoat',
      description: 'Structured wool-cashmere blend overcoat tailored with peak lapels, interior welt pockets, and viscose lining.',
      price: 340.00,
      stock: 9,
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Full-Grain Leather Duffle Bag',
      description: 'Handcrafted pull-up full grain cowhide with solid antique brass hardware, YKK Excella zippers, and reinforced base.',
      price: 295.00,
      stock: 11,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Vegetable-Tanned Bifold Wallet',
      description: 'Artisanal Italian vegetable-tanned leather wallet with burnished edges, six card slots, and full-length cash sleeve.',
      price: 58.00,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Waxed Suede Chelsea Boots',
      description: 'Weather-resistant waxed roughout suede with Goodyear-welted construction and oil-resistant rubber lug soles.',
      price: 240.00,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Minimal Low-Top Leather Sneakers',
      description: 'Full-grain calfskin upper with Margom stitched rubber cupsole, calfskin lining, and waxed cotton laces.',
      price: 185.00,
      stock: 26,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Minimalist Minimal Cardholder',
      description: 'Ultra-slim profile card case cut from natural bridle leather. Holds up to 6 cards with quick thumb access.',
      price: 38.00,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Ceramic Pour-Over Coffee Set',
      description: 'Matte stoneware dripper and 600ml glass carafe designed for uniform thermal stability and balanced extraction.',
      price: 46.00,
      stock: 32,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Machined Brass Tabletop Vessel',
      description: 'Turned from solid brass bar stock with a brushed satin exterior and protective microcrystalline wax coating.',
      price: 94.00,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Woven Wool Bouclé Blanket',
      description: 'Plush virgin wool woven in a textural bouclé weave. Finished with rolled fringe edges and natural warmth.',
      price: 125.00,
      stock: 14,
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Smoked Oak Desk Tray',
      description: 'Solid European smoked oak organizer carved with precision compartments for writing instruments and daily carry.',
      price: 54.00,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Cedar & Amber Botanical Candle',
      description: 'Hand-poured 100% natural soy wax candle featuring notes of Atlas cedarwood, warm amber, and crushed black pepper.',
      price: 36.00,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Cast Iron Tabletop Incense Burner',
      description: 'Heavyweight sand-cast iron vessel with removable brass lid designed to capture ash while diffusing fragrant smoke.',
      price: 48.00,
      stock: 19,
      image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const prod of newProducts) {
    const categoryId = catMap[prod.category];
    // Check if product with same name exists
    const existing = await db.query('SELECT id FROM products WHERE name = $1', [prod.name]);
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO products (category_id, name, description, price, stock_quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [categoryId, prod.name, prod.description, prod.price, prod.stock, prod.image]
      );
      console.log(`Inserted product: ${prod.name}`);
    } else {
      // Update details to ensure clean, high-quality descriptions and images
      await db.query(
        `UPDATE products SET category_id = $1, description = $2, price = $3, stock_quantity = $4, image_url = $5, updated_at = NOW() WHERE id = $6`,
        [categoryId, prod.description, prod.price, prod.stock, prod.image, existing.rows[0].id]
      );
      console.log(`Updated product: ${prod.name}`);
    }
  }

  const countRes = await db.query('SELECT count(*) FROM products');
  console.log(`Finished seeding! Total products in database: ${countRes.rows[0].count}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
