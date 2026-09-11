import {BubbleWorld,clamp} from './physics.mjs';
import {BubbleRenderer} from './render.mjs';
import {PopEffects} from './effects.mjs';
import {Feedback} from './feedback.mjs';
import {PopRewards,POINT_SCALE} from './rewards.mjs';
import {beginGesture,moveGesture,isTap} from './gestures.mjs';
import {rainbowSoap} from './theme.mjs';
import {PlayMoments,flowForPops} from './play.mjs';

const $=id=>document.getElementById(id);
const canvas=$('bubbles'),motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const world=new BubbleWorld(innerWidth,innerHeight,{reducedMotion:motionQuery.matches});
const effects=new PopEffects(rainbowSoap,{reducedMotion:motionQuery.matches});
const feedback=new Feedback(rainbowSoap);
const moments=new PlayMoments();
let savedBest=0;
try{savedBest=Number(localStorage.getItem('bubble-mix.best.v2')??Number(localStorage.getItem('bubble-mix.best.v1'))*POINT_SCALE)||0;}catch{}
const rewards=new PopRewards(savedBest);
let renderer;
try {renderer=new BubbleRenderer(canvas,rainbowSoap);}catch {
  const error=document.createElement('p');error.className='fallback';error.textContent='This browser couldn’t start the bubbles. Try opening this page in Safari or Chrome.';document.querySelector('main').append(error);
}
let paused=false,raf=0,lastTime=0,shownScore=0,focusedId=null,keyboardFocus=false;
let announcementTime=0;
const gestures=new Map();
const format=n=>Math.floor(n).toLocaleString('en-US');

function unlockFeedback() {
  if(!feedback.enabled||feedback.context?.state!=='running')void feedback.setSound(true);
}

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
  paused=value;activityChanged();
}
document.addEventListener('visibilitychange',activityChanged);
addEventListener('pagehide',()=>{finishGestures();cancelAnimationFrame(raf);void feedback.suspend();});
addEventListener('pageshow',activityChanged);

function updateRewards(reward,event) {
  $('score').setAttribute('aria-label',`${rewards.score} points. Best ${rewards.best}.`);
  $('combo').textContent=`×${reward.combo}`;$('combo').hidden=reward.combo<2;
  $('combo').setAttribute('aria-label',`${reward.combo} times combo`);
  $('score').classList.remove('score-bump');void $('score').offsetWidth;$('score').classList.add('score-bump');
  $('score').style.setProperty('--score-width',Math.max(1,format(rewards.score).length*.61));
  try{localStorage.setItem('bubble-mix.best.v2',String(rewards.best));}catch{}
  if(event.chainComplete||performance.now()-announcementTime>650) {
    $('status').textContent=`${reward.label} ${reward.points} points. Total ${rewards.score}.`;
    announcementTime=performance.now();
  }
}
function handleEvents() {
  for(const event of world.drainEvents()) {
    if(event.type==='pop'||event.type==='split') {
      const reward=rewards.pop(event.radius,world.time,event);
      world.generation=flowForPops(rewards.pops);
      updateRewards(reward,event);effects.pop({...event,...reward},world.width,world.height);
      feedback.pop(event.radius,clamp((event.x/world.width-.5)*1.3,-1,1),reward.party,event);
      if(moments.pop(world.time,event)){feedback.wow();effects.cheer(world.width,world.height);}
    } else if(event.type==='merge')feedback.merge(event.radius);
  }
}
function popBubble(id) {
  if(paused||document.hidden)return false;
  const event=world.pop(id);if(!event)return false;
  for(const [pointerId,g] of gestures)if(g.bubbleId===id){gestures.delete(pointerId);if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);}
  handleEvents();return event;
}
function sweep(x1,y1,x2,y2) {for(const id of world.sweepTargets(x1,y1,x2,y2))popBubble(id);}
function dragBubble(g,seconds) {
  const b=world.get(g.bubbleId);if(!b)return;
  if(!b.drag) {
    const centerGrab=Math.hypot(g.startX-b.x,g.startY-b.y)<b.r*.4;
    world.startDrag(b.id,g.startX,g.startY,centerGrab?Math.atan2(g.y-b.y,g.x-b.x):undefined);
  }
  if(world.moveDrag(b.id,g.x,g.y,seconds)) {
    g.bubbleId=null;g.sweeping=true;handleEvents();
  } else feedback.stretch(clamp(Math.hypot(g.x-b.x,g.y-b.y)/b.r,0,2));
}

