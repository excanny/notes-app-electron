const path = require('path');

module.exports = {
    indexHtml: path.join(__dirname, '..', '..', 'renderer', 'pages', 'index.html'),
    preloadScript: path.join(__dirname, '..', '..', 'preload', 'preload.js'),
    trayIcon: path.join(__dirname, '..', '..', 'renderer', 'assets', 'icons', 'n_logo.jfif'),
};