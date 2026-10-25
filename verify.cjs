const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
require('./physics.js');
const {World,ellipse,contact}=globalThis.PinballPhysics;
const ball=(x,y,vx=0,vy=0)=>({x,y,vx,vy,r:17,omega:0,angle:0});
const wall=(id,points,extra={})=>({id,points,restitution:.8,friction:0,...extra});
const flipper=(side=1)=>({x:0,y:0,a:side===1?.48:Math.PI-.48,rest:side===1?.48:Math.PI-.48,side,omega:0,length:175,radius:30});
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS',name);}
test('swept collision: 50,000 px/s cannot pass through thin rail',()=>{
 const w=new World([wall('rail',[[100,-500],[100,500]])]);w.gravity=0;w.drag=0;const b=ball(0,0,50000,0);w.step(b,[],{},1/240);assert(b.x<83);assert(b.vx<0);assert(Math.abs(b.vx+40000)<1e-6);
});
test('oblique wall hit conserves tangential velocity and loses normal energy',()=>{
 const w=new World([wall('rail',[[100,-500],[100,500]])]);w.gravity=0;w.drag=0;const b=ball(80,0,500,130);w.step(b,[],{},.02);assert(Math.abs(b.vx+400)<1e-6);assert(Math.abs(b.vy-130)<1e-6);
});
test('rounded endpoint collision',()=>{
 const w=new World([wall('end',[[100,0],[100,100]])]);w.gravity=0;w.drag=0;const b=ball(60,-10,1000,0);w.step(b,[],{},.05);assert(b.vx<1000);assert(b.vy<0);
});
test('embedded ball is expelled from a solid polygon',()=>{
 const w=new World([{...wall('box',[[0,0],[100,0],[100,100],[0,100]]),closed:true}]);w.gravity=0;w.drag=0;const b=ball(50,20);w.step(b,[],{},1/240);assert.equal(contact(b,w.shapes[0]),null);assert(b.y<=-17);
});
test('friction transfers tangential energy into ball spin',()=>{
 const w=new World([wall('rail',[[100,-500],[100,500]],{friction:.3})]);w.gravity=0;w.drag=0;const b=ball(80,0,500,300);w.step(b,[],{},.01);assert(Math.abs(b.omega)>0);assert(Math.abs(b.vy)<300);
});
test('held flipper has no artificial launch kick',()=>{
 const w=new World();w.gravity=0;w.drag=0;const f=flipper();f.a=f.rest-.86;
 const b=ball(90*Math.cos(f.a)+46*Math.sin(f.a),90*Math.sin(f.a)-46*Math.cos(f.a),0,150);
 w.step(b,[f],{left:true},1/240);assert(Math.hypot(b.vx,b.vy)<=150.01);
});
test('moving flipper transfers rotation into ball velocity',()=>{
 const w=new World();w.gravity=0;w.drag=0;const f=flipper();const b=ball(125*Math.cos(f.a)+47*Math.sin(f.a),125*Math.sin(f.a)-47*Math.cos(f.a),0,80);
 for(let i=0;i<20;i++)w.step(b,[f],{left:true},1/240);
 assert(b.vy<-300);assert(Number.isFinite(b.vx));
});
test('frame partition independence at fixed stepping',()=>{
 function sim(groups){const w=new World([wall('floor',[[-1000,400],[1000,400]])]),b=ball(0,0,160,50);for(const group of groups)for(let i=0;i<group;i++)w.step(b,[],{},1/240);return b;}
 const a=sim(Array(60).fill(4)),b=sim(Array(30).fill(8));assert.deepEqual(a,b);
});
test('resting contact settles without repeated bounce or scoring',()=>{
 let hits=0;const w=new World([wall('floor',[[-1000,100],[1000,100]])],()=>hits++),b=ball(0,70);
 for(let i=0;i<2400;i++)w.step(b,[],{},1/240);
 assert(Math.abs(b.y-83)<.1);assert(Math.abs(b.vy)<3);const settledHits=hits;for(let i=0;i<2400;i++)w.step(b,[],{},1/240);assert.equal(hits,settledHits);
});
test('passive geometry never adds kinetic energy',()=>{
 const w=new World([wall('left',[[-100,-200],[-100,200]],{friction:.2}),wall('right',[[100,-200],[100,200]],{friction:.2}),wall('top',[[-100,-200],[100,-200]],{friction:.2}),wall('bottom',[[-100,200],[100,200]],{friction:.2})]);w.gravity=0;w.drag=0;
 const b=ball(0,0,1100,700);let energy=b.vx*b.vx+b.vy*b.vy;
 for(let i=0;i<2400;i++){w.step(b,[],{},1/240);const next=b.vx*b.vx+b.vy*b.vy+.4*b.r*b.r*b.omega*b.omega;assert(next<=energy+1e-5);energy=next;}
});
test('48 fast flipper impacts: both sides, angles and contact positions',()=>{
 for(const side of [1,-1])for(const angle of [.48,-.38])for(const fraction of [.15,.4,.7,.9])for(const speed of [500,2000,10000]){
  const w=new World();w.gravity=0;w.drag=0;const f=flipper(side);f.a=f.rest=side===1?angle:Math.PI-angle;
  const nx=Math.sin(f.a)*side,ny=-Math.cos(f.a)*side;
  const b=ball(Math.cos(f.a)*175*fraction+nx*52,Math.sin(f.a)*175*fraction+ny*52,-nx*speed,-ny*speed);
  w.step(b,[f],{},.03);
  const q=PinballPhysics.closest(b.x,b.y,[0,0],[Math.cos(f.a)*175,Math.sin(f.a)*175]);
  assert((b.x-q.x)*nx+(b.y-q.y)*ny>46.9,'ball crossed flipper');
  assert(b.vx*nx+b.vy*ny>0,'ball did not rebound');
 }
});
test('rotating flipper intercepts high-speed approaching ball',()=>{
 for(const side of [1,-1])for(const fraction of [.3,.6,.85])for(const speed of [600,3000,6000]){
  const w=new World();w.gravity=0;w.drag=0;const f=flipper(side),nx=Math.sin(f.a)*side,ny=-Math.cos(f.a)*side;
  const b=ball(Math.cos(f.a)*175*fraction+nx*50,Math.sin(f.a)*175*fraction+ny*50,-nx*speed,-ny*speed);
  w.step(b,[f],{left:true},.02);
  const q=PinballPhysics.closest(b.x,b.y,[0,0],[Math.cos(f.a)*175,Math.sin(f.a)*175]);
  assert((b.x-q.x)*Math.sin(f.a)*side-(b.y-q.y)*Math.cos(f.a)*side>46.8);
 }
});
const elements={};const gl=new Proxy({}, {get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})});
const el=id=>elements[id]??={textContent:'',hidden:false,style:{setProperty(){}},querySelector:()=>({}),setAttribute(){},getContext:()=>gl};
const context={PinballPhysics,document:{getElementById:el,querySelector:el},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},Image:class{},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(context);
vm.runInContext(fs.readFileSync('rules.js','utf8')+'\n'+fs.readFileSync('game.js','utf8')+`
start();assert.equal(state,'ready');beginCharge();for(let i=0;i<288;i++)physics(1/240);assert(charge>.99);assert.equal(state,'ready');assert(ball.y>1349);launch();let previous={x:ball.x,y:ball.y};
for(let i=0;i<1200&&state==='launch';i++){physics(1/240);assert(Math.hypot(ball.x-previous.x,ball.y-previous.y)<17,'launch must not teleport');previous={x:ball.x,y:ball.y};}
assert.equal(state,'play');assert(ball.x<300);console.log('PASS continuous shooter rail and playfield entry');
for(let i=0;i<2400&&state==='play';i++){physics(1/240);assert(Number.isFinite(ball.x)&&Number.isFinite(ball.vy));}
start();beginCharge();physics(.05);assert.equal(state,'ready');assert(charge>0&&charge<.1);launch();const shortSpeed=launchSpeed;assert(shortSpeed<1500);
start();beginCharge();for(let i=0;i<400;i++)physics(1/240);assert.equal(charge,1);assert.equal(state,'ready');launch();assert.equal(launchSpeed,1900);assert(launchSpeed>shortSpeed);
start();beginCharge();physics(.2);pause();assert.equal(charging,false);assert.equal(charge,0);launch();assert.equal(state,'paused');pause();assert.equal(state,'ready');assert.equal(ball.y,1240);
assert.equal(BALL_TIME_SCALE,2);console.log('PASS charge stays armed until release, variable strength, max clamp, pause cancellation and 2x clock');
start();state='play';Object.assign(ball,{x:217,y:434,vx:0,vy:400});for(let i=0;i<12;i++)physics(1/240);assert(rules.bets.black>=1,'bumper adds black BET');assert.equal(score,0);
for(let n=0;n<3;n++){balls=2-n;state='play';ball.x=470;ball.y=1440;physics(1/240);}assert.equal(state,'over');assert.equal(balls,0);
start();pause();assert.equal(state,'paused');pause();assert.equal(state,'ready');console.log('PASS scoring, 3-ball game over, restart and pause');
// The lower mouth admits balls; the upper walnut rim is solid.
const rim=world.shapes.find(s=>s.id==='roulette-rim');assert(rim);
const rw=new World([{...rim,disabled:false}]);rw.gravity=0;rw.drag=0;
const mouth={x:470,y:1060,vx:0,vy:-500,r:17,omega:0};rw.step(mouth,[],{},.22);assert(mouth.y<960&&mouth.vy<0);
const topHit={x:470,y:660,vx:0,vy:500,r:17,omega:0};rw.step(topHit,[],{},.15);assert(topHit.vy<0);
const spindle=world.shapes.find(s=>s.id==='roulette-spindle');assert(spindle);
const rotorWorld=new World([spindle]);rotorWorld.gravity=0;rotorWorld.drag=0;
const entering={x:390,y:1070,vx:0,vy:-500,r:17,omega:0};rotorWorld.step(entering,[],{},.5);assert(entering.y<850&&entering.vy<0);
const centerHit={x:470,y:800,vx:0,vy:600,r:17,omega:0};rotorWorld.step(centerHit,[],{},.1);assert(centerHit.vy<0);
roulette.light=2;roulette.angle=.7;roulette.angularSpeed=.12;animateRoulette(.016);assert(roulette.angle>.7&&roulette.angularSpeed>.12&&roulette.angularSpeed<.3);
roulette.light=0;roulette.angularSpeed=2;const previousAngle=roulette.angle;animateRoulette(.016);assert(roulette.angle>previousAngle&&roulette.angularSpeed<2&&roulette.angularSpeed>1.9);
start();state='play';Object.assign(ball,{x:410,y:880,vx:150,vy:100});updateRoulette(.01);assert.equal(state,'play','zero BET cannot capture');rules.bets.red=1;syncRouletteGate();updateRoulette(.01);assert.equal(score,0,'no award on entry');assert.equal(state,'roulette');
const rx=ball.x,ry=ball.y;physics(1/240);assert(Math.hypot(ball.x-rx,ball.y-ry)<3,'capture position is continuous');
for(let i=0;i<1440&&roulette.phase==='rolling';i++)physics(1/240);
assert.equal(roulette.phase,'resolved');assert.equal(score,0);assert.equal(rules.bets.black,0);assert.equal(ball.vx,0);assert.equal(ball.vy,0);
for(let i=0;i<120;i++)physics(1/240);assert.equal(score,0,'zero BET pays zero once');assert.equal(state,'play');
assert(!world.shapes.some(s=>['coins-left','coins-right','cards','roulette'].includes(s.id)),'old-image colliders removed');
assert.equal(world.shapes.find(s=>s.id==='dice').x,267);assert.equal(world.shapes.find(s=>s.id==='chips-stack').x,672);
console.log('PASS revised-image positions, open roulette, spindle bounce, smooth rotation and entry scoring');
// Exercise every traced solid from eight approach directions; no residual penetration.
for(const shape of world.shapes.filter(s=>s.closed)){
 const cx=shape.points.reduce((n,p)=>n+p[0],0)/shape.points.length,cy=shape.points.reduce((n,p)=>n+p[1],0)/shape.points.length;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,b={x:cx+Math.cos(a)*200,y:cy+Math.sin(a)*200,vx:-Math.cos(a)*5000,vy:-Math.sin(a)*5000,r:17,omega:0};
  const isolated=new World([{...shape,disabled:false,ignoreBalls:new Set()}]);isolated.gravity=0;isolated.drag=0;isolated.step(b,[],{},.05);
  assert.equal(PinballPhysics.contact(b,isolated.shapes[0]),null,shape.id);
 }
}
console.log('PASS all traced obstacles: eight-direction high-speed sweeps');
`,context);
console.log('Physics regression checks complete.');
vm.runInContext(`
start();for(let i=0;i<40;i++)add(100,217,524);assert(particles.length<=100);
updatePresentation(1);assert.equal(particles.length,0,'expired effects released');
rules.collect('chip-left');rules.collect('roulette');rules.collect('chip-right');rules.beginSpin(1250);spinTime=1.5;spinElapsed=0;spinResult=['7','7','7'];const beforeJackpot=score;
for(let i=0;i<100;i++)updatePresentation(.02);
assert.equal(score,beforeJackpot,'SPIN never pays directly');
updatePresentation(2);assert.equal(score,beforeJackpot);
start();assert.equal(spinTime,0);assert.equal(particles.length,0);
console.log('PASS effect cap, cleanup, sequential spin completion and multiplier-only settlement');
`,context);

