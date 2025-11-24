'use client';

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
          <button onClick={handleRegister} className='px-4 ml-2 border-1 border-black'>Register to DNS</button>
        </div>
      ) : (
        <div style={{background: '#', padding: 10, marginBottom: 20}}>
          Logged in as: <strong>{myDomain}</strong>
        </div>
      )}

      <div  className='border-black border p-2 mb-5'>
        <h3>2. Connect to Peer</h3>
        <input className='border border-black' placeholder="friend.local" value={targetDomain} onChange={e=>setTargetDomain(e.target.value)} />
        <button onClick={connectToPeer} disabled={!registered} className='px-4 ml-2 border-1 border-black'>Connect P2P</button>
        <p>Status: <strong>{status}</strong></p>
      </div>

      <div style={{ border: '1px solid #000', height: 300, overflowY: 'scroll', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === 'Me' ? 'right' : 'left', margin: '5px 0' }}>
            <span style={{ 
              background: m.sender === 'Me' ? '#0070f1' : '#eee',
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
        <button disabled={!connectedPeer} className='px-4 ml-2 border-1 border-black'>Send</button>
      </form>
    </div>
  );
}