
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

let dnsRecords = {};

server.on('error', (err) => {
  console.log(`DNS Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  const request = JSON.parse(msg.toString());
  const { type, domain } = request;
  
  console.log(`[DNS] Terima ${type} dari ${rinfo.address}:${rinfo.port}`);

  let response = {};

  if (type === 'REGISTER') {
    dnsRecords[domain] = { ip: rinfo.address, timestamp: Date.now() };
    console.log(`[REGISTER] Domain: ${domain} -> IP: ${rinfo.address}`);
    response = { status: 'OK', message: `Domain ${domain} registered` };
  } 
  
  else if (type === 'QUERY') {
    const record = dnsRecords[domain];
    if (record) {
      console.log(`[QUERY] Found: ${domain} -> ${record.ip}`);
      response = { status: 'FOUND', ip: record.ip };
    } else {
      console.log(`[QUERY] Not Found: ${domain}`);
      response = { status: 'NOT_FOUND' };
    }
  }

  const responseBuffer = Buffer.from(JSON.stringify(response));
  server.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
    if (err) console.error(err);
  });
});

server.on('listening', () => {
  const address = server.address();
  console.log(`DNS Server (UDP) jalan di ${address.address}:${address.port}`);
});

server.bind(6000);