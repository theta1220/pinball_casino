// Display only: exact safe-integer gameplay values never round-trip through HUD text.
function setHudText(element,text){if(element.textContent===text)return;if(typeof AtlasText!=='undefined')AtlasText.setText(element,text);else if(element.textContent!==text)element.textContent=text;ui?.invalidate();}
function compactNumber(value){if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid display total');const units=['','K','M','G','T','P'];const n=BigInt(value);let unit=0,scale=1n;while(unit<units.length-1&&n>=scale*1000n){unit++;scale*=1000n;}let tenths=(n*10n+scale/2n)/scale;if(tenths>=10000n&&unit<units.length-1){unit++;scale*=1000n;tenths=(n*10n+scale/2n)/scale;}return String(tenths/10n)+'.'+String(tenths%10n)+units[unit];}
let powerMode='low';try{if(localStorage.getItem('royal-flush-power-v1')==='high')powerMode='high';}catch{}
const powerBudget=()=>typeof PinballPowerProfile==='undefined'?{mode:'high',fps:60,dpr:2,pixels:2000000,points:32,sparks:48,ghosts:6,coins:40}:PinballPowerProfile.settings(powerMode);
let ui=null;
let contextLost=false,contextResume=null;
let frameQueued=false,lastDraw=-Infinity;
function wakeFrame(){if(!frameQueued){frameQueued=true;requestAnimationFrame(frame);}}
const $=id=>document.getElementById(id),canvas=$('game'),gl=canvas.getContext('webgl',{antialias:false,alpha:false});
if(!gl){globalThis.pinballStartup?.fail('WebGL is unavailable. Try another browser.');$('overlay').innerHTML='<h2>WebGL unavailable</h2><p>This game requires a browser with WebGL support.</p>';throw Error('WebGL unavailable');}
const W=941,H=1672;
const scene=typeof PinballSceneLayout==='undefined'?null:new PinballSceneLayout(canvas,gl,()=>wakeFrame());
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let p,buf,color,textured;
function initGeometry(){p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,'attribute vec2 a;attribute vec2 u;varying vec2 v;uniform vec2 res;void main(){gl_Position=vec4(a.x/res.x*2.-1.,1.-a.y/res.y*2.,0,1);v=u;}'));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D tex;uniform vec4 color;uniform float textured;void main(){gl_FragColor=mix(color,texture2D(tex,v),textured);}'));gl.linkProgram(p);gl.useProgram(p);buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);for(const [n,o] of [['a',0],['u',8]]){let a=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,16,o);}gl.uniform2f(gl.getUniformLocation(p,'res'),W,H);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
color=gl.getUniformLocation(p,'color');textured=gl.getUniformLocation(p,'textured');}
initGeometry();
function poly(points,c){gl.uniform1f(textured,0);gl.uniform4fv(color,c);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.flatMap(([x,y])=>[x,y,0,0])),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLE_FAN,0,points.length);}
function circle(x,y,r,c){const pts=[[x,y]];for(let i=0;i<=40;i++)pts.push([x+Math.cos(i/40*Math.PI*2)*r,y+Math.sin(i/40*Math.PI*2)*r]);poly(pts,c);}
function capsule(x,y,xx,yy,r,c){const a=Math.atan2(yy-y,xx-x),pts=[];for(let i=0;i<=16;i++){let t=a+Math.PI/2+i*Math.PI/16;pts.push([x+Math.cos(t)*r,y+Math.sin(t)*r]);}for(let i=0;i<=16;i++){let t=a-Math.PI/2+i*Math.PI/16;pts.push([xx+Math.cos(t)*r,yy+Math.sin(t)*r]);}poly(pts,c);}
let ready=false;
let art=typeof SpriteRenderer==='undefined'?null:new SpriteRenderer(gl,PINBALL_ASSETS,()=>{ready=true;$('start').disabled=false;syncGo();wakeFrame();},error=>{globalThis.pinballStartup?.fail('Game artwork could not load. Reload to try again.');$('toast').textContent=error.message;});
const sound=typeof PinballAudio==='undefined'?null:new PinballAudio();
const reactions=typeof PinballReactions==='undefined'?null:new PinballReactions();
const feedback=typeof PinballFeedback==='undefined'?null:new PinballFeedback(gl,canvas,()=>wakeFrame());
ui=typeof PinballUIController==='undefined'?null:new PinballUIController(gl,canvas,()=>wakeFrame());
scene?.mount();
const rules=new PinballRules();
const cues=typeof PinballCues==='undefined'?null:new PinballCues();
const auto=typeof PinballAuto==='undefined'?null:new PinballAuto();
const magic=typeof PinballMagicTrail==='undefined'?null:new PinballMagicTrail();
const study=typeof PinballEngagement==='undefined'?null:new PinballEngagement((()=>{try{return globalThis.localStorage;}catch{return null;}})());
function updateGoals(){if($('betBlack'))setHudText($('betBlack'),compactNumber(rules.bets.black));if($('betRed'))setHudText($('betRed'),compactNumber(rules.bets.red));if($('betMultiplier'))setHudText($('betMultiplier'),'BONUS\nx'+rules.multiplier);}
function showStudy(){if($('studyOutput')&&study){const report=study.report();if($('returnSummary'))$('returnSummary').textContent=Object.entries(report.longTermReturn.windows).map(([day,w])=>day+' (by initial mode): '+['all','manual-only','auto-only','mixed-auto'].map((mode,i)=>{const g=w.groups[mode];return ['All','Manual','Automatic','Mixed'][i]+' '+g.numerator+'/'+g.denominator+' / pending'+g.pending+' / n='+g.sampleSize;}).join(' / ')).join(' | ');$('studyOutput').textContent=JSON.stringify(report,null,2);if($('studySummary'))$('studySummary').textContent=['all','manual-only','auto-only','mixed-auto'].map((key,i)=>{const g=report.continuation[key];return ['All','Manual only','Automatic only','Mixed'][i]+': '+g.numerator+'/'+g.denominator+' ('+(g.rate===null?'No data':Math.round(g.rate*100)+'%')+')';}).join(' | ');}}
if(study){$('studyEnabled').onchange=e=>{study.enable(e.target.checked);showStudy();};$('studyReport').onclick=showStudy;$('studyClear').onclick=()=>{$('studyDeleteConfirm').hidden=false;$('studyDeleteCancel').focus?.();};window.addEventListener('pagehide',()=>study.interrupt());window.addEventListener('blur',()=>study.interrupt());document.addEventListener?.('visibilitychange',()=>{if(document.hidden)study.interrupt();});}
let studyClock=performance.now();
updateGoals();
let spinResult=['7','♥','♦'],spinElapsed=0,resultHold=0;
let fxSeed=713;function fxRandom(){fxSeed^=fxSeed<<13;fxSeed^=fxSeed>>>17;fxSeed^=fxSeed<<5;return (fxSeed>>>0)/4294967296;}
let settingsOpen=false,settingsResume='intro';
let score=0,best=0,balls=10,state='intro',prior='ready',muted=false,ctx,toastTime=0,spinTime=0,spinCooldown=0,keys={left:false,right:false},particles=[];
try{best=Number(localStorage.getItem('royal-flush-best-v3'))||0;}catch{}setHudText($('best'),compactNumber(best));
const {World,ellipse}=PinballPhysics;
// Coordinates traced in the original 941 x 1672 artwork. Closed outlines are solid.
const rail=(id,points,extra={})=>({id,points,radius:3,restitution:.68,friction:.1,...extra});
const solid=(id,points,extra={})=>({id,points,closed:true,restitution:.64,friction:.14,...extra});
// Sprite scale follows image.png; wall outlines follow the faithful clean background.
const rouletteRim=[];
for(let i=0;i<=48;i++){const a=Math.PI/3-i*Math.PI*5/3/48;rouletteRim.push([470+232*Math.cos(a),875+175*Math.sin(a)]);}
for(let i=0;i<=48;i++){const a=-Math.PI*4/3+i*Math.PI*5/3/48;rouletteRim.push([470+187*Math.cos(a),890+128*Math.sin(a)]);}
const SPIN_LAYOUT={x:470,y:554,width:204,height:196};
const tableShapes=[
 solid('roulette-rim',rouletteRim,{restitution:.62,friction:.1}),
 rail('left-wall',[[317,207],[265,223],[196,254],[137,289],[112,335],[143,348],[155,370],[151,402],[128,430],[102,450],[88,540],[78,650],[79,676],[106,694],[120,728],[115,760],[91,791],[62,811],[43,980],[30,1110],[30,1170],[45,1206],[79,1253],[125,1305],[190,1350],[280,1400],[360,1440]]),
 rail('right-wall',[[480,88],[600,91],[706,119],[790,160],[849,217],[882,286],[895,400],[906,600],[914,900]]),
 rail('top-arch',[[317,207],[324,163],[350,127],[399,103],[480,88]]),
 rail('shooter-divider',[[805,260],[826,360],[839,600],[839,931],[831,1030],[831,1180],[831,1287],[795,1330],[744,1370],[665,1414],[583,1445]]),
 // Guided GO balls bypass world collisions; these physical mouths block reverse entry.
 rail('launch-exit-gate',[[196,245],[285,258]]),
 rail('shooter-return-gate',[[805,260],[849,217]]),
 solid('slot',[[285,267],[320,245],[375,220],[413,181],[470,170],[528,185],[567,222],[617,245],[667,267],[674,392],[643,432],[566,468],[515,449],[423,449],[376,468],[298,435],[269,394],[269,280]],{restitution:.58}),
 solid('chip-left',ellipse(217,524,78,76),{n:100,boost:50,x:217,y:524,r:78,releaseImpulse:160}),
 // Right decorative bevel is not solid: retain left face, open a >34px ball corridor.
 solid('chip-right',ellipse(721,524,78,76).map(([x,y])=>[x>721?721+(x-721)*72/78:x,y]),{n:100,boost:50,x:721,y:524,r:78,releaseImpulse:160}),
 solid('spin',ellipse(SPIN_LAYOUT.x,SPIN_LAYOUT.y,SPIN_LAYOUT.width/2,SPIN_LAYOUT.height/2),{n:500,spin:true,boost:35,x:SPIN_LAYOUT.x,y:SPIN_LAYOUT.y,r:102,releaseImpulse:160}),
 solid('dice',ellipse(267,642,50,51),{n:100,x:267,y:642,r:50,releaseImpulse:160}),
 solid('chips-stack',ellipse(672,643,51,52),{n:100,x:672,y:643,r:51,releaseImpulse:160}),
 solid('sling-left',[[135,970],[157,965],[278,1107],[271,1129],[248,1141],[132,1124],[118,1102],[120,990]],{boost:150,restitution:.78}),
 solid('sling-right',[[806,970],[784,965],[663,1107],[670,1129],[693,1141],[809,1124],[823,1102],[821,990]],{boost:150,restitution:.78}),
 solid('roulette-spindle',ellipse(470,890,25,18),{restitution:.8})
];
// Open U-shaped bowl: solid walnut rim and spindle, passable lower mouth.
// Rotor angles are accumulated continuously in world time, never reset on a hit.
const roulette={x:470,y:890,angle:0,angularSpeed:.12,light:0,cooldown:0,inside:false};
function syncRouletteGate(){
 const rim=world.shapes.find(s=>s.id==='roulette-rim'),enabled=rules.bets.black+rules.bets.red>0;
 if(!rim)return;
 if(enabled&&rim.disabled){rim.ignoreBalls=new Set(liveBalls.filter(b=>PinballPhysics.contact(b,rim)).map(b=>b.id));}
 rim.disabled=!enabled;
 if(!enabled)rim.ignoreBalls=new Set();
 else for(const id of rim.ignoreBalls||[]){const b=liveBalls.find(b=>b.id===id);if(!b||!PinballPhysics.contact(b,rim))rim.ignoreBalls.delete(id);}
}
function updateRoulette(dt){
 if(rules.bets.black+rules.bets.red<=0){ball.inBowl=false;return;}
 const rim=world.shapes.find(s=>s.id==='roulette-rim');if(rim.ignoreBalls?.has(ball.id))return;

 const inBowl=((ball.x-roulette.x)/150)**2+((ball.y-roulette.y)/112)**2<1;
 if(inBowl&&!ball.inBowl&&roulette.cooldown===0&&!roulette.owner){
  const dx=ball.x-roulette.x,dy=(ball.y-roulette.y)/.68;
  roulette.radius=Math.hypot(dx,dy);roulette.orbit=Math.atan2(dy,dx);
  const tangent=(-Math.sin(roulette.orbit)*ball.vx+Math.cos(roulette.orbit)*ball.vy/.68)/Math.max(50,roulette.radius);
  roulette.speed=Math.sign(tangent||1)*Math.max(1.2,Math.min(5,Math.abs(tangent)));
  roulette.owner=ball.id;ball.phase='roulette';roulette.settlementId=rules.enterRoulette(ball.stakeMultiplier||1);roulette.stable=0;roulette.phase='rolling';state='roulette';toast('ROULETTE');
 }
 roulette.inside=inBowl;ball.inBowl=inBowl;
}
function stepRoulette(dt){
 if(roulette.phase!=='rolling')return;
 const previousX=ball.x,previousY=ball.y;
 roulette.speed*=Math.exp(-1.65*dt);
 roulette.radius+=(125-roulette.radius)*(1-Math.exp(-3*dt));
 roulette.orbit+=roulette.speed*dt;
 ball.x=roulette.x+Math.cos(roulette.orbit)*roulette.radius;
 ball.y=roulette.y+Math.sin(roulette.orbit)*roulette.radius*.68;
 ball.vx=(ball.x-previousX)/dt;ball.vy=(ball.y-previousY)/dt;
 const settled=Math.hypot(ball.vx,ball.vy)<8&&Math.abs(roulette.angularSpeed)<.05;
 roulette.stable=settled?roulette.stable+dt:0;
 if(roulette.stable>=.3){
  ball.vx=0;ball.vy=0;roulette.phase='resolved';roulette.angularSpeed=0;roulette.cooldown=2.5;
  study?.event('hit','roulette');const stockBefore=balls,launchesBefore=goLaunched;const result=rules.settleRoulette(roulette.settlementId,PinballRules.rouletteColor(roulette.orbit-roulette.angle),Math.min(Number.MAX_SAFE_INTEGER-balls,Number.MAX_SAFE_INTEGER-ammoAwarded,Number.MAX_SAFE_INTEGER-rainPending-Math.max(0,balls-9)));if(result?.award){art?.skin?.celebrate?.();awardBalls(result.award,true);sound?.cue('collect',1,470);}if(result){settlementHistory.push({...result,owner:ball.id,stockBefore,stockAfterCredit:stockBefore+result.award,stockAfter:balls,rainPending,rainLaunched,launchesBefore,launchesAfter:goLaunched,relativeAngle:roulette.orbit-roulette.angle,liveAtCredit:liveBalls.map(b=>({id:b.id,phase:b.phase,stake:b.stakeMultiplier})),reservationsAtCredit:goReservations,followups:[],followupElapsed:0});if(settlementHistory.length>20)settlementHistory.shift();}syncRouletteGate();updateGoals();
  roulette.light=2.2;reactions?.hit('roulette',.7,ball.x,ball.y);
  roulette.releaseWait=.45;
 }
}
function animateRoulette(dt){
 const target=roulette.owner?0:roulette.light>0?2.8:.12;
 roulette.angularSpeed+=(target-roulette.angularSpeed)*(1-Math.exp(-dt*(roulette.owner?2:roulette.light>0?1.9:.65)));
 roulette.angle=(roulette.angle+roulette.angularSpeed*dt)%(Math.PI*2);
 roulette.light=Math.max(0,roulette.light-dt);
}
const bumpers=tableShapes.filter(s=>s.n);
let ball={x:894,y:1240,vx:0,vy:0,r:17,omega:0,angle:0,trail:[]};
const flippers=[{x:240,y:1198,a:.48,rest:.48,side:1},{x:702,y:1198,a:Math.PI-.48,rest:Math.PI-.48,side:-1}].map(f=>({...f,length:190,radius:34,omega:0}));
const world=new World(tableShapes,(shape,speed)=>{
  if(shape.id==='roulette-spindle')roulette.light=Math.max(roulette.light,.45);
  if(shape.n){study?.event('hit',shape.id);reactions?.hit(shape.id,speed/700,shape.x,shape.y);if(shape.id==='chip-left'||shape.id==='chip-right')collectTarget(shape.id);else if(!shape.spin)add(shape.n*(ball.stakeMultiplier||1),ball.x,ball.y);}
  else if(speed>120){sound?.cue('wall',Math.min(1,speed/900),ball.x);if(shape.id?.startsWith('sling'))reactions?.hit(shape.id,speed/1000,ball.x,ball.y);}
  if(shape.spin&&spinCooldown<=0){const result=rules.beginSpin(speed);if(result){spinTime=2.1;spinElapsed=0;spinResult=result.symbols;spinCooldown=3;feedback?.beginSpin(spinResult,result.plan);$('reels').hidden=false;sound?.cue('spin');updateChargeUI();toast(`SPIN x${result.multiplier}`);}}
});
// A ball constrained to the visible shooter rail conserves tangential speed,
// with gravity/rolling loss. It exits continuously into the playfield (no teleport).
const launchPoints=[[894,1240],[890,1000],[886,750],[881,520],[874,365],[860,280],[837,216],[806,173],[766,141],[716,117],[660,99],[600,89],[540,87],[480,91],[426,101],[382,116],[350,138],[331,169],[323,203],[309,232],[287,255],[245,276]];
function makeLaunchSegments(points){return points.slice(1).map((b,i)=>{const a=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);return {a,b,length,tx:(b[0]-a[0])/length,ty:(b[1]-a[1])/length};}).filter(s=>s.length>.001);}
let launchSegments=makeLaunchSegments(launchPoints);
let launchTravel=0,launchSegment=0,launchDistance=0,launchSpeed=0,debugPhysics=false;
const BALL_TIME_SCALE=2;
// Winnings add ammunition. Only accepted GO presses authorize a launch.
let peakLive=0,goReservations=0,goLaunched=0,flipperClock=0;
let liveBalls=[],nextBallId=1,ammoAwarded=0,queueWait=0,launchSeed=1;
const MAX_LIVE_BALLS=12;
let rainPending=0,rainLaunched=0,rainWait=0,rainSeed=1;
const RAIN_THRESHOLD=10,RAIN_INTERVAL=.2;
const STAKE_TIERS=Object.freeze([1,5,10,50,100,500]);
let selectedStake=1,goStakes=[],stakeHistory=[],settlementHistory=[];
function affordableStake(){const options=STAKE_TIERS.filter(n=>n<=balls);if(!options.includes(selectedStake))selectedStake=options.filter(n=>n<=selectedStake).pop()||1;return options;}
function cycleStake(){if(settingsOpen||state==='paused')return;stopAuto('MANUAL');const options=affordableStake();if(options.length)selectedStake=options[(options.indexOf(selectedStake)+1)%options.length];syncGo();}

