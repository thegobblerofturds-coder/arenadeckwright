export const RECOMMENDED_THICKNESS=.78;
export const STARTING_FLOW=.4;
export const flowForPops=pops=>STARTING_FLOW+(1-STARTING_FLOW)*(1-Math.exp(-Math.max(0,pops)/90));
const ENCOURAGEMENT=["YOU’RE DOING GREAT!","YOU’RE FUCKING CRUSHING IT!","LOOK AT YOU GO!","FUCK YES. KEEP GOING!","YOU’VE GOT THIS!","SO GOOD. KEEP GLOWING!"];

export class PlayMoments {
  constructor({random=Math.random}={}) {
    this.random=random;this.recentPops=[];this.lastPop=-Infinity;
    this.lastWow=-Infinity;this.nextEncouragement=18+random()*7;this.messageIndex=0;
  }
  pop(time,event={}) {
    this.lastPop=time;
    this.recentPops=this.recentPops.filter(t=>time-t<2.5);this.recentPops.push(time);
    const busy=event.bossFinal||event.layeredFinal||this.recentPops.length>=7||(event.chainComplete&&event.goldenChain);
    if(!busy||time-this.lastWow<10)return false;
    this.lastWow=time;return true;
  }
  encourage(time) {
    if(time<this.nextEncouragement||time-this.lastPop>14)return null;
    this.nextEncouragement=time+24+this.random()*12;
    return ENCOURAGEMENT[this.messageIndex++%ENCOURAGEMENT.length];
  }
}
