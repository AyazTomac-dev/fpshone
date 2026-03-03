// Build a procedural city, player, simple AI bots, and populate drawList for renderer.
// Keeps game objects, updates, physics-lite.

import { ProceduralModels } from './proceduralModels.js';
import { CityGenerator } from './cityGenerator.js';
import { Player } from './player.js';
import { AIManager } from './ai.js';
import { Particles } from './particles.js';

export class GameScene {
  constructor(renderer){
    this.renderer = renderer;
    this.drawList = [];
    this.models = new ProceduralModels(renderer.gl || null, renderer);
    this.city = new CityGenerator(this);
    this.player = new Player(this);
    this.ai = new AIManager(this);
    this.particles = new Particles(this);
    this.time = 0;
    this._init();
  }

  _init(){
    // generate base ground and chunks
    this.city.generateInitialChunks();
    // spawn procedural rifle near player
    this.player.equip(this.models.createRifle());
    // spawn some AI enemies
    this.ai.spawnWave(6);
  }

  addMesh(mesh){
    this.drawList.push(mesh);
  }

  removeMesh(mesh){
    const i = this.drawList.indexOf(mesh);
    if(i>=0) this.drawList.splice(i,1);
  }

  update(dt, t){
    this.time = t;
    // camera follows player
    this.renderer.camera.position[0] = this.player.position[0];
    this.renderer.camera.position[2] = this.player.position[2] + 6;
    this.renderer.camera.position[1] = this.player.position[1] + 2.0;
    // simple day/night cycle modifies ambient
    const day = (Math.sin(t*0.05)+1)/2;
    for(const m of this.drawList) m.material.ambient = 0.03 + 0.2*day;
    // update subsystems
    this.player.update(dt);
    this.ai.update(dt);
    this.particles.update(dt);
    this.city.update(dt);
  }
}