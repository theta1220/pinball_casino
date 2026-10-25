/* Frame animation is primary. Only characters receive optional small secondary skin motion. */
class PinballIdleSkin {
 constructor(){this.time=0;this.reduced=false;this.reaction=0;this.toastElapsed=null;this.idleOrigin=0;this.eventStarted=0;this.eventCompleted=0;this.eventCancelled=0;this.eventSource=null;this.eventSources=Object.fromEntries(["gameplay","diagnostic-preview"].map(k=>[k,{started:0,completed:0,cancelled:0,coalesced:0}]));}
 advance(dt,reduced=false){this.reduced=reduced;if(!Number.isFinite(dt)||dt<=0)return;this.time+=Math.min(dt,.04);if(this.toastElapsed!==null){this.toastElapsed+=Math.min(dt,.04);if(this.toastElapsed>=1){this.toastElapsed=null;this.idleOrigin=this.time;this.eventCompleted++;this.eventSources[this.eventSource].completed++;this.eventSource=null;}}this.reaction=Math.max(0,this.reaction-dt);}
 celebrate(source="gameplay"){source=source==="diagnostic-preview"?source:"gameplay";const counts=this.eventSources[source];if(this.toastElapsed!==null){counts.coalesced++;return false;}this.toastElapsed=0;this.eventSource=source;counts.started++;this.eventStarted++;return true;}
 resetClips(){if(this.toastElapsed!==null){this.eventCancelled++;this.eventSources[this.eventSource].cancelled++;}this.eventSource=null;this.toastElapsed=null;this.idleOrigin=this.time;}
 eventReport(){return {scope:"page-lifetime diagnostics; not retention",active:this.toastElapsed!==null,activeSource:this.eventSource,started:this.eventStarted,completed:this.eventCompleted,cancelled:this.eventCancelled,sources:JSON.parse(JSON.stringify(this.eventSources))};}
 characterKey(){return this.toastElapsed!==null&&!this.reduced?'character-bartender-toast':'character-bartender-idle';}
 clock(asset,key){if(key==='character-bartender-toast')return this.toastElapsed??0;if(key==='character-bartender-idle')return this.time-this.idleOrigin;return this.time+(asset?.phase||0);}
 react(amount=1){this.reaction=Math.max(this.reaction,Math.min(1,amount));}
 frame(asset=null,key='coin'){
  if(this.reduced)return 0;
  if(asset?.fps){const seq=asset.sequence;const i=Math.floor(this.clock(asset,key)*asset.fps);return seq[asset.loop===false?Math.min(seq.length-1,i):i%seq.length];}
  return [0,1,2,3,2,1][Math.floor(this.time*5)%6];
 }
 offset(key,u,v,w,h,asset=null){
  if(this.reduced||!key.startsWith('character-')||!asset?.poseLandmarks)return [0,0];
  const tick=this.clock(asset,key)*asset.fps,rawIndex=Math.floor(tick),index=asset.loop===false?Math.min(asset.sequence.length-1,Math.max(0,rawIndex)):rawIndex,fraction=tick-rawIndex;
  const i=asset.sequence[index%asset.sequence.length],j=asset.sequence[asset.loop===false?Math.min(index+1,asset.sequence.length-1):(index+1)%asset.sequence.length];
  const p=asset.sequence[asset.loop===false?Math.max(0,index-1):(index+asset.sequence.length-1)%asset.sequence.length];
  const a=asset.poseLandmarks[i].head,b=asset.poseLandmarks[j].head,previous=asset.poseLandmarks[p].head,ra=asset.frameAnchors[i],rb=asset.frameAnchors[j],rp=asset.frameAnchors[p];
  const weight=Math.exp(-(((u-a[0])/.21)**2+((v-a[1])/.22)**2))*Math.min(1,Math.max(0,(1-v)*5));
  const ease=fraction*fraction*(3-2*fraction),clamp=x=>Math.max(-4,Math.min(4,x));
  return [w,h].map((size,axis)=>{
   const current=a[axis]-ra[axis];
   const start=clamp(((previous[axis]-rp[axis])-current)*size*.5);
   const end=clamp(((b[axis]-rb[axis])-current)*size*.5);
   return weight*(start+(end-start)*ease);
  });
 }
}
globalThis.PinballIdleSkin=PinballIdleSkin;if(typeof module!=='undefined')module.exports=PinballIdleSkin;
