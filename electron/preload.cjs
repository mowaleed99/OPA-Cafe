const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
  saveBackup: (filePath, data) => ipcRenderer.invoke('file:saveBackup', filePath, data),
  saveAutoBackup: (filename, data) => ipcRenderer.invoke('file:saveAutoBackup', filename, data)
});
