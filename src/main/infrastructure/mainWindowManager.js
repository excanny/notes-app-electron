const { BrowserWindow, Menu } = require('electron');
const path = require('path');
const paths = require('../config/paths');

async function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        frame: false, 
        resizable: false, 
        show: false, 
        center: true, 
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            preload: paths.preloadScript
            
        },
    });

    try {
        await mainWindow.loadFile(paths.indexHtml);
    } catch (error) {
        console.error('Failed to load HTML file:', error);
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus(); 
    });


    //mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    return mainWindow;
}

module.exports = { createMainWindow };