function launchRandom(){launchSeed=(Math.imul(launchSeed,1664525)+1013904223)>>>0;return launchSeed/4294967296;}
function attachBall(b,phase='play'){b.id=nextBallId++;Object.defineProperty(b,'stakeMultiplier',{value:STAKE_TIERS.includes(b.stakeMultiplier)?b.stakeMultiplier:1,enumerable:true,writable:false});b.phase=phase;b.magic=typeof PinballMagicTrail==='undefined'?null:new PinballMagicTrail();b.stall={time:0,anchor:{x:b.x,y:b.y},count:0};liveBalls.push(b);peakLive=Math.max(peakLive,liveBalls.length);return b;}
function awardBalls(n,rouletteReward=false){if(!Number.isSafeInteger(n)||n<0||!Number.isSafeInteger(balls+n)||!Number.isSafeInteger(ammoAwarded+n))throw Error('Invalid ammunition award');const reserve=rouletteReward&&n>0&&balls+n>=RAIN_THRESHOLD?balls+n-(RAIN_THRESHOLD-1):0;if(!Number.isSafeInteger(rainPending+reserve))throw Error('Rain reservation overflow');balls+=n;ammoAwarded+=n;if(reserve){balls-=reserve;rainPending+=reserve;}updateUI();syncGo();}
function queueRain(dt){
 rainWait=Math.max(0,rainWait-dt);if(!rainPending||rainWait>0||liveBalls.length>=MAX_LIVE_BALLS)return;
 const random=()=>{rainSeed=(Math.imul(rainSeed,1664525)+1013904223)>>>0;return rainSeed/4294967296;};
 const side=random()<.5;const x=side?195+35*random():715+40*random();
 const b=attachBall({x,y:-20,vx:0,vy:220+100*random(),r:17,omega:0,angle:0,trail:[],stakeMultiplier:1},'rain');b.launchSource='roulette-rain';rainPending--;rainLaunched++;rainWait=RAIN_INTERVAL;sound?.cue('launch',.3,b.x);
}
function fleetState(){if(!liveBalls.length)return 'play';return liveBalls.some(b=>b.phase==='play'||b.phase==='rain')?'play':liveBalls.some(b=>b.phase==='launch')?'launch':liveBalls.some(b=>b.phase==='roulette')?'roulette':'ready';}
function syncGo(){const options=affordableStake(),selector=$('stakeSelector');if(selector){setHudText(selector,'BET\nx'+selectedStake);const disabled=settingsOpen||state==='paused'||options.length===0;if(selector.disabled!==disabled)selector.disabled=disabled;selector.setAttribute('aria-label','Launch stake x'+selectedStake+' - costs '+selectedStake+' ammunition');}const b=$('launch');if(!b)return;const disabled=settingsOpen||state==='paused'||!!(art&&!ready)||(!['intro','over'].includes(state)&&balls<=0);if(b.disabled!==disabled)b.disabled=disabled;b.setAttribute('aria-label',state==='over'?'GO next game':'GO launch - remaining '+balls+' balls');}
function go(diagnostic=false){
 if(!diagnostic)sound?.unlock?.()?.then(showSound);
 if(!diagnostic)stopAuto('MANUAL');else study?.markAutomatic(auto?.seed||1);
 if(settingsOpen||state==='paused'||(art&&!ready))return false;
 if(state==='intro'){const requestedStake=selectedStake;start();selectedStake=requestedStake;}else if(state==='over')start();
 if(balls<=0)return false;
 affordableStake();const stake=selectedStake;if(balls<stake)return false;balls-=stake;goStakes.push(Object.freeze({stake,source:diagnostic?'diagnostic-auto':'user-go'}));goReservations++;stakeHistory.push({stake,source:diagnostic?'diagnostic-auto':'user-go'});if(stakeHistory.length>100)stakeHistory.shift();study?.event('inputs');
 if(state==='ready'){for(const b of liveBalls)b.magic?.clear();liveBalls=[];state='play';}
 updateUI();syncGo();return true;
}
function automaticFlippers(dt){
 flipperClock+=dt;const pulse=flipperClock%.32<.055;
 for(const side of ['left','right']){const near=liveBalls.some(b=>b.phase==='play'&&b.y>1060&&b.y<1280&&(side==='left'?b.x<475:b.x>=475));setFlipper(side,pulse&&near,true);}
}
function queueLaunch(dt){
 queueWait=Math.max(0,queueWait-dt);
 if(!goReservations||queueWait>0||liveBalls.length>=MAX_LIVE_BALLS||liveBalls.some(b=>b.phase==='launch'||b.phase==='ready'||Math.hypot(b.x-894,b.y-1240)<70))return;
 const reservation=goStakes.shift()||{stake:1,source:'legacy-test'};const b=attachBall({x:894,y:1240,vx:0,vy:0,r:17,omega:0,angle:0,trail:[],stakeMultiplier:reservation.stake},'launch');b.launchSource=reservation.source;
 b.rail={segments:makeLaunchSegments(launchPoints),travel:0,speed:350+1550*(.8+.2*launchRandom())};b.goAuthorized=true;
 goReservations--;goLaunched++;queueWait=.45;study?.event('launches');sound?.cue('launch',.7,894);reactions?.hit('launch',.5,894,1240);
}

