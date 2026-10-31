import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {sceneAt,FRAMES} from './src/motion.ts';

const first=sceneAt(0),closing=sceneAt(FRAMES);
assert.deepEqual(closing,first,'The loop endpoint must reproduce the starting pose.');
let narrowestMargin=Infinity;
for(let frame=0;frame<FRAMES;frame+=.25){
  const state=sceneAt(frame);
  for(const row of state.rows){
    assert.ok([row.x,row.y,row.width,row.height,row.angle].every(Number.isFinite));
    const a=row.angle*Math.PI/180;
    const dx=Math.abs(Math.cos(a))*row.width/2+Math.abs(Math.sin(a))*row.height/2;
    const dy=Math.abs(Math.sin(a))*row.width/2+Math.abs(Math.cos(a))*row.height/2;
    const margin=Math.min(row.x-dx,1080-row.x-dx,row.y-dy,1080-row.y-dy);
    assert.ok(margin>=0,`Fragment clipped at frame ${frame}`);
    narrowestMargin=Math.min(narrowestMargin,margin);
  }
}
const report={frames:FRAMES,identicalEndpointPose:true,fragmentsStayInFrame:true,narrowestMargin:Number(narrowestMargin.toFixed(3))};
await fs.mkdir('qa',{recursive:true});
await fs.writeFile('qa/loop-check.json',JSON.stringify(report,null,2));
console.log(report);
