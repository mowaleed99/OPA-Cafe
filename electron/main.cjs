const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';
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
    mainWindow.webContents.openDevTools();
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
  createWindow();
  createTray();

  // IPC Handlers
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

  ipcMain.handle('file:saveAutoBackup', async (event, filename, data) => {
    try {
      const documentsPath = app.getPath('documents');
      const backupDir = path.join(documentsPath, 'OPA_Cafe_Backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const filePath = path.join(backupDir, filename);
      fs.writeFileSync(filePath, data);
      return { success: true, filePath };
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

