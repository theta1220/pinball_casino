/* Presentation-only state: never writes to the physics world. */
class PinballReactions {
  constructor(){this.clear();}
  clear(){this.hits=new Map();this.camera={age:1,x:0,y:0,power:0};}
  hit(id,strength=1,x=470,y=850){
    const power=Math.max(.25,Math.min(1,strength));
    this.hits.set(id,{age:0,power});
    // Coalesce simultaneous hits rather than stacking screen displacement.
    this.camera={age:0,x:x<470?-1:1,y:-.65,power:Math.max(power,this.camera.power*.5)};
  }
  update(dt){for(const [id,h] of this.hits){h.age+=dt;if(h.age>.8)this.hits.delete(id);}this.camera.age+=dt;}
  pose(id,reduced=false){const h=this.hits.get(id);if(!h)return {sx:1,sy:1,brightness:1};const bounce=Math.sin(h.age*22)*Math.exp(-h.age*6)*h.power;return {sx:1,sy:1,angle:reduced?0:.075*bounce,lift:reduced?0:7*bounce,brightness:1+Math.exp(-h.age*19)*h.power*(reduced?.18:.22)};}
  betInvitation(id,bets,multiplier,time,reduced=false,actionable=true){const hasBet=bets.black+bets.red>0;if(!actionable)return {angle:0,brightness:1};const invited=id==='chip-left'||id==='chip-right'||(hasBet&&(id==='roulette'||id==='spin'&&multiplier===1));if(!invited)return {angle:0,brightness:1};const wave=Math.sin(time*.9)**2;return {angle:reduced||id==='roulette'?0:.04*Math.sin(time*3)*wave,brightness:reduced?1.18:1.06+.28*wave};}
  invitation(id,collected,time,reduced=false,actionable=true){
    if(!actionable)return {angle:0,brightness:1};
    const ids=['chip-left','roulette','chip-right'],remaining=ids.filter((_,i)=>!collected[i]);
    const candidates=remaining.length?remaining:['spin'];
    if(!candidates.includes(id))return {angle:0,brightness:1};
    if(reduced)return {angle:0,brightness:1.18};
    // One physical object at a time, a slow double mechanical nod with a smooth light swell.
    const phase=((time%3.6)+3.6)%3.6,chosen=candidates[Math.floor(time/3.6)%candidates.length];
    if(chosen!==id)return {angle:0,brightness:1.06};
    const envelope=Math.sin(Math.PI*phase/3.6)**2;
    return {angle:id==='roulette'?0:.055*Math.sin(phase/3.6*Math.PI*4)*envelope,brightness:1.06+.28*envelope};
  }
  offset(reduced=false){const c=this.camera;if(reduced||c.age>.18)return {x:0,y:0};const wave=Math.sin(c.age*60)*Math.exp(-c.age*23)*c.power*4;return {x:c.x*wave,y:c.y*wave};}
}
class PinballReelMotion {
  constructor(){this.positions=[0,1,2];this.stopped=[true,true,true];}
  startPlan(plan){this.starts=[...plan.starts];this.targets=[...plan.targets];this.durations=[...plan.durations];this.natural=true;this.stopped=[false,false,false];}
  start(result){this.natural=false;this.starts=this.positions.map(p=>((p%3)+3)%3);this.targets=result.map((s,i)=>this.starts[i]-12-((this.starts[i]-s)%3+3)%3);this.stopped=[false,false,false];}
  update(elapsed){const justStopped=[];this.positions=this.starts.map((start,i)=>{const t=Math.min(1,Math.max(0,elapsed/(this.natural?this.durations[i]:1.25+i*.4))),ease=this.natural?t*(2-t):t*t*t*(10+t*(-15+6*t));if(t===1&&!this.stopped[i]){this.stopped[i]=true;justStopped.push(i);}return start+(this.targets[i]-start)*ease;});return justStopped;}
}
globalThis.PinballReactions=PinballReactions;
globalThis.PinballReelMotion=PinballReelMotion;
