import { db } from './infrastructure/database/db';

export async function cleanupLocalDuplicates() {
  console.log('[Cleanup] Checking for local duplicates...');

  try {
    // ─── CATEGORIES ──────────────────────────────────────────────────────────
    const categories = await db.categories.toArray();
    const catToKeep = new Map<string, string>(); // name → id to keep
    const catToDelete = new Set<string>();        // ids to delete

    for (const c of categories) {
      if (!catToKeep.has(c.name)) {
        catToKeep.set(c.name, c.id);
      } else {
        catToDelete.add(c.id);
      }
    }

    // ─── PRODUCTS ────────────────────────────────────────────────────────────
    const products = await db.products.toArray();
    const prodToKeep = new Set<string>();
    const prodToDelete = new Set<string>();
    const prodsToUpdate: typeof products = [];

    // Build a map: catId → catName (using ALL categories, including ones we'll delete)
    const idToCatName = new Map<string, string>();
    for (const c of categories) {
      idToCatName.set(c.id, c.name);
    }

    for (const p of products) {
      const catName = idToCatName.get(p.category_id) ?? p.category_id;
      const uniqueKey = `${catName}::${p.name}`;

      if (!prodToKeep.has(uniqueKey)) {
        prodToKeep.add(uniqueKey);

        // Re-point product to the kept category if it currently points to a duplicate
        const keptCatId = catToKeep.get(catName);
        if (p.category_id !== keptCatId && keptCatId) {
          prodsToUpdate.push({ ...p, category_id: keptCatId });
        }
      } else {
        prodToDelete.add(p.id);
      }
    }

    const hasDuplicates = catToDelete.size > 0 || prodToDelete.size > 0;
    if (!hasDuplicates) {
      console.log('[Cleanup] No duplicates found.');
      return;
    }

    // ─── STEP 1: Remove any pending INSERT ops for duplicates from sync queue ─
    // (prevents them from being re-created on Supabase)
    const syncQueue = await db.sync_queue.toArray();
    const staleQueueIds: string[] = [];

    for (const item of syncQueue) {
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = JSON.parse(item.payload);
      } catch (e) {}
      
      const id = parsedPayload.id as string | undefined;
      if (!id) continue;

      if (item.action === 'insert') {
        if (item.table_name === 'categories' && catToDelete.has(id)) {
          staleQueueIds.push(item.id!);
        }
        if (item.table_name === 'products' && prodToDelete.has(id)) {
          staleQueueIds.push(item.id!);
        }
      }
    }

    if (staleQueueIds.length > 0) {
      // @ts-ignore
      await db.sync_queue.bulkDelete(staleQueueIds);
      console.log(`[Cleanup] Removed ${staleQueueIds.length} stale INSERT ops from sync queue.`);
    }

    // ─── STEP 2: Delete duplicates from local Dexie ───────────────────────────
    if (catToDelete.size > 0) {
      await db.categories.bulkDelete(Array.from(catToDelete));
      console.log(`[Cleanup] Deleted ${catToDelete.size} duplicate categories locally.`);
    }

    if (prodToDelete.size > 0) {
      await db.products.bulkDelete(Array.from(prodToDelete));
      console.log(`[Cleanup] Deleted ${prodToDelete.size} duplicate products locally.`);
    }

    if (prodsToUpdate.length > 0) {
      await db.products.bulkPut(prodsToUpdate);
      console.log(`[Cleanup] Re-pointed ${prodsToUpdate.length} products to kept category.`);
    }

    // ─── STEP 3: Enqueue DELETE ops so Supabase is also cleaned ──────────────
    const remoteDeleteOps = [
      ...Array.from(catToDelete).map(id => ({
        id: crypto.randomUUID(),
        action: 'delete' as const,
        table_name: 'categories',
        payload: JSON.stringify({ id }),
        created_at: new Date().toISOString(),
        status: 'pending' as const,
        retry_count: 0,
      })),
      ...Array.from(prodToDelete).map(id => ({
        id: crypto.randomUUID(),
        action: 'delete' as const,
        table_name: 'products',
        payload: JSON.stringify({ id }),
        created_at: new Date().toISOString(),
        status: 'pending' as const,
        retry_count: 0,
      })),
    ];

    if (remoteDeleteOps.length > 0) {
      await db.sync_queue.bulkAdd(remoteDeleteOps);
      console.log(`[Cleanup] Queued ${remoteDeleteOps.length} remote DELETE ops for Supabase.`);
    }

    console.log('[Cleanup] Done.');
  } catch (error) {
    console.error('[Cleanup] Failed:', error);
  }
}
