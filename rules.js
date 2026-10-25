/* Outcomes follow mechanical stopping positions, never desired symbols. */
class PinballRules {
 constructor(config={}){this.config={betPerHit:1,multipliers:{none:1,pair:2,triple:3,sevens:5},...config};this.reset();}
 reset(){this.bets={black:0,red:0};this.multiplier=1;this.roulettePending=null;this.rouletteSerial=0;this.lastBetHit={};this.pending=null;this.jackpots=0;this.positions=[0,1,2];}
 get collected(){return [this.bets.black>0,this.multiplier>1,this.bets.red>0];}
 collect(id,time){const side=id==='chip-left'?'black':id==='chip-right'?'red':null;if(!side)return false;if(Number.isFinite(time)){if(this.lastBetHit[side]!==undefined&&time-this.lastBetHit[side]<.12)return false;this.lastBetHit[side]=time;}const next=this.bets[side]+this.config.betPerHit;if(!Number.isSafeInteger(next)||next<0)throw Error('BET exceeds safe integer range');this.bets[side]=next;return true;}
 get count(){return this.collected.filter(Boolean).length;}
 enterRoulette(ballMultiplier=1){if(![1,5,10,50,100,500].includes(ballMultiplier))throw Error('Invalid ball multiplier');if(this.roulettePending)return this.roulettePending.id;const id=++this.rouletteSerial;this.roulettePending={id,ballMultiplier,bets:{...this.bets},multiplier:this.multiplier};return id;}
 static rouletteSegments=[[0,"black"],[4.8,"red"],[16.8,"black"],[28.4,"red"],[40.1,"black"],[52.8,"red"],[64.9,"black"],[90.4,"red"],[102.7,"black"],[115.3,"red"],[127.6,"black"],[139.4,"red"],[151.7,"black"],[163.4,"red"],[175.4,"black"],[186.9,"red"],[199.8,"black"],[212.1,"red"],[224.5,"black"],[237.3,"red"],[249.9,"black"],[264.3,"green"],[276.1,"black"],[290.1,"red"],[302.8,"black"],[315.3,"red"],[328,"black"],[340.7,"red"],[352.5,"black"]];
 static rouletteColor(angle){const degrees=(angle*180/Math.PI%360+360)%360;let color=this.rouletteSegments[0][1];for(const [start,next] of this.rouletteSegments){if(degrees+1e-9<start)break;color=next;}return color;}
 settleRoulette(id,color,capacity=Number.MAX_SAFE_INTEGER){const p=this.roulettePending;if(!p||p.id!==id||!['red','black','green'].includes(color))return null;const bets={...this.bets},multiplier=this.multiplier;const stake=color==='green'?bets.red+bets.black:bets[color];const award=stake*multiplier*p.ballMultiplier;if(!Number.isSafeInteger(award)||award<0||award>capacity)throw Error('Ammunition award exceeds safe integer range');const result={id:p.id,bets,multiplier,ballMultiplier:p.ballMultiplier,color,award,captureBets:p.bets,captureBonus:p.multiplier};this.bets={black:0,red:0};this.multiplier=1;this.roulettePending=null;this.pending=null;return result;}
 beginSpin(impact=600){
  if(this.pending)return null;
  const strength=Math.max(0,Math.min(1,impact/1800));
  const starts=this.positions.map(p=>((p%3)+3)%3);
  const durations=[1.25,1.65,2.05];
  const targets=starts.map((p,i)=>Math.round(p-(6+strength*18+i*.37)*durations[i]/2));
  const symbols=targets.map(p=>['7','♥','♦'][((p%3)+3)%3]);
  const same=symbols.every(s=>s===symbols[0]),jackpot=same&&symbols[0]==='7';
  const pair=new Set(symbols).size===2;
  const m=this.config.multipliers,multiplier=jackpot?m.sevens:same?m.triple:pair?m.pair:m.none,award=0;
  this.positions=targets;
  this.pending={symbols,jackpot,award,multiplier,plan:{starts,targets,durations}};
  return this.pending;
 }
 settle(){if(!this.pending)return null;const result=this.pending;this.pending=null;this.multiplier=result.multiplier;if(result.jackpot)this.jackpots++;return result;}
}
globalThis.PinballRules=PinballRules;
