/* Critical startup lifecycle; no frame loop, storage, network, or game-state changes. */
(function(root){
class StartupGate {
 constructor({paint,setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}){this.paint=paint;this.setTimer=setTimer;this.clearTimer=clearTimer;this.state='loading';this.begin();}
 begin(reason='loading'){this.clearTimer(this.timer);this.state=reason;this.paint(reason,reason==='lost'?'Graphics interrupted. Restoring the game...':'Loading game artwork...');this.timer=this.setTimer(()=>{if(this.state==='loading'||this.state==='lost'){this.state='slow';this.paint('slow','Loading is taking longer than expected. You can wait or reload.');}},15000);}
 fail(message='The game could not load. Reload to try again.'){this.clearTimer(this.timer);this.state='error';this.paint('error',message);}
 complete({boardReady,sceneReady,uiReady,drawCalls,contextLost}){if(this.state==='error'||this.state==='ready'||contextLost||!boardReady||!sceneReady||!uiReady||!(drawCalls>0))return false;this.clearTimer(this.timer);this.state='ready';this.paint('ready','');return true;}
}
root.PinballStartupGate=StartupGate;
if(typeof module!=='undefined')module.exports=StartupGate;
if(typeof document==='undefined')return;
const doc=document,html=doc.documentElement;
function paint(state,message){html.dataset.startup=state;const panel=doc.getElementById('startupStatus'),text=doc.getElementById('startupMessage'),machine=doc.querySelector('.machine');if(text)text.textContent=message;if(panel)panel.hidden=state==='ready';if(machine){machine.inert=state!=='ready';machine.setAttribute('aria-busy',String(state!=='ready'));}}
root.pinballStartup=new StartupGate({paint});
doc.getElementById('startupReload')?.addEventListener('click',()=>root.location.reload());
// Report early fatal/runtime or script failures through a deliberate fallback, never old UI.
root.addEventListener('error',e=>{if(root.pinballStartup.state!=='ready'&&(e.error||e.target?.tagName==='SCRIPT'))root.pinballStartup.fail('The game could not start. Reload to try again.');},true);
root.addEventListener('unhandledrejection',()=>{if(root.pinballStartup.state!=='ready')root.pinballStartup.fail('The game could not load. Reload to try again.');});
})(globalThis);
