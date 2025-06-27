const { Notification } = require('electron');

function showSaveSuccessNotification() {
    new Notification({
        title: 'Save Successful',
        body: 'Your changes have been saved successfully.',
    }).show();
}

module.exports = { showSaveSuccessNotification };
