const ReturnCohort=typeof PinballReturnCohort!=='undefined'?PinballReturnCohort:require('./return-cohort.js');
/* Local, opt-in design diagnostics. No identifiers, network or human claims. */
class PinballEngagement {
 constructor(storage=null,clock=()=>Date.now()){this.returns=new ReturnCohort(null,clock);this.storage=storage;this.enabled=false;this.rows=[];this.current=null;this.follow=null;this.storageError=false;try{const saved=JSON.parse(storage?.getItem('pinball-study-v1')||'null');if(saved?.schema===1&&Array.isArray(saved.rows)){this.rows=saved.rows.slice(-100);this.returns=new ReturnCohort(saved.returnCohort||null,clock);}}catch{this.storageError=true;}}
 markManual(){if(this.current&&this.current.mode!=="manual-only"){this.current.mode="mixed-auto";this.current.source="mixed-auto";}}
 markAutomatic(seed){for(const row of [this.current])if(row){row.mode=row.source==='automation'?'auto-only':'mixed-auto';row.source=row.source==='automation'?'automation':'mixed-auto';row.autoPolicy='sparse-reactive-v1';row.autoSeed=seed;}this.persist();}
 persist(force=false){if(!this.enabled&&!force)return;try{this.storage?.setItem('pinball-study-v1',JSON.stringify({schema:1,returnCohort:this.returns.data,rows:this.rows.slice(-100)}));}catch{this.storageError=true;}}
 enable(value){if(!value)this.interrupt();this.enabled=!!value;}
 start(version='goals-v1',source='browser-unverified',returnSource=source){
  if(!this.enabled)return;
  if(this.current)this.finish(false);
  if(this.follow){this.follow.replay=this.follow.wait<60;this.follow.replayInitiator=source==='automation'?'automatic':'manual-input';this.follow=null;}
  this.current={returnStart:this.returns.begin(),returnSource,version,source,originSource:source,mode:source==='automation'?'auto-only':'manual-only',active:0,hits:0,repeats:0,last:null,gap:0,longestGap:0,launches:0,returns:0,drains:0,collects:0,inputs:0,nudges:0};this.persist();
 }
 tick(dt,active){if(!Number.isFinite(dt)||dt<0)return;if(this.follow){this.follow.wait+=dt;if(this.follow.wait>=60){this.follow.replay=false;this.follow=null;this.persist();}}if(active&&this.current){const c=this.current;c.active+=dt;c.gap+=dt;c.longestGap=Math.max(c.longestGap,c.gap);}}
 event(type,id){const c=this.current;if(!c)return;if(type==='hit'){c.hits++;if(c.last===id)c.repeats++;c.last=id;c.gap=0;}else if(['launches','returns','drains','collects','inputs','nudges'].includes(type))c[type]++;}
 finish(complete=true){if(!this.current)return;const row={...this.current,complete,replay:null,wait:0};this.returns.accept(row);delete row.last;delete row.gap;this.rows.push(row);this.rows=this.rows.slice(-100);this.current=null;if(complete)this.follow=row;this.persist();}
 interrupt(){if(this.current)this.finish(false);if(this.follow){this.follow=null;this.persist();}}
 clear(){this.returns=new ReturnCohort(null,this.returns.clock);this.rows=[];this.current=null;this.follow=null;this.persist(true);}
 static risk(c){const repetition=c.hits>=2?c.repeats/(c.hits-1):null,failedLaunch=c.launches?c.returns/c.launches:null;
  const parts={repetition,failedLaunch,feedbackGap:c.active>=10?Math.min(1,c.longestGap/10):null};
  const values=Object.values(parts);return {metric:'design-risk-v1',parts,score:values.every(v=>v!==null)?Math.round(100*values.reduce((a,b)=>a+b,0)/3):null,warning:'Unvalidated proxy, not boredom or enjoyment; null = insufficient exposure. Agency, mastery, clarity, fatigue and goal comprehension need human observation.'};}
 static interval(k,n){if(!n)return null;const z=1.96,p=k/n,d=1+z*z/n,m=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,m-h),Math.min(1,m+h)];}
 report(){const groups={};for(const r of this.rows){const key=r.version+'/'+r.source;const g=groups[key]??={sessions:0,completed:0,interrupted:0,replayNumerator:0,replayDenominator:0,censored:0,pending:0,riskScored:0,riskUnscored:0,launches:0,returnedLaunches:0};g.sessions++;g.launches+=r.launches;g.returnedLaunches+=r.returns;if(PinballEngagement.risk(r).score===null)g.riskUnscored++;else g.riskScored++;if(!r.complete){g.interrupted++;continue;}g.completed++;if(r.replay===null){if(r===this.follow)g.pending++;else g.censored++;}else{g.replayDenominator++;if(r.replay)g.replayNumerator++;}}
  for(const g of Object.values(groups)){g.rate=g.replayDenominator?g.replayNumerator/g.replayDenominator:null;g.wilson95=PinballEngagement.interval(g.replayNumerator,g.replayDenominator);}
  const fresh=()=>({sessions:0,completed:0,interrupted:0,numerator:0,denominator:0,censored:0,pending:0,automaticReplays:0,manualInputReplays:0});const continuation={all:fresh(),'manual-only':fresh(),'auto-only':fresh(),'mixed-auto':fresh()};
  for(const row of this.rows){const mode=row.mode|| (row.source==='automation'?'auto-only':row.source==='mixed-auto'?'mixed-auto':'manual-only');for(const g of [continuation.all,continuation[mode]]){g.sessions++;if(!row.complete){g.interrupted++;continue;}g.completed++;if(row.replay===null){if(row===this.follow)g.pending++;else g.censored++;}else{g.denominator++;if(row.replay){g.numerator++;if(row.replayInitiator==='automatic')g.automaticReplays++;else if(row.replayInitiator==='manual-input')g.manualInputReplays++;}}}}
  for(const g of Object.values(continuation)){g.rate=g.denominator?g.numerator/g.denominator:null;g.wilson95=PinballEngagement.interval(g.numerator,g.denominator);}
  return {schema:1,measurementVersion:"continuation-accounting-v2",longTermReturn:this.returns.report(PinballEngagement.interval),continuation,continuationWarning:'60-second same-tab session continuation includes configured automatic replay; automatic runs can mechanically inflate it. Manual-only is not verified human. Repeated sessions are not independent; intervals are descriptive. Legacy replay initiation may be unknown.',definition:'Session = start through 3-ball game over; interrupted starts separate. Same-tab session continuation (automatic + manual) within 60 visible wall-clock seconds after game over; lost visibility/reload closes observation as censored. Not D1/D7 or human retention. Up to 100 local sessions; no participant IDs or cross-device tracking. Separate opt-in local-return-v1 stores an epoch timestamp; see longTermReturn.',groups,storageError:this.storageError,rows:this.rows.map(r=>({...r,risk:PinballEngagement.risk(r)}))};
 }
}
globalThis.PinballEngagement=PinballEngagement;
if(typeof module!=='undefined')module.exports=PinballEngagement;
