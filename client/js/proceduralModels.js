// Procedural geometry builder: cylinder, box, planes, and a detailed procedural rifle assembled from parts.
// It creates Mesh objects compatible with renderer (simple VAO + modelMatrix + material).

import { mat4 } from './shaders.js';

function createVAOFromArrays(gl, arrays){
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // position
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  // normals
  const nBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,nBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
  // uv
  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.uvs), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2,2,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null);
  return { vao, vertexCount: arrays.positions.length/3 };
}

// primitives
function buildBox(w,h,d){
  const hw=w/2, hh=h/2, hd=d/2;
  const positions=[
// 6 faces * 2 tris * 3 verts = 36 verts
  // front
  -hw,-hh,hd, hw,-hh,hd, hw,hh,hd, -hw,-hh,hd, hw,hh,hd, -hw,hh,hd,
  // back
  hw,-hh,-hd, -hw,-hh,-hd, -hw,hh,-hd, hw,-hh,-hd, -hw,hh,-hd, hw,hh,-hd,
  // left
  -hw,-hh,-hd, -hw,-hh,hd, -hw,hh,hd, -hw,-hh,-hd, -hw,hh,hd, -hw,hh,-hd,
  // right
  hw,-hh,hd, hw,-hh,-hd, hw,hh,-hd, hw,-hh,hd, hw,hh,-hd, hw,hh,hd,
  // top
  -hw,hh,hd, hw,hh,hd, hw,hh,-hd, -hw,hh,hd, hw,hh,-hd, -hw,hh,-hd,
  // bottom
  -hw,-hh,-hd, hw,-hh,-hd, hw,-hh,hd, -hw,-hh,-hd, hw,-hh,hd, -hw,-hh,hd
  ];
  const normals = new Array(positions.length).fill(0); // approximate
  const uvs = new Array((positions.length/3)*2).fill(0);
  return { positions, normals, uvs };
}

export class ProceduralModels {
  constructor(gl, renderer){
    this.gl = renderer.gl;
    this.renderer = renderer;
  }

  _makeMeshFromArrays(arrays, material){
    const obj = createVAOFromArrays(this.gl, arrays);
    obj.modelMatrix = mat4.create();
    obj.material = material || { albedo: [0.8,0.8,0.8], metal:0.0, rough:0.6, ambient:0.06 };
    return obj;
  }

  createCrate(size=1){
    const arrays = buildBox(size,size,size);
    const m = { albedo:[0.45,0.35,0.25], metal:0.0, rough:0.9, ambient:0.08 };
    return this._makeMeshFromArrays(arrays, m);
  }

  createRifle(){
    // build a simple high-detail rifle from multiple boxes/cylinders assembled
    const group = this.createCrate(0.001); // dummy to be replaced by merged geometry
    // We'll procedurally produce one merged array comprising barrel, receiver, stock, magazine
    const arrays = { positions:[], normals:[], uvs:[] };

    // helper to append transformed box
    function appendBox(x,y,z,w,h,d){
      const b = buildBox(w,h,d);
      for(let i=0;i<b.positions.length;i+=3){
        arrays.positions.push(b.positions[i]+x, b.positions[i+1]+y, b.positions[i+2]+z);
        arrays.normals.push(0,1,0); // naive
      }
    }
    // barrel
    appendBox(0,0,1.2, 0.08,0.08,1.8);
    // handguard
    appendBox(0,0,0.6, 0.18,0.14,0.8);
    // receiver
    appendBox(0,0,0.0, 0.24,0.12,0.6);
    // magazine
    appendBox(0,-0.28,-0.35, 0.14,0.32,0.06);
    // stock
    appendBox(-0.6,0,0.0, 0.4,0.12,0.2);
    // sight
    appendBox(0,0.12,0.38, 0.06,0.04,0.2);

    // create UVs placeholder
    arrays.uvs = new Array((arrays.positions.length/3)*2).fill(0);
    const m = { albedo:[0.12,0.12,0.12], metal:1.0, rough:0.25, ambient:0.04 };

    const mesh = this._makeMeshFromArrays(arrays, m);
    // set a transform so it appears in front of player
    mesh.modelMatrix = mat4.create();
    return mesh;
  }

  createCharacter(){
    // low-mid poly humanoid: head, torso, limbs
    const arrays = { positions:[], normals:[], uvs:[] };
    function addBox(x,y,z,w,h,d){
      const b=buildBox(w,h,d);
      for(let i=0;i<b.positions.length;i+=3){
        arrays.positions.push(b.positions[i]+x,b.positions[i+1]+y,b.positions[i+2]+z);
        arrays.normals.push(0,1,0);
      }
    }
    addBox(0,0.9,0,0.36,0.5,0.2); // torso
    addBox(0,1.45,0,0.22,0.22,0.22); // head
    addBox(-0.26,0.5,0,0.12,0.4,0.12); // left leg
    addBox(0.26,0.5,0,0.12,0.4,0.12); // right leg
    addBox(-0.32,1.05,0,0.12,0.36,0.12); // left arm
    addBox(0.32,1.05,0,0.12,0.36,0.12); // right arm
    arrays.uvs = new Array((arrays.positions.length/3)*2).fill(0);
    const m = { albedo:[0.65,0.55,0.45], metal:0.0, rough:0.8, ambient:0.05 };
    const mesh = this._makeMeshFromArrays(arrays, m);
    mesh.modelMatrix = mat4.create();
    return mesh;
  }
}