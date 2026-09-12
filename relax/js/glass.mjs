import {clamp,TAU} from './physics.mjs';

export const MAX_GLASS_DROPS=64;
export class GlassSplatter {
  constructor({random=Math.random,reducedMotion=false}={}){this.random=random;this.reducedMotion=reducedMotion;this.drops=[];}
  add(event,width,height) {
    const {x,y,radius}=event;
    const count=this.reducedMotion?2:event.bossFinal?14:event.cascade?1:event.fragment?2:radius>=80?7:4;
    for(let i=0;i<count;i++) {
      const angle=this.random()*TAU,distance=radius*(.4+this.random()*1.25),r=(event.fragment?2:3)+this.random()*(event.bossFinal?12:radius>=80?9:5);
      const px=clamp(x+Math.cos(angle)*distance,r+4,width-r-4),py=clamp(y+Math.sin(angle)*distance,86+r,height-r-4);
      this.drops.push({x:px,y:py,trailY:py,r,age:0,life:3.8+this.random()*2,delay:.3+this.random()*.5,speed:0,hue:(event.hue??0)*180/Math.PI+i*58,phase:this.random()*TAU});
    }
    if(this.drops.length>MAX_GLASS_DROPS)this.drops.splice(0,this.drops.length-MAX_GLASS_DROPS);
  }
  step(dt) {
    for(const d of this.drops) {
      d.age+=dt;
      if(this.reducedMotion||d.age<d.delay)continue;
      d.speed+=(7+d.r*.8-d.speed)*(1-Math.exp(-dt*1.3));
      d.y+=d.speed*dt;d.x+=Math.sin(d.age*.7+d.phase)*dt*.5;
      d.trailY=Math.max(d.trailY,d.y-d.r*4);
    }
    this.drops=this.drops.filter(d=>d.age<d.life);
  }
  draw(ctx,height) {
    ctx.save();
    for(const d of this.drops) {
      if(d.y-d.r>height)continue;
      const fade=Math.min(1,d.age*10,(d.life-d.age)*1.3),stretch=this.reducedMotion?0:clamp(d.speed/20,0,.65),r=d.r;
      ctx.globalAlpha=fade*.14;ctx.strokeStyle=`hsl(${d.hue} 95% 78%)`;ctx.lineWidth=r*.58;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(d.x,d.trailY);ctx.quadraticCurveTo(d.x-1,(d.trailY+d.y)/2,d.x,d.y);ctx.stroke();
      ctx.save();ctx.translate(d.x,d.y);
      ctx.beginPath();ctx.moveTo(0,-r*(1+stretch));
      ctx.bezierCurveTo(r*.22,-r*.48,r,-r*.25,r*.94,r*.25);
      ctx.bezierCurveTo(r*.85,r*1.15,-r*.85,r*1.15,-r*.94,r*.25);
      ctx.bezierCurveTo(-r,-r*.25,-r*.22,-r*.48,0,-r*(1+stretch));ctx.closePath();
      const body=ctx.createRadialGradient(-r*.25,-r*.4,0,0,r*.15,r*1.4);
      body.addColorStop(0,'#f4ffffcf');body.addColorStop(.25,`hsla(${d.hue} 95% 76% / .38)`);
      body.addColorStop(.63,`hsla(${d.hue+75} 90% 60% / .2)`);body.addColorStop(1,`hsla(${d.hue+140} 95% 82% / .86)`);
      ctx.globalAlpha=fade*.8;ctx.fillStyle=body;ctx.fill();ctx.lineWidth=.9;ctx.strokeStyle=`hsla(${d.hue+60} 95% 86% / .72)`;ctx.stroke();
      ctx.fillStyle='#ffffff';ctx.globalAlpha=fade*.84;ctx.beginPath();ctx.ellipse(-r*.28,-r*.26,r*.22,r*.09,-.65,0,TAU);ctx.fill();
      ctx.globalAlpha=fade*.48;ctx.strokeStyle='#fff0ff';ctx.lineWidth=.65;ctx.beginPath();ctx.arc(0,r*.12,r*.7,.4,1.9);ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
