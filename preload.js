// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Menyuntikkan 'electronAPI' ke dalam objek 'window' di UI
contextBridge.exposeInMainWorld('electronAPI', {
  
  // Fungsi 1: Untuk menjalankan skrip Python
  // Ini akan mengirim sinyal 'run-python-script' ke main.js
  runPython: (command) => ipcRenderer.invoke('run-python-script', command),
  
  // Fungsi 2: Untuk membuka/menutup Dev Tools
  // Ini akan mengirim sinyal 'devtools:toggle' ke main.js
  toggleDevTools: () => ipcRenderer.invoke('devtools:toggle')
});