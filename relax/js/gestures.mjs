// An input gesture remains a drag once it crosses the threshold, even if it returns.
export const DRAG_THRESHOLD = 9;
export function beginGesture(pointerId, bubbleId, x, y, time) {
  return { pointerId, bubbleId, startX:x, startY:y, x, y, time, dragging:false };
}
export function moveGesture(g, x, y) {
  g.x=x;g.y=y;
  if(Math.hypot(x-g.startX,y-g.startY)>=DRAG_THRESHOLD)g.dragging=true;
  return g.dragging;
}
export function isTap(g, time) { return !g.dragging && time-g.time<420; }
