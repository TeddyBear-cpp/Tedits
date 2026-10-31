import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {getFoundAt,FOUND_FRAMES as FRAMES} from './src/motion.ts';

assert.deepEqual(getFoundAt(0),getFoundAt(FRAMES));
let minimumMargin=Infinity;
for(let f=0;f<FRAMES;f+=.25){
  const state=getFoundAt(f);
  for(const row of state.rows){
    assert.ok(Object.values(row).every(Number.isFinite));
    assert.ok(row.opacity>=0&&row.opacity<=1);
    if(row.opacity<.01)continue;
    const a=row.angle*Math.PI/180;
    const dx=Math.abs(Math.cos(a))*row.width/2+Math.abs(Math.sin(a))*row.height/2;
    const dy=Math.abs(Math.sin(a))*row.width/2+Math.abs(Math.cos(a))*row.height/2;
    const margin=Math.min(row.x-dx,1080-row.x-dx,row.y-dy,1080-row.y-dy);
    assert.ok(margin>0,`Result clipped at ${f}`);
    minimumMargin=Math.min(minimumMargin,margin);
  }
  if(f>=180&&f<=278){
    assert.ok(state.rows[1].y-state.rows[1].height/2>state.rows[0].y+state.rows[0].height/2,'Featured result overlaps another result.');
  }
}
const report={frames:FRAMES,identicalEndpointPose:true,visibleResultsStayInFrame:true,featuredResultDoesNotOverlap:true,minimumMargin};
await fs.mkdir('qa/get-found',{recursive:true});
await fs.writeFile('qa/get-found/loop-check.json',JSON.stringify(report,null,2));
console.log(report);
