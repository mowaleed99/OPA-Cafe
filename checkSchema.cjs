const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const { app } = require('electron');

app.whenReady().then(() => {
    const dbPath = path.join(app.getPath('appData'), 'OPA Cafe', 'database', 'cafe.sqlite');
    const db = new Database(dbPath);
    const tableInfo = db.pragma('table_info(sync_queue)');
    console.log('SCHEMA_OUTPUT', JSON.stringify(tableInfo, null, 2));
    app.quit();
});
