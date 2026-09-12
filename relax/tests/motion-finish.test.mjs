import test from 'node:test';
import assert from 'node:assert/strict';
import {BubbleWorld,specialPose,MAX_SHOCKWAVES} from '../js/physics.mjs';
import {GlassSplatter,MAX_GLASS_DROPS} from '../js/glass.mjs';
import {makeRatchetSamples} from '../js/ratchet.mjs';

const advance=(world,seconds)=>{const events=[];for(let i=0;i<seconds*60;i++){world.step(1/60);events.push(...world.drainEvents());}return events;};

test('a boss enters visibly, becomes touchable on arrival, and has a single delayed finale',()=>{
  const w=new BubbleWorld(390,844,{generation:0,random:()=>.4}),b=w.addSpecial('boss');
  assert.ok(b.y>844);assert.ok(specialPose(b).scaleX<.3);assert.equal(w.pop(b.id),null);
  advance(w,.7);assert.ok(b.y<844&&b.y>844*.49);assert.ok(specialPose(b).scaleX>.3&&specialPose(b).scaleX<1);
  assert.equal(w.hitTest(b.x,b.y),null);
  advance(w,.8);assert.equal(b.entrance,null);assert.equal(specialPose(b).scaleX,1);assert.equal(w.hitTest(b.x,b.y),b);
  for(let i=0;i<6;i++)w.pop(b.id);w.drainEvents();
  assert.equal(w.pop(b.id).type,'bossCharge');const originalRadius=b.r;
  for(let i=0;i<20;i++)assert.equal(w.pop(b.id),null);
  const first=advance(w,.3);assert.ok(!first.some(e=>e.bossFinal));assert.ok(specialPose(b).scaleX>1.08);
  w.resize(568,320);const rest=advance(w,6),finals=rest.filter(e=>e.bossFinal);
  assert.equal(finals.length,1);assert.ok(finals[0].radius>0);assert.ok(originalRadius>0);
  assert.equal(w.get(b.id),undefined);assert.equal(w.cascades.length,0);
});

test('bubbles form at every edge, move inward smoothly, and can be grabbed during entry',()=>{
  const w=new BubbleWorld(390,844,{generation:0,random:()=>.3}),edges=new Set();
  for(let i=0;i<4;i++) {
    w.bubbles=[];w.links.clear();const b=w.spawn();edges.add(b.spawnEdge);
    const entry=b.arrival,from={x:b.x,y:b.y};w.step(1/60);
    assert.ok(Math.hypot(b.x-from.x,b.y-from.y)<1);
    assert.ok(entry.toX>0&&entry.toX<390&&entry.toY>0&&entry.toY<844);
    advance(w,3);assert.equal(b.arrival,null);
    const before={x:b.x,y:b.y};advance(w,.5);
    assert.ok((b.x-before.x)*(b.flowX??0)+(b.y-before.y)*(b.flowY??0)>0);
  }
  assert.deepEqual([...edges].sort(),[0,1,2,3]);
  w.bubbles=[];const b=w.spawn();advance(w,.8);
  assert.ok(b.arrival?.edge);assert.equal(w.startDrag(b.id,b.x,b.y),true);assert.equal(b.arrival,null);
});

test('directional bubbles can leave every edge without getting stuck on the old walls',()=>{
  const w=new BubbleWorld(390,844,{generation:0});
  for(const [x,y]of [[-100,300],[490,300],[190,-100],[190,944]]) {
    const b=w.addBubble(x,y,20);b.flowX=1;b.flowY=1;w.step(1/60);assert.equal(w.get(b.id),undefined);
  }
});

test('jelly ripples reach near bubbles before far bubbles and remain bounded',()=>{
  const w=new BubbleWorld(700,900,{generation:0,random:()=>.4});
  const parent=w.addBubble(150,450,140),near=w.addBubble(390,450,40),far=w.addBubble(600,450,40);
  w.pop(parent.id);assert.equal(w.shockwaves.length,1);assert.equal(near.squish,undefined);
  advance(w,.12);assert.equal(near.squish,undefined);advance(w,.23);assert.ok(near.squish);assert.equal(far.squish,undefined);
  advance(w,.27);assert.ok(far.squish);
  for(let i=0;i<100;i++)w.emitShockwave(50,50,140);
  assert.equal(w.shockwaves.length,MAX_SHOCKWAVES);advance(w,3);assert.equal(w.shockwaves.length,0);
  for(const b of w.bubbles)for(const p of b.points)assert.ok(Number.isFinite(p.x+p.y));
});

test('glass droplets stick, slide slowly, fade away, and respect reduced motion',()=>{
  for(const reducedMotion of [false,true]) {
    const glass=new GlassSplatter({random:()=>.4,reducedMotion});
    glass.add({x:190,y:350,radius:100,hue:2},390,844);const d=glass.drops[0],y=d.y;
    for(let i=0;i<12;i++)glass.step(1/60);assert.equal(d.y,y);
    for(let i=0;i<120;i++)glass.step(1/60);
    if(reducedMotion)assert.equal(d.y,y);else assert.ok(d.y>y&&d.y<y+40);
    for(let i=0;i<100;i++)glass.add({x:190,y:100,radius:160,bossFinal:true},390,844);
    assert.equal(glass.drops.length,MAX_GLASS_DROPS);assert.ok(glass.drops.every(d=>d.y>=86));
    for(let i=0;i<420;i++)glass.step(1/60);assert.equal(glass.drops.length,0);
  }
});

test('reduced motion removes the entrance travel, swell, and physical shockwaves',()=>{
  const w=new BubbleWorld(390,844,{generation:0,reducedMotion:true}),b=w.addSpecial('boss'),y=b.y;
  advance(w,.2);assert.equal(b.y,y);assert.equal(specialPose(b,true).scaleX,1);advance(w,.2);
  for(let i=0;i<7;i++)w.pop(b.id);assert.equal(specialPose(b,true).scaleX,1);
  advance(w,.2);assert.equal(w.shockwaves.length,0);assert.equal(w.get(b.id),undefined);
});

test('ratchet tooth audio is a short, bounded transient with a quiet tail',()=>{
  let seed=923;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(const rate of [22050,44100,48000]) {
    const samples=makeRatchetSamples(rate,random);assert.ok(samples.length/rate<.045);
    assert.ok(samples.every(n=>Number.isFinite(n)&&Math.abs(n)<=.95));
    const energy=(a,b)=>samples.slice(Math.floor(rate*a),Math.floor(rate*b)).reduce((n,v)=>n+v*v,0)/(rate*(b-a));
    assert.ok(energy(.001,.015)>energy(.03,.043)*30);assert.ok(Math.max(...samples)>.3);assert.equal(samples.at(-1),0);
  }
});
