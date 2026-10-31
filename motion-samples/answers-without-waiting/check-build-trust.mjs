import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {getTrustAt,TRUST_FRAMES as FRAMES} from './src/motion.ts';

assert.deepEqual(getTrustAt(0),getTrustAt(FRAMES));
let minimumMargin=Infinity;
for(let f=0;f<FRAMES;f+=.25){
  const state=getTrustAt(f);
  for(const card of [state.project,state.review]){
    assert.ok(Object.values(card).every(Number.isFinite));
    assert.ok(card.opacity>=0&&card.opacity<=1);
    if(card.opacity<.01)continue;
    const a=card.angle*Math.PI/180;
    const dx=(Math.abs(Math.cos(a))*card.width/2+Math.abs(Math.sin(a))*card.height/2)*card.scale;
    const dy=(Math.abs(Math.sin(a))*card.width/2+Math.abs(Math.cos(a))*card.height/2)*card.scale;
    const margin=Math.min(card.x-dx,1080-card.x-dx,card.y-dy,1080-card.y-dy);
    assert.ok(margin>0,`Proof card clipped at ${f}`);
    minimumMargin=Math.min(minimumMargin,margin);
  }
}
const report={frames:FRAMES,identicalEndpointPose:true,visibleProofCardsStayInFrame:true,minimumMargin};
await fs.mkdir('qa/build-trust',{recursive:true});
await fs.writeFile('qa/build-trust/loop-check.json',JSON.stringify(report,null,2));
console.log(report);
