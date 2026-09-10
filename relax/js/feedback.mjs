import { clamp } from './physics.mjs';

export const hapticPattern = radius => radius >= 85
  ? [65, 28, 50, 22, 70, 25, 130]
  : radius >= 50 ? [40, 22, 60, 25, 85] : [30, 18, 55];

export class Feedback {
  constructor(theme) {
    this.theme=theme; this.enabled=false; this.haptics=true; this.context=null;
    this.hapticAvailable=typeof navigator!=='undefined' && typeof navigator.vibrate==='function';
    this.lastTick=0; this.lastStretch=0; this.lastPop=0; this.voices=0; this.suspended=false;
  }
  async setSound(enabled) {
    this.enabled=enabled;
    if(!enabled) { if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.025);return false; }
    try {
      if(!this.context) this.initialize();
      if(!this.context) {this.enabled=false;return false;}
      await this.context.resume();
      if(!this.enabled)return false;
      this.master.gain.setTargetAtTime(.82,this.context.currentTime,.02);
      return true;
    } catch { this.enabled=false;return false; }
  }
  initialize() {
    const Audio=globalThis.AudioContext || globalThis.webkitAudioContext;
    if(!Audio)return;
    const ctx=this.context=new Audio();
    this.master=ctx.createGain();this.master.gain.value=.82;
    const compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-8;compressor.knee.value=14;compressor.ratio.value=10;
    compressor.attack.value=.003;compressor.release.value=.2;
    // A soft limiter keeps rapid overlapping bursts full without digital clipping.
    const limiter=ctx.createWaveShaper(), curve=new Float32Array(2048);
    for(let i=0;i<curve.length;i++) {const x=i/(curve.length-1)*2-1;curve[i]=Math.tanh(x*1.4)*.93;}
    limiter.curve=curve;
    this.master.connect(compressor);compressor.connect(limiter);limiter.connect(ctx.destination);
    this.noise=ctx.createBuffer(1,ctx.sampleRate*.7,ctx.sampleRate);
    const data=this.noise.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }
  tone(frequency, endFrequency, duration, gain, offset=0, type='sine', pan=0) {
    if(!this.context || this.voices>=42)return;
    const ctx=this.context, now=ctx.currentTime+offset;
    const oscillator=ctx.createOscillator(), envelope=ctx.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency,20),now+duration);
    envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(gain,now+.009);
    envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(envelope);
    let panner;
    if(ctx.createStereoPanner) {panner=ctx.createStereoPanner();panner.pan.value=pan;envelope.connect(panner);panner.connect(this.master);}
    else envelope.connect(this.master);
    this.voices++;
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();panner?.disconnect();this.voices--;};
    oscillator.start(now);oscillator.stop(now+duration+.02);
  }
  splash(size, pan) {
    if(this.voices>=42)return;
    const ctx=this.context, now=ctx.currentTime, duration=.13+size*.22;
    const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
    source.buffer=this.noise;filter.type='bandpass';filter.Q.value=.65;
    filter.frequency.setValueAtTime(2200,now);filter.frequency.exponentialRampToValueAtTime(320,now+duration);
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.8,now+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(filter);filter.connect(gain);gain.connect(this.master);this.voices++;
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.voices--;};
    source.start();source.stop(now+duration+.02);
  }
  pop(radius, pan=0, party=false) {
    if(this.suspended)return;
    this.lastPop=performance.now();
    this.vibrate(party?[70,25,70,25,100,40,160]:hapticPattern(radius));
    if(!this.enabled || this.context?.state!=='running')return;
    const size=clamp(radius/110,.2,1.5), pitch=this.theme.audioPitch;
    this.tone((230-size*55)*pitch,42,.30+size*.11,.87,0,'sine',pan);
    this.tone((620-size*120)*pitch,90,.19,.34,.014,'sine',pan);
    this.splash(size,pan);
    // Bright major-pentatonic chimes spread into a short jackpot flourish.
    const notes=party?[523.25,659.25,783.99,1046.5,1318.51,1567.98,2093,2637]:radius>=85?[523.25,659.25,783.99,1046.5,1318.51,1567.98]:[783.99,1046.5,1318.51];
    notes.forEach((note,i)=>{
      this.tone(note,note*.998,.42+i*.04,.10,i*.052+.065,'sine',clamp(pan+(i%2?.2:-.2),-1,1));
      if(radius>=85)this.tone(note*2,note*2,.18,.025,i*.052+.072,'sine',-pan);
    });
  }
  stretch(amount) {
    if(this.suspended)return;
    const now=performance.now();
    if(now-this.lastTick>110 && now-this.lastPop>450) {this.vibrate(12);this.lastTick=now;}
    if(!this.enabled || this.context?.state!=='running' || now-this.lastStretch<160)return;
    this.lastStretch=now;
    this.tone(100+amount*110,70+amount*170,.15,.095,0,'sine');
  }
  tick() {
    const now=performance.now();
    if(now-this.lastTick>75) {this.vibrate(10);this.lastTick=now;}
  }
  merge(radius) {
    if(!this.enabled || this.suspended || this.context?.state!=='running')return;
    this.tone(160,65,.25,.12);
  }
  vibrate(pattern) {
    if(this.haptics && this.hapticAvailable && !this.suspended) {try{navigator.vibrate(pattern);}catch{}}
  }
  setHaptics(enabled) {
    this.haptics=enabled;
    if(enabled)this.vibrate([20,30,35]);else this.stopVibration();
  }
  stopVibration() {if(this.hapticAvailable)try{navigator.vibrate(0);}catch{}}
  async suspend() {
    this.suspended=true;this.stopVibration();
    try {await this.context?.suspend();}catch{}
  }
  async resume() {
    this.suspended=false;
    if(this.enabled)try{await this.context?.resume();}catch{}
  }
}
