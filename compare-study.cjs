const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(process.argv[2]),game=process.argv[3],output=process.argv[4];require(path.join(root,'physics.js'));const Study=require('./engagement.js');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})});const els={};const el=id=>els[id]??={style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};
const c={PinballPhysics,document:{getElementById:el,querySelector:el},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,Study};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'rules.js'),'utf8')+'\n'+fs.readFileSync(game,'utf8')+`
const data=[];const onHit=world.onHit;
for(let trial=0;trial<24;trial++){
 start();const meter=new Study();meter.enable(true);meter.start('paired-v1','simulation');let readyTime=0;
 world.onHit=(s,v)=>{if(s.n)meter.event('hit',s.id);onHit(s,v);};
 for(let step=0;step<240*90&&state!=='over';step++){
  const t=step/240,prevBalls=balls,prevState=state;
  keys.left=trial<12&&ball.y>1060&&ball.x<475&&Math.floor(t*8)%3!==0;
  keys.right=trial<12&&ball.y>1060&&ball.x>=475&&Math.floor(t*8)%3!==0;
  if(state==='ready'){readyTime+=1/240;if(readyTime>=.5){beginCharge();charge=.45+(trial%12)*.55/11;ball.y=1240+110*charge;launch();meter.event('launches');readyTime=0;}}
  meter.tick(1/240,['play','launch','roulette'].includes(state));physics(1/240);updatePresentation(1/240);
  if(prevState==='launch'&&state==='ready')meter.event('returns');if(balls<prevBalls)meter.event('drains');
 }
 meter.current.nudges=sessionRecoveries;meter.finish(state==='over');data.push({trial,power:.45+(trial%12)*.55/11,controller:trial<12?'reactive':'passive',score,balls,state,...meter.rows[0],risk:Study.risk(meter.rows[0])});
}
globalThis.results=data;`,c);
fs.writeFileSync(output,JSON.stringify({protocol:'paired-v1',dt:1/240,capSeconds:90,sampleSize:24,seed:'deterministic/no random gameplay',source:'simulation, not humans',rows:c.results},null,2));
const rows=c.results;console.log(JSON.stringify({n:rows.length,completed:rows.filter(r=>r.complete).length,launches:rows.reduce((a,r)=>a+r.launches,0),returns:rows.reduce((a,r)=>a+r.returns,0),meanRisk:rows.reduce((a,r)=>a+r.risk.score,0)/rows.filter(r=>r.risk.score!==null).length,nudges:rows.reduce((a,r)=>a+r.nudges,0)},null,2));