let lastLaunchPower=null,launchMethod='hold',lastLaunchReturned=false;
let charging=false,charge=0,recoil=0,stalledFor=0,stallAnchor={x:0,y:0},recoveryCount=0,sessionRecoveries=0;
function cancelCharge(){sound?.charge(0,false);charging=false;charge=0;if(state==='ready')ball.y=1240;updateChargeUI();}
function returnGuidance(){return 'Last launch '+lastLaunchPower+'% did not reach the board. '+(launchMethod==='selected'?'Increase the selected power and retry.':'Hold longer before release.')+' No ammunition lost.';}
function updateChargeUI(){
 if($('launchHint'))$('launchHint').textContent=lastLaunchReturned?returnGuidance():'Select launch power. Low power returns before reaching the board.';
 syncLaunchChoice();
 updateGoals();
 $('power').style.setProperty('--charge',`${Math.round(charge*100)}%`);
 $('power').setAttribute('aria-valuenow',String(Math.round(charge*100)));
 $('chargeText').textContent='GO';
}
function beginCharge(){
 if(art&&!ready)return;
 if(state==='intro'||state==='over')start();
 if(state!=='ready'||charging)return;
 launchMethod='hold';charging=true;charge=0;$('toast').textContent='';updateChargeUI();
}
function inShooterLane(b){
 if(b.phase!=='play'||roulette.owner===b.id||b.y<260||b.y>=1430)return false;
 const p=world.shapes.find(s=>s.id==='shooter-divider').points;
 for(let i=1;i<p.length;i++){const a=p[i-1],z=p[i];if(b.y>=a[1]&&b.y<=z[1]){const x=a[0]+(z[0]-a[0])*(b.y-a[1])/(z[1]-a[1]);return b.x>x+b.r+3;}}return false;
}
function returnSameBallToPlay(b,reason){
 if(b.phase!=='play'||roulette.owner===b.id||b.y>=1430)return false;
 const xs=b.x<470?[210,230,730,750]:[730,750,210,230];let point=null;
 for(const y of [330,350])for(const x of xs){const probe={...b,x,y,r:b.r+3};if(!point&&!world.shapes.some(s=>PinballPhysics.contact(probe,s)))point={x,y};}
 if(!point)return false;
 Object.assign(b,point,{vx:b.x<470?60:-60,vy:180,omega:0});b.trail=[];b.magic?.clear();b.recoveryOrigin=null;b.stall={time:0,anchor:{...point},count:0};
 b.recoveryLog??=[];b.recoveryLog.push({reason,time:world.time,x:b.x,y:b.y});if(b.recoveryLog.length>8)b.recoveryLog.shift();study?.event('nudges');sessionRecoveries++;return true;
}
function recoverStall(dt){
 if(ball.recoveryOrigin&&Math.hypot(ball.x-ball.recoveryOrigin.x,ball.y-ball.recoveryOrigin.y)>120){recoveryCount=0;ball.recoveryOrigin=null;}
 if(Math.hypot(ball.x-stallAnchor.x,ball.y-stallAnchor.y)>35){stallAnchor={x:ball.x,y:ball.y};stalledFor=0;}
 else stalledFor+=dt;
 if(stalledFor>1.4){
  if(recoveryCount>=2&&returnSameBallToPlay(ball,'failed-nudges')){stallAnchor={x:ball.x,y:ball.y};stalledFor=0;recoveryCount=0;return;}
  ball.recoveryOrigin??={x:ball.x,y:ball.y};
  // A small cabinet nudge, never a teleport or score award. Alternating lateral
  // impulses break stable two-surface pockets without trapping the ball again.
  const toward=(ball.x<470?1:-1)*(ball.y<750?-1:1);
  ball.vx+=toward*(ball.y<750?500:(recoveryCount%2?-210:240));ball.vy-=ball.y<750?700:400;
  study?.event('nudges');recoveryCount++;sessionRecoveries++;stalledFor=0;toast('NUDGE · Recovery nudge');
 }
}


