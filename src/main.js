const electron = require('electron');
const { ipcMain } = require('electron');

import Configstore from 'configstore';
import secrets from '../secrets.json';
import SyncService from './SyncService';
// const secrets = require('../secrets.json');

const conf = new Configstore('keendoo-events');

const path = require('path');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

import ElectronGoogleAuth from './oauth/ElectronGoogleAuth';

const oauth = new ElectronGoogleAuth(Object.assign({}, secrets.oauth, {
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
}));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

/*
 * Gets the auth token, via either:
 *   An existing token from the conf
 *   A new token from a new oauth browser window
 */
const getToken = async () => {
  const token = conf.get('auth');
  if (token) {
    return token;
  }

  const result = await oauth.auth(BrowserWindow);
  conf.set('auth', result);
  return result;
};


/*
 * Start syncing
 */
const start = async () => {
  try {
    const token = await getToken();
    oauth.client.setCredentials(token);

    const sync = new SyncService();

    sync.on('update', (events) => {
      if (mainWindow) {
        mainWindow.webContents.send('events.synced', events);
      }
    });

    sync.setAuth(oauth);
    await sync.start();
  } catch (e) {
    console.error(e, e.stack);
  }
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 1281,
    height: 800,
    minWidth: 1281,
    minHeight: 800,
    backgroundColor: '#312450',
    show: false,
    icon: path.join(__dirname, 'client/assets/icons/png/64x64.png')
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/client/index.html`);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
  }

  // Show the mainwindow when it is loaded and ready to show
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();
    await start();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  /*
   * Notify app when shown
   */
  mainWindow.on('after-show', () => {
    if (mainWindow) {
      mainWindow.webContents.send('app.after-show');
    }
  });

  /*
   * When menubar is ready, start syncing
   */
  mainWindow.on('show', async () => {

  });
}

/*
 * Listen for 'auth.get' requests and fetch token.
 * Emit an 'auth.change' event.
 */
ipcMain.on('auth.get', async (event) => {
  try {
    const token = await getToken();
    event.sender.send('auth.change', null, token);
  } catch (e) {
    event.sender.send('auth.change', e.stack, null);
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
