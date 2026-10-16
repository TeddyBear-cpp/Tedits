// Local-only preview server with byte ranges for responsive video scrubbing.
const http = require('http');
const fs = require('fs');
const path = require('path');
function createPreviewServer() {
  return http.createServer((req,res)=>{
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
    catch { res.writeHead(400);res.end();return; }
    if (pathname.split('/').some(segment=>segment.startsWith('.')||segment==='backups')) {res.writeHead(404);res.end();return;}
    const file=path.resolve(__dirname,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(__dirname+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    const size=fs.statSync(file).size;
    const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.mp4':'video/mp4'};
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start=0,end=size-1;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
      start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
      end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
      if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
      headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    }
    headers['Content-Length']=end-start+1;
    res.writeHead(req.headers.range?206:200,headers);
    if(req.method==='HEAD'){res.end();return;}
    const stream=fs.createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());
    res.on('close',()=>stream.destroy());
    stream.pipe(res);
  });
}
module.exports={createPreviewServer};
if(require.main===module)createPreviewServer().listen(8084,'127.0.0.1',()=>console.log('Preview ready: http://127.0.0.1:8084/video-preview.html'));
