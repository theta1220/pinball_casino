// Deterministic DOM/canvas lifecycle model, not a browser or pixel-quality claim.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
function environment(version){
 const jobs=[],stats={draws:0,resets:0};
 class E{
  constructor(tag='span',id=''){this.tagName=tag;this.id=id;this.children=[];this.style={};this.dataset={};this.clientWidth=400;this.visible=true;this.className='';this.classList={contains:n=>this.className.split(' ').includes(n)};}
  get firstElementChild(){return this.children.find(n=>n.tagName!=='#text')||null;}
  get parentElement(){return this.parent;}
  get textContent(){return this.tagName==='#text'?this.value:this.children.map(n=>n.textContent).join('');}
  set textContent(t){this.children=[];if(String(t)){const n=new E('#text');n.value=String(t);this.append(n);}}
  append(n){n.parent=this;this.children.push(n);}
  replaceWith(n){const p=this.parent;p.children[p.children.indexOf(this)]=n;n.parent=p;this.parent=null;}
  matches(s){return s.split(',').some(t=>t[0]==='#'?this.id===t.slice(1):t[0]==='.'?this.classList.contains(t.slice(1)):t===this.tagName);}
  closest(s){for(let p=this;p;p=p.parent)if(p.matches(s))return p;return null;}
  querySelectorAll(s){return this.children.flatMap(n=>[...(n.matches(s)?[n]:[]),...n.querySelectorAll(s)]);}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  getClientRects(){for(let p=this;p;p=p.parent)if(!p.visible)return [];return [{}];}
  setAttribute(){}
  set width(v){this.w=v;this.drawn=[];stats.resets++;} get width(){return this.w;}
  set height(v){this.h=v;this.drawn=[];stats.resets++;} get height(){return this.h;}
  getContext(){return {scale(){},drawImage:(...args)=>{this.drawn.push(args);stats.draws++;}};}
 }
 const machine=new E('main'),surface=new E('section','gameSurface');machine.append(surface);
 const ids={};for(const id of ['score','best','balls','betBlack','betRed','betMultiplier','stakeSelector']){ids[id]=new E('span',id);surface.append(ids[id]);ids[id].textContent='0.0';}
 const c={ui:null,requestAnimationFrame:f=>jobs.push(f),devicePixelRatio:2,NodeFilter:{SHOW_TEXT:4},getComputedStyle:()=>({fontSize:'24px',paddingLeft:'0',paddingRight:'0'})};vm.createContext(c);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'text-atlas-manifest.js'),'utf8')+fs.readFileSync(path.join(__dirname,version,'text-atlas.js'),'utf8'),c);
 c.document={createElement:t=>new E(t),querySelector:()=>machine,getElementById:id=>ids[id],createTreeWalker(root){const collect=n=>n.children.flatMap(ch=>ch.tagName==='#text'?[ch]:collect(ch));const ns=collect(root);let i=0;return{nextNode(){this.currentNode=ns[i++];return !!this.currentNode;}};}};
 const renderer=Object.create(c.AtlasText.prototype);Object.assign(renderer,{meta:c.PINBALL_TEXT,images:{numeric:{},gold:{},body:{}},observer:{disconnect(){},observe(){}},pending:false});
 const source=fs.readFileSync(path.join(__dirname,version,'game.js'),'utf8');
 const functions=['compactNumber','updateUI','updateGoals',...(version===''?['setHudText']:[])].map(name=>source.split(/\r?\n/).find(l=>l.startsWith('function '+name+'('))).join('\n');
 Object.assign(c,{$:id=>ids[id],score:0,balls:10,best:0,rules:{bets:{black:0,red:0},multiplier:1},localStorage:{setItem(){}}});vm.runInContext(functions,c);
 return {c,ids,renderer,jobs,stats,surface};
}
let baselineMissing=0;
for(const version of ['']){
 const e=environment(version);e.renderer.scan();
 for(let frame=0;frame<120;frame++){
  // Drain previously requested rAF callbacks, then run this frame's gameplay.
  const ready=e.jobs.splice(0);ready.forEach(f=>f());
  e.c.score=frame*100;e.c.balls=120-frame;vm.runInContext('updateUI();updateGoals();',e.c);
  // MutationObserver delivery after gameplay requests a future rAF.
  e.renderer.schedule();
  const missing=['score','balls','betBlack','betRed','betMultiplier'].filter(id=>!e.ids[id].querySelector('canvas')).length;
  if(version)baselineMissing+=missing;else assert.equal(missing,0,'no absent atlas at paint opportunity');
 }
}
assert.equal(baselineMissing,0);
const e=environment('');
// Unloaded/missing atlas remains plain readable current text, never blank.
e.c.AtlasText.setText(e.ids.score,'10.0');assert.equal(e.ids.score.textContent,'10.0');assert.equal(e.ids.score.querySelector('canvas'),null);
e.renderer.scan();
const run=e.ids.score.firstElementChild,canvas=run.querySelector('canvas');
for(const text of ['0.0','1.0','9.9','10.0','99.9','100.0','999.9K','1.0M','1.0G','BET\nx1','BET\nx500']){
 e.c.AtlasText.setText(e.ids.score,text);assert.equal(e.ids.score.firstElementChild,run);assert.equal(run.querySelector('canvas'),canvas);assert.equal(e.ids.score.textContent,text);assert(canvas.drawn.length>0);assert(canvas.width>0&&canvas.height>0);assert.equal(run.dataset.atlasStyle,'numeric');
 const resets=e.stats.resets;e.c.AtlasText.setText(e.ids.score,text);assert.equal(e.stats.resets,resets,'identical display is not rerasterized');
}
for(const [n,want] of [[0,'0.0'],[1,'1.0'],[9900,'9.9K'],[10000,'10.0K'],[99900,'99.9K'],[100000,'100.0K'],[999950,'1.0M'],[999950000,'1.0G']])assert.equal(e.c.compactNumber(n),want);
e.surface.visible=false;e.c.AtlasText.setText(e.ids.score,'23.4K');assert(run._atlasDirty);assert.equal(e.ids.score.textContent,'23.4K');e.surface.visible=true;e.renderer.scan();assert.equal(run._atlasDirty,false);
const resets=e.stats.resets;e.c.devicePixelRatio=3;e.renderer.resize=true;e.renderer.scan();assert(e.stats.resets>resets);assert.equal(run.querySelector('canvas'),canvas);
// Gameplay integration routes, not merely the setter in isolation.
e.c.score=999950;e.c.balls=0;e.c.rules.bets.black=1;e.c.rules.multiplier=5;vm.runInContext('updateUI();updateGoals();',e.c);assert.equal(e.ids.score.textContent,'1.0M');assert.equal(e.ids.best.textContent,'1.0M');assert.equal(e.ids.balls.textContent,'0.0');assert.equal(e.ids.betMultiplier.textContent,'BONUS\nx5');
console.log(JSON.stringify({pass:true,baselineMissingAtlasAt120PaintOpportunities:baselineMissing,candidateMissing:0,coverage:'actual scan/paint/updateUI/updateGoals; stable run+canvas; unchanged-value caching; compact thresholds; K/M/G; x1/x500; hidden/reopen; DPR resize; unloaded fallback',limits:'Instrumented DOM model; actual browser pixels/modal controls/layout require integrator QA'},null,2));

