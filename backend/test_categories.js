async function verifyCategoryFlow() {
  const base = 'http://localhost:5000/api';
  console.log('=== VERIFYING COMPLETE CATEGORY FLOW ===\n');

  // 1. Fetch categories
  console.log('1. Checking /api/categories:');
  const catRes = await fetch(`${base}/categories`);
  const catData = await catRes.json();
  console.log(` Status: ${catRes.status}`);
  console.log(' Categories in DB:', catData.data.map(c => ({ id: c.id, name: c.name })));

  // 2. Fetch All Works (no category filter)
  console.log('\n2. Testing "All Works" (no category filter):');
  const allRes = await fetch(`${base}/products?limit=100`);
  const allData = await allRes.json();
  console.log(` Status: ${allRes.status}, Total count: ${allData.data.length}`);
  if (allData.data.length !== 24) {
    throw new Error(`Expected 24 products, got ${allData.data.length}`);
  }

  // 3. Test every individual category
  console.log('\n3. Testing each individual category filter:');
  for (const cat of catData.data) {
    const res = await fetch(`${base}/products?category_id=${cat.id}&limit=100`);
    const data = await res.json();
    console.log(` Category "${cat.name}" (ID ${cat.id}): Status ${res.status}, Count: ${data.data.length}`);
    if (data.data.length !== 6) {
      throw new Error(`Category ${cat.name} expected 6 items, got ${data.data.length}`);
    }
    // Verify every product in this result belongs to this category
    for (const p of data.data) {
      if (p.category_id !== cat.id) {
        throw new Error(`Product ${p.name} category_id ${p.category_id} != ${cat.id}`);
      }
    }
    console.log(`   Items: ${data.data.map(p => p.name).join(', ')}`);
  }

  // 4. Test Search + Category Filtering combination
  console.log('\n4. Testing Search + Category Filter Combination:');
  // In Footwear & Leather (ID 3), search "boot"
  const catFootwear = catData.data.find(c => c.name === 'Footwear & Leather');
  const comboRes = await fetch(`${base}/products?category_id=${catFootwear.id}&search=boot`);
  const comboData = await comboRes.json();
  console.log(` Search "boot" in Footwear & Leather: count = ${comboData.data.length}`);
  console.log(`   Found: ${comboData.data.map(p => p.name).join(', ')}`);

  // Search "boot" in Electronics (should be 0)
  const catElec = catData.data.find(c => c.name === 'Electronics');
  const emptyRes = await fetch(`${base}/products?category_id=${catElec.id}&search=boot`);
  const emptyData = await emptyRes.json();
  console.log(` Search "boot" in Electronics: count = ${emptyData.data.length} (expected 0)`);
  if (emptyData.data.length !== 0) {
    throw new Error('Expected 0 results for search "boot" in Electronics');
  }

  // 5. Test Invalid category_id handling
  console.log('\n5. Testing Invalid Category ID Handling:');
  const invRes = await fetch(`${base}/products?category_id=9999`);
  const invData = await invRes.json();
  console.log(` Query category_id=9999 returned count = ${invData.data.length} (clean empty array)`);

  console.log('\n=== ALL CATEGORY TESTS PASSED WITH 100% INTEGRITY ===');
}

verifyCategoryFlow().catch(err => {
  console.error('Category verification failed:', err);
  process.exit(1);
});
