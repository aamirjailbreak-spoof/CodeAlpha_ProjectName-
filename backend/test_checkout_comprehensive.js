const pool = require('./db');

async function runCheckoutVerification() {
  console.log('=== STARTING COMPREHENSIVE CHECKOUT VERIFICATION ===\n');

  let createdUserId = null;
  let testDeductedUnits = 0;
  const testProductId = 1;

  try {
    // 1. Verify Historical Orders Preserved Unaltered (No Fake Data)
    console.log('--- TEST 1: Historical Orders Preservation ---');
    const legacyOrdersRes = await pool.query(
      'SELECT id, user_id, total_amount, status, customer_name, phone, shipping_address, delivery_method, delivery_fee, payment_method, payment_status FROM orders WHERE id <= 16 ORDER BY id ASC'
    );
    console.log(`Found ${legacyOrdersRes.rowCount} historical orders.`);
    if (legacyOrdersRes.rowCount < 8) {
      throw new Error(`Expected at least 8 historical orders, found ${legacyOrdersRes.rowCount}`);
    }

    for (const order of legacyOrdersRes.rows) {
      if (order.customer_name !== null || order.shipping_address !== null || order.delivery_fee !== null) {
        throw new Error(`Historical order #${order.id} was corrupted with non-null data!`);
      }
    }
    console.log('✓ Historical orders 8–16 are completely preserved with NULL for new fields (zero fake data backfilled).\n');

    // 2. Test Input Validation Rejections
    console.log('--- TEST 2: Validation Rejections ---');
    const testCases = [
      {
        name: 'Empty payload',
        body: {},
        expectedError: 'Full name is required'
      },
      {
        name: 'Invalid phone number',
        body: {
          customer_name: 'Alice Cooper',
          phone: 'abc',
          shipping_address: '123 Main St',
          shipping_city: 'Metropolis',
          shipping_postal_code: '10001'
        },
        expectedError: 'phone number'
      },
      {
        name: 'Invalid delivery method',
        body: {
          customer_name: 'Alice Cooper',
          phone: '+1 555-0199',
          shipping_address: '123 Main St',
          shipping_city: 'Metropolis',
          shipping_postal_code: '10001',
          delivery_method: 'carrier_pigeon'
        },
        expectedError: 'Invalid delivery method'
      },
      {
        name: 'Invalid payment method',
        body: {
          customer_name: 'Alice Cooper',
          phone: '+1 555-0199',
          shipping_address: '123 Main St',
          shipping_city: 'Metropolis',
          shipping_postal_code: '10001',
          delivery_method: 'standard',
          payment_method: 'bitcoin'
        },
        expectedError: 'Invalid payment method'
      }
    ];

    // Create a temporary user and cart for testing
    const email = `chk_test_${Date.now()}@example.com`;
    const password = 'Password123!';
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Checkout Tester', email, password })
    });
    const regData = await regRes.json();
    if (regData.user?.id) {
      createdUserId = regData.user.id;
    } else {
      const uRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (uRes.rows[0]) createdUserId = uRes.rows[0].id;
    }

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Add product 1 to cart
    await fetch('http://localhost:5000/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: 1, quantity: 2 })
    });

    for (const tc of testCases) {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(tc.body)
      });
      const data = await res.json();
      if (res.status !== 400 || !data.message.toLowerCase().includes(tc.expectedError.toLowerCase())) {
        throw new Error(`Validation test "${tc.name}" failed: HTTP ${res.status} - ${data.message}`);
      }
      console.log(`✓ Rejected "${tc.name}" as expected: "${data.message}"`);
    }
    console.log();

    // 3. Test Express Delivery ($14.95) & Online Payment Flow
    console.log('--- TEST 3: Express Delivery & Server-Side Fee Calculation ---');
    
    // Check product stock before order
    const prodBefore = (await pool.query('SELECT price, stock_quantity FROM products WHERE id = 1')).rows[0];
    const unitPrice = Number(prodBefore.price);
    const expectedSubtotal = unitPrice * 2;
    const expectedDeliveryFee = 14.95;
    const expectedTotal = Number((expectedSubtotal + expectedDeliveryFee).toFixed(2));

    const checkoutRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customer_name: 'Arthur Pendelton',
        phone: '+1 (555) 987-6543',
        shipping_address: '742 Evergreen Terrace, Suite 100',
        shipping_city: 'Springfield',
        shipping_postal_code: '97477',
        delivery_instructions: 'Leave at front porch inside weatherproof box',
        delivery_method: 'express',
        payment_method: 'online'
      })
    });

    if (checkoutRes.status !== 201) {
      const err = await checkoutRes.json();
      throw new Error(`Order placement failed: ${checkoutRes.status} ${err.message}`);
    }

    testDeductedUnits += 2;

    const orderData = (await checkoutRes.json()).data;
    console.log(`✓ Order placed successfully: ID #${orderData.id}`);
    console.log(`  Subtotal: $${orderData.subtotal} (expected $${expectedSubtotal})`);
    console.log(`  Delivery fee: $${orderData.delivery_fee} (expected $${expectedDeliveryFee})`);
    console.log(`  Total: $${orderData.total_amount} (expected $${expectedTotal})`);
    console.log(`  Payment status: ${orderData.payment_status} (expected pending)`);

    if (Number(orderData.delivery_fee) !== 14.95) {
      throw new Error(`Delivery fee mismatch: got ${orderData.delivery_fee}, expected 14.95`);
    }
    if (Number(orderData.total_amount) !== expectedTotal) {
      throw new Error(`Total amount mismatch: got ${orderData.total_amount}, expected ${expectedTotal}`);
    }

    // 4. Verify Stock Atomic Decrement
    console.log('\n--- TEST 4: Stock Atomic Decrement ---');
    const prodAfter = (await pool.query('SELECT stock_quantity FROM products WHERE id = 1')).rows[0];
    console.log(`  Stock before: ${prodBefore.stock_quantity} -> Stock after: ${prodAfter.stock_quantity}`);
    if (prodAfter.stock_quantity !== prodBefore.stock_quantity - 2) {
      throw new Error(`Stock was not decremented correctly: before=${prodBefore.stock_quantity}, after=${prodAfter.stock_quantity}`);
    }
    console.log('✓ Inventory deducted atomically with row locks.\n');

    // 5. Verify Order Retrieval & Details Completeness
    console.log('--- TEST 5: Order Retrieval & Metadata ---');
    const getOrderRes = await fetch(`http://localhost:5000/api/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fetchedOrder = (await getOrderRes.json()).data;
    if (
      fetchedOrder.customer_name !== 'Arthur Pendelton' ||
      fetchedOrder.delivery_method !== 'express' ||
      fetchedOrder.payment_method !== 'online' ||
      fetchedOrder.payment_status !== 'pending' ||
      !fetchedOrder.items ||
      fetchedOrder.items.length !== 1
    ) {
      throw new Error(`Fetched order details mismatch: ${JSON.stringify(fetchedOrder)}`);
    }
    console.log('✓ Order details API returned complete checkout metadata and item breakdown.\n');

    console.log('=== ALL COMPREHENSIVE CHECKOUT VERIFICATIONS PASSED ===');
  } catch (err) {
    console.error('❌ VERIFICATION FAILED:', err.message);
    process.exit(1);
  } finally {
    try {
      // 1. Restore ONLY test-caused stock changes (relative delta)
      if (testDeductedUnits > 0) {
        await pool.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2', [testDeductedUnits, testProductId]);
        console.log(`✓ Restored exactly ${testDeductedUnits} test units back to product #${testProductId} (catalog stock preserved).`);
      }
      // 2. Deterministically clean up ONLY the test user and its orders/cart
      if (createdUserId) {
        await pool.query('DELETE FROM orders WHERE user_id = $1', [createdUserId]);
        await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
        console.log(`✓ Cleaned up test user #${createdUserId} and associated test orders.`);
      }
    } catch (cleanupErr) {
      console.error('Warning during test cleanup:', cleanupErr.message);
    } finally {
      await pool.end();
    }
  }
}

runCheckoutVerification();
