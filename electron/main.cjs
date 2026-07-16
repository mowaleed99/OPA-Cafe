const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// `npm run dev:electron` does not set NODE_ENV for the Electron process.
// Electron's own packaging flag reliably distinguishes the Vite development
// server from the installed application.
const isDev = !app.isPackaged;
let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    if (process.env.OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent exiting when closed if we want it to run in tray for auto-backup
  mainWindow.on('close', function (event) {
      if(!app.isQuiting){
          event.preventDefault();
          mainWindow.hide();
      }
      return false;
  });
}

function createTray() {
  // Use a default icon or a simple circle for the tray if no icon is available
  // In a real app, you'd use a .ico or .png file here
  // For now, we'll try to find an icon in public/ or just create a minimal tray
  try {
    const iconPath = path.join(__dirname, '../public/favicon.ico');
    if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);
    } else {
      // Fallback if icon missing (won't crash, but might not show an icon)
      // On windows, Tray requires an icon. We will use a native image if needed,
      // but let's assume favicon.ico exists or will be created.
      const { nativeImage } = require('electron');
      const emptyImage = nativeImage.createEmpty();
      tray = new Tray(emptyImage);
    }
  } catch (e) {
    console.error('Tray icon error:', e);
  }

  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('OPA Cafe POS Backup');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  // Initialize SQLite database
  const { initDb } = require('./database/db.cjs');
  initDb();

  const { setupHandlers } = require('./database/handlers.cjs');
  setupHandlers();

  // Start background sync worker
  const { startSyncWorker, processSyncQueue, getSyncStatus, setSyncSession } = require('./syncWorker.cjs');
  startSyncWorker();

  createWindow();
  createTray();

  // Auto-backup logic
  async function runAutoBackup() {
    try {
      const documentsPath = app.getPath('documents');
      const backupDir = path.join(documentsPath, 'OPA Cafe', 'Backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.sqlite'))
        .map(f => {
          const stats = fs.statSync(path.join(backupDir, f));
          return { name: f, time: stats.mtime.getTime() };
        })
        .sort((a, b) => b.time - a.time);

      const now = Date.now();
      const needsBackup = files.length === 0 || (now - files[0].time > 24 * 60 * 60 * 1000);

      if (needsBackup) {
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `opa-cafe-auto-${dateStr}.sqlite`;
        const filePath = path.join(backupDir, filename);
        
        const { getRawDb } = require('./database/db.cjs');
        const rawDb = getRawDb();
        await rawDb.backup(filePath);
        console.log(`[AutoBackup] Created backup ${filename}`);
        
        // Add new backup to the list
        files.unshift({ name: filename, time: now });
      }

      // Keep only last 30 files
      if (files.length > 30) {
        const toDelete = files.slice(30);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(backupDir, file.name));
          console.log(`[AutoBackup] Deleted old backup ${file.name}`);
        }
      }
    } catch (err) {
      console.error('[AutoBackup] Error:', err);
    }
  }

  // Run auto-backup on startup
  runAutoBackup();
  // Check every hour
  setInterval(runAutoBackup, 60 * 60 * 1000);

  // IPC Handlers
  ipcMain.handle('sync:trigger', async () => {
    try {
      await processSyncQueue();
      return { success: true };
    } catch (err) {
      console.error('Trigger sync error:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('sync:setSession', async (event, session) => {
    await setSyncSession(session);
    if (session?.accessToken) await processSyncQueue();
    return { success: true };
  });

  ipcMain.handle('sync:getStatus', () => {
    return getSyncStatus();
  });

  // Printer Handlers
  ipcMain.handle('printer:getPrinters', async () => {
    try {
      if (!mainWindow) return [];
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers.map(p => ({
        name: p.name,
        displayName: p.displayName || p.name,
        description: p.description,
        isDefault: p.isDefault
      }));
    } catch (e) {
      console.error('Failed to get printers', e);
      return [];
    }
  });

  ipcMain.handle('printer:printHtml', async (event, html, options) => {
    return new Promise((resolve, reject) => {
      let printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({
          silent: true,
          deviceName: options.deviceName || undefined,
          copies: options.copies || 1,
          margins: { marginType: 'none' },
        }, (success, failureReason) => {
          if (!success) {
            reject(new Error(failureReason));
          } else {
            resolve({ success: true });
          }
          printWindow.close();
        });
      });
    });
  });

  ipcMain.handle('printer:exportPdf', async (event, html, options) => {
    return new Promise((resolve, reject) => {
      let printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      printWindow.webContents.on('did-finish-load', async () => {
        try {
          const pdfData = await printWindow.webContents.printToPDF({
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: options.landscape || false
          });

          const documentsPath = app.getPath('documents');
          const exportDir = path.join(documentsPath, 'OPA Cafe', 'Exports');
          if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
          }

          const filename = options.filename || `Export_${Date.now()}.pdf`;
          const filePath = path.join(exportDir, filename);

          fs.writeFileSync(filePath, pdfData);
          printWindow.close();
          shell.openPath(filePath);
          resolve({ success: true, filePath });
        } catch (error) {
          printWindow.close();
          reject(error);
        }
      });
    });
  });

  ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });

  ipcMain.handle('file:saveBackup', async (event, filePath, data) => {
    try {
      fs.writeFileSync(filePath, data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('backup:create', async (event, filename) => {
    try {
      const documentsPath = app.getPath('documents');
      const backupDir = path.join(documentsPath, 'OPA Cafe', 'Backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const filePath = path.join(backupDir, filename);
      const { getRawDb } = require('./database/db.cjs');
      const rawDb = getRawDb();
      
      await rawDb.backup(filePath);
      return { success: true, filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('backup:list', async () => {
    try {
      const backupDir = path.join(app.getPath('documents'), 'OPA Cafe', 'Backups');
      if (!fs.existsSync(backupDir)) return [];
      
      return fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.sqlite'))
        .map(f => {
          const stats = fs.statSync(path.join(backupDir, f));
          return { name: f, size: stats.size, modified: stats.mtime.toISOString() };
        })
        .sort((a, b) => b.modified.localeCompare(a.modified));
    } catch (err) {
      console.error('List backups error:', err);
      return [];
    }
  });

  ipcMain.handle('backup:restore', async (event, filename) => {
    try {
      const backupDir = path.join(app.getPath('documents'), 'OPA Cafe', 'Backups');
      const backupPath = path.join(backupDir, filename);
      
      if (!fs.existsSync(backupPath)) throw new Error('Backup file not found');
      
      // Perform integrity check on the backup file before restoring
      const Database = require('better-sqlite3');
      const testDb = new Database(backupPath, { readonly: true });
      const integrity = testDb.pragma('integrity_check', { simple: true });
      testDb.close();
      
      if (integrity !== 'ok') {
        throw new Error('Backup integrity check failed: ' + integrity);
      }
      
      const { getDbPath, closeDb } = require('./database/db.cjs');
      const currentDbPath = getDbPath();
      
      // Close db and clean up WAL
      closeDb();
      if (fs.existsSync(currentDbPath + '-wal')) fs.unlinkSync(currentDbPath + '-wal');
      if (fs.existsSync(currentDbPath + '-shm')) fs.unlinkSync(currentDbPath + '-shm');
      
      fs.copyFileSync(backupPath, currentDbPath);
      
      // Relaunch app to initialize fresh database
      app.relaunch();
      app.exit(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
