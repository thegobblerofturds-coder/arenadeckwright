import {clamp,lerp} from './physics.mjs';

export const MAX_RIBBONS=6,MAX_PAINT_POINTS=240,MAX_PAINT_BEADS=48;

export class RainbowPaint {
  constructor(){this.time=0;this.strokes=[];this.beads=[];this.serial=0;}
  start(id,x,y,unit=1) {
    this.end(id);
    const stroke={id,unit,x,y,distance:0,hue:this.serial++*83,active:true,nodes:[]};
    this.strokes.push(stroke);
    if(this.strokes.length>MAX_RIBBONS)this.strokes.shift();
    return stroke;
  }
  move(id,x,y) {
    const stroke=this.strokes.find(s=>s.id===id&&s.active);
    if(!stroke||!Number.isFinite(x)||!Number.isFinite(y))return;
    const dx=x-stroke.x,dy=y-stroke.y,d=Math.hypot(dx,dy);
    if(d<3)return;
    if(!stroke.nodes.length)stroke.nodes.push({x:stroke.x,y:stroke.y,born:this.time,hue:stroke.hue,distance:stroke.distance});
    const steps=Math.min(90,Math.ceil(d/(8*stroke.unit))),from=stroke.distance;
    for(let i=1;i<=steps;i++) {
      const distance=from+d*i/steps,node={x:stroke.x+dx*i/steps,y:stroke.y+dy*i/steps,born:this.time,hue:stroke.hue+distance*.48,distance};
      stroke.nodes.push(node);
      const spacing=48*stroke.unit;
      if(Math.floor(distance/spacing)>Math.floor((from+d*(i-1)/steps)/spacing)&&this.beads.length<MAX_PAINT_BEADS) {
        this.beads.push({x:node.x,y:node.y,hue:node.hue*Math.PI/180,radius:(19+4*Math.sin(distance*.03)**2)*stroke.unit,due:this.time+.72});
      }
    }
    stroke.x=x;stroke.y=y;stroke.distance+=d;
    let excess=this.strokes.reduce((n,s)=>n+s.nodes.length,0)-MAX_PAINT_POINTS;
    for(const s of this.strokes){const take=Math.min(s.nodes.length,Math.max(0,excess));s.nodes.splice(0,take);excess-=take;}
  }
  end(id){for(const stroke of this.strokes)if(stroke.id===id)stroke.active=false;}
  finish(){for(const stroke of this.strokes)stroke.active=false;}
  clear(){this.strokes=[];this.beads=[];}
  step(dt,world) {
    this.time+=clamp(dt,0,.08);
    for(const bead of this.beads)if(bead.due<=this.time)world.addPaintBubble(bead.x,bead.y,bead.radius,bead.hue);
    this.beads=this.beads.filter(b=>b.due>this.time);
    for(const stroke of this.strokes)stroke.nodes=stroke.nodes.filter(n=>this.time-n.born<1.4);
    this.strokes=this.strokes.filter(s=>s.active||s.nodes.length);
  }
  draw(ctx,reducedMotion=false) {
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(const stroke of this.strokes)for(let i=1;i<stroke.nodes.length;i++) {
      const a=stroke.nodes[i-1],b=stroke.nodes[i],previous=stroke.nodes[i-2]??a,next=stroke.nodes[i+1]??b;
      const age=this.time-(a.born+b.born)*.5,life=clamp(1-age/1.4,0,1);
      const pooling=.84+.16*Math.cos(b.distance/(48*stroke.unit)*Math.PI*2);
      const width=(32*life*pooling+3)*stroke.unit;
      ctx.beginPath();ctx.moveTo((previous.x+a.x)/2,(previous.y+a.y)/2);
      ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);
      ctx.quadraticCurveTo(b.x,b.y,(b.x+next.x)/2,(b.y+next.y)/2);
      const color=ctx.createLinearGradient(a.x,a.y,b.x+.01,b.y+.01);
      color.addColorStop(0,`hsl(${a.hue} 96% 70%)`);color.addColorStop(1,`hsl(${b.hue} 96% 70%)`);
      ctx.strokeStyle=color;ctx.globalAlpha=life*.12;ctx.lineWidth=width+14;ctx.stroke();
      ctx.globalAlpha=life*.73;ctx.lineWidth=width;ctx.stroke();
      ctx.globalAlpha=life*.3;ctx.strokeStyle='#fffaff';ctx.lineWidth=width*.26;ctx.stroke();
    }
    // Bulging pools make the thread visibly gather into its next round pearls.
    for(const bead of this.beads) {
      const t=clamp(1-(bead.due-this.time)/.72,0,1),r=lerp(4,bead.radius*.75,t*t);
      ctx.globalAlpha=t*.56;ctx.fillStyle=`hsl(${bead.hue*180/Math.PI} 94% 74%)`;
      ctx.beginPath();ctx.arc(bead.x,bead.y,r,0,Math.PI*2);ctx.fill();
      if(!reducedMotion){ctx.globalAlpha=t*.48;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(bead.x-r*.25,bead.y-r*.36,r*.3,r*.12,-.4,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
}
