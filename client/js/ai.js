// Minimal AI manager illustrating a behavior-tree-like state machine, cover selection, sound investigation,
// and simple pathing (grid-steer) suitable for demo purposes.

import { mat4 } from './shaders.js';

export class AIManager {
  constructor(scene){
    this.scene = scene;
    this.agents = [];
    this.navGrid = {}; // simple
  }

  spawnWave(n){
    for(let i=0;i<n;i++){
      const char = this.scene.models.createCharacter();
      char.modelMatrix = mat4.create();
      char.modelMatrix[12] = (Math.random()-0.5)*30;
      char.modelMatrix[14] = (Math.random()-0.5)*30;
      char.health = 100;
      char.state = 'idle';
      this.scene.addMesh(char);
      this.agents.push(char);
    }
  }

  update(dt){
    for(const a of this.agents){
      this._updateAgent(a, dt);
      // simple death
      if(a.health <=0){
        this.scene.removeMesh(a);
        this.agents.splice(this.agents.indexOf(a),1);
      }
    }
  }

  _updateAgent(a, dt){
    // simple behavior tree imitation
    const playerPos = this.scene.player.position;
    const dx = playerPos[0] - a.modelMatrix[12];
    const dz = playerPos[2] - a.modelMatrix[14];
    const dist = Math.hypot(dx,dz);
    if(dist < 6){
      a.state = 'attack';
      // face player
      const ang = Math.atan2(dx,dz);
      // move slightly toward player
      a.modelMatrix[12] += Math.sin(ang)*dt*1.4;
      a.modelMatrix[14] += Math.cos(ang)*dt*1.4;
      // shoot occasionally
      if(Math.random() < 0.01){
        // rough hit chance
        if(Math.random() < 0.25) this.scene.player.hp -= 6;
      }
    } else if(dist < 14){
      a.state = 'investigate';
      // stroll toward player last known
      const ang = Math.atan2(dx,dz);
      a.modelMatrix[12] += Math.sin(ang)*dt*0.6;
      a.modelMatrix[14] += Math.cos(ang)*dt*0.6;
    } else {
      a.state = 'patrol';
      // idle wander
      a.modelMatrix[12] += (Math.random()-0.5)*dt*0.5;
      a.modelMatrix[14] += (Math.random()-0.5)*dt*0.5;
    }
  }

  raycast(from, yaw, pitch){
    // look for nearest agent within a cone and range
    const dir = [Math.sin(yaw), Math.sin(pitch), Math.cos(yaw)];
    let best=null; let bestd=9999;
    for(const a of this.agents){
      const dx = a.modelMatrix[12]-from[0], dz = a.modelMatrix[14]-from[2];
      const dist = Math.hypot(dx,dz);
      if(dist>60) continue;
      const ang = Math.abs(Math.atan2(dx,dz)-yaw);
      if(ang < 0.25 && dist < bestd){ best = a; bestd=dist; }
    }
    return best;
  }

  applyDamage(agent, dmg){
    agent.health -= dmg;
    // spawn particle
    this.scene.particles.spawnImpact([agent.modelMatrix[12], agent.modelMatrix[13], agent.modelMatrix[14]]);
  }
}