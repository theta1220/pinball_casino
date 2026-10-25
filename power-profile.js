/* Reference framebuffer fits 1080x1920 (portrait) or1920x1080 (landscape).
   CSS aspect determines the fit; devicePixelRatio never multiplies pixels. */
(function(root){class PinballPowerProfile{
 static settings(mode){return mode==='high'?{mode:'high',fps:60,referenceWidth:1080,referenceHeight:1920,pixels:2073600,points:32,sparks:48,ghosts:6,coins:40}:{mode:'low',fps:60,referenceWidth:1080,referenceHeight:1920,pixels:2073600,points:12,sparks:12,ghosts:2,coins:12};}
 static size(w,h,dpr,mode){if(!(Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0))return {width:1,height:1};const landscape=w>h,bw=landscape?1920:1080,bh=landscape?1080:1920,scale=Math.min(bw/w,bh/h);return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};}
 static point(x,y,rect){return {x:(x-rect.left)*941/rect.width,y:(y-rect.top)*1672/rect.height};}
}root.PinballPowerProfile=PinballPowerProfile;})(globalThis);
