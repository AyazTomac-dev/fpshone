// Minimal HUD handlers
export class UI {
  constructor(){
    document.getElementById('loading').classList.add('hidden');
    this._bind();
  }
  _bind(){
    document.getElementById('resume').addEventListener('click', ()=>document.getElementById('settings-panel').classList.add('hidden'));
    document.getElementById('quality').addEventListener('change', ()=>{ /* send to renderer */});
    document.getElementById('fov').addEventListener('input',(e)=>{ document.querySelector('canvas').dispatchEvent(new CustomEvent('setfov',{detail:e.target.value})); });
  }
}