vm.runInContext(`
start();rules.collect('chip-left');rules.collect('roulette');rules.collect('chip-right');
const spinShape=world.shapes.find(s=>s.id==='spin');world.onHit(spinShape,1250);
assert.equal(rules.bets.black,1);assert(rules.pending.jackpot);const pendingScore=score;
balls=0;state='play';ball.x=470;ball.y=1440;physics(1/240);assert.equal(state,'settling');
pause();assert.equal(state,'paused');pause();assert.equal(state,'settling');
for(let i=0;i<110;i++)updatePresentation(.02);
assert.equal(state,'over');assert.equal(score,pendingScore);assert.equal(rules.pending,null);
updatePresentation(1);assert.equal(score,pendingScore);start();assert.equal(rules.count,0);
console.log('PASS final-ball pending multiplier, pause/resume, single settlement and restart');
`,context);

vm.runInContext(`
const shots=[];
for(const power of [0,.25,.5,.75,1]){start();beginCharge();charge=power;ball.y=1240+110*power;launch();let top=ball.y;for(let i=0;i<2400&&state==='launch';i++){physics(1/240);top=Math.min(top,ball.y);}shots.push({power,state,top:Math.round(top),speed:Math.round(Math.hypot(ball.vx,ball.vy))});assert.equal(balls,10);}
assert.equal(shots[0].state,'ready');assert.equal(shots[1].state,'ready');assert.equal(shots[4].state,'play');assert(shots[0].top>shots[1].top);assert(shots[3].speed<shots[4].speed);console.log('PASS real launch choices',JSON.stringify(shots));
`,context);

