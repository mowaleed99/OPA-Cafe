const fs = require('fs');
const path = require('path');
const { app } = require('electron');

app.whenReady().then(async () => {
  try {
    const { initDb, closeDb } = require('../electron/database/db.cjs');

    console.log('[1] Simulating Fresh Installation');
    const appDataPath = app.getPath('appData');
    const dbDir = path.join(appDataPath, 'OPA Cafe', 'database');
    const dbPath = path.join(dbDir, 'cafe.sqlite');
    
    // Clear existing
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
    if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');

    // Run initDb
    const db = initDb();
    console.log(' - Fresh DB initialized and migrated successfully.');

    console.log('[2] Backup & Restore Validation');
    // Insert test data
    const schema = require('../electron/database/schema.cjs');
    db.insert(schema.categories).values({
      id: 'cat-test',
      cafe_id: 'cafe-1',
      name: 'Test Category',
      created_at: new Date().toISOString()
    }).run();
    console.log(' - Test data inserted.');

    const backupPath = path.join(dbDir, 'backup-test.sqlite');
    const rawDb = require('../electron/database/db.cjs').getRawDb();
    await rawDb.backup(backupPath);
    console.log(' - Backup exported successfully.');

    // Close and remove db
    closeDb();
    fs.unlinkSync(dbPath);
    console.log(' - Local database removed.');

    // Restore backup
    fs.copyFileSync(backupPath, dbPath);
    console.log(' - Backup restored.');

    // Re-init and verify
    const restoredDb = require('../electron/database/db.cjs').initDb();
    const cats = restoredDb.select().from(schema.categories).all();
    if (cats.length > 0 && cats[0].name === 'Test Category') {
      console.log(' - Restored data verified successfully.');
    } else {
      throw new Error('Data verification failed after restore.');
    }

    console.log('ALL CHECKS PASSED');
    process.exit(0);
  } catch (err) {
    console.error('VALIDATION FAILED:', err);
    process.exit(1);
  }
});