function toast(t){$('toast').textContent=t;toastTime=2;}
function updateUI(){setHudText($('score'),compactNumber(score));setHudText($('balls'),compactNumber(balls));if(score>best){best=score;setHudText($('best'),compactNumber(best));try{localStorage.setItem('royal-flush-best-v3',best);}catch{}}}
function add(n,x,y){
 if(!Number.isSafeInteger(n)||n<0||!Number.isSafeInteger(score+n))throw Error('Score exceeds safe integer range');score+=n;art?.react?.(n>=1500?1:.25);updateUI();feedback?.score(n,x,y);sound?.cue(n>=10000?'jackpot':n===250?'roulette':'bumper',1,x);
 if(!feedback?.reduced)for(let i=0;i<(n>=10000?30:7);i++){const a=fxRandom()*Math.PI*2,speed=95+fxRandom()*160;particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-180,life:.8,size:19+fxRandom()*13,angle:fxRandom()*6.28});}
 if(particles.length>100)particles.splice(0,particles.length-100);
}
function collectTarget(id){
 if(!rules.collect(id,world.time))return false;syncRouletteGate();study?.event('collects');
 art?.react?.(1);sound?.cue('collect',1,id==='chip-left'?217:id==='chip-right'?721:470);
 
 updateChargeUI();updateGoals();return true;
}
function endGame(){
 study?.finish();showStudy();
 sound?.charge(0,false);state='over';syncLaunchChoice();syncGo();keys.left=keys.right=false;
 $('overlay').hidden=false;$('overlay').querySelector('h2').textContent='Play again.';
 $('overlay').querySelector('p').textContent=`SCORE ${score.toLocaleString()} · BEST ${best.toLocaleString()}`;
 $('start').textContent='Play again';
}
function resetBall(){liveBalls=[];ball={x:894,y:1240,vx:0,vy:0,r:17,omega:0,angle:0,trail:[]};attachBall(ball,'ready');roulette.owner=null;magic?.clear();lastLaunchReturned=false;roulette.phase='idle';roulette.stable=0;roulette.inside=false;roulette.cooldown=0;Object.assign(ball,{x:894,y:1240,vx:0,vy:0,omega:0,angle:0,trail:[]});for(const f of flippers){f.a=f.rest;f.omega=0;}keys.left=keys.right=false;state='ready';charging=false;charge=0;recoil=0;stalledFor=0;recoveryCount=0;updateChargeUI();$('launch').disabled=false;toast('');}
function start(){if(art&&!ready)return;study?.start('go-ammo-v4+stake-v1+rain-v1',auto?.running?'automation':$('studySource')?.value||'browser-unverified',$('studySource')?.value||'browser-unverified');if(auto?.running)study?.markAutomatic(auto.seed);if(study?.current)study.current.executionMode=auto?.running&&$('autoFastTest')?.checked?'fixed-step-browser-test':'realtime-input';art?.skin?.resetClips?.();sound?.stopAll();sound?.pause(false);feedback?.clear();reactions?.clear();roulette.light=0;roulette.angle=0;roulette.angularSpeed=.12;sessionRecoveries=0;for(const shape of world.shapes){shape.lastHit=-Infinity;shape.lastRelease=-Infinity;}lastLaunchPower=null;$('power').setAttribute('data-last','false');score=0;balls=10;peakLive=0;rainPending=rainLaunched=rainWait=0;goReservations=goLaunched=0;goStakes=[];stakeHistory=[];settlementHistory=[];selectedStake=1;flipperClock=0;world.ballContacts=0;ammoAwarded=0;queueWait=0;nextBallId=1;launchSeed=(Number($('autoSeed')?.value)||1)>>>0;rainSeed=(launchSeed^0x9e3779b9)>>>0;spinTime=0;spinCooldown=0;resultHold=0;rules.reset();particles=[];if(!feedback)$('reels').hidden=true;$('overlay').hidden=true;updateUI();resetBall();syncRouletteGate();syncGo();}
function launch(){
 if(state!=='ready'||!charging)return;
 lastLaunchReturned=false;study?.event('launches');charging=false;state='launch';launchSegment=0;launchDistance=0;launchTravel=0;
 lastLaunchPower=Math.round(charge*100);
 $('power').style.setProperty('--last-charge',`${lastLaunchPower}%`);$('power').setAttribute('data-last','true');
 launchSpeed=350+1550*charge;
 launchSegments=makeLaunchSegments([[ball.x,ball.y],...launchPoints]);
 ball.phase='launch';ball.rail={segments:launchSegments,travel:0,speed:launchSpeed};ball.vy=-launchSpeed;recoil=.25;charge=0;updateChargeUI();
 $('launch').disabled=true;sound?.cue('launch',1,894);reactions?.hit('launch',.5,894,1240);$('toast').textContent='';
}
function pause(){stopAuto('PAUSED');cancelCharge();if(state==='intro'||state==='over')return;if(state==='paused'){state=prior;toast('RESUME');$('pause').textContent='Ⅱ';}else{prior=state;state='paused';toast('PAUSED');toastTime=Infinity;$('pause').textContent='▶';}keys.left=keys.right=false;sound?.pause(state==='paused');syncLaunchChoice();syncGo();}
function syncLaunchChoice(){const b=$('launchChoice');if(b)b.disabled=state!=='ready'||charging;}
function launchChoice(){
 if(state!=='ready'||charging)return;
 const power=Number($('launchPowerChoice').value)/100;
 if(!Number.isFinite(power)||power<0||power>1)return;
 beginCharge();if(!charging)return;launchMethod='selected';charge=power;ball.y=1240+110*power;launch();
}
if($('launchChoice')){$('launchChoice').onclick=()=>{stopAuto('MANUAL');launchChoice();};$('launchPowerChoice').oninput=()=>{stopAuto('MANUAL');$('launchPowerLabel').textContent='Selected '+$('launchPowerChoice').value+'%';};syncLaunchChoice();}
function showAuto(){if(!auto||!$('autoStatus'))return;const message='AUTO '+auto.reason+' | '+auto.completed+'/'+(auto.runs||0)+' games | seed '+(auto.seed||1);if($('autoStatus').textContent!==message)$('autoStatus').textContent=message;$('autoStart').disabled=auto.running;$('autoStop').disabled=!auto.running;}
function stopAuto(reason='MANUAL'){if(reason==='MANUAL')study?.markManual?.();if(!auto?.running)return;auto.stop(reason);sound?.cue('auto-stop',.4);keys.left=keys.right=false;cancelCharge();showAuto();}
function autoStep(dt){if(!auto?.running)return;const action=auto.tick(dt,{state,x:ball.x,y:ball.y,score});if(!action)return;
 if(action.stop){stopAuto(action.stop);if(action.stop==='TIME LIMIT'&&state!=='over'&&state!=='intro'&&state!=='paused')pause();return;}
 if(action.start){start();study?.markAutomatic(auto.seed);}
 if(action.launch!==undefined){selectedStake=1;go(true);}
 showAuto();
}
if(auto){$('autoStart').onclick=()=>{sound?.unlock?.()?.then(showSound);if(art&&!ready)return;if(settingsOpen){closeSettings();if(state==='paused')pause();}if(state==='paused'){toast('Resume before starting AUTO');return;}cancelCharge();keys.left=keys.right=false;auto.begin({seed:$('autoSeed').value,runs:$('autoRuns').value,limit:$('autoLimit').value});study?.markAutomatic(auto.seed);sound?.cue('auto-start',.4);showAuto();};$('autoStop').onclick=()=>stopAuto('STOPPED');
 window.addEventListener('blur',()=>stopAuto('FOCUS LOST'));window.addEventListener('pagehide',()=>stopAuto('PAGE EXIT'));document.addEventListener?.('visibilitychange',()=>{document.documentElement?.setAttribute('data-background',String(!!document.hidden));if(document.hidden)stopAuto('HIDDEN');});showAuto();}
