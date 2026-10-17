/* Lightweight WebGL surface lighting, with three gently colliding forms.
   The static CSS artwork remains available if WebGL cannot run. */
(() => {
  'use strict';
  const art=document.querySelector('.hero-art');
  if(!art)return;
  const canvas=art.querySelector('canvas');
  const button=document.getElementById('hero-motion-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl){art.dataset.renderer='static';return;}
  const vertex='attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.0,1.0);}';
  const fragment=`
    precision highp float;
    uniform vec2 uResolution,uSize;
    uniform vec4 uForm0,uForm1,uForm2;
    uniform vec3 uColor0,uColor1,uColor2,uBackground;
    uniform float uAngle0,uAngle1,uAngle2;
    vec3 form(vec2 p,vec4 body,float angle,vec3 color,vec3 underneath){
      vec2 q=(p-body.xy)/body.z;
      float c=cos(angle),s=sin(angle);
      q=mat2(c,-s,s,c)*q;
      q.y/=body.w;
      float distance=length(q);
      vec2 shadow=(p-body.xy-vec2(body.z*.08,body.z*.14))/body.z;
      shadow.y/=body.w;
      float shade=(1.0-smoothstep(.76,1.32,length(shadow)))*.25;
      underneath*=1.0-shade;
      if(distance>1.01)return underneath;
      float z=sqrt(max(0.0,1.0-dot(q,q)));
      vec3 normal=normalize(vec3(c*q.x+s*q.y,(-s*q.x+c*q.y)/body.w,z));
      vec3 light=normalize(vec3(-.55,-.75,1.15));
      float diffuse=max(0.0,dot(normal,light));
      float specular=pow(max(0.0,dot(reflect(-light,normal),vec3(0.0,0.0,1.0))),36.0);
      float rim=pow(1.0-z,3.0)*.14;
      vec3 surface=color*(.24+.88*diffuse)+vec3(.97,.98,.90)*(specular*.48+rim);
      return mix(underneath,surface,1.0-smoothstep(.985,1.01,distance));
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/uResolution;
      vec2 p=vec2(uv.x,1.0-uv.y)*uSize;
      vec3 background=uBackground*(.88+.12*uv.y);
      background=form(p,uForm0,uAngle0,uColor0,background);
      background=form(p,uForm1,uAngle1,uColor1,background);
      background=form(p,uForm2,uAngle2,uColor2,background);
      gl_FragColor=vec4(background,1.0);
    }`;
  let program,locations;
  function shader(type,source){
    const value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);
    if(!gl.getShaderParameter(value,gl.COMPILE_STATUS)){gl.deleteShader(value);throw new Error('Hero surface shader unavailable');}
    return value;
  }
  function initialiseRenderer(){
    const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Hero surface renderer unavailable');
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    locations=Object.fromEntries(['uResolution','uSize','uForm0','uForm1','uForm2','uColor0','uColor1','uColor2','uBackground','uAngle0','uAngle1','uAngle2'].map(name=>[name,gl.getUniformLocation(program,name)]));
    art.dataset.renderer='webgl';
  }
  try{initialiseRenderer();}catch(_){art.dataset.renderer='static';return;}
  let width=1,height=1,time=0,raf=0,lastFrame=0,visible=true,userPaused=false,contextLost=false,collisions=0;
  const forms=[
    {x:.22,y:.38,scale:.90,aspect:.94,vx:1,vy:.28,phase:.8},
    {x:.51,y:.62,scale:.75,aspect:.82,vx:-.8,vy:-.35,phase:3.2},
    {x:.80,y:.36,scale:.82,aspect:1,vx:-.65,vy:.55,phase:5.1}
  ];
  let positioned=false;
  function contain(body){
    const min=body.radius+5,maxX=width-min,maxY=height-min;
    if(body.x<min){body.x=min;body.vx=Math.abs(body.vx);}
    else if(body.x>maxX){body.x=maxX;body.vx=-Math.abs(body.vx);}
    if(body.y<min){body.y=min;body.vy=Math.abs(body.vy);}
    else if(body.y>maxY){body.y=maxY;body.vy=-Math.abs(body.vy);}
  }
  function separate(countCollision){
    for(let i=0;i<forms.length;i++)for(let j=i+1;j<forms.length;j++){
      const a=forms[i],b=forms[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001,minimum=a.radius+b.radius+3;
      if(d>=minimum)continue;
      const nx=dx/d,ny=dy/d,overlap=(minimum-d)*.5;
      a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
      const approach=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(approach<0){const impulse=approach*.94;a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny;if(countCollision)collisions++;}
    }
    forms.forEach(contain);
  }
  function resize(){
    const oldWidth=width,oldHeight=height;
    width=Math.max(1,art.clientWidth);height=Math.max(1,art.clientHeight);
    // Cap the raster size: this background does not need full device resolution.
    const ratio=Math.min(devicePixelRatio||1,1.25,1600/width);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    gl.viewport(0,0,canvas.width,canvas.height);
    const radius=Math.min(width*.20,height*.43),speed=Math.min(width,height)*.055;
    forms.forEach(body=>{
      body.x=positioned?body.x/oldWidth*width:body.x*width;
      body.y=positioned?body.y/oldHeight*height:body.y*height;
      if(!positioned){body.vx*=speed;body.vy*=speed;}
      body.radius=radius*body.scale;contain(body);
    });
    positioned=true;for(let pass=0;pass<4;pass++)separate(false);draw();
  }
  function draw(){
    if(contextLost)return;
    const dark=document.documentElement.dataset.theme==='dark';
    const colors=dark?[[.427,.506,.588],[.797,.797,.797],[1,1,.89]]:[[.427,.506,.588],[.290,.290,.290],[1,1,.89]];
    gl.useProgram(program);gl.uniform2f(locations.uResolution,canvas.width,canvas.height);gl.uniform2f(locations.uSize,width,height);
    gl.uniform3fv(locations.uBackground,dark?[.16,.20,.24]:[.85,.88,.85]);
    forms.forEach((body,index)=>{
      gl.uniform4f(locations['uForm'+index],body.x,body.y,body.radius,body.aspect);
      gl.uniform1f(locations['uAngle'+index],Math.sin(time*.09+body.phase)*.34);
      gl.uniform3fv(locations['uColor'+index],colors[index]);
    });
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function step(dt){
    time+=dt;
    const topSpeed=Math.min(width,height)*.09;
    forms.forEach(body=>{
      body.vx+=Math.sin(time*.27+body.phase)*dt*2.2;body.vy+=Math.cos(time*.23+body.phase)*dt*2.2;
      const speed=Math.hypot(body.vx,body.vy);if(speed>topSpeed){body.vx*=topSpeed/speed;body.vy*=topSpeed/speed;}
      body.x+=body.vx*dt;body.y+=body.vy*dt;contain(body);
    });
    separate(true);art.dataset.collisions=String(collisions);
  }
  function frame(now){
    raf=0;
    if(!canRun()){lastFrame=0;update();return;}
    if(!lastFrame)lastFrame=now;
    const elapsed=now-lastFrame;
    if(elapsed>=32){const dt=Math.min(elapsed/1000,.065);step(dt*.5);step(dt*.5);draw();lastFrame=now;}
    raf=requestAnimationFrame(frame);
  }
  function canRun(){return visible&&!document.hidden&&!reduced.matches&&!userPaused&&!contextLost;}
  function update(){
    const paused=reduced.matches||userPaused;
    button.hidden=contextLost;
    button.disabled=reduced.matches;
    button.setAttribute('aria-pressed',String(paused));
    button.title=reduced.matches?'Your device preference keeps this background still':userPaused?'Resume background motion':'Pause background motion';
    button.textContent=reduced.matches?'Reduced motion':userPaused?'Resume motion':'Pause motion';
    art.dataset.motion=contextLost?'static':reduced.matches?'reduced':userPaused?'paused':!visible||document.hidden?'offscreen':'running';
    if(canRun()){if(!raf)raf=requestAnimationFrame(frame);}
    else {if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0;}
  }
  resize();update();
  button.addEventListener('click',()=>{userPaused=!userPaused;update();});
  reduced.addEventListener('change',update);
  document.addEventListener('visibilitychange',update);
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();}).observe(art);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;art.dataset.renderer='static';update();});
  canvas.addEventListener('webglcontextrestored',()=>{try{initialiseRenderer();contextLost=false;resize();update();}catch(_){contextLost=true;update();}});
})();
