
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');
const {World}=PinballPhysics,b=(x,y,vx=0,vy=0)=>({x,y,vx,vy,r:17,omega:0,angle:0});
const w=new World();w.gravity=w.drag=0;
for(const speed of [100,2000,50000]){const a=b(-40,0,speed,70),c=b(40,0,-speed,70);w.stepMany([a,c],[],{},Math.max(.02,30/speed));assert(a.vx<0&&c.vx>0);assert.equal(a.vy,70);assert(Math.abs(a.vx)<=speed);}
const a=b(0,0),c=b(0,0);w.ballContact(a,c);assert(Math.hypot(a.x-c.x,a.y-c.y)>=34);assert(Number.isFinite(a.x));assert.equal(a.vx,0);
const dense=Array.from({length:12},(_,i)=>b((i%4)*34,Math.floor(i/4)*34,(i%2?1:-1)*200,20));let energy=dense.reduce((n,b)=>n+b.vx*b.vx+b.vy*b.vy,0);
for(let i=0;i<1000;i++){w.stepMany(dense,[],{},1/240);const e=dense.reduce((n,b)=>n+b.vx*b.vx+b.vy*b.vy,0);assert(e<=energy+1e-6);energy=e;assert(dense.every(b=>Number.isFinite(b.x+b.y)));}
console.log('PASS ball pairs: equal-mass impulse, tangential preservation, 50k px/s, coincident centers, dense energy bound');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={value:id==='autoSeed'?'2026':'developer',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};
const ctx={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(ctx);
vm.runInContext(['rules.js','magic-trail.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
start();state='play';ball.phase='play';const rim=world.shapes.find(s=>s.id==='roulette-rim'),pin=world.shapes.find(s=>s.id==='roulette-spindle');assert(rim.disabled);rules.multiplier=5;syncRouletteGate();assert(rim.disabled);
for(const side of ['red','black']){rules.bets={red:0,black:0};syncRouletteGate();Object.assign(ball,{x:470,y:700,vx:100,vy:0});rules.bets[side]=1;syncRouletteGate();assert(!rim.disabled);assert(rim.ignoreBalls.has(ball.id));const x=ball.x;world.resolve(ball,rim);assert.equal(ball.x,x);ball.x=100;syncRouletteGate();assert(!rim.ignoreBalls.has(ball.id));}
rules.bets={red:0,black:0};syncRouletteGate();Object.assign(ball,{x:410,y:880,vx:150,vy:0});updateRoulette(.01);assert.notEqual(ball.phase,'roulette');
const isolated=new World([rim,pin]);isolated.gravity=isolated.drag=0;const pass={x:400,y:650,vx:0,vy:800,r:17};isolated.step(pass,[],{},.4);assert(pass.y>950);const hit={x:470,y:800,vx:0,vy:600,r:17};isolated.step(hit,[],{},.1);assert(hit.vy<0);
start();awardBalls(1000);assert.equal(balls,1010);for(let i=0;i<240;i++)physics(1/240);assert.equal(goLaunched,0);assert.equal(goReservations,0);assert.equal(liveBalls.length,1);
for(let i=0;i<20;i++)assert(go());assert.equal(goReservations,20);assert.equal(balls,990);
for(let i=0;i<7200;i++){physics(1/240);updatePresentation(1/240);assert(liveBalls.length<=12);assert.equal(goLaunched+goReservations,20);assert.equal(balls+goLaunched+goReservations,10+ammoAwarded);assert(liveBalls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)));}
console.log('PASS authorized multiball stress',JSON.stringify({ammoStock:balls,ammoAwarded,goLaunched,goReservations,live:liveBalls.length,peak:peakLive,contacts:world.ballContacts}));
pause();const frozen=JSON.stringify(liveBalls),q=goReservations;physics(1);assert.equal(JSON.stringify(liveBalls),frozen);assert.equal(goReservations,q);pause();
start();assert.equal(balls,10);assert.equal(ammoAwarded,0);assert.equal(goReservations,0);assert.equal(goLaunched,0);assert.equal(roulette.owner,null);
console.log('PASS no payout auto-launch, uncapped ammo, GO conservation, pause/reset, BET gate and central pin');
`,ctx);