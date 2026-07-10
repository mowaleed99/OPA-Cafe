import fs from 'fs';

async function main() {
  const url = 'https://rxkomglqrwqjqehlqqlj.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a29tZ2xxcndxanFlaGxxcWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjgxOTMsImV4cCI6MjA5ODk0NDE5M30.qfWfIPYy3NaANa06sEZMzSC0L-Qh6j-dD2EvHJKtTmU';
  
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  // Get all categories
  const catRes = await fetch(`${url}/rest/v1/categories?select=*`, { headers });
  const categories = await catRes.json();
  
  const catMap = new Map();
  const catToDelete = [];
  const catToKeep = new Map(); // name -> id

  for (const c of categories) {
    if (!catToKeep.has(c.name)) {
      catToKeep.set(c.name, c.id);
    } else {
      catToDelete.push(c.id);
    }
  }

  console.log(`Found ${catToDelete.length} duplicate categories.`);

  // Get all products
  const prodRes = await fetch(`${url}/rest/v1/products?select=*`, { headers });
  const products = await prodRes.json();
  
  const prodMap = new Map(); // category_name -> Set of product names
  const prodToDelete = [];
  
  // We need to group products by name AND their category name.
  // Wait, products might be linked to duplicate categories. 
  // Let's create a map from catId -> catName
  const idToCatName = new Map();
  for (const c of categories) {
    idToCatName.set(c.id, c.name);
  }

  // Group products by (catName + productName)
  const keptProducts = new Set();
  
  for (const p of products) {
    const catName = idToCatName.get(p.category_id);
    const uniqueKey = `${catName}::${p.name}`;
    
    if (!keptProducts.has(uniqueKey)) {
      keptProducts.add(uniqueKey);
      
      // We must ensure the kept product points to the kept category ID
      const keptCatId = catToKeep.get(catName);
      if (p.category_id !== keptCatId) {
        // Update product to point to correct category
        await fetch(`${url}/rest/v1/products?id=eq.${p.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ category_id: keptCatId })
        });
      }
    } else {
      prodToDelete.push(p.id);
    }
  }
  
  console.log(`Found ${prodToDelete.length} duplicate products.`);
  
  // Delete duplicate products
  if (prodToDelete.length > 0) {
    const ids = prodToDelete.join(',');
    await fetch(`${url}/rest/v1/products?id=in.(${ids})`, {
      method: 'DELETE',
      headers
    });
    console.log('Deleted duplicate products');
  }

  // Delete duplicate categories
  if (catToDelete.length > 0) {
    const ids = catToDelete.join(',');
    await fetch(`${url}/rest/v1/categories?id=in.(${ids})`, {
      method: 'DELETE',
      headers
    });
    console.log('Deleted duplicate categories');
  }
}

main().catch(console.error);
