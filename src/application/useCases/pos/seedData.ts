import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { supabase } from '../../../infrastructure/api/supabase';
import type { Category } from '../../../core/entities/category';
import type { Product } from '../../../core/entities/product';

const seedData = {
  'Hot Drinks': [
    'شاي', 'ينسون', 'نعناع', 'كركديه', 'شاي اخضر', 'شاي حليب', 
    'قهوه تركي', 'قهوه بندق', 'قهوه فرنساوي', 'نسكافيه', 'كابتشينو', 
    'كوفي ميكس', 'هوت سيدر', 'سحلب', 'سحلب(فواكه -اوريو)', 'هوت كارميل', 'هوت شوكليت'
  ],
  'Soft Drinks': [
    'بيبسي', 'سفن اب', 'ميرندا', 'فيروز', 'بريل', 'ريدبل', 'تويست'
  ],
  'Fresh Drinks': [
    'ليمون نعناع', 'برتقال', 'جوافه', 'مانجا', 'فراوله', 'بلح', 'فلوريدا كوكتيل', 'زبادي ميكس'
  ],
  'Milk Shake': [
    'فانيليا', 'شوكلت', 'فراوله', 'اوريو', 'بلوبيري', 'اناناس'
  ],
  'Snacks': [
    'شيبسي', 'بسكوت', 'اندومي'
  ]
};

/**
 * Seeds the provided categories and products into Dexie and enqueues them for Supabase sync.
 * We set a default price of 20 EGP and cost of 10 EGP for now.
 */
export async function seedCategoriesAndProducts(cafeId: string): Promise<void> {
  const now = new Date().toISOString();
  
  // 1. Check local DB
  const localCategories = await db.categories
    .where('cafe_id')
    .equals(cafeId)
    .toArray();
    
  let existingNames = localCategories.map(c => c.name);

  // 2. Check Supabase to prevent duplicates if local DB was just cleared
  if (navigator.onLine) {
    const { data: remoteCategories } = await supabase
      .from('categories')
      .select('name')
      .eq('cafe_id', cafeId);
      
    if (remoteCategories) {
      existingNames = [...existingNames, ...remoteCategories.map(c => c.name)];
    }
  }

  const existingCategoryNames = new Set(existingNames);
  
  for (const [catName, productNames] of Object.entries(seedData)) {
    if (existingCategoryNames.has(catName)) {
      continue; // Skip if already exists locally or remotely
    }
    
    const catId = crypto.randomUUID();
    const category: Category = {
      id: catId,
      cafe_id: cafeId,
      name: catName,
      created_at: now
    };
    
    // Add to Dexie and sync queue
    await db.categories.add(category);
    await enqueueSync('insert', 'categories', category as unknown as Record<string, unknown>);
    
    // Create products for this category
    const products: Product[] = productNames.map(pName => ({
      id: crypto.randomUUID(),
      cafe_id: cafeId,
      category_id: catId,
      name: pName,
      price: 20, // Default temporary price
      cost: 10,  // Default temporary cost
      status: 'active',
      track_stock: false,
      created_at: now
    }));
    
    await db.products.bulkAdd(products);
    for (const product of products) {
      await enqueueSync('insert', 'products', product as unknown as Record<string, unknown>);
    }
  }
}
