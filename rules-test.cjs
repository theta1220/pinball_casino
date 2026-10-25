const assert=require('node:assert/strict');require('./rules.js');require('./reactions.js');
const outcomes=new Set();
for(const power of [0,100,400,800,1250,1800]){
 const r=new PinballRules(),result=r.beginSpin(power),m=new PinballReelMotion();m.startPlan(result.plan);let previous=[...m.starts];
 for(let i=0;i<=130;i++){m.update(i/60);m.positions.forEach((p,j)=>assert(p<=previous[j]+1e-8));previous=[...m.positions];}
 assert.deepEqual(m.positions,result.plan.targets);outcomes.add(result.symbols.join(''));
 assert.equal(r.beginSpin(800),null);assert.equal(r.settle().award,result.award);assert.equal(r.settle(),null);
 const repeat=new PinballRules();assert.deepEqual(repeat.beginSpin(power).symbols,result.symbols);
}
assert(outcomes.size>=4,'different impacts produce different results');
for(const color of ['black','red','green']){const r=new PinballRules();r.collect('chip-left',0);assert(!r.collect('chip-left',.01));r.collect('chip-right',0);r.collect('chip-right',.2);r.beginSpin(1250);assert.equal(r.settle().award,0);assert.equal(r.multiplier,5);const id=r.enterRoulette();assert.equal(r.enterRoulette(),id);r.collect('chip-left',.3);r.beginSpin(400);const paid=r.settleRoulette(id,color);assert.equal(paid.award,({black:10,red:10,green:20})[color]);assert.deepEqual(r.bets,{black:0,red:0});assert.equal(r.multiplier,1);assert.equal(r.pending,null);assert.equal(r.settle(),null);assert.equal(r.settleRoulette(id,color),null);}
const z=new PinballRules();assert.equal(z.settleRoulette(z.enterRoulette(),'green').award,0);assert.equal(PinballRules.rouletteColor(271*Math.PI/180),'green');assert.equal(PinballRules.rouletteColor(0),'black');assert.equal(PinballRules.rouletteColor(11*Math.PI/180),'red');console.log('PASS BET asymmetry/green, debounce, SPIN no direct payout, stop-time snapshot and confirmed atomic reset-all');
