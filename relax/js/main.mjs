import {BubbleWorld,clamp} from './physics.mjs';
import {BubbleRenderer} from './render.mjs';
import {PopEffects} from './effects.mjs';
import {Feedback} from './feedback.mjs';
import {PopRewards} from './rewards.mjs';
import {beginGesture,moveGesture,isTap} from './gestures.mjs';
import {rainbowSoap} from './theme.mjs';

const $=id=>document.getElementById(id);
const canvas=$('bubbles'),motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const controls={thickness:$('thickness'),generation:$('generation'),sound:$('sound'),pause:$('pause'),haptics:$('haptics')};
const world=new BubbleWorld(innerWidth,innerHeight,{reducedMotion:motionQuery.matches});
const effects=new PopEffects(rainbowSoap,{reducedMotion:motionQuery.matches});
const feedback=new Feedback(rainbowSoap);
let savedBest=0;
try{savedBest=Number(localStorage.getItem('bubble-mix.best.v1'))||0;}catch{}
const rewards=new PopRewards(savedBest);
let renderer;
try {renderer=new BubbleRenderer(canvas,rainbowSoap);}catch {
  const error=document.createElement('p');error.className='fallback';error.textContent='This browser couldn’t start the bubbles. Try opening this page in Safari or Chrome.';document.querySelector('main').append(error);
}
let paused=false,raf=0,lastTime=0,shownScore=0,focusedId=null,keyboardFocus=false;
let soundRequest=0,partyTimeout=0,announcementTime=0;
const gestures=new Map();
const thicknessLabel=n=>n<.2?'Floaty':n<.45?'Silky':n<.7?'Thick':n<.92?'Syrupy':'Full goo';
const generationLabel=n=>n===0?'Stopped':n<.2?'A trickle':n<.48?'Gentle':n<.76?'Bubbly':'Overflowing';
const format=n=>Math.floor(n).toLocaleString('en-US');

function mixChanged() {
  world.setSettings({thickness:Number(controls.thickness.value)/100,generation:Number(controls.generation.value)/100});
  for(const [name,label] of [['thickness',thicknessLabel(world.thickness)],['generation',generationLabel(world.generation)]]) {
    const input=controls[name];$(name+'-value').textContent=label;
    input.setAttribute('aria-valuetext',label);input.style.setProperty('--fill',input.value+'%');
  }
}
for(const input of [controls.thickness,controls.generation])input.addEventListener('input',()=>{mixChanged();feedback.tick();});
mixChanged();$('best').textContent=format(rewards.best);

function finishGestures() {
  for(const [pointerId,g]of gestures) {
    const b=world.get(g.bubbleId);if(b)b.held=false;
    world.endDrag(g.bubbleId);
    if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);
  }
  gestures.clear();
}
function render() {renderer?.draw(world,effects,keyboardFocus?focusedId:null);}
function activityChanged() {
  cancelAnimationFrame(raf);raf=0;lastTime=0;
  if(paused||document.hidden) {finishGestures();shownScore=rewards.score;$('score').textContent=format(shownScore);void feedback.suspend();render();}
  else {void feedback.resume();if(renderer)raf=requestAnimationFrame(frame);}
}
function setPaused(value) {
  paused=value;controls.pause.setAttribute('aria-pressed',String(paused));
  controls.pause.setAttribute('aria-label',paused?'Resume bubbles':'Pause bubbles');controls.pause.title=paused?'Resume bubbles':'Pause bubbles';
  activityChanged();
}
controls.pause.addEventListener('click',()=>setPaused(!paused));
document.addEventListener('visibilitychange',activityChanged);
addEventListener('pagehide',()=>{finishGestures();cancelAnimationFrame(raf);void feedback.suspend();});
addEventListener('pageshow',activityChanged);

