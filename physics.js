/* Engine-free, screen-space rigid-ball physics. Units: image pixels and seconds. */
(function (root) {
  'use strict';
  const EPS = 1e-7;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  function closest(x, y, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy || 1),0,1);
    return {x:a[0]+dx*t,y:a[1]+dy*t,t};
  }
  function inside(x,y,points) {
    let hit=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];
      if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
    }
    return hit;
  }
  function edges(shape) {
    const p=shape.points;
    return p.slice(0,shape.closed?p.length:p.length-1).map((a,i)=>[a,p[(i+1)%p.length]]);
  }
  function ellipse(x,y,rx,ry,count=40) {
    return Array.from({length:count},(_,i)=>[x+rx*Math.cos(i*2*Math.PI/count),y+ry*Math.sin(i*2*Math.PI/count)]);
  }
  // Sweep a point against a capsule: line faces plus exact endpoint circles.
  function sweepSegment(ball,dx,dy,a,b,radius) {
    const r=ball.r+radius,ex=b[0]-a[0],ey=b[1]-a[1],len=Math.hypot(ex,ey);
    let best=null;
    function candidate(t,nx,ny){if(t>=-EPS&&t<=1+EPS&&dx*nx+dy*ny<-EPS&&(!best||t<best.t))best={t:Math.max(0,t),nx,ny};}
    if(len>EPS){
      const nx=-ey/len,ny=ex/len,d=(ball.x-a[0])*nx+(ball.y-a[1])*ny,v=dx*nx+dy*ny;
      if(Math.abs(v)>EPS)for(const side of [-1,1]){
        const t=(side*r-d)/v,along=((ball.x+dx*t-a[0])*ex+(ball.y+dy*t-a[1])*ey)/len;
        if(along>=0&&along<=len)candidate(t,nx*side,ny*side);
      }
    }
    const speed2=dx*dx+dy*dy;
    if(speed2>EPS)for(const point of [a,b]){
      const x=ball.x-point[0],y=ball.y-point[1],dot=x*dx+y*dy,c=x*x+y*y-r*r,disc=dot*dot-speed2*c;
      if(disc>=0){const t=(-dot-Math.sqrt(disc))/speed2;const nx=(x+dx*t)/r,ny=(y+dy*t)/r;candidate(t,nx,ny);}
    }
    return best;
  }
  function contact(ball,shape){
    let best=null;
    for(const [a,b] of shape.edges){const q=closest(ball.x,ball.y,a,b),d=Math.hypot(ball.x-q.x,ball.y-q.y);if(!best||d<best.d)best={...q,d,a,b};}
    const isInside=shape.closed&&inside(ball.x,ball.y,shape.points),r=ball.r+(shape.radius||0);
    if(!isInside&&best.d>=r)return null;
    let nx=(ball.x-best.x)/(best.d||1),ny=(ball.y-best.y)/(best.d||1);
    if(best.d<EPS){const dx=best.b[0]-best.a[0],dy=best.b[1]-best.a[1],len=Math.hypot(dx,dy)||1;nx=-dy/len;ny=dx/len;}
    if(isInside){nx=-nx;ny=-ny;}
    return {nx,ny,depth:isInside?r+best.d:r-best.d,x:best.x,y:best.y};
  }
  class World {
    constructor(shapes=[],onHit=()=>{}){
      this.shapes=shapes.map(s=>({...s,edges:edges(s),lastHit:-Infinity,lastRelease:-Infinity,
        bounds:{minX:Math.min(...s.points.map(p=>p[0]))-(s.radius||0),maxX:Math.max(...s.points.map(p=>p[0]))+(s.radius||0),minY:Math.min(...s.points.map(p=>p[1]))-(s.radius||0),maxY:Math.max(...s.points.map(p=>p[1]))+(s.radius||0)}}));
      this.onHit=onHit;this.time=0;this.gravity=620;this.drag=.035;
    }
    // Unit mass steel sphere, I = 2/5 mr². Friction couples translation and spin.
    impulse(ball,nx,ny,material,surface={vx:0,vy:0}){
      const vn=(ball.vx-surface.vx)*nx+(ball.vy-surface.vy)*ny;
      if(vn>=0)return 0;
      const e=vn<-35?(material.restitution??.72):0;
      const powered=material.boost&&this.time-material.lastHit>.12&&vn<-45;
      const release=material.releaseImpulse&&Math.hypot(ball.vx,ball.vy)<100&&this.time-material.lastRelease>.65;
      if(release)material.lastRelease=this.time;
      const j=-(1+e)*vn+(powered?material.boost:0)+(release?material.releaseImpulse:0);
      const tx=-ny,ty=nx,vt=(ball.vx-surface.vx)*tx+(ball.vy-surface.vy)*ty-(ball.omega||0)*ball.r;
      const jt=clamp(-vt/3.5,-(material.friction??.12)*j,(material.friction??.12)*j);
      ball.vx+=nx*j+tx*jt;ball.vy+=ny*j+ty*jt;
      ball.omega=(ball.omega||0)-jt/(.4*ball.r);
      if(-vn>45&&this.time-material.lastHit>.12){material.lastHit=this.time;this.onHit(material,-vn);}
      return j;
    }
    enabled(shape,ball){return !shape.disabled&&!shape.ignoreBalls?.has(ball.id);}
    resolve(ball,shape,surface){
      if(!this.enabled(shape,ball))return;
      const box=shape.bounds;
      if(box&&(ball.x+ball.r<box.minX||ball.x-ball.r>box.maxX||ball.y+ball.r<box.minY||ball.y-ball.r>box.maxY))return;
      const c=contact(ball,shape);if(!c)return;
      ball.x+=c.nx*(c.depth+.005);ball.y+=c.ny*(c.depth+.005);
      this.impulse(ball,c.nx,c.ny,shape,surface?surface(c):undefined);
    }
    move(ball,dt){
      // Repair spawned/round-off overlap before continuous collision detection.
      for(let pass=0;pass<3;pass++)for(const s of this.shapes)this.resolve(ball,s);
      let remaining=dt;
      for(let count=0;count<12&&remaining>EPS;count++){
        const dx=ball.vx*remaining,dy=ball.vy*remaining;let first=null;
        for(const s of this.shapes){if(!this.enabled(s,ball))continue;
          const box=s.bounds;
          if(Math.max(ball.x,ball.x+dx)+ball.r<box.minX||Math.min(ball.x,ball.x+dx)-ball.r>box.maxX||Math.max(ball.y,ball.y+dy)+ball.r<box.minY||Math.min(ball.y,ball.y+dy)-ball.r>box.maxY)continue;
          for(const [a,b] of s.edges){
          const h=sweepSegment(ball,dx,dy,a,b,s.radius||0);
          if(h&&(!first||h.t<first.t))first={...h,shape:s};
          }
        }
        if(!first){ball.x+=dx;ball.y+=dy;return;}
        ball.x+=dx*first.t+first.nx*.005;ball.y+=dy*first.t+first.ny*.005;
        this.impulse(ball,first.nx,first.ny,first.shape);
        remaining*=1-first.t;
      }
      // At pathological multi-contact corners, keep the resolved position rather than tunnel.
    }
    updateFlippers(flippers,keys,h){
        for(let i=0;i<flippers.length;i++){
          const f=flippers[i],active=keys[i?'right':'left'],target=f.rest+(active?-f.side*.86:0),delta=target-f.a;
          const speed=active?13:7,accel=active?190:95;
          const desired=Math.sign(delta)*Math.min(speed,Math.sqrt(2*accel*Math.abs(delta)));
          f.omega=(f.omega||0)+clamp(desired-(f.omega||0),-accel*h,accel*h);
          const next=f.a+f.omega*h;
          if((target-f.a)*(target-next)<=0){f.a=target;f.omega=0;}else f.a=next;
        }
    }
    // Balls deliberately pass through each other; only board/flipper contacts remain.
    step(ball,flippers,keys,dt){return this.stepMany([ball],flippers,keys,dt);}
    stepMany(balls,flippers,keys,dt,select=()=>{}){
      const maxTip=flippers.reduce((v,f)=>Math.max(v,Math.abs(f.omega||0)*f.length),0);
      let maxSpeed=0;for(const b of balls)maxSpeed=Math.max(maxSpeed,Math.hypot(b.vx,b.vy));
      const steps=Math.max(1,Math.ceil((maxSpeed+maxTip+2500)*dt/3));
      const h=dt/steps,loss=Math.exp(-this.drag*h),angularLoss=Math.exp(-.35*h);
      for(let step=0;step<steps;step++){
        this.time+=h;
        this.updateFlippers(flippers,keys,h);
        // Each rigid flipper has one geometry for this shared substep.
        const flipperShapes=balls.length?flippers.map(f=>{
          const end=[f.x+Math.cos(f.a)*f.length,f.y+Math.sin(f.a)*f.length];
          return {edges:[[[f.x,f.y],end]],radius:f.radius,restitution:.68,friction:.24,lastHit:f.lastHit??-Infinity};
        }):[];
        for(const ball of balls){select(ball);
        ball.vy+=this.gravity*h;
        ball.vx*=loss;ball.vy*=loss;ball.omega=(ball.omega||0)*angularLoss;
        this.move(ball,h);
        for(let pass=0;pass<3;pass++){
          for(let fi=0;fi<flippers.length;fi++){
            const f=flippers[fi],shape=flipperShapes[fi];
            this.resolve(ball,shape,c=>({vx:-f.omega*(c.y+c.ny*f.radius-f.y),vy:f.omega*(c.x+c.nx*f.radius-f.x)}));
            f.lastHit=shape.lastHit;
          }
          for(const s of this.shapes)this.resolve(ball,s);
        }
        ball.angle=(ball.angle||0)+(ball.omega||0)*h;
        }

      }
    }
  }
  root.PinballPhysics={World,ellipse,edges,contact,sweepSegment,closest};
})(globalThis);
