import test from 'node:test';
import assert from 'node:assert/strict';
import {BubbleWorld,MAX_BUBBLES} from '../js/physics.mjs';
import {chainLayout,segmentHit,chainFrequency,FRAGMENT_READY_AGE} from '../js/chains.mjs';
import {PopRewards} from '../js/rewards.mjs';
import {PopEffects,MAX_PARTICLES,MAX_SNAPS} from '../js/effects.mjs';
import {Feedback} from '../js/feedback.mjs';
import {rainbowSoap} from '../js/theme.mjs';

function random(seed=817) {return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function advance(w,seconds) {for(let i=0;i<seconds*60;i++){w.step(1/60);w.drainEvents();}}
function makeChain(golden=false,options={}) {
  const world=new BubbleWorld(390,844,{generation:0,random:random(),...options});
  const parent=world.addBubble(195,400,90);parent.golden=golden;
  const event=world.pop(parent.id);world.drainEvents();
  return {world,parent,event,ids:event.fragmentIds};
}

test('big bubbles split once into small non-merging, non-recursive chains',()=>{
  const {world,parent,event,ids}=makeChain();
  assert.equal(event.type,'split');assert.ok(ids.length>=6&&ids.length<=8);
  assert.equal(world.get(parent.id),undefined);
  for(const id of ids) {
    const b=world.get(id);assert.ok(b.r<parent.r*.4);assert.equal(b.fragment,true);
    assert.equal(world.canSplit(b),false);assert.equal(world.startDrag(id,b.x,b.y),false);
  }
  const [a,b]=ids.map(id=>world.get(id));
  assert.equal(world.merge(a,b),null);
  advance(world,3);assert.equal(world.bubbles.length,ids.length);assert.equal(world.links.size,0);
});

test('golden bubbles arrive occasionally and only one ordinary golden bubble exists at a time',()=>{
  const w=new BubbleWorld(390,844,{generation:0,random:random()});
  let first;
  for(let i=1;i<=14;i++) {
    const b=w.spawn();assert.ok(b);
    if(b.golden){first=b;assert.ok(i>=8&&i<=13);break;}
    w.bubbles=[];
  }
  assert.ok(first);const scheduled=w.nextGolden;
  assert.ok(scheduled-w.spawnCount>=16&&scheduled-w.spawnCount<=26);
  for(let i=0;i<32;i++){const b=w.spawn();assert.equal(b.golden,false);w.bubbles=w.bubbles.filter(item=>item===first);}
  assert.equal(w.merge(first,w.addBubble(first.x,first.y,30)),null);
  const split=w.pop(first.id);assert.equal(split.fragmentIds.length,12);assert.equal(split.golden,true);
  assert.equal(w.spawn().golden,true);
});

test('chains from screen edges fan into the playable area on phone and landscape sizes',()=>{
  for(const [width,height]of [[320,568],[390,844],[844,390],[1440,900]])for(const golden of [false,true]) {
    const unit=Math.max(.65,Math.min(1.65,Math.min(width,height)/390));
    for(const x of [0,width/2,width])for(const y of [0,height]) {
      const playBottom=height-112;
      const layout=chainLayout({x,y,width,height,radius:150*unit,unit,golden,playBottom});
      assert.equal(layout.length,golden?12:8);
      for(const b of layout) {
        assert.ok(b.x-b.r>=0&&b.x+b.r<=width,`horizontal fit ${width} ${golden}`);
        assert.ok(b.y-b.r>=60&&b.y+b.r<=playBottom,`vertical fit ${height} ${golden}`);
      }
      for(let i=1;i<layout.length;i++)assert.ok(Math.hypot(layout[i].x-layout[i-1].x,layout[i].y-layout[i-1].y)>layout[i].r*2);
    }
  }
});

test('opening chains cannot be swept accidentally and their arrival stays smooth',()=>{
  const {world,ids}=makeChain();
  assert.equal(world.sweepTargets(0,400,390,400).length,0);
  const previous=new Map(world.bubbles.map(b=>[b.id,{x:b.x,y:b.y}]));
  for(let frame=0;frame<45;frame++) {
    world.step(1/60);
    for(const b of world.bubbles) {
      const p=previous.get(b.id);assert.ok(Math.hypot(b.x-p.x,b.y-p.y)<20);
      previous.set(b.id,{x:b.x,y:b.y});
    }
  }
  assert.ok(world.bubbles.every(b=>!b.arrival&&b.age>=FRAGMENT_READY_AGE));
  assert.equal(world.bubbles.length,ids.length);
  world.resize(844,390);advance(world,.1);
  for(const b of world.bubbles)assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.r<world.maxRadius);
});

