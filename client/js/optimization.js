// Lightweight FPS monitor & dynamic quality selection
export const Optimization = {
  init(renderer){
    this.renderer = renderer;
    this.fps = 60; this.samples = [];
    this.last = performance.now();
    this._tick();
  },
  _tick(){
    const now = performance.now();
    const dt = now - this.last;
    this.last = now;
    this.samples.push(1000/dt);
    if(this.samples.length > 30) this.samples.shift();
    this.fps = this.samples.reduce((s,v)=>s+v,0)/this.samples.length;
    // dynamic resolution scale
    if(this.fps < 45){ document.body.classList.add('lowperf'); }
    else document.body.classList.remove('lowperf');
    setTimeout(()=>this._tick(),500);
  }
};