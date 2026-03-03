// Touch & desktop controls: joystick for movement, swipe to look, buttons to fire/aim/reload.
// Exposes callbacks used by main.

export class Controls {
  constructor(camera, dom){
    this.camera = camera;
    this.dom = dom;
    this.onMove = ()=>{};
    this.onLook = ()=>{};
    this.onFire = ()=>{};
    this.onAim = ()=>{};
    this.onReload = ()=>{};
    this._bind();
  }

  _bind(){
    // Desktop
    this.keys = {};
    window.addEventListener('keydown', e=>{ this.keys[e.key.toLowerCase()] = true; this._updateFromKeys(); });
    window.addEventListener('keyup', e=>{ this.keys[e.key.toLowerCase()] = false; this._updateFromKeys(); });
    // Mouse look
    let isPointerDown=false, lastX=0,lastY=0;
    window.addEventListener('pointerdown', e=>{ if(e.button===0){ isPointerDown=true; lastX=e.clientX; lastY=e.clientY; }});
    window.addEventListener('pointermove', e=>{ if(isPointerDown){ const dx = e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY; this.onLook(dx,dy); }});
    window.addEventListener('pointerup', e=>{ isPointerDown=false; });
    // Buttons
    document.getElementById('btn-fire').addEventListener('click', ()=>this.onFire());
    document.getElementById('btn-aim').addEventListener('pointerdown', ()=>this.onAim(true));
    document.getElementById('btn-aim').addEventListener('pointerup', ()=>this.onAim(false));
    document.getElementById('btn-reload').addEventListener('click', ()=>this.onReload());
    // joystick simple
    const joy = document.getElementById('joystick-bg');
    let active=false, cx=0,cy=0;
    joy.addEventListener('pointerdown', e=>{ active=true; cx=e.clientX; cy=e.clientY; });
    window.addEventListener('pointermove', e=>{ if(active){ const dx=(e.clientX-cx)/50; const dy=(e.clientY-cy)/50; this.onMove([dx,-dy]); document.getElementById('joystick-thumb').style.transform=`translate(${dx*22}px,${dy*22}px)`; }});
    window.addEventListener('pointerup', e=>{ if(active){ active=false; this.onMove([0,0]); document.getElementById('joystick-thumb').style.transform='translate(0,0)'; }});
    // keyboard movement loop
    setInterval(()=>this._updateFromKeys(),50);
  }

  _updateFromKeys(){
    const forward = (this.keys['w']?1:0) - (this.keys['s']?1:0);
    const right = (this.keys['d']?1:0) - (this.keys['a']?1:0);
    this.onMove([right,forward]);
    if(this.keys[' ']) this.onReload();
    if(this.keys['r']) this.onReload();
  }
}