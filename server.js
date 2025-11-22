
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const dgram = require('dgram');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const DNS_SERVER_IP = '127.0.0.1';
const DNS_SERVER_PORT = 6000;
const MY_PORT = 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Ada peer lain terhubung ke saya:', socket.id);
    socket.on('p2p-message', (data) => {
      io.emit('incoming-message', data);
    });
  });

  server.get('/api/resolve', (req, res) => {
    const targetDomain = req.query.domain;
    const client = dgram.createSocket('udp4');

    const message = Buffer.from(JSON.stringify({ type: 'QUERY', domain: targetDomain }));

    client.send(message, DNS_SERVER_PORT, DNS_SERVER_IP, (err) => {
      if (err) {
        client.close();
        return res.status(500).json({ error: 'Gagal kirim ke DNS' });
      }
    });

    client.on('message', (msg) => {
      const response = JSON.parse(msg.toString());
      client.close();
      res.json(response);
    });
    
    setTimeout(() => {
        try { client.close(); } catch(e){}
    }, 2000);
  });

  server.get('/api/register', (req, res) => {
    const myDomain = req.query.domain;
    const client = dgram.createSocket('udp4');
    const message = Buffer.from(JSON.stringify({ type: 'REGISTER', domain: myDomain }));
    
    client.send(message, DNS_SERVER_PORT, DNS_SERVER_IP, (err) => {
        client.close();
        if(err) return res.status(500).json({error: "Failed"});
        res.json({status: "Request Sent"});
    });
  });

  server.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(MY_PORT, '0.0.0.0', () => {
    console.log(`> Peer Node siap di Port ${MY_PORT}`);
  });
});