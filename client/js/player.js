// Player class: holds position, orientation, weapons, input reactions, simple physics, shooting.
// Performs client-side prediction and sends inputs to server via MultiplayerClient when connected.

import { mat4 } from './shaders.js';

export class Player {
  constructor(scene){
    this.scene = scene;
    this.position = [0, 0.8, 0];
    this.velocity = [0,0,0];
    this.viewYaw = 0;
    this.viewPitch = -0.2;
    this.moveInput = [0,0];
    this.speed = 4.0;
    this.isAiming = false;
    this.weapon = null;
    this.hp = 100;
    this.ammo = 30;
    this.ammoCap = 30;
    this.recoil = 0;
    this.lastShot = 0;
  }

  equip(mesh){
    this.weapon = mesh;
    // attach to player and add to scene drawlist
    this.scene.addMesh(this.weapon);
    // place in front of camera
    mat4.identity(this.weapon.modelMatrix);
  }

  setMove(vec){
    this.moveInput[0] = vec[0]; this.moveInput[1] = vec[1];
  }
  rotateView(dx,dy){
    this.viewYaw += dx * 0.002;
    this.viewPitch = Math.max(-1.2, Math.min(0.6, this.viewPitch + dy * 0.002));
    this.scene.renderer.camera.rotation[0] = this.viewPitch;
    this.scene.renderer.camera.rotation[1] = this.viewYaw;
  }

  setAiming(v){
    this.isAiming = v;
  }

  tryFire(){
    const now = performance.now();
    if(now - this.lastShot < 100) return; // basic fire rate limiter 600 RPM approx
    if(this.ammo <= 0) { return; }
    this.ammo--;
    document.getElementById('ammo-val').textContent = this.ammo;
    this.lastShot = now;
    this.recoil += 0.06;
    // spawn particle/muzzle & perform raycast locally - server validation will follow
    this.scene.particles.spawnMuzzle(this.position, this.viewYaw, this.viewPitch);
    // local hit detection: find closest AI in front cone
    const hit = this.scene.ai.raycast(this.position, this.viewYaw, this.viewPitch);
    if(hit) this.scene.ai.applyDamage(hit, 33);
  }

  reload(){
    this.ammo = this.ammoCap;
    document.getElementById('ammo-val').textContent = this.ammo;
  }

  update(dt){
    // movement
    const forward = [Math.sin(this.viewYaw), 0, Math.cos(this.viewYaw)];
    const right = [Math.cos(this.viewYaw), 0, -Math.sin(this.viewYaw)];
    this.velocity[0] = (forward[0]*this.moveInput[1] + right[0]*this.moveInput[0]) * this.speed;
    this.velocity[2] = (forward[2]*this.moveInput[1] + right[2]*this.moveInput[0]) * this.speed;
    this.position[0] += this.velocity[0]*dt;
    this.position[2] += this.velocity[2]*dt;
    // update weapon transform to follow camera
    if(this.weapon){
      const m = this.weapon.modelMatrix;
      mat4.identity(m);
      // place relative to camera
      m[12] = this.position[0] + Math.sin(this.viewYaw)*0.6;
      m[13] = this.position[1] - 0.2;
      m[14] = this.position[2] + Math.cos(this.viewYaw)*0.8;
    }
    // update UI HP
    document.getElementById('hp-val').textContent = Math.round(this.hp);
  }
}