$('start').onclick=()=>{stopAuto('MANUAL');start();};
const launchButton=$('launch');
launchButton.onclick=()=>go();
if($('stakeSelector'))$('stakeSelector').onclick=cycleStake;
$('pause').onclick=()=>{if(!settingsOpen){pause();return;}if(settingsResume==='paused')settingsResume=prior;else{prior=settingsResume;settingsResume='paused';}$('pause').textContent=settingsResume==='paused'?'Keep paused: ON':'Keep paused: OFF';};
function openSettings(){if(settingsOpen)return;settingsResume=state;stopAuto('SETTINGS');cancelCharge();keys.left=keys.right=false;settingsOpen=true;state='paused';sound?.pause(true);$('settingsDialog').hidden=false;$('gameSurface').inert=true;$('pause').textContent=settingsResume==='paused'?'Keep paused: ON':'Keep paused: OFF';$('settingsClose').focus?.();syncGo();}
function closeSettings(){if(!settingsOpen)return;settingsOpen=false;$('settingsDialog').hidden=true;$('restartConfirm').hidden=true;$('studyDeleteConfirm').hidden=true;$('gameSurface').inert=false;if(settingsResume==='paused')state='paused';else if(document.hidden){prior=settingsResume;state='paused';}else state=settingsResume;keys.left=keys.right=false;acc=0;prev=performance.now();sound?.pause(state==='paused');syncGo();$('settingsOpen').focus?.();}
$('settingsOpen').onclick=openSettings;$('settingsClose').onclick=closeSettings;
$('restartRequest').onclick=()=>{$('restartConfirm').hidden=false;$('restartCancel').focus?.();};$('restartCancel').onclick=()=>{$('restartConfirm').hidden=true;$('restartRequest').focus?.();};$('restartConfirmButton').onclick=()=>{closeSettings();stopAuto('MANUAL');start();};
$('studyDeleteCancel').onclick=()=>{$('studyDeleteConfirm').hidden=true;$('studyClear').focus?.();};$('studyDeleteAccept').onclick=()=>{study?.clear();showStudy();$('studyDeleteConfirm').hidden=true;};
$('settingsDialog').onkeydown=e=>{if(e.code==='Escape'||e.key==='Escape'){e.preventDefault();e.stopPropagation?.();if(!$('restartConfirm').hidden){$('restartCancel').onclick();}else if(!$('studyDeleteConfirm').hidden){$('studyDeleteCancel').onclick();}else closeSettings();return;}if(e.key==='Tab'){const nodes=[...($('settingsDialog').querySelectorAll?.('button,input,select,summary,[tabindex="0"]')||[])].filter(n=>!n.disabled&&n.getClientRects?.().length);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}};
function showSound(){if(!sound)return;muted=!sound.enabled;$('sound').textContent=muted?'OFF':'ON';$('sound').setAttribute('aria-pressed',String(!muted));$('audioStatus').textContent=sound.error||(muted?'Sound OFF':sound.ctx?'Music and effects ON':'Sound ON - press GO to start');}
function saveSoundChoice(enabled=sound.enabled){try{localStorage.setItem('royal-flush-audio-choice-v1',JSON.stringify({enabled:!!enabled,explicit:true}));}catch{}}
$('sound').onclick=async()=>{if(!sound)return;const wanted=!sound.enabled;await sound.enable(wanted);saveSoundChoice(wanted);if(settingsOpen)sound.pause(true);showSound();if(sound.enabled)sound.cue('spin');};
if(sound&&feedback){
 const applySettings=(save=true)=>{sound.levels(Number($('musicLevel').value)/100,Number($('sfxLevel').value)/100);feedback.reduced=$('reduceMotion').checked;if(save)try{localStorage.setItem('royal-flush-settings',JSON.stringify({music:sound.musicLevel,sfx:sound.sfxLevel,reduced:feedback.reduced}));}catch{}};
 try{const saved=JSON.parse(localStorage.getItem('royal-flush-settings')||'null');if(saved){$('musicLevel').value=Math.max(0,Math.min(100,saved.music*100));$('sfxLevel').value=Math.max(0,Math.min(100,saved.sfx*100));feedback.reduced=!!saved.reduced;}
 const choice=JSON.parse(localStorage.getItem('royal-flush-audio-choice-v1')||'null');if(choice?.explicit&&typeof choice.enabled==='boolean')sound.enabled=choice.enabled;
 else if(saved&&typeof saved.muted==='boolean')sound.enabled=!saved.muted;
 else if(saved&&typeof saved.enabled==='boolean')sound.enabled=saved.enabled;
 }catch{}
 $('reduceMotion').checked=feedback.reduced;for(const id of ['musicLevel','sfxLevel','reduceMotion'])$(id).oninput=()=>applySettings();applySettings(false);showSound();$('start').disabled=!ready;
}
function setFlipper(side,active,automatic=false){if(!automatic&&active&&!keys[side]&&['play','launch','roulette'].includes(state))study?.event('inputs');if(active&&!keys[side]&&['ready','play','launch','roulette'].includes(state))sound?.cue('flipper',1,side==='left'?240:702);keys[side]=active&&['ready','play','launch','roulette'].includes(state);}
window.addEventListener('keydown',e=>{if(settingsOpen)return;if(e.target?.matches?.('input,select'))return;if(['KeyP','Escape'].includes(e.code)&&!e.repeat){e.preventDefault();pause();}});
window.addEventListener('blur',()=>{cancelCharge();keys.left=keys.right=false;if(['play','launch','ready','roulette','settling'].includes(state))pause();});
function physics(dt){
 if(settingsOpen)return;if(['paused','intro','over','settling'].includes(state)||document.hidden){if(state==='over'||state==='intro')autoStep(dt);return;}
 autoStep(dt);if(state==='paused'||state==='over')return;automaticFlippers(dt);
 for(const entry of settlementHistory){entry.followupElapsed+=dt;const target=entry.followups.length===0?1:3;if(entry.followups.length<2&&entry.followupElapsed>=target)entry.followups.push({afterSeconds:target,stock:balls,hud:$('balls').textContent,state,live:liveBalls.length,captured:roulette.owner,reservations:goReservations,launched:goLaunched});}
 if(study?.current)study.tick(dt,['play','launch','roulette'].includes(state));
 animateRoulette(dt);recoil=Math.max(0,recoil-dt);
 // Compatibility with direct deterministic single-ball fixtures.
 if(liveBalls.length===1&&liveBalls[0].phase!=='rain'&&['ready','launch','play','roulette'].includes(state))liveBalls[0].phase=state;
 if(state==='ready'){if(charging){charge=Math.min(1,charge+dt/1.2);ball.y=1240+110*charge;updateChargeUI();}world.updateFlippers(flippers,keys,dt*BALL_TIME_SCALE);return;}
 queueLaunch(dt);queueRain(dt);
 syncRouletteGate();
 const scaled=dt*BALL_TIME_SCALE;
 roulette.cooldown=Math.max(0,roulette.cooldown-dt);

 const free=liveBalls.filter(b=>b.phase==='play');
 for(const b of free)if(inShooterLane(b))returnSameBallToPlay(b,'shooter-lane');
 world.stepMany(free,flippers,keys,scaled,b=>{ball=b;});
 for(const b of [...liveBalls]){
  ball=b;
  if(b.phase==='rain'){b.vy+=world.gravity*scaled;b.y+=b.vy*scaled;if(b.y>=300){b.phase='play';if(world.shapes.some(s=>world.enabled(s,b)&&PinballPhysics.contact(b,s)))returnSameBallToPlay(b,'rain-clearance');}}
  else if(b.phase==='launch'){
   const r=b.rail;let distance=r.travel,segment=0;
   while(segment<r.segments.length-1&&distance>r.segments[segment].length){distance-=r.segments[segment++].length;}
   r.speed+=(world.gravity*r.segments[segment].ty-world.drag*r.speed)*scaled;r.travel=Math.max(0,r.travel+r.speed*scaled);
   distance=r.travel;segment=0;while(segment<r.segments.length-1&&distance>r.segments[segment].length){distance-=r.segments[segment++].length;}
   const rail=r.segments[segment],d=Math.min(distance,rail.length);b.x=rail.a[0]+rail.tx*d;b.y=rail.a[1]+rail.ty*d;b.vx=rail.tx*r.speed;b.vy=rail.ty*r.speed;
   launchSpeed=r.speed;launchTravel=r.travel;launchSegment=segment;
   if(r.speed<0&&b.y>=1240){if(b.goAuthorized){goStakes.unshift(Object.freeze({stake:b.stakeMultiplier,source:b.launchSource}));goReservations++;goLaunched--;liveBalls=liveBalls.filter(x=>x!==b);}else{study?.event('returns');resetBall();lastLaunchReturned=true;sound?.cue('return',.5,894);updateChargeUI();toast(returnGuidance());}return;}
   if(segment===r.segments.length-1&&distance>=rail.length)b.phase='play';
  }else if(b.phase==='roulette'){
   if(roulette.phase==='rolling')stepRoulette(dt);
   else if(roulette.phase==='resolved'){roulette.releaseWait-=dt;if(roulette.releaseWait<=0){roulette.phase='idle';roulette.owner=null;b.phase='play';b.vx=(470-b.x)*1.5;b.vy=230;}}
  }else if(b.phase==='play'){
   updateRoulette(dt);
   if(b.phase==='play'){stalledFor=b.stall.time;stallAnchor=b.stall.anchor;recoveryCount=b.stall.count;recoverStall(dt);b.stall={time:stalledFor,anchor:stallAnchor,count:recoveryCount};}
   if(b.y>1430||b.x<-b.r||b.x>W+b.r){study?.event('drains');b.magic?.clear();liveBalls=liveBalls.filter(x=>x!==b);sound?.cue('drain');}
  }
  b.magic?.update(dt,b,b.phase,!!feedback?.reduced);
 }
 if(!liveBalls.length&&!goReservations&&!rainPending){updateUI();if(balls>0)resetBall();else if(spinTime>0){state='settling';keys.left=keys.right=false;}else endGame();}
 else {state=fleetState();let lowest=null;for(const b of liveBalls)if(b.phase==='play'&&(!lowest||b.y>lowest.y))lowest=b;ball=lowest||liveBalls[0]||ball;}
 syncGo();
}
$('debug').onclick=()=>{debugPhysics=!debugPhysics;$('debug').setAttribute('aria-pressed',String(debugPhysics));};
let renderSubmissions=0;
function render(dt){renderSubmissions++;
 const target=scene?scene.measure():typeof PinballPowerProfile==='undefined'?{width:Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2)),height:Math.round(canvas.clientHeight*Math.min(devicePixelRatio||1,2))}:PinballPowerProfile.size(canvas.clientWidth,canvas.clientHeight,devicePixelRatio||1,powerMode),{width,height}=target;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,width,height);gl.clearColor(8/255,19/255,17/255,1);gl.clear(gl.COLOR_BUFFER_BIT);scene?.draw(art,powerBudget().mode==='low');if(!ready)return;
 const boardViewport=scene?.measure().viewport||[0,0,width,height];gl.viewport(...boardViewport);if(scene){gl.enable(gl.SCISSOR_TEST);gl.scissor(...boardViewport);}
 art.lowPower=powerBudget().mode==='low';art.begin();
 // 1. Intact empty felt background, never covered by patches.
 art.draw('board-clean',W/2,H/2,W,H);
 const bartenderKey=art.skin.characterKey(),bartenderScale=art.assets[bartenderKey]?.drawScale||1;art.draw(bartenderKey,165,278,560*bartenderScale,560*bartenderScale);
 art.draw(PINBALL_CHARACTER_STATES.goblin.idle,812,148,250,187.5);
 art.draw(PINBALL_CHARACTER_STATES.waiter.idle,145,1672,540,540);
 // Printed decoration shares the object's anchor; no baked-in stale mounting ring.
 art.draw('spin-decal',SPIN_LAYOUT.x,SPIN_LAYOUT.y,316,316,{projection:.96});
 // 2. Rotor rotates in its own circular plane, then projects onto the table.

 art.shadow('roulette-frame',470,875,464,350);
 art.draw('roulette-disc',470,890,380,380,{angle:roulette.angle,projection:.68});
 art.draw('roulette-frame',470,875,464,350,{brightness:reactions?.betInvitation('roulette',rules.bets,rules.multiplier,art.skin.time,!!feedback?.reduced,state==='play'&&spinTime===0&&!document.hidden).brightness||1});
 // The foot ellipse (82% down the sprite) sits on the rotor's axle.
 art.shadow('spindle',roulette.x,roulette.y,70,104,{anchorY:.82});
 art.draw('spindle',roulette.x,roulette.y,70,104,{anchorY:.82});
 // 3. Independent static objects, with real alpha edges.
 art.shadow('slot',470,320,410,300);
 art.draw('slot',470,320,410,300,{brightness:reactions?.pose('slot',feedback?.reduced).brightness||1});
 const objects=[['bumper',217,524,156,152],['blue-bumper',721,524,156,152],['spin',SPIN_LAYOUT.x,SPIN_LAYOUT.y,SPIN_LAYOUT.width,SPIN_LAYOUT.height],['dice',267,642,100,102],['chips-stack',672,643,102,104]];
 for(const [name,x,y,w,h] of objects){const id=bumpers.find(b=>b.x===x&&b.y===y)?.id;const pose=reactions?.pose(id,feedback?.reduced)||{sx:1,sy:1,brightness:1};const invite=reactions?.betInvitation(id,rules.bets,rules.multiplier,art.skin.time,!!feedback?.reduced,state==='play'&&spinTime===0&&!document.hidden)||{angle:0,brightness:1};art.shadow(name,x,y,w,h);art.draw(name,x,y+h/2-(pose.lift||0),w,h,{angle:(pose.angle||0)+invite.angle,anchorY:1,brightness:pose.brightness*invite.brightness});}
 art.shadow('sling',199,1054,165,180);art.shadow('sling',742,1054,165,180,{flip:true});
 art.draw('sling',199,1054,165,180,{brightness:reactions?.pose('sling-left',feedback?.reduced).brightness||1});art.draw('sling',742,1054,165,180,{flip:true,brightness:reactions?.pose('sling-right',feedback?.reduced).brightness||1});
 // 4. Flippers rotate complete sprites about their actual silver pivot.
 for(const f of flippers)art.shadow('flipper',f.x,f.y,260,88,{anchorX:.142,anchorY:.5,flip:f.side<0,angle:f.side<0?f.a-Math.PI:f.a});
 for(const f of flippers)art.draw('flipper',f.x,f.y,260,88,{anchorX:.142,anchorY:.5,flip:f.side<0,angle:f.side<0?f.a-Math.PI:f.a});
 // 5. The spring is three natural sprite slices, not a painted replacement.
 const springTop=1260+110*charge+(lastLaunchReturned&&!feedback?.reduced?45*(.5+.5*Math.sin((art.skin?.time||0)*5)):0)+(recoil>0?Math.sin(recoil*65)*recoil*12:0);
 art.shadow('spring',894,springTop,48,35,{anchorY:0,slice:[0,.14]});
 art.shadow('spring',894,springTop+35,48,1438-springTop-35,{anchorY:0,slice:[.14,.77]});
 art.shadow('spring',894,1438,48,58,{anchorY:0,slice:[.77,1]});
 art.draw('spring',894,springTop,48,35,{anchorY:0,slice:[0,.14]});
 art.draw('spring',894,springTop+35,48,1438-springTop-35,{anchorY:0,slice:[.14,.77]});
 art.draw('spring',894,1438,48,58,{anchorY:0,slice:[.77,1]});
 // 6. Live ball; no painted ball exists in the background.
 const visible=liveBalls.length?liveBalls:[ball];
 let {points,sparks,ghosts}=powerBudget();
 for(const b of visible){
 art.shadow('ball',b.x-3,b.y-5,b.r*2,b.r*2);
 const trail=b.magic;
 if(trail&&!feedback?.reduced){
 gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);for(const [n,o] of [['a',0],['u',8]]){const loc=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,16,o);}gl.uniform2f(gl.getUniformLocation(p,'res'),W,H);
 for(let i=1;i<trail.points.length&&points>0;i++,points--){const a=trail.points[i-1],c=trail.points[i],fade=Math.max(0,1-c.age/.22);capsule(a.x,a.y,c.x,c.y,1.2+2.2*fade,[1,.79,.3,.22*fade]);}
 for(const a of trail.sparks){if(sparks--<=0)break;const fade=Math.max(0,1-a.age/.55);circle(a.x,a.y,1.8*fade,[1,.9,.55,.55*fade]);}
 art.begin();for(const a of trail.points.filter((_,i)=>i%4===0).slice(-6)){if(ghosts--<=0)break;art.draw('ball',a.x,a.y,b.r*1.7,b.r*1.7,{opacity:.19*Math.max(0,1-a.age/.22)});}
 }
 }
 for(const t of particles.slice(-powerBudget().coins))art.draw('coin',t.x,t.y,t.size*Math.max(.16,Math.abs(Math.cos(t.angle*2))),t.size,{angle:.2*Math.sin(t.angle),opacity:Math.min(1,t.life*4),brightness:1.1});
 for(const b of visible)art.draw('ball',b.x,b.y,b.r*2,b.r*2);
 feedback?.drawReels?.(boardViewport);
 ui?.draw(feedback,boardViewport);
 globalThis.pinballStartup?.complete({boardReady:ready,sceneReady:!scene||scene.ready,uiReady:!!ui?.ready,drawCalls:ui?.stats?.drawCalls,contextLost:contextLost||gl.isContextLost()});
 if(false && debugPhysics){
  gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  for(const [n,o] of [['a',0],['u',8]]){const a=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,16,o);}
  for(const s of world.shapes)for(const [a,b] of s.edges)capsule(...a,...b,1.5,[.2,1,.8,.8]);
  for(const f of flippers)capsule(f.x,f.y,f.x+Math.cos(f.a)*f.length,f.y+Math.sin(f.a)*f.length,f.radius,[.3,.8,1,.25]);
 }
}

