// Basic authoritative player state: position, velocity, hp, input queue and simple applyInputs logic.

class PlayerState {
  constructor(id, conn){
    this.id = id;
    this.conn = conn;
    this.x=0; this.y=0; this.z=0;
    this.vx=0; this.vy=0; this.vz=0;
    this.hp = 100;
    this.inputQueue = [];
    this._lastInputTime = Date.now();
  }

  enqueueInput(data){
    // minimal sanitization
    if(Date.now() - this._lastInputTime < 10) return; // rudimentary rate limit
    this.inputQueue.push(data);
    this._lastInputTime = Date.now();
    // cap queue
    if(this.inputQueue.length > 50) this.inputQueue.shift();
  }

  applyInputs(dt){
    // consume inputs and update position
    while(this.inputQueue.length){
      const inpt = this.inputQueue.shift();
      if(inpt.move){
        const f = inpt.move.forward || 0, r = inpt.move.right || 0;
        const speed = 3.5;
        this.vx = (Math.sin(inpt.yaw)*f + Math.cos(inpt.yaw)*r) * speed;
        this.vz = (Math.cos(inpt.yaw)*f - Math.sin(inpt.yaw)*r) * speed;
      }
      if(inpt.fire){
        // server side validation: check rate limits, apply damage to watched targets (omitted)
      }
    }
    this.x += this.vx * dt;
    this.z += this.vz * dt;
  }
}

module.exports = { PlayerState };