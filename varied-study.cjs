const fs=require('fs'),vm=require('vm'),path=require('path');const root=__dirname;require(root+'/physics.js');const Study=require(root+'/engagement.js');const game=process.argv[2],route=process.argv[3],out=process.argv[4],capability=process.argv[5]==='tap';
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};const c={PinballPhysics,Study,route,capability,document:{getElementById:el,querySelector:el},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math};vm.createContext(c);
vm.runInContext(fs.readFileSync(root+'/rules.js','utf8')+'\n'+fs.readFileSync(game,'utf8')+`
const results=[],original=world.onHit;
for(let trial=0;trial<(capability?12:72);trial++){
 const seed=1+Math.floor(trial/9),style=['passive','reactive','alternating'][Math.floor(trial/3)%3],intended=capability?.75:[.6,.8,1][trial%3];
 const actual=capability&&route==='held'?.03:intended;start();const meter=new Study();meter.enable(true);meter.start('varied-v2','simulation');let readyWait=0,entered=false;
 world.onHit=(s,v)=>{if(s.n)meter.event('hit',s.id);original(s,v);};
 for(let n=0;n<240*(capability?12:90)&&state!=='over';n++){
  const t=n/240,phase=(seed*.137)%1,priorState=state,oldBalls=balls;
  keys.left=style==='reactive'?ball.y>1060&&ball.x<475&&Math.floor((t+phase)*8)%3!==0:style==='alternating'&&Math.floor((t+phase)*5)%2===0;
  keys.right=style==='reactive'?ball.y>1060&&ball.x>=475&&Math.floor((t+phase)*8)%3!==0:style==='alternating'&&Math.floor((t+phase)*5)%2!==0;
  if(state==='ready'){readyWait+=1/240;if(readyWait>=.5){if(route==='selected'){$('launchPowerChoice').value=String(actual*100);launchChoice();}else{beginCharge();charge=actual;ball.y=1240+110*actual;launch();}meter.event('launches');readyWait=0;}}
  meter.tick(1/240,['play','launch','roulette'].includes(state));physics(1/240);updatePresentation(1/240);
  if(state==='play')entered=true;if(priorState==='launch'&&state==='ready')meter.event('returns');if(balls<oldBalls)meter.event('drains');
 }
 meter.current.nudges=sessionRecoveries;meter.finish(state==='over');results.push({trial,seed,style,intended,actual,entered,score,balls,state,...meter.rows[0],risk:Study.risk(meter.rows[0])});
}
globalThis.results=results;`,c);
const r=c.results,scored=r.filter(x=>x.risk.score!==null);const summary={n:r.length,entered:r.filter(x=>x.entered).length,completed:r.filter(x=>x.complete).length,scored:scored.length,unscored:r.length-scored.length,launches:r.reduce((s,x)=>s+x.launches,0),returned:r.reduce((s,x)=>s+x.returns,0),meanRisk:scored.length?scored.reduce((s,x)=>s+x.risk.score,0)/scored.length:null,nudges:r.reduce((s,x)=>s+x.nudges,0)};fs.writeFileSync(out,JSON.stringify({protocol:capability?'tap-constraint-v2':'varied-v2',route,capSeconds:capability?12:90,dt:1/240,seeds:'1..8 deterministic input phase offsets; no gameplay RNG',source:'simulation, not humans',summary,rows:r},null,2));console.log(JSON.stringify(summary));
