import {chainLayout,segmentHit,FRAGMENT_READY_AGE} from './chains.mjs';
export const TAU = Math.PI * 2;
export const POINTS = 32;
export const MAX_BUBBLES = 54;
export const MAX_FLOATING_BUBBLES = 30;
export const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
export const lerp = (a, b, t) => a + (b - a) * t;
const angleDistance = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export class BubbleWorld {
  constructor(width, height, { random = Math.random, thickness = 0.78, generation = 0.32, reducedMotion = false } = {}) {
    this.width = Math.max(width, 1); this.height = Math.max(height, 1);
    this.random = random; this.thickness = thickness; this.generation = generation;
    this.reducedMotion = reducedMotion; this.bubbles = []; this.links = new Map();
    this.time = 0; this.spawnClock = 0; this.nextId = 1; this.events = [];
    this.chains=new Map();this.spawnCount=0;this.nextGolden=8+Math.floor(random()*6);
  }
  get maxRadius() { return Math.min(this.width * 0.43, this.height * 0.35, 230); }
  get sizeUnit() { return clamp(Math.min(this.width, this.height) / 390, 0.65, 1.65); }
  canSplit(b) { return !!b && !b.fragment && (b.golden || b.r>=72*this.sizeUnit); }
  setSettings({ thickness = this.thickness, generation = this.generation } = {}) {
    if (!Number.isFinite(thickness) || !Number.isFinite(generation)) throw new TypeError('Mix settings must be numbers.');
    this.thickness = clamp(thickness, 0, 1); this.generation = clamp(generation, 0, 1);
  }
  addBubble(x, y, radius, newborn = false) {
    if (this.bubbles.length >= MAX_BUBBLES) return null;
    const r = clamp(radius, 10, this.maxRadius);
    const b = {
      id: this.nextId++, x, y, r, vx: (this.random() - .5) * 9, vy: -8,
      age: newborn ? 0 : 10, phase: this.random() * TAU, hue: this.random() * TAU,
      drag: null, cooldown: 0, wobble: 0, points: [],fragment:false,golden:false,arrival:null,
    };
    for (let i = 0; i < POINTS; i++) {
      const a = i * TAU / POINTS;
      b.points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0 });
    }
    this.bubbles.push(b); return b;
  }
  seed() {
    const layout = [
      [.23, .29, 65], [.77, .43, 52], [.38, .65, 78],
      [.72, .73, 42], [.75, .19, 34], [.16, .82, 48], [.57, .91, 62],
    ];
    for (const [x, y, r] of layout) this.addBubble(x * this.width, y * this.height, r * this.sizeUnit);
    if (this.width > 900) for (const [x,y,r] of [[.5,.27,44],[.87,.65,54],[.1,.48,34]]) this.addBubble(x*this.width,y*this.height,r*this.sizeUnit);
  }
  spawn() {
    if(this.bubbles.length>=MAX_FLOATING_BUBBLES)return null;
    const occupiedArea=this.bubbles.reduce((area,b)=>area+Math.PI*b.r*b.r,0);
    if(occupiedArea>this.width*this.height*1.12)return null;
    const r = (31 + this.random() ** .6 * 42) * this.sizeUnit;
    const x = r + 10 + this.random() * Math.max(1, this.width - 2*r - 20);
    const b=this.addBubble(x,this.height+r*.35,r,true);
    if(b) {
      this.spawnCount++;
      if(this.spawnCount>=this.nextGolden && !this.bubbles.some(item=>item.golden)) {
        b.golden=true;b.r=Math.min(79*this.sizeUnit,this.maxRadius);
        for(let i=0;i<POINTS;i++){const angle=i*TAU/POINTS;b.points[i].x=Math.cos(angle)*b.r;b.points[i].y=Math.sin(angle)*b.r;}
        this.nextGolden=this.spawnCount+16+Math.floor(this.random()*11);
      }
    }
    return b;
  }
  resize(width, height) {
    const w = Math.max(1, width), h = Math.max(1, height);
    const ratio = Math.min(w,h) / Math.min(this.width,this.height);
    for (const b of this.bubbles) {
      b.x *= w / this.width; b.y *= h / this.height;
      const scale = clamp(ratio, .3, 1.5);
      b.r *= scale;
      for (const p of b.points) { p.x *= scale; p.y *= scale; p.vx = 0; p.vy = 0; }
      b.drag = null;b.held=false;b.arrival=null;
    }
    this.width = w; this.height = h; this.links.clear();
    for (const b of this.bubbles) {
      if (b.r <= this.maxRadius) continue;
      const scale = this.maxRadius / b.r; b.r = this.maxRadius;
      for (const p of b.points) { p.x *= scale; p.y *= scale; }
    }
  }
  get(id) { return this.bubbles.find(b => b.id === id); }
  hitTest(x, y) {
    for(const fragment of [true,false]) for (let n = this.bubbles.length - 1; n >= 0; n--) {
      const b = this.bubbles[n], px = x-b.x, py = y-b.y;
      if(b.fragment!==fragment || (b.fragment&&b.age<FRAGMENT_READY_AGE))continue;
      let inside = false;
      for (let i=0,j=POINTS-1; i<POINTS; j=i++) {
        const a = b.points[i], c = b.points[j];
        if ((a.y > py) !== (c.y > py) && px < (c.x-a.x)*(py-a.y)/(c.y-a.y)+a.x) inside = !inside;
      }
      if (inside) return b;
    }
    // The neck is touchable while two membranes are flowing together.
    for(const l of this.links.values()) {
      const a=this.get(l.a),b=this.get(l.b);if(!a||!b)continue;
      const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy||1;
      const t=clamp(((x-a.x)*dx+(y-a.y)*dy)/len2,0,1);
      if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<Math.min(a.r,b.r)*.4)return t<.5?a:b;
    }
    return null;
  }
  sweepTargets(x1,y1,x2,y2) {
    return this.bubbles.filter(b=>b.fragment&&b.age>=FRAGMENT_READY_AGE)
      .map(b=>({id:b.id,t:segmentHit(x1,y1,x2,y2,b.x,b.y,b.r+6)}))
      .filter(hit=>hit.t!==null).sort((a,b)=>a.t-b.t).map(hit=>hit.id);
  }
  startDrag(id, x, y) {
    const b = this.get(id); if (!b || b.drag || b.fragment) return false;
    b.drag = { x, y, angle: Math.atan2(y-b.y, x-b.x) };
    this.clearLinks(id); return true;
  }
  moveDrag(id, x, y) {
    const b = this.get(id);
    if (b?.drag) { b.drag.x = x; b.drag.y = y; }
  }
  endDrag(id) {
    const b = this.get(id);
    if (b) { b.drag = null; b.wobble = .7; b.cooldown = .8; }
  }
  clearLinks(id) {
    for (const [key, l] of this.links) if (l.a === id || l.b === id) this.links.delete(key);
  }
  pop(id) {
    const b = this.get(id); if (!b) return null;
    const event = { type:this.canSplit(b)?'split':'pop', x: b.x, y: b.y, radius: b.r, hue: b.hue, golden:b.golden,fragment:b.fragment,points: b.points.map(p => ({ x: b.x+p.x, y: b.y+p.y })),snaps:[] };
    if(b.fragment) {
      const chain=this.chains.get(b.chainId);
      if(chain) {
        event.chainStep=chain.popped++;event.chainComplete=chain.popped===chain.total;
        event.goldenChain=chain.golden;
        for(const neighbor of this.bubbles)if(neighbor.chainId===b.chainId&&Math.abs(neighbor.chainIndex-b.chainIndex)===1) {
          const dx=b.x-neighbor.x,dy=b.y-neighbor.y,d=Math.hypot(dx,dy)||1;
          event.snaps.push({x:neighbor.x+dx/d*neighbor.r*.92,y:neighbor.y+dy/d*neighbor.r*.92,toX:b.x-dx/d*b.r*.9,toY:b.y-dy/d*b.r*.9,golden:chain.golden});
        }
      }
    }
    this.bubbles.splice(this.bubbles.indexOf(b), 1); this.clearLinks(id);
    for (const other of this.bubbles) {
      const dx = other.x - b.x, dy = other.y - b.y, d = Math.hypot(dx,dy) || 1;
      const kick = (other.fragment?30:95) * Math.exp(-d / (b.r*3));
      other.vx += dx/d*kick; other.vy += dy/d*kick; other.wobble = .9;
    }
    if(event.type==='split')event.fragmentIds=this.split(b);
    this.events.push(event);this.cleanChains();return event;
  }
  split(parent) {
    const layout=chainLayout({x:parent.x,y:parent.y,radius:parent.r,width:this.width,height:this.height,unit:this.sizeUnit,golden:parent.golden,playBottom:this.playBottom??this.height-90});
    // Keep room for complete new chains by retiring the oldest small fragments first.
    const retire=this.bubbles.filter(b=>b.fragment&&!b.held).sort((a,b)=>b.age-a.age);
    while(this.bubbles.length+layout.length>MAX_BUBBLES && retire.length) {
      const oldest=retire.shift();this.bubbles=this.bubbles.filter(b=>b!==oldest);
    }
    const ids=[];
    for(const [index,target]of layout.entries()) {
      const child=this.addBubble(parent.x+(target.x-parent.x)*.12,parent.y+(target.y-parent.y)*.12,target.r);
      if(!child)break;
      child.fragment=true;child.chainId=parent.id;child.chainIndex=index;child.age=0;
      child.hue=parent.hue+index*.63;child.phase=parent.phase;child.wobble=.65;
      child.vx=0;child.vy=-10;
      child.arrival={fromX:child.x,fromY:child.y,toX:target.x,toY:target.y,elapsed:0,duration:this.reducedMotion?.24:.56+this.thickness*.15};
      ids.push(child.id);
    }
    this.chains.set(parent.id,{id:parent.id,total:ids.length,popped:0,golden:parent.golden});
    return ids;
  }
  cleanChains() {
    const live=new Set(this.bubbles.filter(b=>b.fragment).map(b=>b.chainId));
    for(const id of this.chains.keys())if(!live.has(id))this.chains.delete(id);
  }
  merge(a, b) {
    if (a.drag || b.drag || a.fragment || b.fragment || a.golden || b.golden || Math.hypot(a.r,b.r) > this.maxRadius) return null;
    const aArea = a.r*a.r, bArea = b.r*b.r, area = aArea+bArea;
    const x = (a.x*aArea+b.x*bArea)/area, y = (a.y*aArea+b.y*bArea)/area;
    const dx = b.x-a.x, dy = b.y-a.y, distance = Math.hypot(dx,dy);
    const direction = Math.atan2(dy,dx), r = Math.sqrt(area);
    const vx = (a.vx*aArea+b.vx*bArea)/area, vy = (a.vy*aArea+b.vy*bArea)/area;
    this.bubbles = this.bubbles.filter(item => item !== a && item !== b);
    this.clearLinks(a.id); this.clearLinks(b.id);
    const merged = this.addBubble(x,y,r);
    merged.vx = vx; merged.vy = vy; merged.hue = a.hue; merged.wobble = .55; merged.cooldown = 1.8;
    const stretch = clamp(distance/(r*2)+.5,1,1.5), c=Math.cos(direction), s=Math.sin(direction);
    for (let i=0;i<POINTS;i++) {
      const angle = i*TAU/POINTS-direction;
      const u=Math.cos(angle)*r*stretch, v=Math.sin(angle)*r/stretch;
      merged.points[i].x = u*c-v*s; merged.points[i].y = u*s+v*c;
    }
    this.events.push({ type:'merge', x, y, radius:r }); return merged;
  }
  drainEvents() { return this.events.splice(0); }
  step(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    let remaining = Math.min(seconds, .08);
    while (remaining > 0) { const dt=Math.min(remaining,1/90); this.tick(dt); remaining-=dt; }
  }
  tick(dt) {
    const visc=this.thickness, motion=this.reducedMotion ? .3 : 1;
    this.time += dt;
    if (this.generation > 0) {
      this.spawnClock += dt * (.12+this.generation*this.generation*2.9) * (this.reducedMotion ? .5 : 1);
      if (this.spawnClock >= 1) { this.spawnClock %= 1; this.spawn(); }
    } else this.spawnClock = 0;
    for (const b of this.bubbles) {
      b.age+=dt; b.cooldown=Math.max(0,b.cooldown-dt); b.wobble *= Math.exp(-dt*(2-visc));
      if(b.arrival) {
        const arrival=b.arrival;arrival.elapsed+=dt;
        const t=Math.min(1,arrival.elapsed/arrival.duration),ease=1-(1-t)**3;
        b.x=lerp(arrival.fromX,arrival.toX,ease);
        b.y=lerp(arrival.fromY,arrival.toY,ease)-(this.reducedMotion?0:Math.sin(t*Math.PI)*b.r*.45);
        if(t===1)b.arrival=null;
        this.deform(b,dt);continue;
      }
      const targetVx=Math.sin(this.time*.3+b.phase)*lerp(16,6,visc)*motion;
      const targetVy=-(lerp(32,14,visc)+b.r*.025)*motion;
      const damping = 1-Math.exp(-dt*1.6);
      b.vx = lerp(b.vx,targetVx,damping); b.vy=lerp(b.vy,targetVy,damping);
      if (b.drag) {
        const dx=b.drag.x-b.x, dy=b.drag.y-b.y;
        b.vx+=dx*dt*lerp(7,2.3,visc); b.vy+=dy*dt*lerp(7,2.3,visc);
      }
      b.x+=clamp(b.vx,-420,420)*dt; b.y+=clamp(b.vy,-420,420)*dt;
      if(b.x<b.r*.5) { b.x=b.r*.5; b.vx=Math.abs(b.vx)*.4; }
      if(b.x>this.width-b.r*.5) { b.x=this.width-b.r*.5; b.vx=-Math.abs(b.vx)*.4; }
      b.y=Math.min(b.y,this.height+b.r*2);
      this.deform(b,dt);
    }
    this.bubbles=this.bubbles.filter(b=>b.drag || b.y+b.r*2 > -40);this.cleanChains();
    const alive=new Set(this.bubbles.map(b=>b.id));
    for(const [key,l] of this.links) if(!alive.has(l.a)||!alive.has(l.b)) this.links.delete(key);
    this.collide(dt);
  }
  deform(b,dt) {
    const visc=this.thickness, spring=lerp(60,15,visc), damping=Math.exp(-dt*lerp(6,11,visc));
    const motion=this.reducedMotion?.3:1, newborn=b.fragment?0:Math.max(0,1-b.age/2.8);
    const dx=b.drag?b.drag.x-b.x:0, dy=b.drag?b.drag.y-b.y:0;
    const dragLength=Math.hypot(dx,dy), maxStretch=b.r*2.5;
    const dragScale=dragLength>maxStretch ? maxStretch/dragLength : 1;
    const restOffsets=b.points.map((p,i)=>({x:p.x-Math.cos(i*TAU/POINTS)*b.r,y:p.y-Math.sin(i*TAU/POINTS)*b.r}));
    for(let i=0;i<POINTS;i++) {
      const a=i*TAU/POINTS, p=b.points[i];
      const wobble=(Math.sin(a*3+this.time*lerp(1.3,.6,visc)+b.phase)*.035+Math.sin(a*2-this.time*.7+b.phase)*(.035+b.wobble*.075))*motion;
      const oval=.035+visc*.045;
      let tx=Math.cos(a)*b.r*(1+wobble-oval), ty=Math.sin(a)*b.r*(1+wobble+oval), grip=0;
      // The lower membrane trails into a thick neck during formation.
      if(newborn>0) { const neck=Math.exp(-(angleDistance(a,Math.PI/2)**2)*10); ty+=neck*b.r*.85*newborn; tx*=1-newborn*.14; }
      if(b.drag) {
        const da=angleDistance(a,b.drag.angle), weight=Math.exp(-da*da*lerp(1.3,2.6,visc));
        grip=weight*210;
        tx=lerp(tx,dx*dragScale,weight*.94); ty=lerp(ty,dy*dragScale,weight*.94);
      }
      const previous=restOffsets[(i+POINTS-1)%POINTS], next=restOffsets[(i+1)%POINTS], current=restOffsets[i];
      p.vx+=((tx-p.x)*(spring+grip)+(previous.x+next.x-current.x*2)*35)*dt;
      p.vy+=((ty-p.y)*(spring+grip)+(previous.y+next.y-current.y*2)*35)*dt;
      p.vx*=damping; p.vy*=damping; p.x+=p.vx*dt; p.y+=p.vy*dt;
      if(grip>0) {const anchor=(grip/210)*.25;p.x=lerp(p.x,tx,anchor);p.y=lerp(p.y,ty,anchor);}
      const length=Math.hypot(p.x,p.y), max=b.r*2.9;
      if(length>max) {p.x*=max/length;p.y*=max/length;p.vx=0;p.vy=0;}
    }
  }
  collide(dt) {
    const queued=[], visc=this.thickness;
    const occupied=new Set([...this.links.values()].flatMap(l=>[l.a,l.b]));
    for(let i=0;i<this.bubbles.length;i++) for(let j=i+1;j<this.bubbles.length;j++) {
      const a=this.bubbles[i],b=this.bubbles[j],dx=b.x-a.x,dy=b.y-a.y;
      const d=Math.hypot(dx,dy)||.001, sum=a.r+b.r, key=`${a.id}:${b.id}`;
      let link=this.links.get(key);
      if(a.drag||b.drag||a.held||b.held||a.fragment||b.fragment) {if(link)this.links.delete(key);continue;}
      if(d>sum*1.19) {if(link)this.links.delete(key);continue;}
      const canMerge=!a.golden&&!b.golden&&Math.hypot(a.r,b.r)<=this.maxRadius;
      if(!link && d<sum*1.01 && canMerge && !a.cooldown && !b.cooldown && !occupied.has(a.id) && !occupied.has(b.id)) {
        link={a:a.id,b:b.id,progress:0};this.links.set(key,link);occupied.add(a.id);occupied.add(b.id);
      }
      if(link) {
        link.progress+=dt/lerp(.75,2.5,visc);
        const desired=sum*lerp(.96,.61,Math.min(1,link.progress));
        const correction=(d-desired)*Math.min(1,dt*4);
        a.x+=dx/d*correction*.5;a.y+=dy/d*correction*.5;
        b.x-=dx/d*correction*.5;b.y-=dy/d*correction*.5;
        if(link.progress>=1)queued.push([a,b]);
      } else if(d<sum*.94) {
        const push=Math.min((sum*.94-d)*dt*2.5,4), nx=d<.01?1:dx/d,ny=d<.01?0:dy/d;
        a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
        a.vx-=nx*dt*5;b.vx+=nx*dt*5;
      }
    }
    for(const [a,b] of queued) if(this.get(a.id)&&this.get(b.id))this.merge(a,b);
  }
}
