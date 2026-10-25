const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');require('./physics.js');
const gl=new Proxy({},{get:(_,k)=>k==='getShaderParameter'?()=>true:()=>({})}),els={},events={};const el=id=>els[id]??={style:{setProperty(){}},setAttribute(){},querySelector:()=>({}),getContext:()=>gl,value:id==='studySource'?'developer':''};
const c={PinballPhysics,document:{getElementById:el,querySelector:el,addEventListener(){}},window:{addEventListener(name,fn){(events[name]??=[]).push(fn);}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},console,Math,assert};vm.createContext(c);
vm.runInContext(['rules.js','return-cohort.js','engagement.js','game.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`
study.enable(true);start();assert.equal(study.current.source,'developer');assert.equal(rules.multiplier,1);
collectTarget('chip-left');assert.equal(rules.bets.black,1);assert.equal(rules.multiplier,1);
beginCharge();charge=.1;ball.y=1251;launch();for(let i=0;i<2400&&state==='launch';i++)physics(1/240);
assert.equal(study.current.returns,1);assert.equal(balls,3);assert($('toast').textContent.includes('No ammunition lost'));
const t=study.current.active;pause();physics(1);assert.equal(study.current.active,t);pause();
for(let i=0;i<3;i++){balls=2-i;state='play';Object.assign(ball,{x:470,y:1500,vx:0,vy:0});physics(1/240);}
assert.equal(state,'over');assert.equal(study.rows[0].drains,3);assert.equal(study.rows[0].complete,true);study.tick(10,false);start();assert.equal(study.rows[0].replay,true);assert.equal(rules.multiplier,1);
for(let n=0;n<5;n++){start();assert.equal(particles.length,0);assert.equal(rules.count,0);}
assert.equal(study.rows.length,6);study.enable(false);assert.equal(study.current,null);
study.enable(true);study.start('auto-v1','automation');stopAuto('MANUAL');assert.equal(study.current.mode,'mixed-auto');stopAuto('MANUAL');assert.equal(study.current.originSource,'automation');study.enable(false);
console.log('PASS real game hooks: target progression, weak return, pause, three drains, replay and repeated restart');
`,c);
