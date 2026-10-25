const fs=require('fs'),vm=require('vm');require('./physics.js');const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})});const el=()=>({style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl});const c={PinballPhysics,document:{getElementById:el,querySelector:el},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math};vm.createContext(c);
vm.runInContext(fs.readFileSync('rules.js','utf8')+'\n'+fs.readFileSync('game.js','utf8')+`

const original=world.onHit;const launchResults=[],flipResults=[];
for(const power of [.6,.65,.7,.75,.8,.85,.9,.95,1]){start();beginCharge();charge=power;ball.y=1240+110*power;launch();let hits=[];world.onHit=(s,v)=>{if(s.n&&hits.length<5)hits.push(s.id);original(s,v)};for(let n=0;n<2400&&state==='launch';n++)physics(1/240);const exit=Math.round(Math.hypot(ball.vx,ball.vy));for(let n=0;n<1800&&state==='play';n++)physics(1/240);launchResults.push({power,exit,hits});console.log('launch',power,exit,hits.join(','));}
world.onHit=original;
for(const delay of [0,.03,.06,.09,.12,.15,.18,.21,.24,.06,.24]){start();state='play';Object.assign(ball,{x:350,y:1120,vx:0,vy:400});let cross=null;for(let n=0;n<240;n++){keys.left=n/240>=delay;physics(1/240);if(ball.y<1060&&ball.vy<0){cross={x:Math.round(ball.x),vx:Math.round(ball.vx),vy:Math.round(ball.vy)};break;}}flipResults.push({delay,cross});console.log('flip',delay,cross);}
if(!launchResults.find(r=>r.power===1).hits.includes('spin'))throw Error('Full launch should reach SPIN in controlled no-flipper case');
if(flipResults[8].cross.x-flipResults[2].cross.x<100)throw Error('Timing does not separate trajectories');
if(JSON.stringify(flipResults[2].cross)!==JSON.stringify(flipResults[9].cross)||JSON.stringify(flipResults[8].cross)!==JSON.stringify(flipResults[10].cross))throw Error('Same timing failed to repeat');
console.log('PASS controlled launch and flipper timing comparison');
`,c);