function updatePresentation(dt){
 art?.advance?.(dt,!!feedback?.reduced);
 reactions?.update(dt);const kick=reactions?.offset(feedback?.reduced)||{x:0,y:0};feedback?.camera(kick.x,kick.y);feedback?.update(dt);sound?.charge(charge,charging&&state==='ready');
 if(resultHold>0&&spinTime===0){resultHold=Math.max(0,resultHold-dt);}
 spinCooldown=Math.max(0,spinCooldown-dt);
 for(const b of bumpers)b.flash=Math.max(0,(b.flash||0)-dt);
 if(spinTime>0){
  spinTime=Math.max(0,spinTime-dt);spinElapsed+=dt;const stopped=feedback?.spin(spinElapsed)||[];for(const i of stopped){sound?.cue('reel-stop',1,380+i*90);reactions?.hit('slot',.25,470,320);}
  if(spinTime===0){const result=rules.settle();feedback?.win(!!result?.jackpot);resultHold=2;if(result){reactions?.hit('slot',1,470,320);updateGoals();}if(state==='settling')endGame();}
 }
 if(toastTime>0){toastTime-=dt;if(toastTime<=0){$('toast').textContent='';if(spinTime<=0&&!feedback)$('reels').hidden=true;}}
 for(const t of particles){t.x+=t.vx*dt;t.y+=t.vy*dt;t.vy+=460*dt;t.life-=dt;t.angle+=dt*2;}
 particles=particles.filter(t=>t.life>0);
}
if($('previewCharacter'))$('previewCharacter').onclick=()=>{if(settingsOpen)closeSettings();if(state!=='paused'){if(study?.current)study.current.previewUsed=true;art?.skin?.celebrate?.('diagnostic-preview');}};
let prev=performance.now(),prevFrameTime=prev,acc=0;
const probe={raf:[],tasks:[],events:[],last:null,started:performance.now(),supported:false};
if(typeof PerformanceObserver!=='undefined'){try{const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())probe.tasks.push({start:+e.startTime.toFixed(1),duration:+e.duration.toFixed(1)});probe.tasks=probe.tasks.slice(-100);});observer.observe({type:'longtask',buffered:true});probe.supported=true;}catch{}}
for(const event of ['focus','blur','pageshow','pagehide'])window.addEventListener(event,()=>{probe.events.push({event,time:performance.now(),hidden:!!document.hidden,focused:document.hasFocus?.()??null});probe.events=probe.events.slice(-20);});
const frameCosts=[],frameIntervals=[];let perfLast=0,perfMode=null;
let frozenRenderKey=null;
function frame(now){
 frameQueued=false;
 if(contextLost)return;
 if(probe.last!==null){probe.raf.push(now-probe.last);if(probe.raf.length>600)probe.raf.shift();}probe.last=now;
 const workStart=performance.now();const currentPerfMode=!!(auto?.running&&$('autoFastTest')?.checked);if(currentPerfMode!==perfMode){frameCosts.length=frameIntervals.length=0;perfMode=currentPerfMode;}
 cues?.update({state,collected:rules.collected,returned:lastLaunchReturned,auto:!!auto?.running,reduced:!!feedback?.reduced,charging});
 if(study?.follow)study.tick(Math.max(0,(now-studyClock)/1000),false);studyClock=now;
 const dt=Math.min((now-prev)/1000,.04);prev=now;
 if(state!=='paused'&&!document.hidden){
 if(auto?.running&&$('autoFastTest')?.checked){if(study?.current)study.current.executionMode='fixed-step-browser-test';for(let frame=0;frame<60&&auto.running&&state!=='paused';frame++){for(let step=0;step<4;step++)physics(1/240);updatePresentation(1/60);}}
 else{acc+=dt;while(acc>=1/240){physics(1/240);acc-=1/240;}updatePresentation(dt);}}
 
 // Frozen scenes need a repaint only on entry, resize/DPR, asset load or motion preference change.
 // Sleep while paused/hidden; input, visibility and resize invalidate the frozen scene.
 if(document.hidden){frozenRenderKey=null;}
 else if(state==='paused'){
  const key=[canvas.clientWidth,canvas.clientHeight,devicePixelRatio||1,ready,scene?.ready,!!feedback?.reduced,powerMode,ui?.revision].join(':');
  if(key!==frozenRenderKey){render(0);frozenRenderKey=key;}
 }else{frozenRenderKey=null;const interval=1000/powerBudget().fps;if(now-lastDraw>=interval-.5){render(0);lastDraw=Number.isFinite(lastDraw)?lastDraw+Math.max(1,Math.floor((now-lastDraw+.5)/interval))*interval:now;}}
 if(!document.hidden&&state!=='paused'){frameCosts.push(performance.now()-workStart);frameIntervals.push((now-prevFrameTime)||0);if(frameCosts.length>600){frameCosts.shift();frameIntervals.shift();}}
 prevFrameTime=now;if(now-perfLast>1000){perfLast=now;const quantile=(a,p)=>{const b=[...a].sort((x,y)=>x-y);return b.length?+b[Math.floor((b.length-1)*p)].toFixed(2):null;};const node=$('performanceReport');if(node)node.textContent=JSON.stringify({build:'2026-10-25-heart-clearance-v1',renderSubmissions,ui:ui?.stats||null,power:{...powerBudget(),backingWidth:canvas.width,backingHeight:canvas.height,boardViewport:scene?.measure().viewport||[0,0,canvas.width,canvas.height]},version:'go-ammo-v4+stake-v1+rain-v1',exactTotals:{score,best,ammo:balls,bets:{...rules.bets},spinMultiplier:rules.multiplier},multiball:{ammoStock:balls,goReservations:goReservations,goLaunched:goLaunched,ammoAwarded,rainPending,rainLaunched,live:liveBalls.length,peak:peakLive,contacts:world.ballContacts||0,cap:MAX_LIVE_BALLS,ids:liveBalls.map(b=>b.id),selectedStake,stakes:liveBalls.map(b=>({id:b.id,stake:b.stakeMultiplier})),reservedStakes:goStakes.map(r=>r.stake),stakeHistory,settlementHistory},characterEvent:art?.skin?.eventReport?.()??null,cadence:{source:'requestAnimationFrame timestamp differences, not screenshot polling',focused:document.hasFocus?.()??null,visibility:document.visibilityState??null,independentSamples:probe.raf.length,independentMedianMs:quantile(probe.raf,.5),independentP95Ms:quantile(probe.raf,.95),longTaskSupported:probe.supported,longTasks:probe.tasks,events:probe.events,elapsedMs:Math.round(performance.now()-probe.started)},samples:frameCosts.length,workMedianMs:quantile(frameCosts,.5),workP95Ms:quantile(frameCosts,.95),intervalMedianMs:quantile(frameIntervals,.5),intervalP95Ms:quantile(frameIntervals,.95),state,fastTest:perfMode,auto:auto?{running:auto.running,reason:auto.reason,completed:auto.completed,history:auto.history}:null,skinTime:art?.skin?.time,reduced:!!feedback?.reduced,hidden:!!document.hidden},null,2);}
 if(state!=='paused'&&!document.hidden)wakeFrame();
}
const powerSelect=$('powerMode');if(powerSelect){powerSelect.value=powerMode;powerSelect.onchange=()=>{powerMode=powerSelect.value==='high'?'high':'low';try{localStorage.setItem('royal-flush-power-v1',powerMode);}catch{}frozenRenderKey=null;lastDraw=-Infinity;wakeFrame();};}
for(const event of ['resize','pointerdown','keydown','change','click'])window.addEventListener(event,()=>{if(!document.hidden)wakeFrame();});
document.addEventListener?.('visibilitychange',()=>{prev=performance.now();acc=0;probe.last=null;lastDraw=-Infinity;if(!document.hidden)wakeFrame();});
syncGo();wakeFrame();


canvas.addEventListener?.('webglcontextlost',e=>{e.preventDefault();globalThis.pinballStartup?.begin('lost');contextResume=state;contextLost=true;stopAuto('CONTEXT LOST');state='paused';ready=false;sound?.pause(true);});
canvas.addEventListener?.('webglcontextrestored',()=>{initGeometry();const skin=art?.skin;art=new SpriteRenderer(gl,PINBALL_ASSETS,()=>{ready=true;contextLost=false;state=contextResume||'ready';acc=0;prev=performance.now();lastDraw=-Infinity;frozenRenderKey=null;syncGo();ui?.invalidate();sound?.pause(state==='paused');wakeFrame();},error=>{globalThis.pinballStartup?.fail('Graphics could not be restored. Reload to try again.');console.error(error)});if(skin)art.skin=skin;feedback?.restoreGL?.();});
