// main.js

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV !== 'production';

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenu(null);

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'out', 'index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('run-python-script', async (event, command) => {
    const args = [command]; 

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['test_client.py', ...args]);
      
      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(error.trim());
        }
      });
    });
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    console.log('Shortcut DevTools (Ctrl+Shift+I) sengaja dinonaktifkan.');
  });

  ipcMain.handle('devtools:toggle', () => {
    if (win && win.webContents) {
      win.webContents.toggleDevTools();
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});