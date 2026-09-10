import { TAU, clamp } from './physics.mjs';
export const MAX_PARTICLES=650;
export const MAX_BURSTS=10;
export const MAX_SNAPS=40;

export class PopEffects {
  constructor(theme,{random=Math.random,reducedMotion=false}={}) {
    this.theme=theme;this.random=random;this.reducedMotion=reducedMotion;
    this.particles=[];this.bursts=[];this.snaps=[];this.shake=0;this.safeBottom=Infinity;
  }
  pop(event, width, height) {
    const {x,y,radius}=event, big=radius>=85||event.party||event.chainComplete||event.golden;
    const small=event.fragment&&!big;
    const count=this.reducedMotion?(small?5:12):small?20:big?150:Math.round(clamp(radius,55,110));
    const colors=this.theme.confetti;
    for(const burst of this.bursts)if(event.chainComplete||(burst.small&&Math.hypot(burst.x-x,burst.y-y)<130))burst.label='';
    this.bursts.push({x,y,radius:big?Math.max(65,radius):radius,age:0,duration:this.reducedMotion?.65:small?.85:1.6,big,small,party:!!event.party,label:event.label||'NICE!',points:event.points||0,seed:this.random()*TAU});
    for(const strand of event.snaps||[])this.snaps.push({...strand,age:0,duration:this.reducedMotion?.2:.36,seed:this.random()*TAU});
    if(this.snaps.length>MAX_SNAPS)this.snaps.splice(0,this.snaps.length-MAX_SNAPS);
    if(this.bursts.length>MAX_BURSTS)this.bursts.splice(0,this.bursts.length-MAX_BURSTS);
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
    if(big && !this.reducedMotion)for(let side=0;side<2;side++)for(let i=0;i<24;i++) {
      const angle=side===0?-.95+this.random()*.6:-2.2-this.random()*.6;
      const speed=270+this.random()*240;
      this.particles.push({x:side?width:0,y:height*.92,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,age:0,life:1.6+this.random(),size:3+this.random()*6,kind:'ribbon',rotation:this.random()*TAU,spin:(this.random()-.5)*12,color:colors[i%colors.length]});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  step(dt) {
    dt=clamp(dt,0,.05);this.shake*=Math.exp(-dt*12);
    for(const b of this.bursts)b.age+=dt;
    this.bursts=this.bursts.filter(b=>b.age<b.duration);
    for(const s of this.snaps)s.age+=dt;
    this.snaps=this.snaps.filter(s=>s.age<s.duration);
    for(const p of this.particles) {
      p.age+=dt;p.rotation+=p.spin*dt;
      if(this.reducedMotion)continue;
      p.vx*=Math.exp(-dt*.7);p.vy+=140*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    }
    this.particles=this.particles.filter(p=>p.age<p.life);
  }
  draw(ctx,width,height,time) {
    ctx.save();
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
        if(b.points) {const offset=b.small?25:42;ctx.font=`750 ${b.small?16:23}px system-ui, sans-serif`;ctx.lineWidth=b.small?3:4;ctx.strokeText('+'+b.points.toLocaleString('en-US'),0,offset);ctx.fillStyle='#fff1cb';ctx.fillText('+'+b.points.toLocaleString('en-US'),0,offset);}
        ctx.restore();
      }
    }
    for(const p of this.particles) {
      const life=p.age/p.life, alpha=Math.min(1,Math.max(0,(1-life)*3));
      ctx.globalAlpha=alpha;ctx.fillStyle=p.color;ctx.strokeStyle=p.color;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);
      if(p.kind==='star') {
        const s=p.size*(1-life*.4);ctx.beginPath();ctx.moveTo(0,-s*1.7);ctx.quadraticCurveTo(s*.2,-s*.2,s*1.7,0);ctx.quadraticCurveTo(s*.2,s*.2,0,s*1.7);ctx.quadraticCurveTo(-s*.2,s*.2,-s*1.7,0);ctx.quadraticCurveTo(-s*.2,-s*.2,0,-s*1.7);ctx.fill();
      } else if(p.kind==='drop') {
        ctx.beginPath();ctx.ellipse(0,0,p.size*.55,p.size,0,0,TAU);ctx.fill();
        ctx.globalAlpha=alpha*.8;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-p.size*.12,-p.size*.4,p.size*.2,0,TAU);ctx.fill();
      } else if(p.kind==='ribbon') {
        ctx.lineWidth=Math.max(1,p.size*.45);ctx.beginPath();ctx.moveTo(0,-p.size*2);ctx.bezierCurveTo(p.size*2,-p.size,-p.size*2,p.size,0,p.size*2);ctx.stroke();
      } else {ctx.scale(Math.cos(p.age*10+p.spin),1);ctx.fillRect(-p.size*.5,-p.size,p.size,p.size*2);}
      ctx.restore();
    }
    ctx.restore();
  }
}