test('fast swipes hit the whole chain in either direction, including a start outside all bubbles',()=>{
  const {world,ids}=makeChain();advance(world,.8);
  const ordered=world.bubbles.toSorted((a,b)=>a.x-b.x);
  const y=(Math.min(...ordered.map(b=>b.y))+Math.max(...ordered.map(b=>b.y)))/2;
  assert.equal(world.hitTest(0,y),null);
  assert.deepEqual(world.sweepTargets(0,y,390,y),ordered.map(b=>b.id));
  assert.deepEqual(world.sweepTargets(390,y,0,y),ordered.map(b=>b.id).reverse());
  const first=world.get(ids[0]);assert.deepEqual(world.sweepTargets(first.x,first.y,first.x,first.y),[first.id]);
  assert.equal(segmentHit(0,0,1000,0,400,20,19),null);
  assert.equal(segmentHit(0,0,1000,0,400,20,20),.4);
});

test('sweeps prefer chain bubbles over ordinary bubbles underneath',()=>{
  const {world,ids}=makeChain();advance(world,.8);
  const child=world.get(ids[2]);world.addBubble(child.x,child.y,70);
  assert.equal(world.hitTest(child.x,child.y).id,child.id);
  assert.ok(world.sweepTargets(0,child.y,390,child.y).every(id=>world.get(id).fragment));
});

test('any pop order makes one musical ascent and exactly one chain finale',()=>{
  for(const golden of [false,true]) {
    const {world,ids}=makeChain(golden);advance(world,.8);
    const order=[...ids.filter((_,i)=>i%2),...ids.filter((_,i)=>i%2===0)];
    const events=order.map(id=>world.pop(id));
    assert.deepEqual(events.map(e=>e.chainStep),ids.map((_,i)=>i));
    assert.equal(events.filter(e=>e.chainComplete).length,1);
    assert.equal(events.at(-1).chainComplete,true);assert.equal(events.at(-1).goldenChain,golden);
    assert.equal(world.pop(order.at(-1)),null);assert.equal(world.chains.size,0);
    assert.ok(events.every(e=>e.type==='pop'&&!e.fragmentIds));
  }
});

test('only existing adjacent strands snap, and missing fragments never earn a false finale',()=>{
  const {world,ids}=makeChain();advance(world,.8);
  const middle=world.pop(ids[2]);assert.equal(middle.snaps.length,2);
  const adjacent=world.pop(ids[3]);assert.equal(adjacent.snaps.length,1);
  world.get(ids[0]).y=-500;world.step(1/60);
  const remaining=[...world.bubbles].map(b=>world.pop(b.id));
  assert.ok(remaining.every(e=>!e.chainComplete));assert.equal(world.chains.size,0);
});

test('golden splits and completed chains pay their distinct bonuses',()=>{
  const normal=new PopRewards(),gold=new PopRewards();
  assert.equal(gold.pop(90,0,{type:'split',golden:true}).points-normal.pop(90,0,{type:'split'}).points,500);
  const plain=new PopRewards().pop(18,0),finish=new PopRewards().pop(18,0,{chainComplete:true});
  const jackpot=new PopRewards().pop(18,0,{chainComplete:true,goldenChain:true});
  assert.equal(finish.points-plain.points,300);assert.equal(jackpot.points-plain.points,1500);
  assert.equal(finish.label,'PERFECT!');assert.equal(jackpot.label,'GOLD RUSH!');
});

