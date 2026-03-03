// Simple tick loop utility used by rooms: invokes update at specified tickRate (Hz).

class TickLoop {
  constructor(tickRate, fn){
    this.tickRate = tickRate;
    this.fn = fn;
    this._running = false;
  }
  start(){
    if(this._running) return;
    this._running = true;
    let last = Date.now();
    const step = 1000/this.tickRate;
    const loop = () => {
      if(!this._running) return;
      const now = Date.now();
      const dt = (now-last)/1000;
      last = now;
      this.fn(dt, now/1000);
      setTimeout(loop, step);
    };
    loop();
  }
  stop(){ this._running=false; }
}

module.exports = { TickLoop };