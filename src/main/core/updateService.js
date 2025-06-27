function simulateUpdateCheck(mainWindow) {
    const currentVersion = '1.0.0';
    const latestVersion = '1.1.0';

    setTimeout(() => {
        if (currentVersion !== latestVersion && mainWindow) {
            mainWindow.webContents.send('update-available', { latestVersion });
        }
    }, 2000);
}

module.exports = { simulateUpdateCheck };
