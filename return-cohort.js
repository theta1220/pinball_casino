/* One local profile epoch, no identity and no network. Clock injectable for isolated tests. */
class PinballReturnCohort {
 constructor(saved=null,clock=()=>Date.now()){this.clock=clock;this.unsupported=!!saved&&saved.version!==1;this.data=this.unsupported?saved:(saved||{version:1,highWater:0,cohort:null});this.rollback=false;}
 now(){const n=this.clock();this.rollback=!Number.isFinite(n)||n<this.data.highWater;if(this.rollback)return null;if(!this.unsupported)this.data.highWater=n;return n;}
 begin(){return this.unsupported?null:this.now();}
 accept(row){if(this.unsupported)return;const now=this.now();if(now===null||row.returnStart==null||row.returnStart>now||row.active<10||row.launches<1||row.previewUsed||row.executionMode==='fixed-step-browser-test'||row.returnSource==='developer'||!['browser-unverified','automation'].includes(row.returnSource))return;
  if(!this.data.cohort){this.data.cohort={start:row.returnStart,mode:row.mode,windows:{D1:null,D7:null}};return;}
  const c=this.data.cohort,elapsed=row.returnStart-c.start;
  for(const [key,lo,hi] of [['D1',24,48],['D7',168,192]])if(elapsed>=lo*3600000&&elapsed<hi*3600000&&!c.windows[key])c.windows[key]={mode:row.mode,initiator:row.originSource==='automation'?'automatic':'manual-input'};
 }
 report(interval){const now=this.clock(),rollback=!Number.isFinite(now)||now<this.data.highWater,c=this.unsupported?null:this.data.cohort;const result={implemented:true,version:'local-return-v1',unit:'one local browser-profile epoch, not a person',unsupported:this.unsupported,clockRollback:rollback,cohorts:c?1:0,warning:'Only consented effective sessions observed. Off use, deletion, other devices/profiles and forward clock jumps are not recoverable. Index-mode breakdown; return modes separate. AUTO return is not human enjoyment. n<=1, intervals descriptive.',windows:{}};
  for(const [key,lo,hi] of [['D1',24,48],['D7',168,192]]){const groups={};for(const mode of ['all','manual-only','auto-only','mixed-auto']){const eligible=!!c&&(mode==='all'||c.mode===mode),mature=eligible&&!rollback&&now>=c.start+hi*3600000,hit=eligible?c.windows[key]:null;groups[mode]={sampleSize:eligible?1:0,pending:eligible&&!mature?1:0,pendingReturn:!mature&&hit?1:0,numerator:mature&&hit?1:0,denominator:mature?1:0,rate:mature?Number(!!hit):null,wilson95:mature?interval(Number(!!hit),1):null,returnMode:hit?.mode??null,returnInitiator:hit?.initiator??null};}result.windows[key]={elapsedHours:[lo,hi],endExclusive:true,groups};}return result;
 }
}
globalThis.PinballReturnCohort=PinballReturnCohort;if(typeof module!=='undefined')module.exports=PinballReturnCohort;
