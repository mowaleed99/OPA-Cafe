require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { app } = require('electron');
const { getDb, initDb } = require('./electron/database/db.cjs');
const schema = require('./electron/database/schema.cjs');
const SyncRegistry = require('./electron/sync/SyncRegistry.cjs');

app.whenReady().then(async () => {
  await initDb();
  const db = getDb();
  for (const [tableName, table] of Object.entries(SyncRegistry.LOCAL_SYNC_TABLES)) {
    try {
      await db.select().from(table).limit(1).execute();
    } catch (e) {
      console.log('FAILED ON TABLE', tableName, e.message);
    }
  }
  
  const { resetSyncState, processSyncQueue } = require('./electron/syncWorker.cjs');
  try {
    await resetSyncState();
    await processSyncQueue();
    console.log('TEST_SUCCESS');
  } catch(e) {
    console.log('TEST_FAILED_SYNC', e);
  }
  app.quit();
});
