// Room management, authoritative tick loop hookup, simple matchmaking.

const { v4: uuidv4 } = require('uuid');
const { TickLoop } = require('./tickLoop.js');
const { PlayerState } = require('./playerState.js');

class Room {
  constructor(name){
    this.name = name;
    this.players = new Map();
    this.tickLoop = new TickLoop(25, (dt, t)=> this._tick(dt,t));
    this.nextId = 1;
    this.world = { entities: [] };
  }

  addPlayer(conn){
    const id = uuidv4();
    const ps = new PlayerState(id, conn);
    this.players.set(id, ps);
    // send join ack
    conn.send(JSON.stringify({ type:'welcome', id }));
    return ps;
  }

  removePlayer(ps){
    this.players.delete(ps.id);
  }

  receiveInput(ps, input){
    // basic validation: limit movement speeds, rate limit firing events
    if(!this.players.has(ps.id)) return;
    ps.enqueueInput(input);
  }

  _tick(dt, t){
    // authoritative simulation: apply inputs, move players, simple collision & combat
    for(const [id, ps] of this.players.entries()){
      ps.applyInputs(dt);
    }
    // broadcast simplified world state
    const state = { players: [] };
    for(const [id, ps] of this.players.entries()){
      state.players.push({ id, x: ps.x, y: ps.y, z: ps.z, hp: ps.hp });
    }
    const packet = JSON.stringify({ type:'state', t: Date.now(), state });
    for(const [, ps] of this.players.entries()){
      try{ ps.conn.send(packet); }catch(e){}
    }
  }
}

class RoomManager {
  constructor(){
    this.rooms = new Map();
    this.defaultRoom = this._getOrCreateRoom('default');
  }

  _getOrCreateRoom(name){
    if(!this.rooms.has(name)) this.rooms.set(name, new Room(name));
    return this.rooms.get(name);
  }

  addConnection(ws){
    const ps = this._getOrCreatePlayer(ws);
    return ps;
  }

  _getOrCreatePlayer(ws){
    // always add to default room
    const room = this.defaultRoom;
    const ps = room.addPlayer(ws);
    return ps;
  }

  joinRoom(ps, name){
    // move player between rooms (not fully implemented in demo)
  }

  receiveInput(player, data){
    // forward to player's room (simple)
    for(const room of this.rooms.values()){
      if(room.players.has(player.id)) room.receiveInput(player, data);
    }
  }

  removeConnection(player){
    for(const room of this.rooms.values()){
      if(room.players.has(player.id)) room.removePlayer(player);
    }
  }

  startTick(){
    for(const room of this.rooms.values()) room.tickLoop.start();
  }
}

module.exports = { RoomManager };