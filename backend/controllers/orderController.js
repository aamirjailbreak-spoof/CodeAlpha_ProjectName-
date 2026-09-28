const db = require('../db');

const DELIVERY_FEES = {
  standard: 4.95,
  express: 14.95
};

const ALLOWED_DELIVERY_METHODS = ['standard', 'express'];
const ALLOWED_PAYMENT_METHODS = ['cash_on_delivery', 'online'];

/**
 * POST /api/orders
 * Create an order from the authenticated user's current cart.
 * Uses a PostgreSQL transaction with row-level locking (FOR UPDATE OF p)
 * and atomic stock deduction to prevent overselling and race conditions.
 * Validates customer contact, delivery address, delivery method, and payment method.
 * Independently calculates delivery fee and grand total server-side.
 */
async function createOrder(req, res, next) {
  const userId = req.user.id;

  // 1. Validate customer checkout details
  const {
    customer_name,
    phone,
    shipping_address,
    shipping_city,
    shipping_postal_code,
    delivery_instructions,
    delivery_method = 'standard',
    payment_method = 'cash_on_delivery'
  } = req.body || {};

  const trimmedName = typeof customer_name === 'string' ? customer_name.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
  const trimmedAddress = typeof shipping_address === 'string' ? shipping_address.trim() : '';
  const trimmedCity = typeof shipping_city === 'string' ? shipping_city.trim() : '';
  const trimmedPostalCode = typeof shipping_postal_code === 'string' ? shipping_postal_code.trim() : '';
  const trimmedInstructions =
    typeof delivery_instructions === 'string' && delivery_instructions.trim().length > 0
      ? delivery_instructions.trim()
      : null;

  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required (between 2 and 150 characters)'
    });
  }

  const phoneRegex = /^[\d\s+\-().]{7,30}$/;
  if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Valid contact phone number is required (at least 7 digits)'
    });
  }

  if (!trimmedAddress || trimmedAddress.length < 5 || trimmedAddress.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Delivery street address is required (between 5 and 255 characters)'
    });
  }

  if (!trimmedCity || trimmedCity.length < 2 || trimmedCity.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Delivery city is required (between 2 and 100 characters)'
    });
  }

  if (!trimmedPostalCode || trimmedPostalCode.length < 3 || trimmedPostalCode.length > 20) {
    return res.status(400).json({
      success: false,
      message: 'Postal code is required (between 3 and 20 characters)'
    });
  }

  if (!ALLOWED_DELIVERY_METHODS.includes(delivery_method)) {
    return res.status(400).json({
      success: false,
      message: `Invalid delivery method. Allowed options: ${ALLOWED_DELIVERY_METHODS.join(', ')}`
    });
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment method. Allowed options: ${ALLOWED_PAYMENT_METHODS.join(', ')}`
    });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 2. Retrieve the user's active cart
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

    // 3. Fetch cart items joined with products.
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

    // 4. Validate stock availability for all items
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.product_name}". Requested: ${item.quantity}, available: ${item.stock_quantity}`
        });
      }
    }

    // 5. Atomically deduct stock for each product
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

    // 6. Calculate trusted server-side financial values
    let subtotalNum = 0;
    for (const item of items) {
      subtotalNum += parseFloat(item.current_price) * item.quantity;
    }
    const subtotal = subtotalNum.toFixed(2);

    const deliveryFeeNum = DELIVERY_FEES[delivery_method];
    const deliveryFee = deliveryFeeNum.toFixed(2);

    const grandTotalNum = subtotalNum + deliveryFeeNum;
    const totalAmount = grandTotalNum.toFixed(2);

    // 7. Insert new order with all checkout metadata
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, status, total_amount,
        customer_name, phone,
        shipping_address, shipping_city, shipping_postal_code,
        delivery_instructions, delivery_method, delivery_fee,
        payment_method, payment_status
      )
      VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING 
        id, user_id, status, total_amount,
        customer_name, phone,
        shipping_address, shipping_city, shipping_postal_code,
        delivery_instructions, delivery_method, delivery_fee,
        payment_method, payment_status,
        created_at, updated_at;`,
      [
        userId,
        totalAmount,
        trimmedName,
        trimmedPhone,
        trimmedAddress,
        trimmedCity,
        trimmedPostalCode,
        trimmedInstructions,
        delivery_method,
        deliveryFee,
        payment_method
      ]
    );

    const order = orderResult.rows[0];

    // 8. Insert order items snapshotting unit price
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

    // 9. Clear user's cart items and update cart timestamp
    await client.query('DELETE FROM cart_items WHERE cart_id = $1;', [cartId]);
    await client.query('UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [cartId]);

    // 10. Commit the transaction
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        subtotal,
        delivery_fee: order.delivery_fee,
        total_amount: order.total_amount,
        delivery_method: order.delivery_method,
        customer_name: order.customer_name,
        phone: order.phone,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_postal_code: order.shipping_postal_code,
        delivery_instructions: order.delivery_instructions,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
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
        o.customer_name,
        o.phone,
        o.shipping_address,
        o.shipping_city,
        o.shipping_postal_code,
        o.delivery_instructions,
        o.delivery_method,
        o.delivery_fee,
        o.payment_method,
        o.payment_status,
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
      `SELECT 
        id, user_id, status, total_amount,
        customer_name, phone,
        shipping_address, shipping_city, shipping_postal_code,
        delivery_instructions, delivery_method, delivery_fee,
        payment_method, payment_status,
        created_at, updated_at
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

    const items = itemsResult.rows;
    let subtotalNum = 0;
    for (const item of items) {
      subtotalNum += parseFloat(item.unit_price) * item.quantity;
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        subtotal: subtotalNum.toFixed(2),
        delivery_fee: order.delivery_fee,
        total_amount: order.total_amount,
        delivery_method: order.delivery_method,
        customer_name: order.customer_name,
        phone: order.phone,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_postal_code: order.shipping_postal_code,
        delivery_instructions: order.delivery_instructions,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        items,
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
  getOrderById,
  DELIVERY_FEES
};
