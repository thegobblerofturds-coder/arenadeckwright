import test from 'node:test';
import assert from 'node:assert/strict';
import {BubbleWorld,MAX_BUBBLES,TAU} from '../js/physics.mjs';
import {RainbowPaint,MAX_RIBBONS,MAX_PAINT_POINTS,MAX_PAINT_BEADS} from '../js/paint.mjs';
import {PopRewards} from '../js/rewards.mjs';
import {PopEffects,MAX_PARTICLES} from '../js/effects.mjs';
import {rainbowSoap} from '../js/theme.mjs';

const world=()=>new BubbleWorld(390,844,{generation:0,random:()=>.36});
const advance=(w,seconds,events=[])=>{for(let i=0;i<seconds*60;i++){w.step(1/60);events.push(...w.drainEvents());}return events;};

test('paint pools turn into tangible rainbow bubbles after the ribbon is drawn',()=>{
  const w=world(),p=new RainbowPaint();p.start(1,30,300);p.move(1,340,430);p.end(1);
  assert.equal(w.bubbles.length,0);assert.ok(p.beads.length>=6);
  for(let i=0;i<45;i++)p.step(1/60,w);
  assert.ok(w.bubbles.length>=6);assert.ok(w.bubbles.every(b=>b.painted&&b.r>=19));
  const b=w.bubbles[0];assert.equal(w.hitTest(b.x,b.y)?.id,b.id);
  assert.equal(w.pop(b.id).type,'pop');assert.equal(w.pop(b.id),null);
  for(let i=0;i<90;i++)p.step(1/60,w);
  assert.equal(p.strokes.length,0);assert.equal(p.beads.length,0);
});

test('painting stays bounded under fast multi-touch and never turns a tap into bubbles',()=>{
  const w=world(),p=new RainbowPaint();p.start(1,30,300);p.end(1);p.step(1,w);
  assert.equal(w.bubbles.length,0);
  for(let id=2;id<30;id++){p.start(id,10,200);for(let j=0;j<30;j++)p.move(id,j%2?10:380,200+j*3);}
  assert.ok(p.strokes.length<=MAX_RIBBONS);assert.ok(p.beads.length<=MAX_PAINT_BEADS);
  assert.ok(p.strokes.reduce((n,s)=>n+s.nodes.length,0)<=MAX_PAINT_POINTS);
  p.finish();for(let i=0;i<120;i++)p.step(1/60,w);
  assert.ok(w.bubbles.length<=MAX_BUBBLES);assert.equal(p.strokes.length,0);
  p.start(100,100,200);p.move(100,300,200);p.clear();p.step(1,w);assert.equal(p.beads.length,0);
});

test('a giant keeps its identity for four hits, peels layers, then becomes a chain',()=>{
  const w=world(),rewards=new PopRewards(),b=w.addSpecial();w.drainEvents();
  for(let i=3;i>0;i--) {
    const event=w.pop(b.id,{x:b.x+b.r*.8,y:b.y});rewards.pop(event.radius,w.time,event);
    assert.equal(event.type,'layer');assert.equal(event.layers,i);assert.equal(w.get(b.id),b);
    assert.equal(event.membrane.length,32);advance(w,.15);
  }
  const event=w.pop(b.id);rewards.pop(event.radius,w.time,event);
  assert.equal(event.layeredFinal,true);assert.equal(w.get(b.id),undefined);
  assert.ok(event.fragmentIds.length>=6);assert.ok(rewards.score>4000000);
});

test('hard dragging consumes one giant layer and releases its grab without collapsing the outline',()=>{
  const w=world(),b=w.addSpecial('boss');w.drainEvents();
  w.startDrag(b.id,b.x,b.y,0);b.held=true;
  const e=w.moveDrag(b.id,b.x+b.r*3,b.y,.01);
  assert.equal(e.type,'layer');assert.equal(e.extremeDrag,true);assert.equal(b.layers,6);
  assert.equal(b.drag,null);assert.equal(b.held,false);assert.equal(w.moveDrag(b.id,1e6,1e6,.01),null);
  for(let i=0;i<5;i++)w.pop(b.id,{x:b.x+b.r,y:b.y});
  advance(w,2);
  for(const [i,p]of b.points.entries())assert.ok(p.x*Math.cos(i*TAU/32)+p.y*Math.sin(i*TAU/32)>b.r*.5);
});

