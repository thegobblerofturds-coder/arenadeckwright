export const COMBO_WINDOW=2.4;
const PRAISE=['NICE!','WOW!','SO GOOD!','POP OFF!','YESSS!','JUICY!','OOH, NICE!'];
const BIG_PRAISE=['WOW!','MEGA POP!','SO JUICY!','OH, YES!'];
export class PopRewards {
  constructor(best=0,{random=Math.random}={}) {
    this.score=0;this.best=Number.isSafeInteger(best)&&best>=0?best:0;this.pops=0;this.combo=0;this.lastPop=-Infinity;this.lastPraise=-1;this.random=random;
  }
  pop(radius,time) {
    this.combo=time-this.lastPop<=COMBO_WINDOW?Math.min(8,this.combo+1):1;
    this.lastPop=time;this.pops++;
    const base=Math.max(50,Math.round(radius*2/10)*10),party=this.pops%10===0;
    const points=base*this.combo+(party?1000:0);
    this.score+=points;const record=this.score>this.best && this.best>0;this.best=Math.max(this.best,this.score);
    let choice=Math.floor(this.random()*PRAISE.length);
    if(choice===this.lastPraise)choice=(choice+1)%PRAISE.length;
    this.lastPraise=choice;
    const label=party?'POP PARTY!':this.combo>=8?'UNREAL!':radius>=105?BIG_PRAISE[this.pops%BIG_PRAISE.length]:PRAISE[choice];
    return {points,party,label,combo:this.combo,score:this.score,pops:this.pops,record};
  }
  expire(time) {if(time-this.lastPop>COMBO_WINDOW)this.combo=0;return this.combo;}
}
