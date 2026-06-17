const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

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

  // Load from local backend
  mainWindow.loadURL('http://localhost:3001');
  mainWindow.on('closed', () => { mainWindow = null; });
}

function startBackend() {
  const serverPath = path.join(__dirname, 'backend', 'server.cjs');
  backendProcess = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
    stdio: 'pipe',
  });
  backendProcess.stdout.on('data', d => console.log('[Backend]', d.toString().trim()));
  backendProcess.stderr.on('data', d => console.error('[Backend]', d.toString().trim()));
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});
