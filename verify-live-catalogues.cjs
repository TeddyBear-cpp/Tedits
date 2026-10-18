const assert = require('node:assert/strict');
const {renderMaterials,renderTracks} = require('./catalogue-renderer.cjs');
const fs = require('node:fs');
async function get(url) {
  const response = await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw Error(`HTTP ${response.status}: ${url}`);
  return response;
}
(async()=>{
 const endpoint=new URL('https://yjcpyptx.api.sanity.io/v2026-10-01/data/query/production');
 endpoint.searchParams.set('perspective','published');
 endpoint.searchParams.set('query','*[_id in ["menuCatalogue","materialCatalogue","trackCatalogue"]]{...,"mealDays":mealDays[]{...,"imageUrl":image.asset->url},items[]{...,"imageUrl":image.asset->url,"audioUrl":audio.asset->url,dishes[]{...}}}');
 const {result}=await (await get(endpoint)).json();
 const base='https://teddybear-cpp.github.io/Tedits/studio/projects/';
 for(const doc of result) {
  const folder={menuCatalogue:'catering',materialCatalogue:'rivet-beam',trackCatalogue:'afterhours'}[doc._type];
  const live=await (await get(base+folder+'/index.html')).text();
  if(doc._type==='menuCatalogue') {
   const match=live.match(/<script id="cms-menus" type="application\/json">([\s\S]*?)<\/script>/);
   assert.ok(match,'CMS menus missing from live HTML');
   const config=JSON.parse(match[1]);
   const menus=Object.values(config.menus);
   assert.deepEqual(menus.map(m=>m.title),doc.items.map(i=>i.heading));
   assert.deepEqual(menus.map(m=>m.dishes.map(d=>d[0])),doc.items.map(i=>i.dishes.map(d=>d.title)));
   if(doc.mealDays?.length)assert.deepEqual(config.mealDays.map(day=>day.day),doc.mealDays.map(day=>day.day));
  } else {
   const source=fs.readFileSync(`studio/projects/${folder}/index.html`,'utf8');
   const pattern=doc._type==='materialCatalogue'?/<div class="product-grid">[\s\S]*?<\/div>(?=<div class="custom-enquiry-callout")/:/<div class="tracks">[\s\S]*?<\/div>\s*(?=<p class="notice")/;
   const expected=(doc._type==='materialCatalogue'?renderMaterials:renderTracks)(source,doc).match(pattern)[0];
   assert.equal(live.match(pattern)?.[0].replace(/\r/g,''),expected.replace(/\r/g,''),`${folder} does not match published CMS content`);
  }
  console.log(`${folder}: live catalogue matches published Sanity content (${doc.items.length} items)`);
 }
 assert.equal(result.length,3);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
