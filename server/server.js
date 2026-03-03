// Simple authoritative Node.js server using ws. Implements rooms, tick loop, basic validation,
// rewinding support placeholder and authoritative hit processing.

const WebSocket = require('ws');
const { RoomManager } = require('./roomManager.js');

const wss = new WebSocket.Server({ port: 8080 });
const rooms = new RoomManager();

wss.on('connection', (ws) => {
  const player = rooms.addConnection(ws);
  console.log('player connected', player.id);
  ws.on('message', (msg) => {
    try{
      const packet = JSON.parse(msg.toString());
      if(packet.type === 'join') rooms.joinRoom(player, packet.room || 'default');
      if(packet.type === 'input') rooms.receiveInput(player, packet.data);
    }catch(e){ console.warn('bad packet', e); }
  });
  ws.on('close', ()=> rooms.removeConnection(player));
});

rooms.startTick();
console.log('Server running on :8080');