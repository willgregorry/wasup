
'use client';

import { useState } from 'react';

export default function Home() {
  const [commandInput, setCommandInput] = useState('REGISTER:rafi:9090');
  const [response, setResponse] = useState('Belum ada balasan...');

  const handleRunPython = async () => {
    setResponse('Menjalankan skrip Python...');
    
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.runPython(commandInput);
        setResponse(result); 
      } catch (error) {
        setResponse(`Error: ${error}`);
      }
    } else {
      setResponse('Error: Fungsi Electron tidak ditemukan. Pastikan berjalan di Electron.');
    }
  };

  const handleToggleDevTools = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleDevTools();
    }
  };

  return (
    <main style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>Aplikasi Electron + Next.js</h1>
      <p>Kirim perintah ke skrip Python-mu:</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          style={{ width: '300px', padding: '5px' }}
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
        />
        <button onClick={handleRunPython}>
          Kirim Perintah
        </button>
      </div>

      <h3>Balasan dari Python:</h3>
      <pre style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px' }}>
        {response}
      </pre>

      <hr style={{ margin: '20px 0' }} />

      <button onClick={handleToggleDevTools}>
        Toggle Dev Tools (Inspect Element)
      </button>
    </main>
  );
}