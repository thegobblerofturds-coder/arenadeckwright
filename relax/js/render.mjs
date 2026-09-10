import {TAU,POINTS,clamp} from './physics.mjs';

export class BubbleRenderer {
  constructor(canvas,theme) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.theme=theme;
    if(!this.ctx)throw new Error('Canvas is unavailable.');
    this.width=0;this.height=0;this.dpr=1;
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
    ctx.save();ctx.translate(b.x,b.y);
    if(b.fragment){const emergence=clamp(b.age/.24,.08,1);ctx.scale(emergence,emergence);}
    const spectrum=this.rainbow(0,0,r,b.hue+time*.075,b.golden);
    if(b.golden) {
      const glow=ctx.createRadialGradient(0,0,r*.7,0,0,r*1.34);
      glow.addColorStop(0,'#ffe19700');glow.addColorStop(.6,'#ffc55e15');glow.addColorStop(1,'#ffe19700');
      ctx.fillStyle=glow;ctx.fillRect(-r*1.4,-r*1.4,r*2.8,r*2.8);
    }
    // Transparent film, with color concentrated around the curved edge.
    ctx.save();ctx.clip(path);
    ctx.globalAlpha=b.golden?.23:this.theme.filmOpacity;ctx.fillStyle=spectrum;ctx.fill(path);ctx.globalAlpha=1;
    const film=ctx.createRadialGradient(-r*.22,-r*.3,r*.08,0,0,r*1.15);
    film.addColorStop(0,'rgba(175,191,232,0.015)');film.addColorStop(.62,'rgba(74,76,136,0.018)');
    film.addColorStop(.84,'rgba(177,157,239,0.085)');film.addColorStop(.96,'rgba(180,236,247,0.17)');film.addColorStop(1,'rgba(167,149,237,0.025)');
    ctx.fillStyle=film;ctx.fill(path);
    // Flowing interference bands travel slowly through the soap film.
    ctx.save();ctx.rotate(-.38+Math.sin(time*.13+b.phase)*.12);
    for(let i=0;i<3;i++) {
      const y=(-.8+i*.68+Math.sin(time*.17+b.phase+i)*.12)*r;
      const glow=ctx.createLinearGradient(0,y-r*.13,0,y+r*.16);
      glow.addColorStop(0,'rgba(180,155,255,0)');glow.addColorStop(.45,i%2?'rgba(127,236,225,.11)':'rgba(244,167,219,.09)');glow.addColorStop(1,'rgba(180,155,255,0)');
      ctx.fillStyle=glow;ctx.fillRect(-r*3,y-r*.15,r*6,r*.34);
    }
    ctx.restore();
    ctx.strokeStyle=spectrum;ctx.globalAlpha=.08;ctx.lineWidth=17;ctx.stroke(path);
    ctx.globalAlpha=.17;ctx.lineWidth=6;ctx.stroke(path);
    ctx.restore();
    ctx.globalAlpha=.9;ctx.strokeStyle=spectrum;ctx.lineWidth=b.fragment?2:b.golden?2.4:this.theme.rimWidth;ctx.stroke(path);
    ctx.globalAlpha=.26;ctx.lineWidth=.6;ctx.stroke(this.outline(b,.963));ctx.globalAlpha=1;
    // Broken highlights follow the actual deforming membrane, including stretched necks.
    this.highlight(b,17,23,'rgba(239,250,255,.8)',r>70?3.1:2.3,.915);
    this.highlight(b,18,22,'rgba(255,255,255,.75)',1,.887);
    this.highlight(b,2,7,'rgba(241,170,239,.68)',2,.947);
    this.highlight(b,9,12,'rgba(132,241,232,.45)',1.5,.95);
    const p=b.points[21];ctx.fillStyle='#fbffff';ctx.globalAlpha=.9;
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
  draw(world,effects,focusedId=null) {
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
    this.threads(world);
    const joined=new Set();
    for(const link of world.links.values()) {
      const a=world.get(link.a),b=world.get(link.b);
      if(a&&b) {this.bubble(this.compound(a,b,link.progress),world.time,a.id===focusedId||b.id===focusedId);joined.add(a.id);joined.add(b.id);}
    }
    for(const fragment of [false,true])for(const b of world.bubbles)if(b.fragment===fragment&&!joined.has(b.id))this.bubble(b,world.time,b.id===focusedId);
    effects.draw(ctx,this.width,this.height,world.time);
    ctx.restore();
  }
}
