import {TAU,POINTS,clamp,specialPose} from './physics.mjs';

export class BubbleRenderer {
  constructor(canvas,theme) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.theme=theme;
    if(!this.ctx)throw new Error('Canvas is unavailable.');
    this.width=0;this.height=0;this.dpr=1;
    this.lighting=this.makeLighting();
  }
  makeLighting() {
    // Shared sphere lighting keeps the richer film inexpensive even during long chains.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.translate(128,128);ctx.scale(128,128);
    const volume=ctx.createRadialGradient(-.28,-.35,.04,0,0,1.05);
    volume.addColorStop(0,'#d7f0ff52');volume.addColorStop(.34,'#aacbff0c');volume.addColorStop(.62,'#13122d14');
    volume.addColorStop(.82,'#03031863');volume.addColorStop(.93,'#addffc40');volume.addColorStop(1,'#e1f8ff85');
    ctx.fillStyle=volume;ctx.fillRect(-1,-1,2,2);
    const bounce=ctx.createRadialGradient(.34,.62,0,.34,.62,.65);
    bounce.addColorStop(0,'#84f7f74d');bounce.addColorStop(.55,'#e9a6ff14');bounce.addColorStop(1,'#e9a6ff00');
    ctx.fillStyle=bounce;ctx.fillRect(-1,-1,2,2);
    ctx.save();ctx.translate(-.35,-.43);ctx.rotate(-.58);ctx.scale(.34,.5);
    const reflection=ctx.createRadialGradient(0,-.1,0,0,0,1);
    reflection.addColorStop(0,'#ffffff8c');reflection.addColorStop(.32,'#ffffff38');reflection.addColorStop(1,'#ffffff00');
    ctx.fillStyle=reflection;ctx.fillRect(-1,-1,2,2);ctx.restore();
    ctx.fillStyle='#f8ffffd9';ctx.beginPath();ctx.ellipse(-.38,-.57,.22,.045,-.57,0,TAU);ctx.fill();
    ctx.fillStyle='#ffffffa6';ctx.beginPath();ctx.ellipse(-.16,-.73,.055,.027,-.35,0,TAU);ctx.fill();
    const lower=ctx.createLinearGradient(-.2,.6,.65,.91);lower.addColorStop(0,'#b9ffff00');lower.addColorStop(.5,'#b9ffff99');lower.addColorStop(1,'#ffbce700');
    ctx.strokeStyle=lower;ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(0,0,.91,.91,0,.3,1.6);ctx.stroke();
    return canvas;
  }
  resize(width,height,dpr=globalThis.devicePixelRatio||1) {
    this.width=width;this.height=height;
    // Limit the pixel budget as well as DPR for large high-density screens.
    this.dpr=Math.max(.6,Math.min(dpr,1.8,Math.sqrt(2800000/(width*height))));
    this.canvas.width=Math.round(width*this.dpr);this.canvas.height=Math.round(height*this.dpr);
  }
  outline(b,scale=1) {
    const path=new Path2D(),pts=b.points;
    path.moveTo((pts[POINTS-1].x+pts[0].x)*scale/2,(pts[POINTS-1].y+pts[0].y)*scale/2);
    for(let i=0;i<POINTS;i++) {const p=pts[i],n=pts[(i+1)%POINTS];path.quadraticCurveTo(p.x*scale,p.y*scale,(p.x+n.x)*scale/2,(p.y+n.y)*scale/2);}
    path.closePath();return path;
  }
  rainbow(x,y,r,angle,golden=false) {
    const ctx=this.ctx;
    const gradient=ctx.createConicGradient ? ctx.createConicGradient(angle,x,y) : ctx.createLinearGradient(x-r,y-r,x+r,y+r);
    const spectrum=golden?['#fff5bc','#ffd76c','#eaaa3a','#ffe4a1','#fff6cd','#d8a44c','#fff5bc']:this.theme.spectrum;
    spectrum.forEach((color,i)=>gradient.addColorStop(i/(spectrum.length-1),color));
    return gradient;
  }
  bubble(b,time,focused) {
    const ctx=this.ctx,r=b.r,path=this.outline(b);
    const pose=specialPose(b,this.reducedMotion),alpha=pose.opacity;
    ctx.save();ctx.translate(b.x+pose.x,b.y+pose.y);ctx.scale(pose.scaleX,pose.scaleY);ctx.globalAlpha=alpha;
    if(b.fragment||b.painted){const emergence=clamp(b.age/(b.painted?.42:.24),.08,1);ctx.scale(emergence,emergence);}
    const spectrum=this.rainbow(0,0,r,b.hue+time*.075,b.golden);
    if(b.golden||b.special) {
      const glow=ctx.createRadialGradient(0,0,r*.7,0,0,r*1.34);
      glow.addColorStop(0,'#ffe19700');glow.addColorStop(.6,b.special==='boss'?'#ff72c82e':b.special?'#9d8bff20':'#ffc55e15');glow.addColorStop(1,'#ffe19700');
      ctx.fillStyle=glow;ctx.fillRect(-r*1.4,-r*1.4,r*2.8,r*2.8);
    }
    // Transparent film, with color concentrated around the curved edge.
    ctx.save();ctx.clip(path);
    ctx.globalAlpha=(b.golden?.23:this.theme.filmOpacity)*alpha;ctx.fillStyle=spectrum;ctx.fill(path);ctx.globalAlpha=alpha;
    const film=ctx.createRadialGradient(-r*.22,-r*.3,r*.08,0,0,r*1.15);
    film.addColorStop(0,'rgba(175,191,232,0.015)');film.addColorStop(.62,'rgba(74,76,136,0.018)');
    film.addColorStop(.84,'rgba(177,157,239,0.085)');film.addColorStop(.96,'rgba(180,236,247,0.17)');film.addColorStop(1,'rgba(167,149,237,0.025)');
    ctx.fillStyle=film;ctx.fill(path);
    const extentX=Math.max(...b.points.map(p=>Math.abs(p.x))),extentY=Math.max(...b.points.map(p=>Math.abs(p.y)));
    ctx.drawImage(this.lighting,-extentX,-extentY,extentX*2,extentY*2);
    // Flowing interference bands travel slowly through the soap film.
    ctx.save();ctx.rotate(-.38+Math.sin(time*.13+b.phase)*.12);
    for(let i=0;i<3;i++) {
      const y=(-.8+i*.68+Math.sin(time*.17+b.phase+i)*.12)*r;
      const glow=ctx.createLinearGradient(0,y-r*.13,0,y+r*.16);
      glow.addColorStop(0,'rgba(180,155,255,0)');glow.addColorStop(.45,i%2?'rgba(127,236,225,.09)':'rgba(244,167,219,.075)');glow.addColorStop(1,'rgba(180,155,255,0)');
      ctx.fillStyle=glow;ctx.fillRect(-r*3,y-r*.15,r*6,r*.34);
    }
    ctx.restore();
    ctx.strokeStyle=spectrum;ctx.globalAlpha=.08*alpha;ctx.lineWidth=17;ctx.stroke(path);
    ctx.globalAlpha=.17*alpha;ctx.lineWidth=6;ctx.stroke(path);
    ctx.restore();
    if(b.special)this.layers(b,time,path,alpha);
    ctx.globalAlpha=.9*alpha;ctx.strokeStyle=spectrum;ctx.lineWidth=b.fragment?2:b.golden?2.4:this.theme.rimWidth;ctx.stroke(path);
    ctx.globalAlpha=.26*alpha;ctx.lineWidth=.6;ctx.stroke(this.outline(b,.963));ctx.globalAlpha=alpha;
    // Broken highlights follow the actual deforming membrane, including stretched necks.
    this.highlight(b,17,23,'rgba(239,250,255,.8)',r>70?3.1:2.3,.915);
    this.highlight(b,18,22,'rgba(255,255,255,.75)',1,.887);
    this.highlight(b,2,7,'rgba(241,170,239,.68)',2,.947);
    this.highlight(b,9,12,'rgba(132,241,232,.45)',1.5,.95);
    const p=b.points[21];ctx.fillStyle='#fbffff';ctx.globalAlpha=.9*alpha;
    ctx.beginPath();ctx.ellipse(p.x*.94,p.y*.94,Math.max(1.5,r*.027),Math.max(1,r*.014),-.65,0,TAU);ctx.fill();
    if(b.golden) {
      ctx.save();ctx.clip(path);ctx.strokeStyle='#fff1a8';ctx.lineWidth=1.2;
      for(let i=0;i<7;i++) {
        const a=i*TAU/7+time*.09,orbit=r*(.37+(i%3)*.14),x=Math.cos(a)*orbit,y=Math.sin(a)*orbit;
        const s=2+Math.sin(time*1.8+i)*1.4;ctx.globalAlpha=.42+Math.sin(time*1.8+i)*.2;
        ctx.beginPath();ctx.moveTo(x-s,y);ctx.lineTo(x+s,y);ctx.moveTo(x,y-s);ctx.lineTo(x,y+s);ctx.stroke();
      }
      ctx.restore();
    }
    if(focused) {ctx.globalAlpha=.8;ctx.strokeStyle='#f8efff';ctx.lineWidth=1.5;ctx.setLineDash([5,6]);ctx.stroke(this.outline(b,1.09));ctx.setLineDash([]);}
    ctx.restore();
  }
  layers(b,time,path,alpha=1) {
    const ctx=this.ctx,r=b.r,boss=b.special==='boss';
    ctx.save();ctx.clip(path);
    // Nested membranes share the deformed outer surface and drift slightly inside it.
    for(let i=b.layers-1;i>=1;i--) {
      const scale=1-i*.11,shift=(1-scale)*r*.09;
      ctx.save();ctx.translate(Math.sin(time*.7+i)*shift,Math.cos(time*.6+i)*shift);
      const inner=this.outline(b,scale),color=this.rainbow(0,0,r*scale,b.hue+i*1.05-time*.08);
      ctx.strokeStyle=color;ctx.globalAlpha=(.45+i*.025)*alpha;ctx.lineWidth=2.4;ctx.stroke(inner);
      ctx.globalAlpha=.055*alpha;ctx.fillStyle=color;ctx.fill(inner);
      ctx.globalAlpha=.13*alpha;ctx.lineWidth=9;ctx.stroke(inner);
      ctx.globalAlpha=.42*alpha;this.highlight(b,18,23,'#fff7ff',1.4,scale*.97);
      ctx.restore();
    }
    const core=ctx.createRadialGradient(-r*.05,-r*.07,0,0,0,r*.38);
    core.addColorStop(0,boss?'#fff4b89c':'#dcffff70');core.addColorStop(.35,boss?'#ff8bce40':'#c792ff32');core.addColorStop(1,'#c792ff00');
    ctx.globalAlpha=alpha;ctx.fillStyle=core;ctx.fillRect(-r,-r,r*2,r*2);
    ctx.restore();
    // Progress belongs on the bubble itself, keeping the score-only HUD intact.
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#121022';ctx.shadowBlur=9;
    ctx.font=`800 ${Math.min(18,r*.14)}px system-ui, sans-serif`;ctx.fillStyle=boss?'#fff0ba':'#fbecff';
    ctx.fillText(b.anticipation?'ABOUT TO BLOW!':b.entrance&&boss?'INCOMING!':boss?'BOSS BUBBLE':'SQUISH ME',0,-r*.09);
    for(let i=0;i<b.totalLayers;i++) {
      const x=(i-(b.totalLayers-1)/2)*Math.min(16,r*.105),filled=!b.anticipation&&i<b.layers;
      ctx.beginPath();ctx.arc(x,r*.12,filled?3.5:2.4,0,TAU);
      ctx.globalAlpha=(filled?1:.24)*alpha;ctx.fillStyle=filled?(boss?'#ffedac':'#d2fffb'):'#fff';ctx.fill();
    }
    ctx.restore();
  }
  highlight(b,from,to,color,width,scale) {
    const ctx=this.ctx;ctx.beginPath();
    const start=b.points[from];ctx.moveTo(start.x*scale,start.y*scale);
    for(let i=from;i<to;i++) {const p=b.points[i],n=b.points[i+1];ctx.quadraticCurveTo(p.x*scale,p.y*scale,(p.x+n.x)*scale/2,(p.y+n.y)*scale/2);}
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
  }
  compound(a,b,progress) {
    const area=a.r*a.r+b.r*b.r, r=Math.sqrt(area);
    const x=(a.x*a.r*a.r+b.x*b.r*b.r)/area,y=(a.y*a.r*a.r+b.y*b.r*b.r)/area;
    const k=Math.min(a.r,b.r)*(.7+progress*.2);
    const maximum=Math.max(Math.hypot(a.x-x,a.y-y)+a.r*1.3,Math.hypot(b.x-x,b.y-y)+b.r*1.3)+k;
    const blend=clamp((progress-.4)/.6,0,1),smooth=blend*blend*(3-2*blend);
    const points=[];
    const surface=(body,px,py)=>{
      const dx=px-body.x,dy=py-body.y,angle=(Math.atan2(dy,dx)+TAU)%TAU;
      const index=angle/TAU*POINTS,lo=Math.floor(index),fraction=index-lo;
      const p=body.points[lo%POINTS],q=body.points[(lo+1)%POINTS];
      const radius=Math.hypot(p.x,p.y)*(1-fraction)+Math.hypot(q.x,q.y)*fraction;
      return Math.hypot(dx,dy)-radius;
    };
    // Trace one smooth liquid boundary; internal bubble rims dissolve on contact.
    for(let i=0;i<POINTS;i++) {
      const angle=i*TAU/POINTS,c=Math.cos(angle),s=Math.sin(angle);let lo=0,hi=maximum;
      for(let j=0;j<11;j++) {
        const mid=(lo+hi)/2,px=x+c*mid,py=y+s*mid;
        const da=surface(a,px,py),db=surface(b,px,py),h=Math.max(k-Math.abs(da-db),0)/k;
        const distance=Math.min(da,db)-h*h*k*.25;
        if(distance<=0)lo=mid;else hi=mid;
      }
      const radius=(lo+hi)/2*(1-smooth)+r*smooth;
      points.push({x:c*radius,y:s*radius});
    }
    return {id:a.id,x,y,r,hue:a.hue,phase:a.phase,points};
  }
  threads(world) {
    const ctx=this.ctx;
    for(const chain of world.chains.values()) {
      const members=world.bubbles.filter(b=>b.chainId===chain.id).sort((a,b)=>a.chainIndex-b.chainIndex);
      for(let i=1;i<members.length;i++) {
        const a=members[i-1],b=members[i];if(b.chainIndex-a.chainIndex!==1)continue;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
        if(d<a.r+b.r||d>(a.r+b.r)*5)continue;
        const nx=dx/d,ny=dy/d,x1=a.x+nx*a.r*.91,y1=a.y+ny*a.r*.91,x2=b.x-nx*b.r*.91,y2=b.y-ny*b.r*.91;
        const bend=Math.sin(world.time*2+a.chainIndex)*Math.min(8,d*.08);
        ctx.save();ctx.globalAlpha=.48*Math.min(1,a.age*3,b.age*3);
        ctx.strokeStyle=this.rainbow((x1+x2)/2,(y1+y2)/2,d,world.time*.2+a.hue,chain.golden);
        ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2-ny*bend,(y1+y2)/2+nx*bend,x2,y2);ctx.stroke();
        ctx.globalAlpha=.13;ctx.lineWidth=5;ctx.stroke();ctx.restore();
      }
    }
  }
  draw(world,effects,focusedId=null,paint=null) {
    this.reducedMotion=world.reducedMotion;
    const ctx=this.ctx;ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.clearRect(0,0,this.width,this.height);
    ctx.save();
    if(!world.reducedMotion && effects.shake>.1)ctx.translate(Math.sin(world.time*63)*effects.shake,Math.cos(world.time*71)*effects.shake*.65);
    // A handful of very faint motes keep the dark space alive without distracting.
    for(let i=0;i<18;i++) {
      const x=(Math.sin(i*127.1)*.5+.5)*this.width, y=((i*.173+1-world.time*.003)%1)*this.height;
      ctx.globalAlpha=.10+Math.sin(world.time*.8+i)*.04;ctx.fillStyle=i%2?'#d4b4ee':'#9be9e5';
      ctx.beginPath();ctx.arc(x,y,i%3===0?1.5:.8,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    effects.drawUnderlay?.(ctx);
    if(!world.reducedMotion)for(const wave of world.shockwaves) {
      const fade=1-wave.front/wave.reach;
      ctx.save();ctx.globalAlpha=fade*.28;ctx.strokeStyle=this.rainbow(wave.x,wave.y,wave.front,wave.hue);
      ctx.lineWidth=2+fade*3;ctx.beginPath();ctx.ellipse(wave.x,wave.y,Math.max(1,wave.front),Math.max(1,wave.front*.97),0,0,TAU);ctx.stroke();ctx.restore();
    }
    paint?.draw(ctx,world.reducedMotion);
    this.threads(world);
    const joined=new Set();
    for(const link of world.links.values()) {
      const a=world.get(link.a),b=world.get(link.b);
      if(a&&b) {this.bubble(this.compound(a,b,link.progress),world.time,a.id===focusedId||b.id===focusedId);joined.add(a.id);joined.add(b.id);}
    }
    for(const fragment of [false,true])for(const b of world.bubbles)if(b.fragment===fragment&&!b.special&&!joined.has(b.id))this.bubble(b,world.time,b.id===focusedId);
    for(const b of world.bubbles)if(b.special)this.bubble(b,world.time,b.id===focusedId);
    effects.draw(ctx,this.width,this.height,world.time);
    ctx.restore();
    effects.glass?.draw(ctx,this.height);
  }
}
