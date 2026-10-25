const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={value:id==='autoSeed'?'2026':'developer',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};
const ctx={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(ctx);

vm.runInContext(['rules.js','autoplay.js','return-cohort.js','engagement.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
start();go();awardBalls(5);rules.bets={black:2,red:3};const before={stock:balls,reserved:goReservations,ids:liveBalls.map(b=>b.id)};
openSettings();assert(settingsOpen);assert.equal(state,'paused');assert($('gameSurface').inert);assert(!go());for(let i=0;i<10;i++)physics(1);assert.equal(balls,before.stock);assert.equal(goReservations,before.reserved);assert.deepEqual(rules.bets,{black:2,red:3});openSettings();closeSettings();assert.equal(state,'play');assert(!settingsOpen);assert(!$('gameSurface').inert);assert.equal(goLaunched,1);
for(let i=0;i<5;i++){openSettings();closeSettings();}assert.equal(goReservations,0);assert.equal(balls,14);
openSettings();$('restartRequest').onclick();assert(!$('restartConfirm').hidden);$('restartCancel').onclick();assert($('restartConfirm').hidden);assert.equal(balls,14);$('settingsDialog').onkeydown({code:'Escape',preventDefault(){},stopPropagation(){}});assert(!settingsOpen);
pause();openSettings();closeSettings();assert.equal(state,'paused');openSettings();$('pause').onclick();closeSettings();assert.equal(state,'play');openSettings();$('pause').onclick();closeSettings();assert.equal(state,'paused');assert.equal(prior,'play');pause();assert.equal(state,'play');
openSettings();$('restartRequest').onclick();$('restartConfirmButton').onclick();assert.equal(balls,10);assert.equal(goReservations,0);assert.equal(goLaunched,0);assert.equal(state,'ready');assert.deepEqual(rules.bets,{black:0,red:0});
auto.begin({seed:7,runs:1,limit:10});openSettings();assert(!auto.running);closeSettings();assert(!auto.running);openSettings();$('autoStart').onclick();assert(!settingsOpen);assert(auto.running);openSettings();assert(!auto.running);document.hidden=true;closeSettings();assert.equal(state,'paused');document.hidden=false;
console.log('PASS modal freezes stock/BET/reservations, GO guard, repeated open/close, Escape/cancel, prior pause state, restart no launch, explicit AUTO and hidden close');
`,ctx);
