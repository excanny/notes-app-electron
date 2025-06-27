const { app } = require('electron');
const { createMainWindow } = require('./infrastructure/mainWindowManager');
const { setupTray } = require('./infrastructure/trayManager');
const { setupIpcHandlers } = require('./infrastructure/ipcHandlers');
const { simulateUpdateCheck } = require('./core/updateService');

let mainWindow;

app.whenReady().then(async () => {
    mainWindow = await createMainWindow();
    setupTray(mainWindow);
    setupIpcHandlers(app, mainWindow);
    simulateUpdateCheck(mainWindow);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    if (mainWindow === null) {
        mainWindow = await createMainWindow();
    }
});