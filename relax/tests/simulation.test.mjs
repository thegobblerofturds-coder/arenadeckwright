import test from 'node:test';
import assert from 'node:assert/strict';
import {BubbleWorld,MAX_BUBBLES} from '../js/physics.mjs';
import {beginGesture,moveGesture,isTap} from '../js/gestures.mjs';
import {PopRewards} from '../js/rewards.mjs';
import {PopEffects,MAX_PARTICLES,MAX_BURSTS} from '../js/effects.mjs';
import {rainbowSoap} from '../js/theme.mjs';
import {hapticPattern} from '../js/feedback.mjs';
import {BubbleRenderer} from '../js/render.mjs';

function random(seed=513) {return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function advance(world,seconds) {for(let i=0;i<seconds*60;i++){world.step(1/60);world.drainEvents();}}
function finite(world) {
  assert.ok(world.bubbles.length<=MAX_BUBBLES);
  for(const b of world.bubbles){for(const n of [b.x,b.y,b.r,b.vx,b.vy])assert.ok(Number.isFinite(n));for(const p of b.points)for(const n of [p.x,p.y,p.vx,p.vy])assert.ok(Number.isFinite(n));}
}

test('maximum generation stays bounded through prolonged play at both viscosities',()=>{
  for(const thickness of [0,1]){
    const w=new BubbleWorld(390,844,{random:random(),thickness,generation:1});w.seed();
    advance(w,180);finite(w);
    assert.ok(w.bubbles.length>0);
  }
});
test('zero generation emits nothing while current bubbles keep drifting',()=>{
  const w=new BubbleWorld(390,844,{generation:0});const b=w.addBubble(190,600,50);
  advance(w,3);assert.equal(w.bubbles.length,1);assert.ok(b.y<600);
});
test('merging conserves area and removes obsolete links',()=>{
  const w=new BubbleWorld(600,900,{generation:0});
  const a=w.addBubble(200,400,60),b=w.addBubble(308,400,50);
  advance(w,4);assert.equal(w.bubbles.length,1);
  assert.ok(Math.abs(w.bubbles[0].r**2-(a.r**2+b.r**2))<.001);
  assert.equal(w.links.size,0);
});
test('a grabbed bubble does not merge',()=>{
  const w=new BubbleWorld(600,900,{generation:0});
  const a=w.addBubble(200,400,60);w.addBubble(290,400,50);
  a.held=true;advance(w,4);assert.equal(w.bubbles.length,2);
});
test('the merged outline flows continuously into one final membrane',()=>{
  const w=new BubbleWorld(600,900,{generation:0,thickness:1,random:random()});
  const a=w.addBubble(200,400,60),b=w.addBubble(308,400,50);
  let previous;
  for(let i=0;i<150;i++) {
    w.step(1/60);w.drainEvents();
    const link=[...w.links.values()][0];
    if(!link)continue;
    const shape=BubbleRenderer.prototype.compound(a,b,link.progress);
    for(let j=0;j<shape.points.length;j++) {
      const p=shape.points[j];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      if(previous)assert.ok(Math.hypot(p.x-previous[j].x,p.y-previous[j].y)<12);
    }
    previous=shape.points;
  }
  assert.ok(previous);
});
test('goo deforms, recovers more slowly, and survives extreme pointer positions',()=>{
  const results=[];
  for(const thickness of [0,1]) {
    const w=new BubbleWorld(390,844,{generation:0,thickness,random:random()});
    const b=w.addBubble(190,400,65);
    w.startDrag(b.id,250,400);w.moveDrag(b.id,370,300);advance(w,.2);
    assert.ok(Math.max(...b.points.map(p=>Math.hypot(p.x,p.y)))>b.r*1.15);
    advance(w,.4);
    w.endDrag(b.id);advance(w,.35);
    results.push(b.points.reduce((s,p)=>s+Math.abs(Math.hypot(p.x,p.y)-b.r),0));
    w.startDrag(b.id,190,400);w.moveDrag(b.id,1e6,-1e6);advance(w,2);finite(w);
    w.endDrag(b.id);advance(w,6);finite(w);
  }
  assert.ok(results[1]>results[0],`goo should retain more deformation: ${results}`);
});
test('long frame gaps are clamped and rotation fits the new screen',()=>{
  const w=new BubbleWorld(390,844,{generation:1,random:random()});w.seed();
  w.step(3600);assert.ok(w.time<=.081);w.resize(844,390);advance(w,3);finite(w);
  for(const b of w.bubbles)assert.ok(b.r<=w.maxRadius);
});
test('rotating a phone preserves the size of ordinary bubbles',()=>{
  const w=new BubbleWorld(390,844,{generation:0});const b=w.addBubble(195,400,65);
  w.resize(844,390);assert.equal(b.r,65);w.resize(390,844);assert.equal(b.r,65);
});
test('tap, drag returning to origin, long hold, and drag threshold are distinct',()=>{
  const tap=beginGesture(1,5,100,100,0);moveGesture(tap,104,102);assert.ok(isTap(tap,150));
  const drag=beginGesture(2,5,100,100,0);moveGesture(drag,180,100);moveGesture(drag,100,100);assert.equal(isTap(drag,200),false);
  assert.equal(isTap(beginGesture(3,5,100,100,0),600),false);
});
test('popping happens once and its impulse reaches neighboring bubbles',()=>{
  const w=new BubbleWorld(390,844,{generation:0});const a=w.addBubble(130,400,50),b=w.addBubble(260,400,50);
  const old=b.vx;assert.ok(w.pop(a.id));assert.equal(w.pop(a.id),null);assert.ok(b.vx>old);assert.equal(w.drainEvents().length,1);
});
test('points and multipliers increase, ten pops pay a bonus, and breaks never remove score',()=>{
  const r=new PopRewards(0,{random:random()});let reward;
  for(let i=0;i<10;i++){reward=r.pop(60,i*.3);assert.ok(reward.points>0);}
  assert.equal(reward.party,true);assert.equal(reward.label,'POP PARTY!');assert.equal(r.combo,8);
  assert.ok(reward.points>=1000);const score=r.score;r.expire(100);assert.equal(r.score,score);assert.equal(r.combo,0);
  assert.equal(r.pop(60,101).combo,1);assert.equal(r.best,r.score);
});
test('effects stay bounded during pop spam and fully expire',()=>{
  const fx=new PopEffects(rainbowSoap,{random:random()});
  for(let i=0;i<120;i++)fx.pop({x:150,y:400,radius:110,points:100,label:'WOW!',party:i%10===0},390,844);
  assert.ok(fx.particles.length<=MAX_PARTICLES);assert.ok(fx.bursts.length<=MAX_BURSTS);
  for(let i=0;i<300;i++)fx.step(1/60);
  assert.equal(fx.particles.length,0);assert.equal(fx.bursts.length,0);
});
test('reduced motion removes camera shake and long celebrations',()=>{
  const fx=new PopEffects(rainbowSoap,{reducedMotion:true});fx.pop({x:150,y:400,radius:110},390,844);
  assert.equal(fx.shake,0);assert.ok(fx.particles.length<=12);assert.ok(fx.bursts[0].duration<1);
});
test('bigger bubbles have longer patterned haptics',()=>{
  const total=p=>p.reduce((a,b)=>a+b,0);
  assert.ok(total(hapticPattern(100))>total(hapticPattern(30)));
  assert.ok(hapticPattern(100).every(t=>t>0&&t<200));
});
