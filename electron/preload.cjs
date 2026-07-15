const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
  saveBackup: (filePath, data) => ipcRenderer.invoke('file:saveBackup', filePath, data),
  createBackup: (filename) => ipcRenderer.invoke('backup:create', filename),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  restoreBackup: (filename) => ipcRenderer.invoke('backup:restore', filename),
  db: {
    findMany: (table, where) => ipcRenderer.invoke('db:findMany', { table, where }),
    findOne: (table, id) => ipcRenderer.invoke('db:findOne', { table, id }),
    insert: (table, data) => ipcRenderer.invoke('db:insert', { table, data }),
    insertMany: (table, data) => ipcRenderer.invoke('db:insertMany', { table, data }),
    update: (table, id, data) => ipcRenderer.invoke('db:update', { table, id, data }),
    delete: (table, id) => ipcRenderer.invoke('db:delete', { table, id }),
    transaction: (operations) => ipcRenderer.invoke('db:transaction', operations)
  },
  triggerSync: () => ipcRenderer.invoke('sync:trigger'),
  setSyncSession: (session) => ipcRenderer.invoke('sync:setSession', session),
  getSyncStatus: () => ipcRenderer.invoke('sync:getStatus'),
  onSyncStatus: (callback) => {
    const handler = (event, status) => callback(status);
    ipcRenderer.on('sync:status', handler);
    return () => ipcRenderer.removeListener('sync:status', handler);
  },
  getPrinters: () => ipcRenderer.invoke('printer:getPrinters'),
  printHtml: (html, options) => ipcRenderer.invoke('printer:printHtml', html, options),
  exportPdf: (html, options) => ipcRenderer.invoke('printer:exportPdf', html, options)
});
