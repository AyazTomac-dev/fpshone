// Simplified pooled particle system to spawn muzzle flashes and impact sparks.

export class Particles {
  constructor(scene){
    this.scene = scene;
    this.pool = [];
  }

  spawnMuzzle(pos, yaw, pitch){
    // for demo, spawn a small temporary glowing crate representing flash
    const p = this.scene.models.createCrate(0.12);
    p.modelMatrix[12] = pos[0] + Math.sin(yaw)*0.9;
    p.modelMatrix[13] = pos[1] + 0.2;
    p.modelMatrix[14] = pos[2] + Math.cos(yaw)*0.9;
    p.material.albedo = [1.0,0.6,0.2];
    p._age = 0; p._ttl = 0.06;
    this.scene.addMesh(p);
    this.pool.push(p);
  }

  spawnImpact(position){
    const p = this.scene.models.createCrate(0.14);
    p.modelMatrix[12] = position[0]; p.modelMatrix[13] = position[1]+0.6; p.modelMatrix[14] = position[2];
    p.material.albedo = [0.9,0.1,0.1];
    p._age = 0; p._ttl = 0.7;
    this.scene.addMesh(p);
    this.pool.push(p);
  }

  update(dt){
    for(const p of Array.from(this.pool)){
      p._age += dt;
      p.modelMatrix[13] += dt*0.2; // rise
      if(p._age > p._ttl){
        this.scene.removeMesh(p);
        this.pool.splice(this.pool.indexOf(p),1);
      }
    }
  }
}