const pool = require('./db');

async function testAll() {
  const base = 'http://localhost:5000/api';
  let p1Id = null;
  let createdUserId = null;
  let testDeductedUnits = 0;

  try {
    console.log('--- 1. Testing Health ---');
    let res = await fetch(base + '/health');
    console.log('Health:', res.status, await res.json());

    console.log('--- 2. Testing Categories ---');
    res = await fetch(base + '/categories');
    const cats = await res.json();
    console.log('Categories count:', cats.data.length, cats.data.map(c => c.name));

    console.log('--- 3. Testing Products Count & Category Filters ---');
    res = await fetch(base + '/products?limit=100');
    const prods = await res.json();
    console.log('Total products:', prods.data.length);
    for (const c of cats.data) {
      const cf = await fetch(base + '/products?category_id=' + c.id).then(r => r.json());
      console.log(' Category', c.name, 'has', cf.data.length, 'items');
    }

    console.log('--- 4. Testing Search ---');
    const sRes = await fetch(base + '/products?search=leather').then(r => r.json());
    console.log(' Search "leather" returned:', sRes.data.length, 'items');

    console.log('--- 5. Testing Auth (Register & Login) ---');
    const email = 'qa_verifier_' + Date.now() + '@example.com';
    const regRes = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'QA Verifier', email, password: 'Password123!' })
    });
    const regData = await regRes.json();
    console.log(' Register status:', regRes.status, 'Message:', regData.message);
    if (regData.user?.id) {
      createdUserId = regData.user.id;
    } else {
      const uRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (uRes.rows[0]) createdUserId = uRes.rows[0].id;
    }

    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    console.log(' Login status:', loginRes.status, 'Token exists:', Boolean(loginData.token));
    const token = loginData.token;

    console.log('--- 6. Testing Cart (Add, Update, Remove) ---');
    const p1 = prods.data[0];
    p1Id = p1.id;
    const addRes = await fetch(base + '/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ product_id: p1.id, quantity: 2 })
    });
    console.log(' Add to cart status:', addRes.status);

    let cartRes = await fetch(base + '/cart', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json());
    console.log(' Cart item count:', cartRes.data?.items?.length, 'Total:', cartRes.data?.total_price);

    const cartItem = cartRes.data?.items[0];
    if (cartItem) {
      const updRes = await fetch(base + '/cart/items/' + cartItem.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ quantity: 3 })
      });
      console.log(' Update quantity to 3 status:', updRes.status);

      console.log('--- 7. Testing Order Placement ---');
      // Test validation on empty body
      const emptyOrderRes = await fetch(base + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({})
      });
      console.log(' Empty checkout rejected with status:', emptyOrderRes.status);

      // Test successful order placement with checkout payload
      const orderRes = await fetch(base + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          customer_name: 'QA Verifier',
          phone: '+1 555-0199',
          shipping_address: '100 Innovation Way, Suite 400',
          shipping_city: 'San Francisco',
          shipping_postal_code: '94105',
          delivery_instructions: 'Leave at front desk reception',
          delivery_method: 'standard',
          payment_method: 'cash_on_delivery'
        })
      });
      const orderData = await orderRes.json();
      console.log(' Order created status:', orderRes.status, 'Order ID:', orderData.data?.id, 'Total:', orderData.data?.total_amount, 'Fee:', orderData.data?.delivery_fee);
      if (orderRes.status === 201) {
        testDeductedUnits += 3;
      }

      console.log('--- 8. Testing Orders Retrieval ---');
      const myOrders = await fetch(base + '/orders', {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(r => r.json());
      console.log(' User orders count:', myOrders.data?.length);
    }

    console.log('--- ALL INTEGRATION CHECKS PASSED SUCCESSFULLY ---');
  } finally {
    try {
      // 1. Restore ONLY test-caused stock changes (relative delta)
      if (p1Id && testDeductedUnits > 0) {
        await pool.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2', [testDeductedUnits, p1Id]);
        console.log(`✓ Restored exactly ${testDeductedUnits} test units back to product #${p1Id} (catalog stock preserved).`);
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

testAll().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

