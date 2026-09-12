import { TAU, clamp } from './physics.mjs';
import {GlassSplatter} from './glass.mjs';
export const MAX_PARTICLES=650;
export const MAX_BURSTS=10;
export const MAX_SNAPS=40;

export class PopEffects {
  constructor(theme,{random=Math.random,reducedMotion=false}={}) {
    this.theme=theme;this.random=random;this.reducedMotion=reducedMotion;
    this.particles=[];this.bursts=[];this.snaps=[];this.shake=0;this.safeBottom=Infinity;
    this.encouragement=null;
    this.peels=[];
    this.arrivals=[];this.glass=new GlassSplatter({random,reducedMotion});
  }
  encourage(text) {this.encouragement={text,age:0,duration:3.4};}
  arrival(event) {this.arrivals.push({...event,age:0});if(this.arrivals.length>2)this.arrivals.shift();}
  drawUnderlay(ctx) {
    ctx.save();
    for(const e of this.arrivals) {
      const t=clamp(e.age/e.duration,0,1),fade=Math.sin(t*Math.PI),r=e.radius*(this.reducedMotion?1.1:1.55-t*.45);
      const glow=ctx.createRadialGradient(e.x,e.y,r*.55,e.x,e.y,r*1.4);
      glow.addColorStop(0,'#e691ff00');glow.addColorStop(.5,`rgba(216,148,255,${fade*.13})`);glow.addColorStop(1,'#a5edff00');
      ctx.fillStyle=glow;ctx.fillRect(e.x-r*1.4,e.y-r*1.4,r*2.8,r*2.8);
      if(this.reducedMotion)continue;
      for(let i=0;i<7;i++) {
        const a=i*TAU/7+t*.9;ctx.globalAlpha=fade*.65;ctx.strokeStyle=this.theme.confetti[i%6];ctx.lineWidth=1.5+(1-t)*2;
        ctx.beginPath();ctx.arc(e.x,e.y,r,a,a+.3);ctx.stroke();
        ctx.globalAlpha=fade*.8;ctx.fillStyle='#faffff';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2.2,0,TAU);ctx.fill();
      }
    }
    ctx.restore();
  }
  cheer(width,height) {
    const count=this.reducedMotion?6:28;
    for(let i=0;i<count;i++) {
      const side=i%2,x=side?width+8:-8,y=height*(.3+this.random()*.4);
      this.particles.push({x,y,vx:(side?-1:1)*(85+this.random()*130),vy:-100-this.random()*90,age:0,life:this.reducedMotion?.6:1.8+this.random()*.6,size:4+this.random()*5,kind:i%3?'star':'heart',rotation:0,spin:(this.random()-.5)*3,color:this.theme.confetti[i%6]});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  pop(event, width, height) {
    if(event.type==='layer'){this.layer(event);return;}
    if(!event.visualOnly)this.glass.add(event,width,height);
    const {x,y,radius}=event, big=radius>=85||event.party||event.chainComplete||event.golden;
    const small=event.fragment&&!big;
    const count=this.reducedMotion?(small?5:12):event.cascade?(event.fragment?18:48):small?20:big?150:Math.round(clamp(radius,55,110));
    const colors=this.theme.confetti;
    for(const burst of this.bursts)if(!burst.boss&&(event.chainComplete||(burst.small&&Math.hypot(burst.x-x,burst.y-y)<130)))burst.label='';
    this.bursts.push({x,y,radius:big?Math.max(65,radius):radius,age:0,duration:event.bossFinal?4.5:this.reducedMotion?.65:small?.85:1.6,big,small,boss:!!event.bossFinal,party:!!event.party,label:event.cascade?'':event.label||'NICE!',points:event.points||0,seed:this.random()*TAU});
    for(const strand of event.snaps||[])this.snaps.push({...strand,age:0,duration:this.reducedMotion?.2:.36,seed:this.random()*TAU});
    if(this.snaps.length>MAX_SNAPS)this.snaps.splice(0,this.snaps.length-MAX_SNAPS);
    while(this.bursts.length>MAX_BURSTS)this.bursts.splice(Math.max(0,this.bursts.findIndex(b=>!b.boss)),1);
    if(!this.reducedMotion)this.shake=Math.min(6,this.shake+(big?4:small?.35:radius/35));
    for(let i=0;i<count;i++) {
      const angle=this.random()*TAU, speed=(75+this.random()*280)*(big?1.3:small?.45:1);
      const kind=i%5===0?'star':i%3===0?'drop':i%2===0?'ribbon':'confetti';
      const life=this.reducedMotion?.45:small?.4+this.random()*.45:.9+this.random()*1.7;
      this.particles.push({
        x:x+Math.cos(angle)*radius*.35,y:y+Math.sin(angle)*radius*.35,
        vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-(big?70:20),
        age:0,life,size:2+this.random()*(small?3:kind==='ribbon'?7:5),kind,
        rotation:this.random()*TAU,spin:(this.random()-.5)*15,color:colors[i%colors.length],
      });
    }
    // Big pops also send streamers up from both lower corners.
    if(big && !event.cascade && !this.reducedMotion)for(let side=0;side<2;side++)for(let i=0;i<24;i++) {
      const angle=side===0?-.95+this.random()*.6:-2.2-this.random()*.6;
      const speed=270+this.random()*240;
      this.particles.push({x:side?width:0,y:height*.92,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,age:0,life:1.6+this.random(),size:3+this.random()*6,kind:'ribbon',rotation:this.random()*TAU,spin:(this.random()-.5)*12,color:colors[i%colors.length]});
    }
    if(big&&!this.reducedMotion)for(let i=0;i<10;i++) {
      this.particles.push({x,y,fromX:x,fromY:y,toX:width*.5+(this.random()-.5)*65,toY:64,bend:(this.random()-.5)*220,age:0,life:.65+this.random()*.55,size:2+this.random()*2,kind:'scoreSpark',rotation:0,spin:0,color:colors[i%colors.length]});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  layer(event) {
    for(const burst of this.bursts)if(burst.layer)burst.label='';
    this.peels.push({x:event.x,y:event.y,radius:event.radius,points:event.membrane,hue:event.hue,age:0,life:this.reducedMotion?.35:.78});
    if(this.peels.length>6)this.peels.shift();
    // Keep the center visible so the next shell stays easy to poke.
    this.bursts.push({x:event.x,y:event.y-event.radius*.63,radius:26,age:0,duration:.7,big:false,small:true,layer:true,party:false,label:event.label,points:event.points,seed:0});
    if(this.bursts.length>MAX_BURSTS)this.bursts.shift();
    if(!this.reducedMotion)this.shake=Math.min(3,this.shake+1.5);
  }
  cascade(event,width,height) {
    const {x,y,radius,wave}=event;
    this.pop({x,y,radius:radius*(1+wave*.2),label:'',party:false,visualOnly:true},width,height);
    this.bursts[this.bursts.length-1].label='';
    this.cheer(width,height);
  }
  step(dt) {
    dt=clamp(dt,0,.05);this.shake*=Math.exp(-dt*12);
    this.glass.reducedMotion=this.reducedMotion;this.glass.step(dt);
    for(const e of this.arrivals)e.age+=dt;
    this.arrivals=this.arrivals.filter(e=>e.age<e.duration);
    if(this.encouragement){this.encouragement.age+=dt;if(this.encouragement.age>=this.encouragement.duration)this.encouragement=null;}
    for(const b of this.bursts)b.age+=dt;
    this.bursts=this.bursts.filter(b=>b.age<b.duration);
    for(const s of this.snaps)s.age+=dt;
    this.snaps=this.snaps.filter(s=>s.age<s.duration);
    for(const p of this.peels)p.age+=dt;
    this.peels=this.peels.filter(p=>p.age<p.life);
    for(const p of this.particles) {
      p.age+=dt;p.rotation+=p.spin*dt;
      if(this.reducedMotion)continue;
      if(p.kind==='scoreSpark') {
        const t=clamp(p.age/p.life,0,1),ease=t*t*(3-2*t);
        p.x=p.fromX+(p.toX-p.fromX)*ease+Math.sin(t*Math.PI)*p.bend;
        p.y=p.fromY+(p.toY-p.fromY)*ease;continue;
      }
      p.vx*=Math.exp(-dt*.7);p.vy+=140*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    }
    this.particles=this.particles.filter(p=>p.age<p.life);
  }
  draw(ctx,width,height,time) {
    ctx.save();
    for(const peel of this.peels) {
      const t=peel.age/peel.life,points=peel.points;if(!points?.length)continue;
      for(let petal=0;petal<4;petal++) {
        const a=petal*Math.PI/2+.6,drift=this.reducedMotion?0:peel.radius*t*.24;
        ctx.save();ctx.translate(Math.cos(a)*drift,Math.sin(a)*drift+t*t*12);
        ctx.globalAlpha=(1-t)*.7;ctx.lineWidth=2+4*(1-t);ctx.lineCap='round';
        ctx.strokeStyle=`hsl(${peel.hue*180/Math.PI+petal*85} 100% 82%)`;
        const first=petal*8;ctx.beginPath();ctx.moveTo(points[first].x,points[first].y);
        for(let i=first+1;i<first+7;i++) {const p=points[i],q=points[(i+1)%points.length];ctx.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}
        ctx.stroke();ctx.globalAlpha=(1-t)*.22;ctx.lineWidth=12;ctx.stroke();ctx.restore();
      }
    }
    ctx.globalAlpha=1;
    for(const s of this.snaps) {
      const t=s.age/s.duration,recoil=this.reducedMotion?1:(1-t)**2;
      const dx=s.toX-s.x,dy=s.toY-s.y,d=Math.hypot(dx,dy)||1;
      const curl=this.reducedMotion?0:Math.sin(t*Math.PI*2+s.seed)*Math.sin(t*Math.PI)*Math.min(18,d*.4);
      ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle=s.golden?'#ffde87':'#dfbfff';ctx.lineWidth=1.2+(1-t)*1.1;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(s.x,s.y);
      ctx.quadraticCurveTo(s.x+dx*recoil*.5-dy/d*curl,s.y+dy*recoil*.5+dx/d*curl,s.x+dx*recoil,s.y+dy*recoil);ctx.stroke();
      ctx.fillStyle=s.golden?'#fff1b1':'#f3e5ff';ctx.beginPath();ctx.arc(s.x+dx*recoil,s.y+dy*recoil,1.5*(1-t),0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    for(const b of this.bursts) {
      const t=b.age/b.duration, fade=Math.max(0,1-t), radius=b.radius*(.6+Math.sqrt(t)*3.6);
      const bloom=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,Math.max(1,radius));
      bloom.addColorStop(0,`rgba(190,125,255,${fade*.15})`);
      bloom.addColorStop(.4,`rgba(100,225,240,${fade*.12})`);bloom.addColorStop(1,'rgba(100,140,255,0)');
      ctx.fillStyle=bloom;ctx.fillRect(b.x-radius,b.y-radius,radius*2,radius*2);
      if(!this.reducedMotion) {
        for(let ring=0;ring<(b.small?1:3);ring++) {
          const rt=clamp(t*1.6-ring*.13,0,1);if(rt===0||rt===1)continue;
          ctx.beginPath();ctx.arc(b.x,b.y,b.radius*(.55+rt*2.9),0,TAU);
          ctx.strokeStyle=this.theme.confetti[(ring*2)%6];ctx.globalAlpha=(1-rt)*.72;ctx.lineWidth=(1-rt)*3+.5;ctx.stroke();
        }
        ctx.globalAlpha=fade*.8;
        const rays=b.big?22:b.small?7:14;
        for(let i=0;i<rays;i++) {
          const angle=i*TAU/rays+b.seed;
          const inner=b.radius*(.6+t*2.5), outer=inner+(1-t)*b.radius*.7;
          ctx.beginPath();ctx.moveTo(b.x+Math.cos(angle)*inner,b.y+Math.sin(angle)*inner);
          ctx.lineTo(b.x+Math.cos(angle)*outer,b.y+Math.sin(angle)*outer);
          ctx.strokeStyle=this.theme.confetti[i%6];ctx.lineWidth=1.5;ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
      if(b.label&&t<.78) {
        const progress=clamp(t/.13,0,1), scale=.65+Math.sin(progress*Math.PI/2)*.35;
        const edge=b.small?65:Math.min(140,width*.36);
        ctx.save();ctx.translate(clamp(b.x,edge,width-edge),clamp(b.y-(b.small?35:0),Math.min(155,height*.35),Math.max(height*.35,Math.min(height-100,this.safeBottom)))-(this.reducedMotion?0:t*38));ctx.rotate(this.reducedMotion?0:-.06);ctx.scale(this.reducedMotion?1:scale,this.reducedMotion?1:scale);
        ctx.globalAlpha=Math.min(1,progress*3)*clamp((.78-t)*5,0,1);
        ctx.font=`900 italic ${Math.min(b.party?67:b.big?60:b.small?25:43,width*(b.label.length>8?.09:.13))}px system-ui, sans-serif`;
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=b.small?4:7;ctx.strokeStyle='#2c124d';
        ctx.strokeText(b.label,0,0);
        const rainbow=ctx.createLinearGradient(-110,-30,110,25);
        this.theme.confetti.forEach((color,i)=>rainbow.addColorStop(i/5,color));
        ctx.fillStyle=rainbow;ctx.fillText(b.label,0,0);
        if(b.points) {const offset=b.small?25:42;ctx.font=`700 ${b.small?16:23}px system-ui, sans-serif`;ctx.lineWidth=b.small?3:4;ctx.strokeText('+'+b.points.toLocaleString('en-US'),0,offset);ctx.fillStyle='#fff1cb';ctx.fillText('+'+b.points.toLocaleString('en-US'),0,offset);}
        ctx.restore();
      }
    }
    for(const p of this.particles) {
      const life=p.age/p.life, alpha=Math.min(1,Math.max(0,(1-life)*3));
      ctx.globalAlpha=alpha;ctx.fillStyle=p.color;ctx.strokeStyle=p.color;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);
      if(p.kind==='scoreSpark') {
        ctx.globalAlpha=alpha*.24;ctx.beginPath();ctx.arc(0,0,p.size*3,0,TAU);ctx.fill();
        ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(0,0,p.size,0,TAU);ctx.fill();
      } else if(p.kind==='heart') {
        const s=p.size;ctx.beginPath();ctx.moveTo(0,s);ctx.bezierCurveTo(-s*2,-s*.2,-s,-s*1.4,0,-s*.5);ctx.bezierCurveTo(s,-s*1.4,s*2,-s*.2,0,s);ctx.fill();
      } else if(p.kind==='star') {
        const s=p.size*(1-life*.4);ctx.beginPath();ctx.moveTo(0,-s*1.7);ctx.quadraticCurveTo(s*.2,-s*.2,s*1.7,0);ctx.quadraticCurveTo(s*.2,s*.2,0,s*1.7);ctx.quadraticCurveTo(-s*.2,s*.2,-s*1.7,0);ctx.quadraticCurveTo(-s*.2,-s*.2,0,-s*1.7);ctx.fill();
      } else if(p.kind==='drop') {
        ctx.beginPath();ctx.ellipse(0,0,p.size*.55,p.size,0,0,TAU);ctx.fill();
        ctx.globalAlpha=alpha*.8;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-p.size*.12,-p.size*.4,p.size*.2,0,TAU);ctx.fill();
      } else if(p.kind==='ribbon') {
        ctx.lineWidth=Math.max(1,p.size*.45);ctx.beginPath();ctx.moveTo(0,-p.size*2);ctx.bezierCurveTo(p.size*2,-p.size,-p.size*2,p.size,0,p.size*2);ctx.stroke();
      } else {ctx.scale(Math.cos(p.age*10+p.spin),1);ctx.fillRect(-p.size*.5,-p.size,p.size,p.size*2);}
      ctx.restore();
    }
    if(this.encouragement) {
      const e=this.encouragement,t=e.age/e.duration,fade=Math.min(1,t*8,(1-t)*6);
      const y=height*.77-(this.reducedMotion?0:Math.sin(t*Math.PI)*8);
      ctx.save();ctx.globalAlpha=fade;ctx.textAlign='center';ctx.textBaseline='middle';
      let size=Math.min(36,width*.077);ctx.font=`800 italic ${size}px system-ui, sans-serif`;
      const measured=ctx.measureText(e.text).width;
      if(measured>width-46){size*=(width-46)/measured;ctx.font=`800 italic ${size}px system-ui, sans-serif`;}
      ctx.shadowColor='#da9dff';ctx.shadowBlur=18;ctx.fillStyle='#fff0fc';
      ctx.strokeStyle='#201531';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeText(e.text,width*.5,y);ctx.fillText(e.text,width*.5,y);
      ctx.restore();
    }
    ctx.restore();
  }
}
