// Minimal Three.js-alike renderer using WebGL; provides camera, basic mesh/scene handling,
// shader compilation helpers and simple forward renderer with PBR-like shader approximations.

// Note: This is a deliberately compact renderer tailored to the demo's needs.
// It implements: Camera, basic Mesh wrapper, InstancedMesh wrapper, simple depth + PBR-ish shader passes.

import { compileShader, createProgram, mat4, vec3 } from './shaders.js';

export class Renderer {
  constructor(canvas){
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2',{antialias:true,alpha:false});
    if(!this.gl){ alert('WebGL2 required'); throw new Error('No WebGL2'); }
    this.dom = canvas;
    this.camera = {
      position: [0,2,5],
      rotation: [0,0,0],
      fov: 80,
      aspect: 1,
      near: 0.1,
      far: 1000,
      projMat: mat4.create(),
      viewMat: mat4.create()
    };
    this.clearColor = [0.06,0.07,0.08,1];
    this._initGL();
  }

  _initGL(){
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(...this.clearColor);
    this.basicProg = createProgram(gl, compileShader(gl, gl.VERTEX_SHADER, this._vs()), compileShader(gl, gl.FRAGMENT_SHADER, this._fs()));
    // attribute/uniform locations cached later per mesh
    this.resize();
  }

  _vs(){
    return `#version 300 es
    in vec3 aPos;
    in vec3 aNormal;
    in vec2 aUV;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProj;
    out vec3 vPos;
    out vec3 vNormal;
    out vec2 vUV;
    void main(){
      vPos = (uModel * vec4(aPos,1)).xyz;
      vNormal = mat3(uModel) * aNormal;
      vUV = aUV;
      gl_Position = uProj * uView * vec4(vPos,1.0);
    }`;
  }

  _fs(){
    return `#version 300 es
    precision highp float;
    in vec3 vPos;
    in vec3 vNormal;
    in vec2 vUV;
    out vec4 outColor;
    uniform vec3 uCamPos;
    uniform vec3 uAlbedo;
    uniform float uMetal;
    uniform float uRough;
    uniform float uAmbient;
    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(uCamPos - vPos);
      vec3 L = normalize(vec3(0.3,0.7,0.2)); // simple sun
      vec3 H = normalize(L+V);
      float NdotL = clamp(dot(N,L),0.0,1.0);
      float NdotV = clamp(dot(N,V),0.0,1.0);
      float NdotH = clamp(dot(N,H),0.0,1.0);
      // simple Cook-Torrance-ish
      float rough = max(0.04,uRough);
      float D = pow(rough, -2.0) * exp((NdotH*NdotH -1.0)/(rough*NdotH*NdotH));
      float k = (rough + 1.0) * (rough + 1.0) / 8.0;
      float G = NdotL / (NdotL*(1.0-k)+k) * NdotV / (NdotV*(1.0-k)+k);
      vec3 F0 = mix(vec3(0.04), uAlbedo, uMetal);
      vec3 spec = (D * G) * F0;
      vec3 diffuse = (1.0 - uMetal) * uAlbedo / 3.1415;
      vec3 col = (diffuse + spec) * NdotL + uAmbient * uAlbedo;
      // simple fog
      float fog = smoothstep(40.0, 160.0, length(vPos));
      col = mix(col, vec3(0.06,0.07,0.08), fog);
      outColor = vec4(pow(col, vec3(1.0/2.2)),1.0);
    }`;
  }

  resize(){
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.canvas.width = Math.floor(w * devicePixelRatio);
    this.canvas.height = Math.floor(h * devicePixelRatio);
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
    this.camera.aspect = this.canvas.width/this.canvas.height;
    mat4.perspective(this.camera.projMat, this.camera.fov*Math.PI/180, this.camera.aspect, this.camera.near, this.camera.far);
  }

  render(scene){
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // build view matrix
    const cam = this.camera;
    mat4.identity(cam.viewMat);
    mat4.rotateX(cam.viewMat, cam.viewMat, cam.rotation[0]);
    mat4.rotateY(cam.viewMat, cam.viewMat, cam.rotation[1]);
    mat4.translate(cam.viewMat, cam.viewMat, [-cam.position[0], -cam.position[1], -cam.position[2]]);
    // render simple objects
    gl.useProgram(this.basicProg.program);
    gl.uniform3fv(this.basicProg.uCamPos, cam.position);
    for(const mesh of scene.drawList){
      const prog = this.basicProg;
      gl.bindVertexArray(mesh.vao);
      // set uniforms
      gl.uniformMatrix4fv(prog.uModel, false, mesh.modelMatrix);
      gl.uniformMatrix4fv(prog.uView, false, cam.viewMat);
      gl.uniformMatrix4fv(prog.uProj, false, cam.projMat);
      gl.uniform3fv(prog.uAlbedo, mesh.material.albedo);
      gl.uniform1f(prog.uMetal, mesh.material.metal);
      gl.uniform1f(prog.uRough, mesh.material.rough);
      gl.uniform1f(prog.uAmbient, mesh.material.ambient || 0.06);
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    }
    gl.bindVertexArray(null);
  }
}