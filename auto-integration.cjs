const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const root=__dirname;require(root+'/physics.js');const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={},listeners={};const el=id=>els[id]??={value:({autoRuns:'2',autoSeed:'1',autoLimit:'90',launchPowerChoice:'75',studySource:'developer'})[id]||'',style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl};const c={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(n,f){(listeners[n]??=[]).push(f);}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert,listeners};vm.createContext(c);
vm.runInContext(['rules.js','autoplay.js','return-cohort.js','engagement.js','game.js'].map(f=>fs.readFileSync(root+'/'+f,'utf8')).join('\n')+`
const runs=[];
for(const seed of [1,42,2026,42]){
 study.clear();study.enable(true);state='intro';$('autoSeed').value=String(seed);$('autoStart').onclick();
 for(let i=0;i<240*190&&auto.running;i++){physics(1/240);updatePresentation(1/240);}
 assert(!auto.running);assert(!keys.left&&!keys.right);assert(study.rows.every(r=>r.mode==='auto-only'));runs.push({seed,reason:auto.reason,started:auto.started,completed:auto.completed,history:auto.history,report:study.report().continuation});
}
assert.deepEqual(runs[1],runs[3]);
state='intro';$('autoStart').onclick();physics(.01);for(let i=0;i<200;i++)physics(1/240);for(const f of listeners.keydown)f({code:'ArrowLeft',target:{matches:()=>false,closest:()=>false},preventDefault(){}});assert(!auto.running);assert.equal(study.current.mode,'mixed-auto');assert(keys.left);for(const f of listeners.keyup)f({code:'ArrowLeft'});assert(!keys.left);
$('autoStart').onclick();physics(.01);pause();assert(!auto.running);assert.equal(state,'paused');pause();assert(!auto.running);assert(!keys.left&&!keys.right);
$('autoStart').onclick();physics(.01);for(const f of listeners.blur)f();assert(!auto.running);assert(!keys.left&&!keys.right);pause();
$('autoStart').onclick();physics(.01);$('autoStop').onclick();assert(!auto.running);assert(!keys.left&&!keys.right);
$('autoStart').onclick();physics(.01);for(const f of listeners.pagehide)f();assert(!auto.running);assert(!keys.left&&!keys.right);
globalThis.results=runs;console.log('PASS actual auto/game hooks: bounded repeated games, deterministic replay, manual takeover, pause/resume, blur, disable and navigation');
`,c);fs.writeFileSync('auto-results.json',JSON.stringify(c.results,null,2));console.log(JSON.stringify(c.results.map(r=>({seed:r.seed,reason:r.reason,completed:r.completed,history:r.history})),null,2));
