/* Local BGM + bounded, envelope-shaped mechanical and musical cues. */
class PinballAudio {
  constructor(){
    this.enabled=true;this.paused=false;this.voices=new Set();this.last=new Map();this.musicLevel=.3;this.sfxLevel=.85;
    this.music=new Audio('bgm/song.mp3');this.music.loop=true;this.music.preload='metadata';
    this.music.addEventListener('error',()=>{this.error='Music could not load (effects remain available)';});
  }
  static ceilingCurve(){return Float32Array.from({length:2049},(_,i)=>.9*Math.tanh((i/1024-1)/.9));}
  unlock(){if(!this.enabled)return Promise.resolve(false);if(!this.unlocking)this.unlocking=this.enable(true).finally(()=>{this.unlocking=null;});return this.unlocking;}
  async enable(value){
    this.enabled=value;
    if(value){
      try{
        if(!this.ctx){
          const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();
          this.master=this.ctx.createGain();this.master.gain.value=.65;
          this.sfx=this.ctx.createGain();this.sfx.gain.value=this.sfxLevel*2;
          this.musicGain=this.ctx.createGain();this.musicGain.gain.value=this.musicLevel;
          const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=12;
          this.ceiling=this.ctx.createWaveShaper();this.ceiling.curve=PinballAudio.ceilingCurve();this.ceiling.oversample='2x';
          this.sfx.connect(this.master);this.musicGain.connect(this.master);this.master.connect(limiter);limiter.connect(this.ceiling);this.ceiling.connect(this.ctx.destination);
          this.ctx.createMediaElementSource(this.music).connect(this.musicGain);
        }
        await this.ctx.resume();
        if(this.enabled&&!this.paused){this.master.gain.setTargetAtTime(.65,this.ctx.currentTime,.025);try{await this.music.play();}catch{this.error='Music could not start (effects remain available)';}if(!this.enabled||this.paused)this.music.pause();}
      }catch{this.error='Audio could not start. Try the sound button again.';this.enabled=false;}
    }else{this.stopAll();this.music.pause();if(this.ctx)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.02);}
    return this.enabled;
  }
  levels(music,sfx){this.musicLevel=music;this.sfxLevel=sfx;if(this.ctx){this.musicGain.gain.setTargetAtTime(music,this.ctx.currentTime,.04);this.sfx.gain.setTargetAtTime(sfx*2,this.ctx.currentTime,.04);}}
  pause(value){this.paused=value;if(value){this.stopAll();this.music.pause();}else if(this.enabled&&this.ctx)this.unlock();}
  stopAll(){this.charge(0,false);for(const v of [...this.voices])this.stop(v);this.last.clear();}
  stop(v){if(!this.ctx||v.stopped)return;v.stopped=true;const t=this.ctx.currentTime;v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(.0001,t,.008);try{v.o.stop(t+.04);}catch{}this.voices.delete(v);}
  tone(frequency,duration,volume,type='sine',delay=0,end=frequency,pan=0){
    if(!this.enabled||this.paused||!this.ctx)return;
    if(this.voices.size>=18)this.stop(this.voices.values().next().value);
    const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain(),p=this.ctx.createStereoPanner();
    o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    p.pan.value=Math.max(-.6,Math.min(.6,pan));o.connect(g);g.connect(p);p.connect(this.sfx);
    const v={o,g};this.voices.add(v);o.onended=()=>{o.disconnect();g.disconnect();p.disconnect();this.voices.delete(v);};o.start(t);o.stop(t+duration+.02);
  }
  cue(name,strength=1,x=470){
    if(!this.enabled||this.paused||!this.ctx)return;
    const now=this.ctx.currentTime,interval=name==='wall'?.075:name==='bumper'?.055:.035;
    if(now-(this.last.get(name)??-99)<interval)return;this.last.set(name,now);
    const a=Math.min(1,Math.max(.15,strength)),pan=(x/941-.5)*1.2;
    if(name==='flipper'){this.tone(190,.065,.13,'triangle',0,65,pan);this.tone(1100,.024,.035,'square',0,300,pan);}
    else if(name==='wall')this.tone(540,.07,.07*a,'triangle',0,230,pan);
    else if(name==='reel-stop'){this.tone(140,.07,.13,'triangle',0,60,pan);this.tone(1500,.07,.035,'sine',0,900,pan);}
    else if(name==='collect'){[784,1047,1319].forEach((f,i)=>this.tone(f,.16,.055,'sine',i*.055,f,pan));}
    else if(name==='bumper'){this.tone(220,.12,.14*a,'sine',0,95,pan);this.tone(880,.15,.07*a,'triangle',.008,660,pan);}
    else if(name==='launch'){this.charge(0,false);this.tone(130,.25,.18,'triangle',0,600,pan);this.tone(1400,.08,.04,'sine',0,400,pan);}
    else if(name==='return'){this.tone(260,.2,.07,'triangle',0,130,pan);}
    else if(name==='auto-start'){this.tone(440,.12,.045,'sine',0,660);}
    else if(name==='auto-stop'){this.tone(330,.12,.045,'sine',0,220);}
    else if(name==='drain'){[330,247,165].forEach((f,i)=>this.tone(f,.22,.1,'triangle',i*.09,f));}
    else {const notes=name==='jackpot'?[523,659,784,1047,1319]:name==='roulette'?[523,659,784]:[659,880];notes.forEach((f,i)=>this.tone(f,.28,.09,'sine',i*.085,f));}
    if(name==='jackpot'){const t=this.ctx.currentTime;this.musicGain.gain.cancelScheduledValues(t);this.musicGain.gain.setTargetAtTime(this.musicLevel*.45,t,.06);this.musicGain.gain.setTargetAtTime(this.musicLevel,t+1,.3);}
  }
  charge(amount,active){
    if(!active||!this.enabled||this.paused||!this.ctx){if(this.charger){this.stop(this.charger);this.charger=null;}return;}
    if(!this.charger){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='triangle';g.gain.value=0;o.connect(g);g.connect(this.sfx);const v={o,g};o.onended=()=>{o.disconnect();g.disconnect();};o.start();this.charger=v;}
    const t=this.ctx.currentTime;this.charger.o.frequency.setTargetAtTime(90+amount*170,t,.04);this.charger.g.gain.setTargetAtTime(.025+amount*.025,t,.03);
  }
}
globalThis.PinballAudio=PinballAudio;
