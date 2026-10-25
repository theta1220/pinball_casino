/* Lit cylindrical drums. Art remains a texture; no replacement symbols. */
class PinballReelRenderer {
 constructor(canvas,sharedGL=null,onReady=()=>{}){
  this.canvas=canvas;const gl=this.gl=sharedGL||canvas.getContext('webgl',{alpha:false,antialias:false});this.shared=!!sharedGL;if(!gl)return;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const p=this.program=gl.createProgram();
  gl.attachShader(p,shader(gl.VERTEX_SHADER,'attribute vec2 xy;varying vec2 uv;void main(){uv=xy*.5+.5;gl_Position=vec4(xy,0.,1.);}'));
  gl.attachShader(p,shader(gl.FRAGMENT_SHADER,`precision highp float;
   varying vec2 uv;uniform sampler2D strip;uniform float position;uniform float motion;
   vec3 sampleDrum(float phase){return texture2D(strip,vec2(uv.x,fract((phase+.5)/3.))).rgb;}
   void main(){
    float y=1.-2.*uv.y;
    float angle=asin(clamp(y*.92,-.999,.999));
    float phase=position+angle/1.52;
    vec3 c=sampleDrum(phase)*.4;
    c+=(sampleDrum(phase+motion)+sampleDrum(phase-motion))*.24;
    c+=(sampleDrum(phase+motion*2.)+sampleDrum(phase-motion*2.))*.06;
    float curve=pow(max(0.,cos(angle)),.8);
    float side=smoothstep(0.,.09,uv.x)*smoothstep(0.,.09,1.-uv.x);
    float lip=1.-.22*smoothstep(.82,1.,abs(y));
    float light=(.3+.7*curve)*(.78+.22*side)*lip;
    float gloss=.035*exp(-pow((y+.23)*5.,2.));
    gl_FragColor=vec4(c*light+vec3(1.,.92,.75)*gloss,1.);
   }`));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);
  const b=this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const a=this.attribute=gl.getAttribLocation(p,'xy');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  this.pos=gl.getUniformLocation(p,'position');this.motion=gl.getUniformLocation(p,'motion');
  const image=new Image();image.onload=()=>{const t=this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);this.ready=true;if(!this.shared)this.draw(this.lastPosition||0,0);onReady();};image.src='assets/reel-strip.png';
 }
 draw(position,motion,rect=null){this.lastPosition=position;if(!this.ready)return;const gl=this.gl;gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.enableVertexAttribArray(this.attribute);gl.vertexAttribPointer(this.attribute,2,gl.FLOAT,false,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);if(rect)gl.viewport(rect.x,rect.y,rect.w,rect.h);else gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.uniform1f(this.pos,position);gl.uniform1f(this.motion,Math.min(.12,Math.abs(motion)));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
}
globalThis.PinballReelRenderer=PinballReelRenderer;
