/* Independent alpha sprites with an explicit feathered foreground occlusion mask. */
class SpriteRenderer {
  constructor(gl,manifest,onReady,onError){
    this.gl=gl;this.assets={};this.skin=new PinballIdleSkin();
    // Reuse CPU staging storage; double precision grid preserves original math.
    this.vertexGrid=new Float64Array(36*4);
    this.quadVertices=new Float32Array(6*4);
    this.meshVertices=new Float32Array(25*6*4);
    const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    this.program=gl.createProgram();
    gl.attachShader(this.program,compile(gl.VERTEX_SHADER,'attribute vec2 a;attribute vec2 uv;uniform vec2 res;varying vec2 v;varying vec2 surface;void main(){surface=a/res;gl_Position=vec4(a.x/res.x*2.-1.,1.-a.y/res.y*2.,0,1);v=uv;}'));
    gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;varying vec2 surface;uniform sampler2D tex;uniform sampler2D foregroundMask;uniform float occlusionMode;uniform float lowPower;uniform float lowLight;uniform float lightTime;uniform float lightReaction;uniform float ballSurface;uniform float opacity;uniform float brightness;uniform float shadow;uniform vec2 blur;void main(){vec4 c=texture2D(tex,v);if(occlusionMode>0.5)c.a*=texture2D(foregroundMask,surface).r;if(c.a<.025)discard;if(shadow>0.5&&lowPower>0.5){c=vec4(0.025,0.017,0.008,c.a*.5);}else if(shadow>0.5){float a=c.a*0.25;a+=(texture2D(tex,v+vec2(blur.x,0.)).a+texture2D(tex,v-vec2(blur.x,0.)).a+texture2D(tex,v+vec2(0.,blur.y)).a+texture2D(tex,v-vec2(0.,blur.y)).a)*0.125;a+=(texture2D(tex,v+blur).a+texture2D(tex,v-blur).a+texture2D(tex,v+vec2(blur.x,-blur.y)).a+texture2D(tex,v+vec2(-blur.x,blur.y)).a)*0.0625;c=vec4(0.025,0.017,0.008,a);}vec3 illumination=vec3(1.);if(shadow<0.5&&ballSurface<0.5&&lowPower>0.5){illumination=vec3(.94)+lowLight*vec3(.16,.10,.035)+lightReaction*vec3(.08,.05,.02);}else if(shadow<0.5&&ballSurface<0.5){vec2 warm=surface-vec2(.5+.42*sin(lightTime*.65),.46+.37*cos(lightTime*.43));vec2 cool=surface-vec2(.5+.4*cos(lightTime*.53),.5+.36*sin(lightTime*.37));float amber=exp(-dot(warm,warm)*8.);float blue=exp(-dot(cool,cool)*11.);float material=smoothstep(.18,.8,dot(c.rgb,vec3(.299,.587,.114)));float sweep=pow(.5+.5*sin(surface.x*5.+surface.y*3.-lightTime*1.2),8.);illumination=vec3(.86)+amber*vec3(.55,.36,.12)+blue*vec3(.1,.24,.42)+sweep*material*vec3(.17,.14,.08)+lightReaction*vec3(.12,.08,.025);illumination=clamp(illumination,vec3(.86),vec3(1.65));}gl_FragColor=vec4(c.rgb*(shadow>0.5?vec3(1.):illumination*brightness),c.a*opacity);}'));
    gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
    this.maskSampler=gl.getUniformLocation(this.program,'foregroundMask');this.occlusionMode=gl.getUniformLocation(this.program,'occlusionMode');
    if(typeof PinballOcclusionMask!=='undefined'){this.occlusionTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.occlusionTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,941,1672,0,gl.RGBA,gl.UNSIGNED_BYTE,PinballOcclusionMask.raster());gl.activeTexture(gl.TEXTURE0);}
    this.buffer=gl.createBuffer();this.position=gl.getAttribLocation(this.program,'a');this.uv=gl.getAttribLocation(this.program,'uv');
    this.lowPowerUniform=gl.getUniformLocation(this.program,'lowPower');this.lowLightUniform=gl.getUniformLocation(this.program,'lowLight');this.lightTime=gl.getUniformLocation(this.program,'lightTime');this.lightReaction=gl.getUniformLocation(this.program,'lightReaction');this.ballSurface=gl.getUniformLocation(this.program,'ballSurface');
    this.brightness=gl.getUniformLocation(this.program,'brightness');
    this.shadowMode=gl.getUniformLocation(this.program,'shadow');this.blur=gl.getUniformLocation(this.program,'blur');
    this.opacity=gl.getUniformLocation(this.program,'opacity');this.res=gl.getUniformLocation(this.program,'res');
    Promise.all(Object.entries(manifest).map(([key,meta])=>new Promise((resolve,reject)=>{
      if(key.startsWith('character-')&&(!meta.state||meta.frameStates?.length!==meta.frames?.length||meta.frameStates.some(s=>s!==meta.state)))throw Error('Character atlas must contain exactly one state: '+key);
      const img=new Image();img.onload=()=>{
        const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        this.assets[key]={...meta,texture};resolve();
      };img.onerror=()=>reject(Error('Failed to load '+meta.file));img.src='assets/'+meta.file;
    }))).then(onReady).catch(onError);
  }
  advance(dt,reduced){this.skin.advance(dt,reduced);}
  react(amount){this.skin.react(amount);}
  begin(){const gl=this.gl;gl.useProgram(this.program);gl.uniform1f(this.lowPowerUniform,this.lowPower?1:0);gl.uniform1f(this.lowLightUniform,this.skin.reduced?.35:.5+.5*Math.sin(this.skin.time*.65));gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,16,8);gl.uniform2f(this.res,941,1672);gl.uniform1i(this.maskSampler,1);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.occlusionTexture||null);gl.activeTexture(gl.TEXTURE0);}
  shadow(key,x,y,w,h,options={}){
    // Low power retains one alpha silhouette, avoiding two nine-tap blur passes.
    if(this.lowPower){this.draw(key,x+3,y+6,w,h,{...options,shadow:true,softness:0,opacity:.32});return;}
    // Derive shadows from each real sprite alpha, including animated orientation.
    this.draw(key,x+8,y+13,w,h,{...options,shadow:true,softness:5,opacity:.32});
    this.draw(key,x+2,y+5,w,h,{...options,shadow:true,softness:2,opacity:.25});
  }
  draw(key,x,y,w,h,{angle=0,projection=1,anchorX=.5,anchorY=.5,flip=false,opacity=1,slice=[0,1],shadow=false,softness=0,brightness=1}={}){
    const asset=this.assets[key];if(!asset)return;
    const gl=this.gl;let [x0,y0,x1,y1]=asset.bounds;
    if(asset.frames){const frame=asset.frames[this.skin.frame(asset,key)];[x0,y0,x1,y1]=frame;const anchor=asset.frameAnchors?.[this.skin.frame(asset,key)];if(anchor){anchorX=anchor[0];anchorY=anchor[1];}}
    const top=y0+(y1-y0)*slice[0],bottom=y0+(y1-y0)*slice[1],c=Math.cos(angle),s=Math.sin(angle);
    const character=key.startsWith('character-'),nx=character?5:1,ny=character?5:1;
    const grid=this.vertexGrid,vertices=character?this.meshVertices:this.quadVertices;
    let g=0;
    for(let row=0;row<=ny;row++)for(let col=0;col<=nx;col++){
      const u=col/nx,v=row/ny;
      const offset=character?this.skin.offset(key,u,v,w,h,asset):null;
      const lx=((u-anchorX)*w+(offset?offset[0]:0))*(flip?-1:1),ly=(v-anchorY)*h+(offset?offset[1]:0);
      grid[g++]=x+lx*c-ly*s;grid[g++]=y+(lx*s+ly*c)*projection;
      grid[g++]=(x0+u*(x1-x0))/asset.width;grid[g++]=(top+v*(bottom-top))/asset.height;
    }
    let out=0;
    for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){
      const i=row*(nx+1)+col;
      for(let corner=0;corner<6;corner++){
        const j=(corner===0||corner===3?i:corner===1?i+1:corner===5?i+nx+1:i+nx+2)*4;
        vertices[out++]=grid[j];vertices[out++]=grid[j+1];vertices[out++]=grid[j+2];vertices[out++]=grid[j+3];
      }
    }
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,asset.texture);gl.uniform1f(this.occlusionMode,asset.occlusionMask?1:0);gl.uniform1f(this.opacity,opacity);
    gl.uniform1f(this.lightTime,this.skin.reduced?0:this.skin.time);gl.uniform1f(this.lightReaction,this.skin.reduced?0:this.skin.reaction);gl.uniform1f(this.ballSurface,key==='ball'?1:0);gl.uniform1f(this.brightness,brightness);gl.uniform1f(this.shadowMode,shadow?1:0);gl.uniform2f(this.blur,softness/w*(x1-x0)/asset.width,softness/h*(bottom-top)/asset.height);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);
  }
}
globalThis.SpriteRenderer=SpriteRenderer;