controls.sound.addEventListener('click',async()=>{
  const request=++soundRequest,desired=!feedback.enabled;
  controls.sound.setAttribute('aria-pressed',String(desired));
  const enabled=await feedback.setSound(desired);
  if(request!==soundRequest)return;
  controls.sound.setAttribute('aria-pressed',String(enabled));
  controls.sound.setAttribute('aria-label',enabled?'Mute sound':'Turn sound on');controls.sound.title=enabled?'Mute sound':'Turn sound on';
  $('sound-note').textContent=enabled?'Big pops. Big sound.':desired?'Sound unavailable here':'Sound on = extra satisfying';
  if(paused||document.hidden)void feedback.suspend();
});
if(!feedback.hapticAvailable) {
  controls.haptics.disabled=true;controls.haptics.setAttribute('aria-pressed','false');
  controls.haptics.querySelector('span').textContent='unavailable';controls.haptics.title='Vibration is not supported by this browser.';
}
controls.haptics.addEventListener('click',()=>{
  feedback.setHaptics(!feedback.haptics);controls.haptics.setAttribute('aria-pressed',String(feedback.haptics));
  controls.haptics.querySelector('span').textContent=feedback.haptics?'on':'off';
});
$('tray-toggle').addEventListener('click',()=>{
  const expanded=$('tray-toggle').getAttribute('aria-expanded')!=='true';
  $('tray-toggle').setAttribute('aria-expanded',String(expanded));$('mix-controls').hidden=!expanded;
  document.querySelector('.tray-toggle-label').textContent=expanded?'Tuck away':'Adjust';
  updatePlayableArea();
});
const dismissHint=()=>{$('gesture-hint').classList.add('faded');};
setTimeout(dismissHint,12000);

function updateRewards(reward) {
  $('best').textContent=format(rewards.best);
  $('combo').textContent=`×${reward.combo} COMBO`;$('combo').hidden=reward.combo<2;
  $('party-count').textContent=`${rewards.pops%10} / 10`;
  $('party-fill').style.width=(reward.party?100:(rewards.pops%10)*10)+'%';
  $('score').classList.remove('score-bump');void $('score').offsetWidth;$('score').classList.add('score-bump');
  if(reward.party) {
    document.querySelector('.party-progress').classList.add('party-active');$('party-label').textContent='+1,000 BONUS';
    clearTimeout(partyTimeout);partyTimeout=setTimeout(()=>{
      document.querySelector('.party-progress').classList.remove('party-active');$('party-label').textContent='POP PARTY';
      $('party-fill').style.width=(rewards.pops%10)*10+'%';
    },1700);
  }
  try{localStorage.setItem('bubble-mix.best.v1',String(rewards.best));}catch{}
  if(performance.now()-announcementTime>650) {
    $('status').textContent=`${reward.label} ${reward.points} points. Total ${rewards.score}.`;
    announcementTime=performance.now();
  }
}
function handleEvents() {
  for(const event of world.drainEvents()) {
    if(event.type==='pop') {
      const reward=rewards.pop(event.radius,world.time);
      updateRewards(reward);effects.pop({...event,...reward},world.width,world.height);
      feedback.pop(event.radius,clamp((event.x/world.width-.5)*1.3,-1,1),reward.party);
    } else feedback.merge(event.radius);
  }
}
function popBubble(id) {
  if(paused||document.hidden)return false;
  const event=world.pop(id);if(!event)return false;
  for(const [pointerId,g] of gestures)if(g.bubbleId===id){gestures.delete(pointerId);if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);}
  handleEvents();return true;
}

