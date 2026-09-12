export const COMBO_WINDOW=2.4;
export const POINT_SCALE=1000;
const PRAISE=['NICE!','WOW!','SO GOOD!','POP OFF!','YESSS!','JUICY!','OOH, NICE!'];
const BIG_PRAISE=['WOW!','MEGA POP!','SO JUICY!','OH, YES!'];
const SPICY_PRAISE=['FUCK YES!','HOLY SHIT!','PISS!','TURDS!'];
export class PopRewards {
  constructor(best=0,{random=Math.random}={}) {
    this.score=0;this.best=Number.isSafeInteger(best)&&best>=0?best:0;this.pops=0;this.combo=0;this.lastPop=-Infinity;this.lastPraise=-1;this.random=random;
    this.lastSpicy=-Infinity;this.spicyIndex=0;
  }
  pop(radius,time,event={}) {
    this.combo=time-this.lastPop<=COMBO_WINDOW?Math.min(8,this.combo+1):1;
    this.lastPop=time;this.pops++;
    const base=Math.max(50,Math.round(radius*2/10)*10),party=this.pops%10===0;
    const chainBonus=event.chainComplete?(event.goldenChain?1500:300):0;
    const goldenBonus=event.type==='split'&&event.golden?500:0;
    const specialBonus=event.bossFinal?10000:event.layeredFinal?2000:event.type==='layer'?250:0;
    const points=(base*this.combo+(party?1000:0)+chainBonus+goldenBonus+specialBonus)*POINT_SCALE;
    this.score+=points;const record=this.score>this.best && this.best>0;this.best=Math.max(this.best,this.score);
    let choice=Math.floor(this.random()*PRAISE.length);
    if(choice===this.lastPraise)choice=(choice+1)%PRAISE.length;
    this.lastPraise=choice;
    const spicy=time>=8&&time-this.lastSpicy>=18&&!event.cascade&&!event.special&&!event.bossFinal&&!event.layeredFinal&&!event.chainComplete&&this.random()<.055;
    if(spicy)this.lastSpicy=time;
    const label=spicy?SPICY_PRAISE[this.spicyIndex++%SPICY_PRAISE.length]:event.bossFinal?'MEGA CASCADE!':event.layeredFinal?'LAYER HEAVEN!':event.type==='layer'?(event.layers===1?'ONE MORE!':'SQUISH!'):event.chainComplete?(event.goldenChain?'GOLD RUSH!':'PERFECT!'):goldenBonus?'GOLDEN!':party?'POP PARTY!':this.combo>=8?'UNREAL!':radius>=105?BIG_PRAISE[this.pops%BIG_PRAISE.length]:PRAISE[choice];
    return {points,party,label,combo:this.combo,score:this.score,pops:this.pops,record};
  }
  expire(time) {if(time-this.lastPop>COMBO_WINDOW)this.combo=0;return this.combo;}
}