canvas.addEventListener('pointerdown',e=>{
  if(paused||e.button!==0)return;
  unlockFeedback();
  const b=world.hitTest(e.offsetX,e.offsetY);if(b?.held)return;
  e.preventDefault();focusedId=b?.id??null;canvas.focus({preventScroll:true});keyboardFocus=false;
  const g=beginGesture(e.pointerId,b&&!b.fragment?b.id:null,e.offsetX,e.offsetY,performance.now());
  g.sweeping=!b||b.fragment;
  if(b&&!b.fragment){b.held=true;world.clearLinks(b.id);}
  gestures.set(e.pointerId,g);canvas.setPointerCapture(e.pointerId);
  if(g.sweeping)sweep(g.x,g.y,g.x,g.y);
});
canvas.addEventListener('pointermove',e=>{
  const g=gestures.get(e.pointerId);if(!g)return;
  const previousX=g.x,previousY=g.y,now=performance.now(),seconds=(now-g.lastMoveTime)/1000;
  moveGesture(g,e.offsetX,e.offsetY,now);
  if(g.dragging&&!g.sweeping)dragBubble(g,seconds);
  if(g.sweeping||g.dragging)sweep(previousX,previousY,g.x,g.y);
});
function endPointer(e,cancelled=false) {
  const g=gestures.get(e.pointerId);if(!g)return;
  gestures.delete(e.pointerId);
  const b=world.get(g.bubbleId);if(b)b.held=false;
  const previousX=g.x,previousY=g.y,now=performance.now(),seconds=(now-g.lastMoveTime)/1000;
  moveGesture(g,e.offsetX??g.x,e.offsetY??g.y,now);
  if(!cancelled&&g.dragging&&!g.sweeping)dragBubble(g,seconds);
  world.endDrag(g.bubbleId);
  if(!cancelled) {
    if(g.sweeping||g.dragging)sweep(previousX,previousY,g.x,g.y);
    if(!g.sweeping&&isTap(g,performance.now()))popBubble(g.bubbleId);
  }
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
  unlockFeedback();
  keyboardFocus=true;
  if(e.key===' '||e.key==='Enter') {
    const event=popBubble(focusedId);focusedId=event?.fragmentIds?.[0]??world.bubbles.find(b=>b.fragment)?.id??world.bubbles[0]?.id;
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
function updatePlayableArea() {effects.safeBottom=innerHeight-60;world.playBottom=innerHeight-24;}
addEventListener('resize',resize);
motionQuery.addEventListener('change',()=>{
  world.reducedMotion=motionQuery.matches;effects.reducedMotion=motionQuery.matches;
  effects.particles=[];effects.bursts=[];effects.snaps=[];effects.shake=0;render();
});
function frame(now) {
  if(paused||document.hidden){raf=0;return;}
  const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
  world.step(dt);handleEvents();effects.step(dt);
  const encouragement=moments.encourage(world.time);
  if(encouragement) {
    effects.encourage(encouragement);$('status').textContent=encouragement;
  }
  if(!rewards.expire(world.time))$('combo').hidden=true;
  if(keyboardFocus&&!world.get(focusedId))focusedId=world.bubbles[0]?.id;
  shownScore+=(rewards.score-shownScore)*(1-Math.exp(-dt*6));
  if(rewards.score-shownScore<1)shownScore=rewards.score;
  const text=format(shownScore);if($('score').textContent!==text){$('score').textContent=text;feedback.scoreTick(rewards.score-shownScore);}
  render();raf=requestAnimationFrame(frame);
}
world.seed();renderer?.resize(innerWidth,innerHeight);updatePlayableArea();render();activityChanged();

// Optional browser agent tools expose gameplay and simulation inspection.
const snapshot=()=>({
  thickness:world.thickness,generation:world.generation,paused,sound:feedback.enabled,
  haptics:feedback.hapticAvailable&&feedback.haptics,score:rewards.score,best:rewards.best,
  pops:rewards.pops,combo:rewards.combo,voiceReady:!!feedback.wowBuffer,wows:feedback.wowCount,
  encouragement:effects.encouragement?.text??null,
  bubbles:world.bubbles.map(b=>({id:b.id,x:Math.round(b.x),y:Math.round(b.y),radius:Math.round(b.r),golden:b.golden,splittable:world.canSplit(b),fragment:b.fragment,chainId:b.chainId??null,chainIndex:b.chainIndex??null})),
});
if(document.modelContext?.registerTool) {
  const lifecycle=new AbortController();
  const register=tool=>{
    try{void Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  };
  register({name:'get_bubble_mix',description:'Read the mix settings, score, and current bubbles.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>snapshot()});
  register({name:'configure_bubble_mix',description:'Adjust the simulation for inspection. Normal play starts at 40% flow and increases it with pops. No settings controls are shown on the page.',inputSchema:{type:'object',properties:{thickness:{type:'number',minimum:0,maximum:1},generation:{type:'number',minimum:0,maximum:1},paused:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
    if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Expected mix settings.');
    for(const [key,value]of Object.entries(input)) {
      if(!['thickness','generation','paused'].includes(key))throw new TypeError('Unknown setting.');
      if(key==='paused'?typeof value!=='boolean':typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw new TypeError('Invalid setting.');
    }
    world.setSettings(input);if('paused'in input)setPaused(input.paused);render();return snapshot();
  }});
  register({name:'pop_bubbles',description:'Burst current bubbles and collect points. Large or golden bubbles split into chains; small fragments pop. Read IDs with get_bubble_mix first.',inputSchema:{type:'object',properties:{ids:{type:'array',items:{type:'integer'},minItems:1,maxItems:30,uniqueItems:true}},required:['ids'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
    if(!input||typeof input!=='object'||Object.keys(input).some(key=>key!=='ids')||!Array.isArray(input.ids)||input.ids.length<1||input.ids.length>30||new Set(input.ids).size!==input.ids.length||!input.ids.every(id=>Number.isInteger(id)&&world.get(id)))throw new TypeError('Choose existing bubble IDs.');
    if(paused||document.hidden)throw new Error('Resume the visible playground before popping.');
    const ids=[...input.ids].sort((a,b)=>Number(world.get(b).fragment)-Number(world.get(a).fragment));
    for(const id of ids)popBubble(id);render();return snapshot();
  }});
  addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