test('notes rise across the full golden chain; the finishing chord survives audio voice pressure',async()=>{
  const notes=Array.from({length:12},(_,i)=>chainFrequency(i));
  for(let i=1;i<notes.length;i++)assert.ok(notes[i]>notes[i-1]);
  const starts=[],frequencies=[],sources=[];
  const parameter=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const context={currentTime:10,state:'running',
    createGain:()=>({gain:parameter(),connect(){},disconnect(){}}),
    createOscillator:()=>{
      const source={type:'sine',frequency:{...parameter(),setValueAtTime(f){frequencies.push(f);}},connect(){},disconnect(){},start(t){starts.push(t);},stop(t){if(t===undefined)this.onended?.();}};
      sources.push(source);return source;
    },async suspend(){this.state='suspended';},async resume(){this.state='running';},
  };
  const feedback=new Feedback(rainbowSoap);feedback.context=context;feedback.master={};feedback.enabled=true;feedback.hapticAvailable=false;
  for(let i=0;i<12;i++)feedback.pop(18,0,false,{fragment:true,chainStep:i,chainComplete:i===11,goldenChain:true});
  assert.equal(starts.length,29);assert.ok(Math.max(...starts)<context.currentTime+.6);
  assert.ok(starts[2]>starts[0]);assert.ok(frequencies.includes(3136));
  feedback.voices=38;
  const before=sources.length;feedback.pop(18,0,false,{fragment:true,chainStep:11,chainComplete:true,goldenChain:true});
  assert.equal(sources.length-before,5);
  feedback.voices=sources.length;
  await feedback.suspend();assert.equal(feedback.sources.size,0);assert.equal(feedback.voices,0);
  assert.equal(feedback.nextChainNoteTime,0);assert.equal(context.state,'suspended');
});

test('snapping threads and fragment effects remain bounded, expire, and respect reduced motion',()=>{
  for(const reducedMotion of [false,true]) {
    const fx=new PopEffects(rainbowSoap,{random:random(),reducedMotion});
    const event={x:190,y:400,radius:18,fragment:true,label:'NICE!',snaps:[{x:150,y:400,toX:190,toY:400}]};
    for(let i=0;i<100;i++)fx.pop(event,390,844);
    assert.ok(fx.snaps.length<=MAX_SNAPS);assert.ok(fx.particles.length<=MAX_PARTICLES);
    fx.pop({...event,party:true,label:'POP PARTY!'},390,844);
    fx.pop({...event,chainComplete:true,label:'PERFECT!'},390,844);
    assert.ok(fx.bursts.at(-1).big);assert.equal(fx.bursts.filter(b=>b.label).length,1);
    if(reducedMotion)assert.equal(fx.shake,0);
    for(let i=0;i<240;i++)fx.step(1/60);
    assert.equal(fx.snaps.length,0);assert.equal(fx.particles.length,0);assert.equal(fx.bursts.length,0);
  }
});

test('repeated splitting and partial swipes never overflow the world or leak chain state',()=>{
  for(const thickness of [0,1]) {
    const w=new BubbleWorld(390,844,{random:random(),thickness,generation:1});w.seed();
    for(let cycle=0;cycle<120;cycle++) {
      const target=w.bubbles.find(b=>w.canSplit(b))??w.addBubble(190,500,90);
      if(target){target.golden=cycle%9===0;const split=w.pop(target.id);assert.ok(split.fragmentIds.length>=6);}
      for(const b of [...w.bubbles].filter((b,i)=>b.fragment&&i%3===0))w.pop(b.id);
      advance(w,.2);assert.ok(w.bubbles.length<=MAX_BUBBLES);
      for(const b of w.bubbles) {
        assert.ok([b.x,b.y,b.r,...b.points.flatMap(p=>[p.x,p.y])].every(Number.isFinite));
        if(b.fragment)assert.ok(w.chains.has(b.chainId));
      }
      for(const id of w.chains.keys())assert.ok(w.bubbles.some(b=>b.chainId===id));
    }
  }
});