canvas.addEventListener('pointerdown',e=>{
  if(paused||e.button!==0)return;
  const b=world.hitTest(e.offsetX,e.offsetY);if(!b||b.held)return;
  e.preventDefault();focusedId=b.id;canvas.focus({preventScroll:true});keyboardFocus=false;
  b.held=true;world.clearLinks(b.id);
  gestures.set(e.pointerId,beginGesture(e.pointerId,b.id,e.offsetX,e.offsetY,performance.now()));
  canvas.setPointerCapture(e.pointerId);dismissHint();
});
canvas.addEventListener('pointermove',e=>{
  const g=gestures.get(e.pointerId);if(!g)return;
  const wasDragging=g.dragging;
  if(moveGesture(g,e.offsetX,e.offsetY)) {
    if(!wasDragging) {
      const b=world.get(g.bubbleId);
      const centerGrab=b&&Math.hypot(g.startX-b.x,g.startY-b.y)<b.r*.4;
      world.startDrag(g.bubbleId,centerGrab?g.x:g.startX,centerGrab?g.y:g.startY);
    }
    world.moveDrag(g.bubbleId,g.x,g.y);
    const b=world.get(g.bubbleId);if(b)feedback.stretch(clamp(Math.hypot(g.x-b.x,g.y-b.y)/b.r,0,2));
  }
});
function endPointer(e,cancelled=false) {
  const g=gestures.get(e.pointerId);if(!g)return;
  gestures.delete(e.pointerId);
  const b=world.get(g.bubbleId);if(b)b.held=false;
  moveGesture(g,e.offsetX??g.x,e.offsetY??g.y);
  world.endDrag(g.bubbleId);
  if(!cancelled&&isTap(g,performance.now()))popBubble(g.bubbleId);
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
}
canvas.addEventListener('pointerup',e=>endPointer(e));
canvas.addEventListener('pointercancel',e=>endPointer(e,true));
canvas.addEventListener('lostpointercapture',e=>endPointer(e,true));
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('focus',()=>{if(!gestures.size){keyboardFocus=true;focusedId=world.bubbles[0]?.id;}});
canvas.addEventListener('blur',()=>{keyboardFocus=false;render();});
canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(e.key))return;
  e.preventDefault();if(paused)return;
  keyboardFocus=true;dismissHint();
  if(e.key===' '||e.key==='Enter') {
    popBubble(focusedId);focusedId=world.bubbles[0]?.id;
  } else {
    const index=Math.max(0,world.bubbles.findIndex(b=>b.id===focusedId));
    const direction=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;
    focusedId=world.bubbles[(index+direction+world.bubbles.length)%world.bubbles.length]?.id;
  }
  render();
});
function resize() {
  finishGestures();world.resize(innerWidth,innerHeight);renderer?.resize(innerWidth,innerHeight);updatePlayableArea();render();
}
function updatePlayableArea() {effects.safeBottom=document.querySelector('.mix-tray').getBoundingClientRect().top-58;}
addEventListener('resize',resize);
motionQuery.addEventListener('change',()=>{
  world.reducedMotion=motionQuery.matches;effects.reducedMotion=motionQuery.matches;
  effects.particles=[];effects.bursts=[];effects.shake=0;render();
});
function frame(now) {
  if(paused||document.hidden){raf=0;return;}
  const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
  world.step(dt);handleEvents();effects.step(dt);
  if(!rewards.expire(world.time))$('combo').hidden=true;
  if(keyboardFocus&&!world.get(focusedId))focusedId=world.bubbles[0]?.id;
  shownScore+=(rewards.score-shownScore)*(1-Math.exp(-dt*13));
  if(rewards.score-shownScore<1)shownScore=rewards.score;
  const text=format(shownScore);if($('score').textContent!==text)$('score').textContent=text;
  render();raf=requestAnimationFrame(frame);
}
world.seed();renderer?.resize(innerWidth,innerHeight);updatePlayableArea();render();activityChanged();

// Optional browser agent tools call the same actions as the visible controls.
const snapshot=()=>({
  thickness:world.thickness,generation:world.generation,paused,sound:feedback.enabled,
  haptics:feedback.hapticAvailable&&feedback.haptics,score:rewards.score,best:rewards.best,
  pops:rewards.pops,combo:rewards.combo,
  bubbles:world.bubbles.map(b=>({id:b.id,x:Math.round(b.x),y:Math.round(b.y),radius:Math.round(b.r)})),
});
if(document.modelContext?.registerTool) {
  const lifecycle=new AbortController();
  const register=tool=>{
    try{void Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  };
  register({name:'get_bubble_mix',description:'Read the mix settings, score, and current bubbles.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>snapshot()});
  register({name:'configure_bubble_mix',description:'Set bubble thickness, automatic generation rate, or pause state.',inputSchema:{type:'object',properties:{thickness:{type:'number',minimum:0,maximum:1},generation:{type:'number',minimum:0,maximum:1},paused:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
    if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Expected mix settings.');
    for(const [key,value]of Object.entries(input)) {
      if(!['thickness','generation','paused'].includes(key))throw new TypeError('Unknown setting.');
      if(key==='paused'?typeof value!=='boolean':typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw new TypeError('Invalid setting.');
    }
    for(const key of ['thickness','generation'])if(key in input)controls[key].value=String(Math.round(input[key]*100));
    mixChanged();if('paused'in input)setPaused(input.paused);render();return snapshot();
  }});
  register({name:'pop_bubbles',description:'Pop the specified current bubbles and collect points. Read bubble IDs with get_bubble_mix first.',inputSchema:{type:'object',properties:{ids:{type:'array',items:{type:'integer'},minItems:1,maxItems:30,uniqueItems:true}},required:['ids'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
    if(!input||typeof input!=='object'||Object.keys(input).some(key=>key!=='ids')||!Array.isArray(input.ids)||input.ids.length<1||input.ids.length>30||new Set(input.ids).size!==input.ids.length||!input.ids.every(id=>Number.isInteger(id)&&world.get(id)))throw new TypeError('Choose existing bubble IDs.');
    if(paused||document.hidden)throw new Error('Resume the visible playground before popping.');
    for(const id of input.ids)popBubble(id);render();return snapshot();
  }});
  addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
