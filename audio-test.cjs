const assert=require('node:assert/strict');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const node=()=>({gain:param(),frequency:param(),pan:param(),threshold:param(),ratio:param(),connect(){},disconnect(){},start(){},stop(){}});
let contexts=0;
global.window={AudioContext:class{constructor(){contexts++;this.currentTime=0;this.destination={};}resume(){return Promise.resolve();}createGain(){return node();}createOscillator(){return node();}createStereoPanner(){return node();}createDynamicsCompressor(){return node();}createWaveShaper(){return node();}createMediaElementSource(){return node();}}};
global.Audio=class{constructor(){this.playing=false;}addEventListener(){}play(){this.playing=true;return Promise.resolve();}pause(){this.playing=false;}};
require('./audio.js');
(async()=>{
 const a=new PinballAudio();assert.equal(a.enabled,true);assert.equal(a.ctx,undefined);assert.equal(a.sfxLevel,.85);const curve=PinballAudio.ceilingCurve();assert(Math.max(...curve)<.725);assert(Math.min(...curve)>-.725);await a.enable(true);assert(a.music.playing);assert.equal(a.sfx.gain.value,1.7);assert.equal(contexts,1);
 for(let i=0;i<80;i++){a.ctx.currentTime+=.1;a.cue('bumper');}assert(a.voices.size<=18);
 a.charge(.4,true);const first=a.charger;a.charge(.8,true);assert.equal(a.charger,first);
 a.pause(true);assert.equal(a.charger,null);assert.equal(a.voices.size,0);assert.equal(a.music.playing,false);
 a.pause(false);await Promise.resolve();await Promise.resolve();assert(a.music.playing);assert.equal(contexts,1);
 await a.enable(false);assert.equal(a.music.playing,false);a.cue('jackpot');assert.equal(a.voices.size,0);
 a.music.play=()=>Promise.reject(Error('load'));await a.enable(true);assert(a.enabled,'BGM failure must not disable SFX');assert(a.error);a.cue('flipper');assert(a.voices.size>0);
 a.stopAll();assert.equal(a.voices.size,0);const pending=Array.from({length:100},()=>a.unlock());assert(pending.every(p=>p===pending[0]));await Promise.all(pending);assert.equal(contexts,1);await a.enable(false);await a.unlock();assert(!a.enabled);console.log('PASS audio lifecycle: one context, voice cap, continuous charge, pause/resume, mute and BGM failure');
})().catch(e=>{console.error(e);process.exitCode=1;});
