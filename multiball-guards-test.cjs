const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={value:id==='autoSeed'?'2026':'developer',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};
const ctx={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(ctx);

vm.runInContext(['rules.js','magic-trail.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
for(const [color,angle,n] of [['black',0,4],['red',11,6],['green',271,10]]){
 start();balls=0;state='play';ball.phase='play';rules.bets={black:2,red:3};rules.multiplier=2;syncRouletteGate();Object.assign(ball,{x:410,y:880,vx:100,vy:0});const owner=ball;updateRoulette(.01);const id=roulette.owner;
 const second=attachBall({x:520,y:880,vx:100,vy:0,r:17,omega:0,angle:0},'play');ball=second;updateRoulette(.01);assert.equal(roulette.owner,id);assert.equal(second.phase,'play');ball=owner;
 roulette.orbit=angle*Math.PI/180;roulette.angle=0;roulette.angularSpeed=0;roulette.radius=125;roulette.speed=0;roulette.stable=.3;ball.x=470+Math.cos(roulette.orbit)*125;ball.y=890+Math.sin(roulette.orbit)*125*.68;stepRoulette(.01);
 assert.equal(balls,Math.min(n,9));assert.equal(score,0);assert.equal(goReservations,0);assert.equal(goLaunched,0);assert.equal(rules.multiplier,1);assert(world.shapes.find(s=>s.id==='roulette-rim').disabled);stepRoulette(.01);assert.equal(balls,Math.min(n,9));
 rainWait=100; // Isolate capture release; rain lifecycle has its own test.
 for(let i=0;i<120;i++)physics(1/240);assert.equal(owner.phase,'play');assert.equal(roulette.owner,null);assert.equal(goLaunched,0);assert.equal(liveBalls.length,2);
 const expectedGo=committedSlots()<MAX_LIVE_BALLS?1:0;awardBalls(7);assert.equal(balls,Math.min(n,9)+7);assert(go());assert.equal(balls,Math.min(n,9)+6);assert.equal(goReservations,expectedGo);awardBalls(5);assert.equal(goReservations,expectedGo);queueLaunch(1);assert.equal(goLaunched,expectedGo);
}
start();balls=0;state='play';ball.phase='play';ball.x=470;ball.y=1100;physics(1/240);assert.notEqual(state,'over');awardBalls(2);assert(go());assert.equal(balls,1);pause();const stock=balls;physics(1);assert.equal(balls,stock);pause();
goReservations=0;balls=0;liveBalls.forEach(b=>{b.phase='play';b.x=470;b.y=1500;});physics(1/240);assert.equal(state,'over');assert(go());assert.equal(balls,9);assert.equal(goReservations,1);assert.equal(goLaunched,0);
assert(!fsSource.includes('ballQueue'));assert(!fsSource.includes('rewardLaunched'));
console.log('PASS black/red/green stock credit then threshold rain, multi-entry/reset, multiple payouts, zero-stock recovery, queued GO plus win, replay exactly one reservation');
`,Object.assign(ctx,{fsSource:fs.readFileSync('game.js','utf8')}));