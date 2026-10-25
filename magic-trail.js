/* Artistic points/lines, never status markers. Fixed-step, bounded and deterministic. */
class PinballMagicTrail {
 constructor(){this.clear();this.seed=17;}
 clear(){this.points=[];this.sparks=[];this.last=null;this.clock=0;}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 update(dt,ball,state,reduced=false){
  if(!['play','launch','roulette'].includes(state)||reduced){this.clear();return;}
  if(!Number.isFinite(dt)||dt<=0)return;
  this.clock+=dt;for(const p of this.points)p.age+=dt;
  for(const p of this.sparks){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx+=Math.sin(p.phase+p.age*8)*40*dt;p.vy+=20*dt;}
  this.points=this.points.filter(p=>p.age<.22);this.sparks=this.sparks.filter(p=>p.age<.55);
  if(this.last&&Math.hypot(ball.x-this.last.x,ball.y-this.last.y)>280)this.clear();
  if(!this.last||Math.hypot(ball.x-this.last.x,ball.y-this.last.y)>7){
   this.points.push({x:ball.x,y:ball.y,age:0});this.last={x:ball.x,y:ball.y};
   if(this.clock>.018){this.clock=0;const a=this.random()*Math.PI*2;this.sparks.push({x:ball.x,y:ball.y,vx:Math.cos(a)*36,vy:Math.sin(a)*36-15,phase:a,age:0});}
  }
  if(this.points.length>32)this.points.splice(0,this.points.length-32);if(this.sparks.length>48)this.sparks.splice(0,this.sparks.length-48);
  while(this.points.length>1&&Math.hypot(ball.x-this.points[0].x,ball.y-this.points[0].y)>180)this.points.shift();
 }
}
globalThis.PinballMagicTrail=PinballMagicTrail;if(typeof module!=='undefined')module.exports=PinballMagicTrail;
