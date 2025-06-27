const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  notifySaveSuccess: () => ipcRenderer.send('save-success'),
  closeApp: () => ipcRenderer.send('close-app')
});
