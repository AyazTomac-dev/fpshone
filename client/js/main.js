// Entry point: initialize renderer, scene, input, UI, networking, and start loop.

// Imports
import { Renderer } from './renderer.js';
import { GameScene } from './scene.js';
import { Controls } from './controls.js';
import { UI } from './ui.js';
import { MultiplayerClient } from './multiplayerClient.js';
import { Optimization } from './optimization.js';

// Create renderer bound to canvas
const canvas = document.getElementById('glcanvas');
const renderer = new Renderer(canvas);

// Create scene (procedural)
const scene = new GameScene(renderer);

// Controls & UI
const controls = new Controls(renderer.camera, renderer.dom);
const ui = new UI();

// Multiplayer
const net = new MultiplayerClient();
net.onConnect(() => {
  console.log('connected to server');
});

// Hook input events
controls.onFire = () => scene.player.tryFire();
controls.onAim = (isAiming) => scene.player.setAiming(isAiming);
controls.onReload = () => scene.player.reload();
controls.onMove = (vec) => scene.player.setMove(vec);
controls.onLook = (dx,dy) => scene.player.rotateView(dx,dy);

// Start optimization monitor
Optimization.init(renderer);

// Start main loop
let last = performance.now();
function tick(t){
  const dt = Math.min(0.05,(t-last)/1000);
  last = t;
  scene.update(dt, t/1000);
  renderer.render(scene);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Resize handling
window.addEventListener('resize',()=>renderer.resize());
renderer.resize();

// Debug: connect networking after load
net.connect();
window.game = { renderer, scene, controls, ui, net };