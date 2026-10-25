const assert=require('node:assert/strict'),Trail=require('./magic-trail.js'),t=new Trail();
for(let n=0;n<2000;n++)t.update(1/240,{x:470+Math.sin(n*.05)*200,y:800+Math.cos(n*.05)*200},'play');assert(t.points.length<=32&&t.sparks.length<=48);assert(t.points.every(p=>p.age<.22));const before=JSON.stringify(t);t.update(0,{x:0,y:0},'play');assert.equal(JSON.stringify(t),before);
t.update(.01,{x:900,y:50},'play');assert(t.points.length<=1);t.update(.01,{x:900,y:60},'ready');assert.equal(t.points.length,0);assert.equal(t.sparks.length,0);
for(let n=0;n<20;n++)t.update(1/240,{x:100+n*25,y:500},'launch');assert(t.points.length>0);t.clear();assert.equal(t.points.length,0);assert.equal(t.sparks.length,0);t.update(.01,{x:100,y:500},'play',true);assert.equal(t.points.length,0);
console.log('PASS bounded magical trail, high speed, direction changes, discontinuity/reset, zero-dt pause and reduced motion');
