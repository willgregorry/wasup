'use client';
import TypeBox from './Components/TypeBox';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        timestamp: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  return (
    
    <div className="flex flex-col h-screen">
      {/* Area Chat */}
      
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Coba aja Chat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className="bg-white rounded-lg px-4 py-3 shadow-md max-w-2xl"
              >
                <p className="text-black text-base">{msg.text}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TypeBox di bagian bawah */}
      <TypeBox onSendMessage={handleSendMessage} />
    </div>
  );
}