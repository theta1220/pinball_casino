const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={};const el=id=>els[id]??={value:id==='launchPowerChoice'?'75':'developer',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};const c={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(c);
vm.runInContext(['rules.js','return-cohort.js','engagement.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
for(const power of [0,.45,.6,.75,1]){
 start();beginCharge();charge=power;ball.y=1240+110*power;launch();for(let n=0;n<400;n++)physics(1/240);const expected=[state,ball.x,ball.y,ball.vx,ball.vy,score,balls];
 start();$('launchPowerChoice').value=String(power*100);launchChoice();for(let n=0;n<400;n++)physics(1/240);assert.deepEqual([state,ball.x,ball.y,ball.vx,ball.vy,score,balls],expected);
}
start();$('launchPowerChoice').value='100';launchChoice();const speed=launchSpeed;launchChoice();assert.equal(launchSpeed,speed);assert($('launchChoice').disabled);pause();launchChoice();assert.equal(state,'paused');assert($('launchChoice').disabled);pause();
start();$('launchPowerChoice').value='NaN';launchChoice();assert.equal(state,'ready');$('launchPowerChoice').value='150';launchChoice();assert.equal(state,'ready');
study.enable(true);start();study.event('launches');study.event('returns');study.finish(false);const g=study.report().groups['go-ammo-v4+stake-v1+rain-v1/developer'];assert.equal(g.riskUnscored,1);assert.equal(g.riskScored,0);assert.equal(g.returnedLaunches,1);assert.equal(g.launches,1);
console.log('PASS selected launch matches held launch at 5 powers; guards, pause, repeat clicks, invalid input and missing-score coverage');
`,c);
