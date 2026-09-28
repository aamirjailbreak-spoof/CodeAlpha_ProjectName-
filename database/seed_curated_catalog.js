const db = require('../backend/db');

async function seedCuratedCatalog() {
  console.log('Seeding pristine curated catalog...');

  // 1. Clear out old/duplicate products and categories for clean IDs
  await db.query('DELETE FROM cart_items');
  await db.query('DELETE FROM order_items');
  await db.query('DELETE FROM products');
  await db.query('DELETE FROM categories');
  await db.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
  await db.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

  // 2. Ensure 4 pristine categories exist with sequential IDs 1, 2, 3, 4
  await db.query(`
    INSERT INTO categories (name, description) VALUES
      ('Electronics', 'Precision audio monitors, custom mechanical keyboards, and computing tools'),
      ('Apparel', 'Heavyweight cotton textiles, selvedge denim, and tailored knitwear'),
      ('Footwear & Leather', 'Full-grain leather carry goods, handcrafted boots, and card cases'),
      ('Living & Objects', 'Artisanal stoneware, turned brass vessels, and interior essentials');
  `);

  const categoryRows = (await db.query('SELECT id, name FROM categories ORDER BY id ASC')).rows;
  const catMap = {};
  for (const c of categoryRows) {
    catMap[c.name] = c.id;
  }

  // 3. Define 24 verified, distinct products with 100% matched professional photography
  const curatedProducts = [
    // --- Electronics (6 items) ---
    {
      category: 'Electronics',
      name: 'Wireless Studio Headphones',
      description: 'Over-ear monitoring headphones featuring 45mm neodymium drivers, active acoustic dampening, and memory foam lambskin pads.',
      price: 245.00,
      stock: 28,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Custom Mechanical Keyboard',
      description: 'Solid aluminum chassis keyboard with factory-lubed tactile switches, dye-sublimated PBT keycaps, and USB-C connectivity.',
      price: 165.00,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Active Studio Monitor Pair',
      description: 'Two-way nearfield acoustic monitors with 5-inch composite woofers and silk dome tweeters for reference mixing.',
      price: 280.00,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Wireless In-Ear Monitors',
      description: 'Precision in-ear acoustic earphones with passive noise isolation, IPX5 moisture resistance, and aluminum charging case.',
      price: 135.00,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Ergonomic Desktop Mouse',
      description: 'Rechargeable wireless desktop mouse with machined aluminum scroll wheel, silent switches, and 4000 DPI optical tracking.',
      price: 85.00,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Electronics',
      name: 'Anodized Laptop Stand',
      description: 'Solid CNC-milled aluminum stand elevating display to ergonomic eye level while promoting unhindered device airflow.',
      price: 68.00,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    },

    // --- Apparel (6 items) ---
    {
      category: 'Apparel',
      name: 'Heavyweight Combed Cotton T-Shirt',
      description: '240 GSM organic ring-spun cotton tee with bound rib collar, preshrunk jersey knit, and straight relaxed silhouette.',
      price: 38.00,
      stock: 55,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Loopback French Terry Hoodie',
      description: '450 GSM custom knit cotton pullover hoodie with double-layer hood, flatlock seam construction, and ribbed cuffs.',
      price: 120.00,
      stock: 22,
      image: '/images/french_terry_hoodie.png'
    },
    {
      category: 'Apparel',
      name: 'Japanese Selvedge Denim Jean',
      description: '14.5oz unwashed raw indigo denim woven on vintage shuttle looms in Okayama. Finished with copper hardware.',
      price: 175.00,
      stock: 16,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Australian Merino Wool Crewneck',
      description: 'Fine-gauge 19.5-micron merino wool sweater offering natural breathability, temperature regulation, and clean drape.',
      price: 145.00,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Garment-Washed Linen Shirt',
      description: 'Pure European flax linen shirt washed for softness. Features mother-of-pearl buttons and tailored point collar.',
      price: 95.00,
      stock: 24,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Apparel',
      name: 'Tailored Wool-Blend Overcoat',
      description: 'Structured mid-length overcoat cut from virgin wool blend. Features notch lapels, horn buttons, and viscose lining.',
      price: 340.00,
      stock: 9,
      image: '/images/tailored_overcoat.png'
    },

    // --- Footwear & Leather (6 items) ---
    {
      category: 'Footwear & Leather',
      name: 'Full-Grain Leather Weekend Duffle',
      description: 'Handcrafted pull-up cowhide travel bag with solid brass hardware, reinforced base studs, and YKK Excella zippers.',
      price: 295.00,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Vegetable-Tanned Bifold Wallet',
      description: 'Traditional Italian vegetable-tanned leather wallet with six card slots, two interior receipt pockets, and cash sleeve.',
      price: 65.00,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Waxed Roughout Chelsea Boots',
      description: 'Goodyear-welted weatherproof boots crafted from waxed suede with elastic side gussets and Vibram lug soles.',
      price: 245.00,
      stock: 14,
      image: '/images/chelsea_boots.png'
    },
    {
      category: 'Footwear & Leather',
      name: 'Minimal Low-Top Leather Sneakers',
      description: 'Supple Italian calfskin upper paired with stitched rubber cupsole and removable cushioned leather footbed.',
      price: 175.00,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Footwear & Leather',
      name: 'Natural Bridle Leather Cardholder',
      description: 'Slim four-slot card case cut from English bridle leather with beveled edges and central folded-cash compartment.',
      price: 42.00,
      stock: 45,
      image: '/images/leather_cardholder.png'
    },
    {
      category: 'Footwear & Leather',
      name: 'Full-Grain Bridle Leather Belt',
      description: '1.25-inch full grain steerhide leather strap paired with solid forged brass buckle and hand-burnished edges.',
      price: 75.00,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'
    },

    // --- Living & Objects (6 items) ---
    {
      category: 'Living & Objects',
      name: 'Ceramic Pour-Over Coffee Dripper',
      description: 'Heat-retaining matte stoneware cone designed for uniform 60-degree flow rate and sweet, balanced coffee extraction.',
      price: 42.00,
      stock: 35,
      image: '/images/ceramic_pour_over.jpg'
    },
    {
      category: 'Living & Objects',
      name: 'Turned Brass Desk Vessel',
      description: 'Turned from solid brass bar stock with a weighted base, hand-brushed satin finish, and felted underlay.',
      price: 88.00,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Virgin Wool Bouclé Throw Blanket',
      description: 'Woven from 100% pure virgin wool in a textural bouclé weave with rolled fringe detailing. Size: 130x180cm.',
      price: 135.00,
      stock: 14,
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Sculpted Crystal Glass Ashtray',
      description: 'Heavyweight clear sculpted crystal glass valet ashtray with dual rests, polished rim, and deep dished basin.',
      price: 48.00,
      stock: 20,
      image: '/images/crystal_glass_ashtray.png'
    },
    {
      category: 'Living & Objects',
      name: 'Atlas Cedar Soy Wax Candle',
      description: 'Hand-poured 8.5oz natural soy candle with crackling wood wick and essential notes of Atlas cedar, amber, and pine.',
      price: 36.00,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Living & Objects',
      name: 'Stoneware Tea Mug & Saucer',
      description: 'Wheel-thrown ceramic tea cup and matching saucer with iron-speckled matte glaze and comfortable 280ml capacity.',
      price: 32.00,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const item of curatedProducts) {
    const categoryId = catMap[item.category];
    await db.query(
      `INSERT INTO products (category_id, name, description, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [categoryId, item.name, item.description, item.price, item.stock, item.image]
    );
  }

  const finalCount = await db.query('SELECT count(*) FROM products');
  console.log(`Successfully seeded ${finalCount.rows[0].count} pristine, curated products!`);
  process.exit(0);
}

seedCuratedCatalog().catch((err) => {
  console.error('Seeding failure:', err);
  process.exit(1);
});
