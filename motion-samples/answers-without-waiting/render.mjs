import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';

const root=path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const found=process.argv.includes('--get-found');
const trust=process.argv.includes('--build-trust');
const id=trust?'BuildTrustLoop':found?'GetFoundLoop':'AnswersLoop';
const qa=trust?'qa/build-trust':found?'qa/get-found':'qa';
const output=trust?'out/build-trust-loop.mp4':found?'out/get-found-loop.mp4':'out/answers-loop.mp4';
await fs.mkdir('out',{recursive:true});
await fs.mkdir(qa,{recursive:true});
const chrome=process.env.TEDITS_RENDER_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),publicDir:path.resolve('public'),outDir:path.resolve('build')});
const browser=await openBrowser('chrome',{browserExecutable:chrome,chromeMode:'chrome-for-testing'});
try {
  const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});
  const last=composition.durationInFrames;
  const posterFrame=trust||found?230:148;
  const inspect=process.argv.includes('--stills')||process.argv.includes('--all-frames');
  const frames=inspect?(trust?[0,50,100,140,180,230,295,339,359,360]:found?[0,55,100,140,175,230,295,339,359,360]:[0,34,74,112,148,190,225,239,240]):[0,posterFrame,last-1,last];
  for(const frame of frames){
    await renderStill({serveUrl,composition:{...composition,durationInFrames:last+1},frame,output:path.resolve(`${qa}/frame-${String(frame).padStart(3,'0')}.png`),imageFormat:'png',puppeteerInstance:browser});
    console.log(`Still ${frame}/${last}`);
  }
  await fs.copyFile(`${qa}/frame-${posterFrame}.png`,trust?'out/build-trust-poster.png':found?'out/get-found-poster.png':'out/poster.png');
  if(!process.argv.includes('--stills')){
    let logged=-1;
    await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.resolve(output),crf:18,pixelFormat:'yuv420p',muted:true,concurrency:2,puppeteerInstance:browser,onProgress:({progress})=>{
      const step=Math.floor(progress*10);if(step!==logged){logged=step;console.log(`Rendering ${step*10}%`);}
    }});
    console.log(`Rendered ${output} — 1080×1080, 60fps, ${last/composition.fps}s, silent`);
  }
} finally {await browser.close({silent:true});}
