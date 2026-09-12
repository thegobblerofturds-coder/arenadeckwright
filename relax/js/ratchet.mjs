// Two dry tooth contacts and short metal resonances make a mechanical click, not a beep.
export function makeRatchetSamples(sampleRate,random=Math.random) {
  const samples=new Float32Array(Math.ceil(sampleRate*.043));let previousNoise=0;
  for(let i=0;i<samples.length;i++) {
    const t=i/sampleRate,noise=random()*2-1,bright=noise-previousNoise*.72;previousNoise=noise;
    let value=0;
    for(const [start,weight]of [[0,1],[.007,.48]]) {
      const age=t-start;if(age<0)continue;
      const attack=Math.min(1,age/.0005);
      value+=weight*attack*(bright*.42*Math.exp(-age*370)+
        Math.sin(age*Math.PI*2*1870)*.25*Math.exp(-age*180)+
        Math.sin(age*Math.PI*2*3290)*.16*Math.exp(-age*250)+
        Math.sin(age*Math.PI*2*5170)*.08*Math.exp(-age*320));
    }
    samples[i]=Math.max(-.95,Math.min(.95,value))*Math.min(1,(samples.length-1-i)/(sampleRate*.002));
  }
  return samples;
}
export const ratchetInterval=remaining=>.115-.077*Math.max(0,Math.min(1,Math.log10(Math.max(0,remaining)+1)/7));
