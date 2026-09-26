const db = require('../db');

/**
 * Helper to retrieve or create the user's active cart.
 */
async function getOrCreateUserCart(userId) {
  const existingCart = await db.query(
    'SELECT id, user_id, created_at, updated_at FROM cart WHERE user_id = $1;',
    [userId]
  );

  if (existingCart.rows.length > 0) {
    return existingCart.rows[0];
  }

  const newCart = await db.query(
    `INSERT INTO cart (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING id, user_id, created_at, updated_at;`,
    [userId]
  );

  return newCart.rows[0];
}

/**
 * GET /api/cart
 * Retrieve the authenticated user's cart with items and calculated subtotal.
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateUserCart(userId);

    const itemsResult = await db.query(
      `SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        p.name AS product_name,
        p.price AS product_price,
        p.image_url AS product_image_url,
        p.stock_quantity AS product_stock,
        ROUND((ci.quantity * p.price), 2) AS item_total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC;`,
      [cart.id]
    );

    const items = itemsResult.rows;

    // Calculate subtotal and total item count
    let subtotalNum = 0;
    let totalItems = 0;

    for (const item of items) {
      subtotalNum += parseFloat(item.item_total);
      totalItems += item.quantity;
    }

    const subtotal = subtotalNum.toFixed(2);

    return res.status(200).json({
      success: true,
      data: {
        id: cart.id,
        user_id: cart.user_id,
        items,
        subtotal,
        total_items: totalItems,
        created_at: cart.created_at,
        updated_at: cart.updated_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/cart/items
 * Add a product to the authenticated user's cart.
 * If the product is already in the cart, increments the quantity.
 */
async function addCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    // Validate product_id
    if (!product_id || !/^[1-9]\d*$/.test(String(product_id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required'
      });
    }

    const parsedProductId = parseInt(product_id, 10);

    // Validate quantity
    if (!quantity || !/^[1-9]\d*$/.test(String(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than 0'
      });
    }

    const parsedQuantity = parseInt(quantity, 10);

    // Check if product exists in database
    const productCheck = await db.query(
      'SELECT id, name, price, stock_quantity FROM products WHERE id = $1;',
      [parsedProductId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productCheck.rows[0];

    // Check stock availability
    if (parsedQuantity > product.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock_quantity} available)`
      });
    }

    // Ensure cart exists for user
    const cart = await getOrCreateUserCart(userId);

    // Insert or increment quantity atomically
    const insertResult = await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING id, cart_id, product_id, quantity, created_at;`,
      [cart.id, parsedProductId, parsedQuantity]
    );

    // Update cart updated_at timestamp
    await db.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [cart.id]);

    const item = insertResult.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: product.name,
        product_price: product.price,
        created_at: item.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/cart/items/:id
 * Update the quantity of an existing cart item.
 * Enforces user isolation: cart item must belong to the user's cart.
 */
async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    const cartItemId = parseInt(id, 10);

    if (quantity === undefined || !/^[1-9]\d*$/.test(String(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than 0'
      });
    }

    const parsedQuantity = parseInt(quantity, 10);

    // Verify cart item exists and belongs to the authenticated user's cart
    const itemCheck = await db.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, p.stock_quantity, p.name, p.price
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND c.user_id = $2;`,
      [cartItemId, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const itemData = itemCheck.rows[0];

    // Check stock availability
    if (parsedQuantity > itemData.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${itemData.stock_quantity} available)`
      });
    }

    // Update quantity
    const updateResult = await db.query(
      `UPDATE cart_items
       SET quantity = $1
       WHERE id = $2
       RETURNING id, cart_id, product_id, quantity, created_at;`,
      [parsedQuantity, cartItemId]
    );

    await db.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [itemData.cart_id]);

    const updatedItem = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        id: updatedItem.id,
        cart_id: updatedItem.cart_id,
        product_id: updatedItem.product_id,
        quantity: updatedItem.quantity,
        product_name: itemData.name,
        product_price: itemData.price,
        created_at: updatedItem.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/cart/items/:id
 * Remove an existing cart item.
 * Enforces user isolation: cart item must belong to the user's cart.
 */
async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    const cartItemId = parseInt(id, 10);

    // Verify cart item exists and belongs to the authenticated user's cart
    const itemCheck = await db.query(
      `SELECT ci.id, ci.cart_id
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2;`,
      [cartItemId, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = itemCheck.rows[0].cart_id;

    await db.query('DELETE FROM cart_items WHERE id = $1;', [cartItemId]);
    await db.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [cartId]);

    return res.status(200).json({
      success: true,
      message: 'Cart item removed successfully'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
};
