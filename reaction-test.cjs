const assert=require('node:assert/strict');
require('./reactions.js');
for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){
 const m=new PinballReelMotion();m.start([a,b,c]);let previous=[...m.positions],stops=[];
 for(let n=0;n<=150;n++){stops.push(...m.update(n/60));m.positions.forEach((p,i)=>assert(p<=previous[i]+1e-8));previous=[...m.positions];}
 assert.deepEqual(stops,[0,1,2]);assert.deepEqual(m.positions.map(p=>((p%3)+3)%3),[a,b,c]);assert.deepEqual(m.update(3),[]);
 m.start([c,a,b]);m.update(3);assert.deepEqual(m.positions.map(p=>((p%3)+3)%3),[c,a,b]);
}
const r=new PinballReactions();for(let n=0;n<100;n++)r.hit('bumper',1,200,500);
assert.equal(r.hits.size,1);r.update(.025);assert(r.pose('bumper').brightness>1);assert.equal(r.pose('bumper').sy,1);assert.notEqual(r.pose('bumper').angle,0);
assert.equal(r.pose('bumper',true).sy,1);assert.deepEqual(r.offset(true),{x:0,y:0});assert(Math.abs(r.offset().x)<=4);
r.update(1);assert.equal(r.hits.size,0);assert.deepEqual(r.offset(),{x:0,y:0});
console.log('Reaction bounds, reduced motion, 27 reel outcomes and sequential stops: PASS');

for(let mask=0;mask<8;mask++){const collected=[0,1,2].map(i=>!!(mask&(1<<i))),snapshot=JSON.stringify(collected);for(let n=0;n<720;n++){for(const [id,i] of [['chip-left',0],['roulette',1],['chip-right',2],['spin',3]]){const a=r.invitation(id,collected,n/60);assert(Math.abs(a.angle)<=.055);assert(a.brightness>=1&&a.brightness<=1.34);if(i<3&&collected[i]||i===3&&mask!==7)assert.deepEqual(a,{angle:0,brightness:1});assert.equal(r.invitation(id,collected,n/60,true).angle,0);assert.deepEqual(a,r.invitation(id,collected,n/60));}}assert.equal(JSON.stringify(collected),snapshot);}console.log('PASS all eight target states, SPIN handoff, bounded rigid cue, reduced/frozen clock and no rules mutation');

for(const state of ['intro','ready','launch','roulette','settling','over','paused','play'])for(const spin of [0,1])for(const hidden of [false,true]){const active=state==='play'&&spin===0&&!hidden;for(const mask of [0,7])for(const id of ['chip-left','roulette','chip-right','spin']){const a=r.invitation(id,[0,1,2].map(i=>!!(mask&(1<<i))),1,false,active);if(!active)assert.deepEqual(a,{angle:0,brightness:1});}}console.log('PASS invitation suppressed while goals unavailable, slot resolving, pause/hidden and end-state; resumes from live collection state');

for(const bets of [{black:0,red:0},{black:100,red:0},{black:0,red:200}])for(const m of [1,2,5]){const a=r.betInvitation('roulette',bets,m,1);assert.equal(a.brightness>1,bets.black+bets.red>0);assert.equal(r.betInvitation('chip-left',bets,m,1).brightness>1,true);assert.equal(r.betInvitation('spin',bets,m,1).brightness>1,bets.black+bets.red>0&&m===1);}console.log('PASS BET-specific invitations replace old collection-complete semantics');
