/* Deterministic input policy only; never changes score, ball velocity or rules. */
class PinballAuto {
 constructor(){this.running=false;this.reason='OFF';this.started=0;this.completed=0;this.history=[];}
 begin({seed=1,runs=3,limit=90}={}){this.seed=(Number(seed)>>>0)||1;this.random=this.seed;this.runs=Math.max(1,Math.min(10,Math.floor(Number(runs)||3)));this.limit=Math.max(10,Math.min(180,Number(limit)||90));this.started=0;this.completed=0;this.elapsed=0;this.wait=0;this.history=[];this.running=true;this.reason='RUNNING';this.inGame=false;}
 next(){let x=this.random;x^=x<<13;x^=x>>>17;x^=x<<5;this.random=x>>>0;return this.random/4294967296;}
 stop(reason='OFF'){this.running=false;this.reason=reason;return {left:false,right:false};}
 tick(dt,s){
  if(!this.running)return null;
  if(!Number.isFinite(dt)||dt<0)return null;
  if(s.state==='paused')return {stop:'PAUSED'};
  if(!this.inGame){
   this.started++;this.inGame=true;this.elapsed=0;this.wait=0;this.phase=this.next()*.3;
   if(s.state==='intro'||s.state==='over')return {start:true,left:false,right:false};
  }
  if(s.state==='over'){
   this.completed++;this.history.push({run:this.started,seconds:+this.elapsed.toFixed(3),score:s.score,complete:true});this.inGame=false;
   if(this.completed>=this.runs)return {stop:'DONE'};
   return {left:false,right:false};
  }
  this.elapsed+=dt;
  if(this.elapsed>=this.limit){this.history.push({run:this.started,seconds:+this.elapsed.toFixed(3),score:s.score,complete:false});return {stop:'TIME LIMIT'};}
  if(s.state==='ready'){this.wait+=dt;if(this.wait>=.65){this.wait=0;return {launch:[60,75,90,100][Math.floor(this.next()*4)],left:false,right:false};}}
  else this.wait=0;
  const pulse=((this.elapsed+this.phase)%.32)<.055,near=s.state==='play'&&s.y>1060&&s.y<1280;
  return {left:near&&pulse&&s.x<475,right:near&&pulse&&s.x>=475};
 }
}
globalThis.PinballAuto=PinballAuto;if(typeof module!=='undefined')module.exports=PinballAuto;
