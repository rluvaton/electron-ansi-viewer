import {app, BrowserWindow, ipcMain} from "electron";

import * as path from "node:path";
import {setupMainMenu} from "./menu";

// Setup
import './file-handling';
import {OpenedFileState} from "./ansi-file/open-file-state";
import {getWindowFromEvent} from "./helper";
import {ParsedFileState} from "./ansi-file/parsed-ansi-file";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}



let mainWindow: BrowserWindow;

const createWindow = () => {
    setupMainMenu();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
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

ipcMain.on('get-window-id', (event) => {
    event.returnValue = event.sender.id;
})

ipcMain.on('window-initialized', (event) => {
    const window = getWindowFromEvent(event);
    process.nextTick(() => {
        OpenedFileState.abortParsing(window);
        ParsedFileState.removeStateForWindow(window);
    });
    event.returnValue = undefined;
})
