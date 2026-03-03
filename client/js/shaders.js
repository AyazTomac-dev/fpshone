// Small shader & math helpers used by renderer
export function compileShader(gl, type, source){
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(s));
    throw new Error('Shader compile error');
  }
  return s;
}
export function createProgram(gl, vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(p));
    throw new Error('Program link error');
  }
  // cache uniform/attrib locations commonly used
  p.uModel = gl.getUniformLocation(p, 'uModel');
  p.uView = gl.getUniformLocation(p, 'uView');
  p.uProj = gl.getUniformLocation(p, 'uProj');
  p.uCamPos = gl.getUniformLocation(p, 'uCamPos');
  p.uAlbedo = gl.getUniformLocation(p, 'uAlbedo');
  p.uMetal = gl.getUniformLocation(p, 'uMetal');
  p.uRough = gl.getUniformLocation(p, 'uRough');
  p.uAmbient = gl.getUniformLocation(p, 'uAmbient');
  return { program: p,
    uModel: p.uModel, uView: p.uView, uProj: p.uProj,
    uCamPos: p.uCamPos, uAlbedo: p.uAlbedo, uMetal: p.uMetal, uRough: p.uRough, uAmbient: p.uAmbient
  };
}

// Minimal math (mat4 + vec3)
export const mat4 = {
  create(){ return new Float32Array(16).fill(0).map((v,i)=> (i%5===0?1:0)); },
  identity(out){ for(let i=0;i<16;i++) out[i]=(i%5===0?1:0); },
  perspective(out,fovy,aspect,near,far){
    const f = 1.0/Math.tan(fovy/2), nf = 1/(near - far);
    out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
    out[4]=0; out[5]=f; out[6]=0; out[7]=0;
    out[8]=0; out[9]=0; out[10]=(far+near)*nf; out[11]=-1;
    out[12]=0; out[13]=0; out[14]=2*far*near*nf; out[15]=0;
  },
  translate(out, a, v){
    out[12] = a[12] + v[0];
    out[13] = a[13] + v[1];
    out[14] = a[14] + v[2];
  },
  rotateX(out, a, rad){
    const s = Math.sin(rad), c = Math.cos(rad);
    // naive multiply for demo camera only
    out[5]=c; out[6]=s; out[9]=-s; out[10]=c;
  },
  rotateY(out,a,rad){
    const s=Math.sin(rad), c=Math.cos(rad);
    out[0]=c; out[2]=-s; out[8]=s; out[10]=c;
  }
};
export const vec3 = {
  len(a){ return Math.hypot(a[0],a[1],a[2]); }
};