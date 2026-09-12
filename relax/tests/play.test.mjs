import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BubbleWorld} from '../js/physics.mjs';
import {PlayMoments,flowForPops,RECOMMENDED_THICKNESS} from '../js/play.mjs';
import {Feedback} from '../js/feedback.mjs';
import {PopEffects,MAX_PARTICLES} from '../js/effects.mjs';
import {rainbowSoap} from '../js/theme.mjs';
import {PopRewards} from '../js/rewards.mjs';

test('one ordinary large-bubble chain earns millions of actual points',()=>{
  const w=new BubbleWorld(390,844,{generation:0}),rewards=new PopRewards();
  const b=w.addBubble(190,450,78),split=w.pop(b.id);rewards.pop(split.radius,0,split);
  for(const [i,id]of split.fragmentIds.entries()){const e=w.pop(id);rewards.pop(e.radius,.5+i*.08,e);}
  assert.ok(rewards.score>=2000000&&rewards.score<4000000);
  assert.equal(rewards.best,rewards.score);
});

test('flow starts at 40%, grows gently with pops, and remains bounded',()=>{
  const world=new BubbleWorld(390,844);
  assert.equal(world.generation,.4);assert.equal(world.thickness,RECOMMENDED_THICKNESS);
  assert.equal(flowForPops(0),.4);assert.equal(flowForPops(-10),.4);
  let previous=.4;
  for(let pops=1;pops<2000;pops++) {
    const flow=flowForPops(pops);assert.ok(flow>=previous&&flow<=1);
    assert.ok(flow-previous<.007);previous=flow;
  }
  assert.ok(flowForPops(100)>.75&&flowForPops(100)<.85);
});

test('hard pulls, fast flicks, and crossing the membrane burst before deformation',()=>{
  for(const [x,y,seconds]of [[390,400,.2],[244,400,.009],[160,400,.2],[1e6,-1e6,.016]]) {
    const w=new BubbleWorld(390,844,{generation:0});const b=w.addBubble(190,400,65);
    w.startDrag(b.id,190,400,0);
    const before=JSON.stringify(b.points),event=w.moveDrag(b.id,x,y,seconds);
    assert.equal(event?.extremeDrag,true);assert.equal(event.type,'pop');
    assert.equal(w.get(b.id),undefined);assert.equal(JSON.stringify(b.points),before);
    assert.equal(w.moveDrag(b.id,x,y,seconds),null);assert.equal(w.drainEvents().length,1);
  }
  const w=new BubbleWorld(390,844,{generation:0});const b=w.addBubble(190,400,90);
  w.startDrag(b.id,190,400,0);const split=w.moveDrag(b.id,380,300,.01);
  assert.equal(split.type,'split');assert.ok(split.fragmentIds.length>=6);
});

test('a gentle pull stays rounded without crossing its own outline',()=>{
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const intersects=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<-1e-8&&cross(c,d,a)*cross(c,d,b)<-1e-8;
  for(const angle of [0,.7,1.7,3.1,4.3,5.4]) {
    const w=new BubbleWorld(600,900,{generation:0,random:()=>.35});const b=w.addBubble(300,450,80);
    w.startDrag(b.id,b.x,b.y,angle);
    for(let frame=0;frame<50;frame++) {
      if(frame<30) {
        const stretch=Math.sin(frame/30*Math.PI*.7)*60;
        assert.equal(w.moveDrag(b.id,b.x+Math.cos(angle)*stretch,b.y+Math.sin(angle)*stretch,.05),null);
      } else w.endDrag(b.id);
      w.step(1/60);
      const p=b.points;
      for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++) {
        if(i===0&&j===p.length-1)continue;
        assert.equal(intersects(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]),false);
      }
    }
    assert.ok(w.get(b.id));
  }
});

