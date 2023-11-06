const {app, BrowserWindow} = require('electron');
const path = require('node:path');
const {dialog, ipcMain} = require('electron')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// TODO - listen for scroll events/search and send them to the renderer

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


ipcMain.handle('select-file', async () => {
    // TODO - remove this
    const defaultPath = '/Users/rluvaton/dev/personal/ansi-viewer/examples'

    try {
        const result = await dialog.showOpenDialog({properties: ['openFile'], defaultPath: defaultPath});
        if(result.canceled) {
            console.log('canceled');
            return undefined;
        }
        return result.filePaths[0];
    } catch (err) {
        console.error('Failed to get file', err);
        return undefined
    }
});