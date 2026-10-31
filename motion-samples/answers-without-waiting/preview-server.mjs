import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.ttf':'font/ttf','.json':'application/json'};
http.createServer((request,response)=>{
  let file;
  try{file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname.replace(/^\/$/,'/preview.html')));}catch{response.writeHead(400).end();return;}
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404).end('Not found');return;}
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'};
    const range=request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start=0,end=stat.size-1;
    if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end){response.writeHead(416).end();return;}headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;}
    headers['Content-Length']=String(end-start+1);
    response.writeHead(range?206:200,headers);
    if(request.method==='HEAD'){response.end();return;}
    fs.createReadStream(file,{start,end}).pipe(response);
  });
}).listen(8091,'127.0.0.1',()=>console.log('Motion sample: http://127.0.0.1:8091/'));