test('a seven-hit boss cascades in timed waves, even with no other bubbles on screen',()=>{
  const w=world(),b=w.addSpecial('boss'),rewards=new PopRewards();w.drainEvents();
  for(let i=0;i<6;i++){const e=w.pop(b.id);assert.equal(e.type,'layer');rewards.pop(e.radius,0,e);}
  assert.equal(w.cascades.length,0);
  const final=w.pop(b.id);rewards.pop(final.radius,0,final);
  assert.equal(final.bossFinal,true);assert.equal(w.get(b.id),undefined);assert.ok(rewards.score>15000000);
  w.drainEvents();const events=advance(w,5);
  assert.equal(events.filter(e=>e.type==='cascadeWave').length,3);
  assert.equal(events.filter(e=>e.type==='cascadeFinale').length,1);
  const pops=events.filter(e=>e.type==='pop');assert.equal(pops.length,24);
  assert.equal(new Set(pops.map(e=>e.bubbleId)).size,pops.length);assert.ok(pops.every(e=>e.cascade));
  assert.equal(w.cascades.length,0);assert.equal(w.bubbles.length,0);
});

test('boss cascades finish once on crowded resized boards without exceeding budgets',()=>{
  const w=world(),b=w.addSpecial('boss');
  for(let i=0;i<35;i++)w.addBubble(30+i%5*77,150+Math.floor(i/5)*90,i%3?24:80);
  for(let i=0;i<7;i++)w.pop(b.id);w.drainEvents();w.resize(844,390);
  const all=[];
  for(let i=0;i<360;i++) {
    w.step(1/60);all.push(...w.drainEvents());
    assert.ok(w.bubbles.length<=MAX_BUBBLES);assert.ok(w.cascades.length<=100);
    for(const bubble of w.bubbles)for(const p of bubble.points)assert.ok(Number.isFinite(p.x+p.y));
  }
  assert.equal(w.cascades.length,0);
  const destroyed=all.filter(e=>e.type==='pop'||e.type==='split');
  assert.equal(new Set(destroyed.map(e=>e.bubbleId)).size,destroyed.length);
  assert.equal(all.filter(e=>e.type==='cascadeFinale').length,1);
});

test('special bubbles appear during play, remain distinct, and fit after resizing between layers',()=>{
  const w=world();w.generation=.4;advance(w,16);const giant=w.bubbles.find(b=>b.special);
  assert.equal(giant.special,'layered');assert.equal(w.addSpecial('boss'),null);
  const other=w.addBubble(giant.x,giant.y,20);assert.equal(w.hitTest(giant.x,giant.y),giant);
  assert.equal(w.merge(giant,other),null);
  w.resize(320,568);w.pop(giant.id);assert.ok(giant.r<=w.maxRadius);
  for(let i=0;i<3;i++)w.pop(giant.id);
  for(let i=0;i<12;i++){const b=w.addBubble(20,100,20);w.pop(b.id);}
  advance(w,26);assert.equal(w.bubbles.find(b=>b.special)?.special,'boss');
});

test('shell peels and cascades respect reduced motion and expire completely',()=>{
  for(const reducedMotion of [false,true]) {
    const w=world(),fx=new PopEffects(rainbowSoap,{reducedMotion}),b=w.addSpecial('boss');
    for(let i=0;i<6;i++){const e=w.pop(b.id);fx.pop({...e,points:100000,label:'SQUISH!'},390,844);}
    for(let wave=0;wave<12;wave++)fx.cascade({x:190,y:400,radius:160,wave},390,844);
    assert.ok(fx.peels.length<=6);assert.ok(fx.particles.length<=MAX_PARTICLES);
    if(reducedMotion)assert.equal(fx.shake,0);
    for(let i=0;i<300;i++)fx.step(1/60);
    assert.equal(fx.peels.length,0);assert.equal(fx.particles.length,0);assert.equal(fx.bursts.length,0);
  }
});
