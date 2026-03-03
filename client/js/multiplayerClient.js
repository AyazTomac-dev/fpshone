// Minimal WebSocket client implementing simple authoritative messages and client prediction hooks.
// Attempts to connect to ws://localhost:8080 by default.

export class MultiplayerClient {
  constructor(){
    this.url = 'ws://localhost:8080';
    this.socket = null;
    this.onConnect = ()=>{};
  }

  connect(){
    try{
      this.socket = new WebSocket(this.url);
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = () => { this.onConnect(); console.log('ws open'); };
      this.socket.onmessage = (ev) => { /* handle world updates */ };
      this.socket.onclose = ()=> console.log('ws close');
      this.socket.onerror = (e)=> console.error('ws err',e);
    }catch(e){ console.warn('ws not available', e); }
  }

  sendInput(data){
    if(this.socket && this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({type:'input',data}));
  }
}