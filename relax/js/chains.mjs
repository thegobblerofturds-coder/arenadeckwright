export const FRAGMENT_READY_AGE = .24;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

export function chainLayout({x,y,radius,width,height,unit=1,golden=false,playBottom=height-90}) {
  const count = golden ? 12 : clamp(Math.round(radius/(12*unit)),6,8);
  const columns = golden ? count/2 : count;
  const r = Math.min(clamp(radius/Math.sqrt(count)*.56,16*unit,25*unit),width/(columns*2.6+2));
  const spacing = r*2.55, span=(columns-1)*spacing;
  const centerX=clamp(x,span/2+r+14,width-span/2-r-14);
  const rowHeight=golden?r*2.8:0;
  const top=70+r*1.8+rowHeight*.5;
  const centerY=clamp(y,top,Math.max(top,playBottom-r*2-rowHeight*.5));
  return Array.from({length:count},(_,i)=>{
    const row=Math.floor(i/columns),column=row===0?i:count-1-i;
    return {x:centerX+(column-(columns-1)/2)*spacing,y:centerY+(row-.5)*rowHeight-Math.sin(column/(columns-1)*Math.PI)*r*.8,r};
  });
}

// Swept intersection catches small bubbles even between widely spaced pointer events.
export function segmentHit(x1,y1,x2,y2,cx,cy,radius) {
  const dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy;
  const t=len2?clamp(((cx-x1)*dx+(cy-y1)*dy)/len2,0,1):0;
  return Math.hypot(cx-x1-t*dx,cy-y1-t*dy)<=radius ? t : null;
}

const SCALE=[0,2,4,7,9];
export function chainFrequency(step) {
  const index=clamp(Math.floor(step),0,15);
  return 392*2**((SCALE[index%SCALE.length]+Math.floor(index/SCALE.length)*12)/12);
}
