'use client';
// import TypeBox from './Components/TypeBox';
// import { useState } from 'react';

// export default function Home() {
//   const [messages, setMessages] = useState([]);

//   const handleSendMessage = (message) => {
//     if (message.trim()) {
//       const newMessage = {
//         id: Date.now(),
//         text: message,
//         timestamp: new Date().toLocaleTimeString('id-ID', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         })
//       };
//       setMessages(prev => [...prev, newMessage]);
//     }
//   };

//   return (
    
//     <div className="flex flex-col h-screen">
//       {/* Area Chat */}
      
//       <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
//         {messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-600">
//             <p>Coba aja Chat</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {messages.map((msg) => (
//               <div 
//                 key={msg.id} 
//                 className="bg-white rounded-lg px-4 py-3 shadow-md max-w-2xl"
//               >
//                 <p className="text-black text-base">{msg.text}</p>
//                 <span className="text-xs text-gray-500 mt-1 block">
//                   {msg.timestamp}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* TypeBox di bagian bawah */}
//       <TypeBox onSendMessage={handleSendMessage} />
//     </div>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [myDomain, setMyDomain] = useState('');
  const [registered, setRegistered] = useState(false);
  
  const [targetDomain, setTargetDomain] = useState('');
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [status, setStatus] = useState('Offline');

  useEffect(() => {
    const myServer = io(); 
    
    myServer.on('incoming-message', (data) => {
      setMessages(prev => {
         const lastMsg = prev[prev.length - 1];
         if (lastMsg && lastMsg.sender === 'Me' && lastMsg.text === data.text) {
             return prev;
         }
         return [...prev, { sender: 'Them', text: data.text }];
      });
    });

    return () => myServer.disconnect();
  }, []);

  const handleRegister = async () => {
    await fetch(`/api/register?domain=${myDomain}`);
    setRegistered(true);
    setStatus(`Registered as ${myDomain}`);
  };

  const connectToPeer = async () => {
    setStatus(`Looking up ${targetDomain}...`);
    
    const res = await fetch(`/api/resolve?domain=${targetDomain}`);
    const data = await res.json();

    if (data.status === 'FOUND') {
      setStatus(`Found IP: ${data.ip}. Connecting...`);
      
      const socketToFriend = io(`http://${data.ip}:3000`);
      
      socketToFriend.on('connect', () => {
        setStatus(`Connected to ${targetDomain} (${data.ip})`);
        setConnectedPeer(socketToFriend);
      });

      socketToFriend.on('connect_error', () => {
        setStatus('Connection Failed (Firewall?)');
      });
    } else {
      setStatus('Domain not found in DNS');
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (connectedPeer && inputMsg) {
      const payload = { text: inputMsg, from: myDomain };
      
      connectedPeer.emit('p2p-message', payload);
      setMessages(prev => [...prev, { sender: 'Me', text: inputMsg }]);
      setInputMsg('');
    }
  };

  return (
    <div className="p-5 max-w-[500px] m-auto text-black">
      <h1>P2P LAN Chat + DNS</h1>
      
      {!registered ? (
        <div className='border-black border p-2 mb-5'>
          <h3>1. Register Domain</h3>
          <input className='border border-black' placeholder="myname.local" value={myDomain} onChange={e=>setMyDomain(e.target.value)} />
          <button onClick={handleRegister}>Register to DNS</button>
        </div>
      ) : (
        <div style={{background: '#', padding: 10, marginBottom: 20}}>
          Logged in as: <strong>{myDomain}</strong>
        </div>
      )}

      <div  className='border-black border p-2 mb-5'>
        <h3>2. Connect to Peer</h3>
        <input className='border border-black' placeholder="friend.local" value={targetDomain} onChange={e=>setTargetDomain(e.target.value)} />
        <button onClick={connectToPeer} disabled={!registered}>Connect P2P</button>
        <p>Status: <strong>{status}</strong></p>
      </div>

      <div style={{ border: '1px solid #000', height: 300, overflowY: 'scroll', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === 'Me' ? 'right' : 'left', margin: '5px 0' }}>
            <span style={{ 
              background: m.sender === 'Me' ? '#0070f3' : '#eee', 
              color: m.sender === 'Me' ? 'white' : 'black',
              padding: '5px 10px', borderRadius: 10 
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{marginTop: 10, display: 'flex'}}>
        <input className='border border-black' style={{flex:1}} value={inputMsg} onChange={e=>setInputMsg(e.target.value)} placeholder="Type message..." disabled={!connectedPeer} />
        <button disabled={!connectedPeer}>Send</button>
      </form>
    </div>
  );
}