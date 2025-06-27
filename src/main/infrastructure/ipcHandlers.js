const { ipcMain } = require('electron');
const { showSaveSuccessNotification } = require('../core/notificationService');

function setupIpcHandlers(app, mainWindow) {
    ipcMain.on('close-app', () => {
        app.quit();
    });

    ipcMain.on('save-success', () => {
        showSaveSuccessNotification();
    });
}

module.exports = { setupIpcHandlers };
