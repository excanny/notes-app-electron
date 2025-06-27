const { Tray, Menu } = require('electron');
const paths = require('../config/paths');

function setupTray(mainWindow) {
    const tray = new Tray(paths.trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        { label: 'Hide App', click: () => mainWindow.hide() },
        { label: 'Quit', click: () => require('electron').app.quit() },
    ]);

    tray.setToolTip('My Notes App');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

module.exports = { setupTray };
