const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Directly start Express server in the same process
const server = require('./backend/server.cjs');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: '养生馆经营跟进系统',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('http://localhost:3001');
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Wait a bit for the server to start
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  app.quit();
});
