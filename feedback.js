class PinballFeedback {
  constructor(){this.root=document.getElementById('feedback');this.items=[];this.reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;this.reels=document.getElementById('reels');this.motion=new PinballReelMotion();this.buildReels();}
  buildReels(){this.reels.innerHTML=Array.from({length:3},()=>'<div class="reel-window"><canvas width="180" height="272" aria-hidden="true"></canvas></div>').join('');this.columns=[...this.reels.children];this.drums=this.columns.map(el=>new PinballReelRenderer(el.firstElementChild));this.previousPositions=[0,1,2];this.paintReels();this.reels.hidden=false;this.reels.setAttribute('aria-label','Slot reels');}
  clear(){this.items.forEach(i=>i.el.remove());this.items=[];this.motion=new PinballReelMotion();this.paintReels();this.reels.hidden=false;this.reels.classList.remove('reel-win');this.camera(0,0);}
  paintReels(){this.columns.forEach((el,i)=>{const position=this.motion.positions[i];this.drums[i].draw(position,this.reduced?0:(position-this.previousPositions[i])*.3);this.previousPositions[i]=position;el.classList.toggle('reel-stopped',this.motion.stopped[i]);});}
  score(value,x,y){
    if(this.items.length>=10)this.items.shift().el.remove();
    const el=document.createElement('span');el.className=value>=10000?'score-pop jackpot-pop':'score-pop';el.textContent='+'+value.toLocaleString();
    el.style.left=Math.max(12,Math.min(88,x/941*100))+'%';el.style.top=Math.max(8,Math.min(85,y/1672*100))+'%';this.root.append(el);this.items.push({el,age:0,duration:value>=10000?1.8:.85});
  }
  camera(x,y){const scale=document.getElementById('game').clientWidth/941;for(const el of [document.getElementById('game'),this.root,this.reels]){const transform=`translate(${x*scale}px,${y*scale}px)`;if(el.style.transform!==transform)el.style.transform=transform;}}
  update(dt){for(const i of this.items){i.age+=dt;const p=Math.min(1,i.age/i.duration);i.el.style.opacity=String(Math.min(1,(1-p)*4));i.el.style.transform=`translate(-50%,${this.reduced?0:-28*p}px)`;}this.items=this.items.filter(i=>{if(i.age>=i.duration){i.el.remove();return false;}return true;});}
  beginSpin(result,plan){this.reels.hidden=false;if(plan)this.motion.startPlan(plan);else this.motion.start(result.map(s=>s==='7'?0:s==='♥'?1:2));this.reels.classList.remove('reel-win');}
  spin(elapsed){const stopped=this.motion.update(elapsed);this.paintReels();return stopped;}
  win(jackpot){this.reels.classList.toggle('reel-win',jackpot);}
  progress(symbols){this.motion.positions=symbols.map(s=>s==='7'?0:s==='♥'?1:2);this.motion.stopped=[true,true,true];this.previousPositions=[...this.motion.positions];this.reels.classList.remove('reel-win');this.paintReels();}
}
globalThis.PinballFeedback=PinballFeedback;
