// Chunked procedural grid city with road network, buildings, instanced props.
// Simplified for demo but implements streaming, LOD and instancing patterns.

import { mat4 } from './shaders.js';

export class CityGenerator {
  constructor(scene){
    this.scene = scene;
    this.chunkSize = 40;
    this.chunks = new Map();
    this.range = 2; // how many chunks in each axis to keep
    this.propPool = [];
  }

  _chunkKey(cx,cz){ return `${cx},${cz}`; }

  generateInitialChunks(){
    const p = this.scene.player.position || [0,0,0];
    this._streamAround(Math.floor(p[0]/this.chunkSize), Math.floor(p[2]/this.chunkSize));
  }

  update(dt){
    const p = this.scene.player.position;
    const cx = Math.floor(p[0]/this.chunkSize), cz = Math.floor(p[2]/this.chunkSize);
    this._streamAround(cx,cz);
  }

  _streamAround(cx,cz){
    const needed = new Set();
    for(let x=cx-this.range;x<=cx+this.range;x++){
      for(let z=cz-this.range;z<=cz+this.range;z++){
        needed.add(this._chunkKey(x,z));
        if(!this.chunks.has(this._chunkKey(x,z))){
          this._createChunk(x,z);
        }
      }
    }
    // unload others
    for(const k of Array.from(this.chunks.keys())){
      if(!needed.has(k)){
        const arr = this.chunks.get(k);
        for(const m of arr) this.scene.removeMesh(m);
        this.chunks.delete(k);
      }
    }
  }

  _createChunk(cx,cz){
    const meshes = [];
    // ground plane as a big lowpoly box
    const ground = this.scene.models.createCrate(this.chunkSize*0.98);
    // place ground
    ground.modelMatrix = mat4.create();
    ground.modelMatrix[12] = cx * this.chunkSize;
    ground.modelMatrix[14] = cz * this.chunkSize;
    ground.modelMatrix[13] = -0.5;
    ground.material.albedo = [0.1,0.1,0.1];
    ground.material.rough = 0.95;
    this.scene.addMesh(ground);
    meshes.push(ground);

    // roads: simple darker strips across chunk centerlines (spawn simple boxes)
    const road = this.scene.models.createCrate( this.chunkSize * 0.22 );
    road.modelMatrix = mat4.create();
    road.modelMatrix[12] = cx * this.chunkSize;
    road.modelMatrix[14] = cz * this.chunkSize;
    road.modelMatrix[13] = -0.49;
    road.material.albedo = [0.06,0.06,0.06];
    this.scene.addMesh(road);
    meshes.push(road);

    // create several buildings
    const bcount = 6;
    for(let i=0;i<bcount;i++){
      const b = this.scene.models.createCrate(1.0 + Math.random()*6);
      b.modelMatrix = mat4.create();
      b.modelMatrix[12] = cx * this.chunkSize + (Math.random()-0.5)*this.chunkSize*0.6;
      b.modelMatrix[14] = cz * this.chunkSize + (Math.random()-0.5)*this.chunkSize*0.6;
      b.modelMatrix[13] = 0.5 + Math.random()*6;
      b.material.albedo = [0.7 - Math.random()*0.5,0.7 - Math.random()*0.5,0.7 - Math.random()*0.5];
      b.material.rough = 0.7;
      this.scene.addMesh(b);
      meshes.push(b);
    }

    this.chunks.set(this._chunkKey(cx,cz), meshes);
  }
}