vm.runInContext(`
for(const [color,degrees,expected] of [['black',0,2],['red',11,4],['green',271,6]]){
 start();rules.bets={black:1,red:2};rules.multiplier=2;roulette.settlementId=rules.enterRoulette();ball.phase='roulette';roulette.owner=ball.id;state='roulette';roulette.phase='rolling';roulette.angle=0;roulette.angularSpeed=0;roulette.radius=125;roulette.orbit=degrees*Math.PI/180;roulette.speed=0;roulette.stable=.3;ball.x=470+Math.cos(roulette.orbit)*125;ball.y=890+Math.sin(roulette.orbit)*125*.68;stepRoulette(.01);assert.equal(balls+rainPending+overflowScore/10,10+expected);assert.equal(score,Math.max(0,10+expected-9-(MAX_LIVE_BALLS-1))*10,'only capacity overflow becomes score');assert.deepEqual(JSON.stringify(rules.bets),JSON.stringify({black:0,red:0}));assert.equal(rules.multiplier,1);stepRoulette(.01);assert.equal(balls+rainPending+overflowScore/10,10+expected,'repeat stop cannot pay twice');
}
start();rules.bets.black=300;rules.multiplier=3;balls=2;state='play';ball.y=1500;physics(1/240);assert.equal(rules.bets.black,300);assert.equal(rules.multiplier,3);start();assert.equal(rules.bets.black,0);assert.equal(rules.multiplier,1);console.log('PASS real roulette black/red/green payout/reset and ball-loss/replay lifecycle');
`,context);
