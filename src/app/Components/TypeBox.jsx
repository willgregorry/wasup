import React, { useState } from 'react';

const TypeBox = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className='w-full px-4 py-2 fixed bottom-0 left-0 bg-opacity-90' 
         style={{ backgroundColor: '' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan..."
          className='InputBox bg-black text-white px-4 py-2 rounded-md flex-1'
        />
        <button 
          onClick={handleSend} 
          className='bg-black hover:bg-blue-600 text-white px-6 py-2 rounded-md cursor-pointer transition-colors'
        >
          Kirim
        </button>
      </div>
    </div>
  );
}

export default TypeBox;