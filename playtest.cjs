const fs=require('fs'),vm=require('vm');require('./physics.js');
const gl=new Proxy({}, {get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})});
const elements={},listeners={};const el=id=>elements[id]??={textContent:'',hidden:false,style:{setProperty(){}},querySelector:()=>({}),setAttribute(){},getContext:()=>gl};
const context={PinballPhysics,document:{getElementById:el,querySelector:el},window:{addEventListener(name,fn){listeners[name]=fn;}},localStorage:{getItem(){},setItem(){}},Image:class{},performance:{now:()=>0},requestAnimationFrame(){},console,Math};vm.createContext(context);
vm.runInContext(fs.readFileSync('rules.js','utf8')+'\n'+fs.readFileSync('game.js','utf8')+`
const results=[];
for(let trial=0;trial<24;trial++){
 start();beginCharge();launch();launchSpeed=1450+(trial%12)*450/11;
 let stagnant=0,anchor={x:0,y:0},time=0,lowest=0;
 while(time<35&&balls===3){
  keys.left=trial<12&&ball.y>1060&&ball.x<475&&Math.floor(time*8)%3!==0;
  keys.right=trial<12&&ball.y>1060&&ball.x>=475&&Math.floor(time*8)%3!==0;
  physics(1/240);updatePresentation(1/240);time+=1/240;lowest=Math.max(lowest,state==='play'?ball.y:0);
  if(state==='play'){
   if(Math.hypot(ball.x-anchor.x,ball.y-anchor.y)>30){anchor={x:ball.x,y:ball.y};stagnant=0;}else stagnant+=1/240;
   if(stagnant>3){results.push({trial,stuck:[Math.round(ball.x),Math.round(ball.y)],speed:Math.round(Math.hypot(ball.vx,ball.vy)),lowest:Math.round(lowest)});break;}
  }
 }
 if(stagnant<=3)results.push({trial,result:balls<3?'drain':'active',lowest:Math.round(lowest),score,nudges:sessionRecoveries});
}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.stuck))throw Error('Sustained trap found');console.log('PASS 24 launches: 12 flipper-controlled and 12 passive at varied power, no 3-second traps');
`,context);
