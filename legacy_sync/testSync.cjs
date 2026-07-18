require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { app } = require('electron');
const { initDb } = require('./electron/database/db.cjs');
const { resetSyncState, processSyncQueue } = require('./electron/syncWorker.cjs');

app.whenReady().then(async () => {
  try {
    await initDb();
    await resetSyncState();
    await processSyncQueue();
    console.log('TEST_SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('TEST_FAILED', e);
    process.exit(1);
  }
});