test('WOW accompanies busy play with a cooldown; encouragement remains occasional',()=>{
  const m=new PlayMoments({random:()=>0});let cheers=0;
  assert.equal(m.encourage(100),null);
  for(let i=0;i<40;i++)if(m.pop(i*.08))cheers++;
  assert.equal(cheers,1);
  assert.equal(m.pop(13,{chainComplete:true,goldenChain:true}),true);
  m.pop(17);assert.equal(m.encourage(18),'YOU’RE DOING GREAT!');assert.equal(m.encourage(19),null);
  assert.equal(m.encourage(50),null);m.pop(50);assert.equal(m.encourage(50),'LOOK AT YOU GO!');
  assert.equal(m.encourage(51),null);
});

test('score ticks are quiet, rate limited, and silent when paused or settled',()=>{
  const f=new Feedback(rainbowSoap),tones=[];
  f.context={state:'running',currentTime:0};f.enabled=true;f.tone=(...args)=>tones.push(args);
  for(let frame=0;frame<120;frame++){f.context.currentTime=frame/120;f.scoreTick(2000-frame*5);}
  assert.ok(tones.length>=9&&tones.length<=12);assert.ok(tones.every(t=>t[2]<=.03&&t[3]<.04));
  const count=tones.length;f.context.currentTime=2;f.scoreTick(0);
  f.suspended=true;f.scoreTick(100);f.suspended=false;f.enabled=false;f.scoreTick(100);
  assert.equal(tones.length,count);
});

test('voice playback cannot overlap and all audio stops when the page becomes inactive',async()=>{
  const scheduled=[],f=new Feedback(rainbowSoap);
  const gain={value:1,cancelScheduledValues(){},setTargetAtTime(value,time){scheduled.push([value,time]);},setValueAtTime(){}};
  const sources=[];
  f.context={state:'running',currentTime:1,
    createGain:()=>({gain:{...gain},connect(){},disconnect(){}}),
    createBufferSource:()=>{const s={playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){this.onended?.();}};sources.push(s);return s;},
    async suspend(){this.state='suspended';},
  };
  f.master={gain};f.mixBus={};f.enabled=true;f.hapticAvailable=false;f.wowBuffer={duration:.42};
  assert.equal(f.wow(),true);assert.equal(f.wow(),false);assert.equal(sources.length,1);
  assert.equal(f.wowCount,1);assert.ok(scheduled[0][0]<scheduled[1][0]);
  await f.suspend();assert.equal(f.sources.size,0);assert.equal(f.voices,0);
  assert.equal(f.wowPlaying,false);assert.equal(f.wow(),false);
});

test('a voice download finishing after pause never starts a stale cheer',async()=>{
  const f=new Feedback(rainbowSoap);let complete,played=0;
  f.context={state:'running',currentTime:0,async suspend(){this.state='suspended';}};
  f.enabled=true;f.hapticAvailable=false;f.voiceReady=new Promise(resolve=>complete=resolve);
  f.playWow=()=>{played++;return true;};
  assert.equal(f.wow(),true);assert.equal(f.wow(),false);
  await f.suspend();complete();await f.voiceReady;await Promise.resolve();
  assert.equal(played,0);assert.equal(f.wowPending,false);
});

test('the bundled WOW is a compact, non-silent PCM clip',()=>{
  const wav=readFileSync(new URL('../audio/wow-anime.wav',import.meta.url));
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),1);
  const seconds=wav.readUInt32LE(40)/wav.readUInt32LE(28);assert.ok(seconds>1&&seconds<3);
  let peak=0;for(let i=44;i<wav.length;i+=2)peak=Math.max(peak,Math.abs(wav.readInt16LE(i)));
  assert.ok(peak>12000&&peak<32000);assert.ok(wav.length<140000);
});

test('new cheers, score sparks, and encouragement expire without building up',()=>{
  for(const reducedMotion of [false,true]) {
    const fx=new PopEffects(rainbowSoap,{reducedMotion});fx.encourage('YOU’RE DOING GREAT!');
    for(let i=0;i<60;i++){fx.cheer(390,844);fx.pop({x:190,y:400,radius:100},390,844);}
    assert.ok(fx.particles.length<=MAX_PARTICLES);
    for(let frame=0;frame<300;frame++)fx.step(1/60);
    assert.equal(fx.encouragement,null);assert.equal(fx.particles.length,0);
  }
});
