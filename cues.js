/* Presentation only: three target contours, one shooter cue, pause and auto symbols. */
class PinballCues {
 constructor(){this.root=document.getElementById('playCues');this.last='';}
 update({state,collected,returned,auto,reduced,charging}){
  if(!this.root)return;
  const key=JSON.stringify([state,collected,returned,auto,reduced,charging]);if(key===this.last)return;this.last=key;
  this.root.setAttribute('data-phase',state);this.root.setAttribute('data-return',String(returned));this.root.setAttribute('data-reduced',String(reduced));this.root.setAttribute('data-charging',String(charging));
  for(let i=0;i<3;i++)document.getElementById('targetCue'+i).setAttribute('data-collected',String(collected[i]));
  document.getElementById('autoStatus').setAttribute('data-running',String(auto));
  document.getElementById('autoStatus').setAttribute('aria-label',auto?'AUTO active':'AUTO stopped');
  document.getElementById('start').setAttribute('aria-label',state==='over'?'Play again':'Start game');
 }
}
globalThis.PinballCues=PinballCues;
