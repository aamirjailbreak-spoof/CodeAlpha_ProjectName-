const db = require('../db');

/**
 * POST /api/orders
 * Create an order from the authenticated user's current cart.
 * Uses a PostgreSQL transaction with row-level locking (FOR UPDATE)
 * and atomic stock deduction to prevent overselling and race conditions.
 */
async function createOrder(req, res, next) {
  const userId = req.user.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Retrieve the user's active cart
    const cartResult = await client.query(
      'SELECT id FROM cart WHERE user_id = $1;',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const cartId = cartResult.rows[0].id;

    // 2. Fetch cart items joined with products.
    // ORDER BY p.id ASC FOR UPDATE OF p prevents deadlocks and serializes concurrent checkouts.
    const cartItemsResult = await client.query(
      `SELECT 
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price AS current_price,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY p.id ASC
      FOR UPDATE OF p;`,
      [cartId]
    );

    const items = cartItemsResult.rows;

    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // 3. Validate stock availability for all items
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.product_name}". Requested: ${item.quantity}, available: ${item.stock_quantity}`
        });
      }
    }

    // 4. Atomically deduct stock for each product
    for (const item of items) {
      const stockUpdate = await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND stock_quantity >= $1
         RETURNING id, stock_quantity;`,
        [item.quantity, item.product_id]
      );

      if (stockUpdate.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.product_name}"`
        });
      }
    }

    // 5. Calculate total amount using fresh database prices
    let totalAmountNum = 0;
    for (const item of items) {
      totalAmountNum += parseFloat(item.current_price) * item.quantity;
    }
    const totalAmount = totalAmountNum.toFixed(2);

    // 6. Insert new order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount)
       VALUES ($1, 'pending', $2)
       RETURNING id, user_id, status, total_amount, created_at, updated_at;`,
      [userId, totalAmount]
    );

    const order = orderResult.rows[0];

    // 7. Insert order items snapshotting unit price
    const orderItems = [];
    for (const item of items) {
      const oiResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         RETURNING id, order_id, product_id, quantity, unit_price, created_at;`,
        [order.id, item.product_id, item.quantity, item.current_price]
      );

      const createdItem = oiResult.rows[0];
      orderItems.push({
        id: createdItem.id,
        order_id: createdItem.order_id,
        product_id: createdItem.product_id,
        product_name: item.product_name,
        quantity: createdItem.quantity,
        unit_price: createdItem.unit_price,
        item_total: (createdItem.quantity * parseFloat(createdItem.unit_price)).toFixed(2),
        created_at: createdItem.created_at
      });
    }

    // 8. Clear user's cart items and update cart timestamp
    await client.query('DELETE FROM cart_items WHERE cart_id = $1;', [cartId]);
    await client.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [cartId]);

    // 9. Commit the transaction
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        total_amount: order.total_amount,
        items: orderItems,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Error during transaction rollback:', rollbackErr.message);
    }
    return next(error);
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders
 * Retrieve all orders for the authenticated user with summary stats.
 */
async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        o.id,
        o.user_id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        COUNT(oi.id)::int AS total_items,
        COALESCE(SUM(oi.quantity), 0)::int AS total_quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC;`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/orders/:id
 * Retrieve single order details with order items and product info.
 * Enforces strict user isolation: order must belong to req.user.id.
 */
async function getOrderById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const orderId = parseInt(id, 10);

    // Retrieve order only if it belongs to authenticated user
    const orderResult = await db.query(
      `SELECT id, user_id, status, total_amount, created_at, updated_at
       FROM orders
       WHERE id = $1 AND user_id = $2;`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Retrieve order items with product details
    const itemsResult = await db.query(
      `SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        ROUND((oi.quantity * oi.unit_price), 2) AS item_total,
        oi.created_at,
        p.name AS product_name,
        p.image_url AS product_image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC;`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        total_amount: order.total_amount,
        items: itemsResult.rows,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
