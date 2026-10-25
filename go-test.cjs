const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={value:id==='autoSeed'?'2026':'developer',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};
const ctx={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(ctx);

vm.runInContext(['rules.js','autoplay.js','return-cohort.js','engagement.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
study.enable(true);start();assert.equal(balls,10);balls=3;assert(go());assert.equal(balls,2);assert.equal(goReservations,1);assert.equal(state,'play');assert(go());assert(go());assert(!go());assert.equal(balls,0);assert.equal(goReservations,3);assert.equal(study.current.mode,'manual-only');assert.equal($('launch').disabled,true);
queueLaunch(1);assert.equal(goReservations,2);assert.equal(goLaunched,1);assert.equal(liveBalls.length,1);const speed=liveBalls[0].rail.speed;assert(speed>=1590&&speed<=1900);queueLaunch(1);assert.equal(goReservations,2,'blocked rail preserves press');awardBalls(4);assert.equal(balls,4);
pause();const q=goReservations,r=balls;assert(!go());physics(1);assert.equal(goReservations,q);assert.equal(balls,r);pause();assert.equal(balls,4);
// Automatic flippers respond to BOTH sides without marking ordinary player sessions automated.
liveBalls=[];attachBall({x:300,y:1150,vx:0,vy:0,r:17},'play');attachBall({x:600,y:1150,vx:0,vy:0,r:17},'play');state='play';flipperClock=0;const inputs=study.current.inputs;automaticFlippers(.01);assert(keys.left&&keys.right);assert.equal(study.current.inputs,inputs);assert.equal(study.current.mode,'manual-only');automaticFlippers(.1);assert(!keys.left&&!keys.right);
// All drained, with stock/queues exhausted, then GO starts a clean new game exactly once.
goReservations=0;balls=0;for(const b of liveBalls){b.x=470;b.y=1500;}physics(1/240);assert.equal(state,'over');assert(go());assert.equal(balls,9);assert.equal(goReservations,1);assert.equal(ammoAwarded,0);
start();auto.begin({seed:7,runs:1,limit:10});go(true);assert.equal(balls,9);go();assert(!auto.running);assert.equal(study.current.mode,'mixed-auto');
console.log('PASS GO stock10, click single-consumption, blocked launch queue, normal/reward concurrency, pause, autonomous two-sided flippers, manual classification, replay and diagnostic takeover');
`,ctx);
const source=fs.readFileSync('game.js','utf8');assert(source.includes('launchButton.onclick=()=>go()'));assert(!source.includes('launchButton.onpointerdown='));const html=fs.readFileSync('index.html','utf8');assert(html.includes('class="go-button"'));assert(html.includes('type="button">GO</button>'));
