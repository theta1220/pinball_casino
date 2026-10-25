const assert=require('node:assert/strict'),Skin=require('./idle-skin.js');require('./asset-manifest.js');
const results=[];
for(const [key,size] of [['character-bartender-idle',560],['character-goblin-idle',250],['character-waiter-idle',540]]){
 const a=globalThis.PINBALL_ASSETS[key],s=new Skin();let worst=0,maxCorrection=0;
 for(let i=0;i<12;i++){
  const j=(i+1)%12,head=a.poseLandmarks[i].head,next=a.poseLandmarks[j].head;
  s.time=(i+1)/12-(a.phase||0)-1e-8;if(s.time<0)s.time+=1;
  const before=s.offset(key,...head,size,size,a);
  s.time=(i+1)/12-(a.phase||0)+1e-8;if(s.time<0)s.time+=1;
  const after=s.offset(key,...next,size,size,a);
  for(let axis=0;axis<2;axis++){
   const x=(head[axis]-a.frameAnchors[i][axis])*size+before[axis],y=(next[axis]-a.frameAnchors[j][axis])*size+after[axis];
   worst=Math.max(worst,Math.abs(x-y));maxCorrection=Math.max(maxCorrection,Math.abs(before[axis]),Math.abs(after[axis]));
  }
 }
 assert(worst<.001);assert(maxCorrection<=4);
 s.reduced=true;assert.deepEqual(s.offset(key,.5,.3,size,size,a),[0,0]);s.reduced=false;assert.deepEqual(s.offset('bumper',.5,.3,size,size,a),[0,0]);
 results.push({key,worstLandmarkBoundaryPx:worst,maxCorrectionPx:maxCorrection});
}
console.log('PASS all 36 authored pose boundaries including loop seams, midpoint continuity, <=4px cap, rigid/reduced',JSON.stringify(results));
