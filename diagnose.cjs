const { app } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('appData'), 'OPA Cafe', 'database', 'cafe.sqlite');
  console.log('DB Path:', dbPath);
  const db = new Database(dbPath);
  console.log('Orders:', db.prepare('SELECT id, created_at, status FROM orders ORDER BY created_at DESC LIMIT 5').all());
  console.log('Closings:', db.prepare('SELECT id, closing_date, created_at FROM daily_closings ORDER BY created_at DESC LIMIT 5').all());
  app.quit();
});
