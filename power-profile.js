/* Bounded presentation budgets; never changes simulation or rewards. */
(function(root){class PinballPowerProfile{
 static settings(mode){return mode==='high'?{mode:'high',fps:60,dpr:2,pixels:2000000,points:32,sparks:48,ghosts:6,coins:40}:{mode:'low',fps:60,dpr:1,pixels:400000,points:12,sparks:12,ghosts:2,coins:12};}
 static size(w,h,dpr,mode){const p=this.settings(mode);let scale=Math.min(Math.max(1,dpr||1),p.dpr,Math.sqrt(p.pixels/Math.max(1,w*h)));return {width:Math.max(1,Math.floor(w*scale)),height:Math.max(1,Math.floor(h*scale))};}
}root.PinballPowerProfile=PinballPowerProfile;})(globalThis);
