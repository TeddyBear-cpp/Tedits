import {spring} from 'remotion';

export const FPS = 60;
export const FRAMES = 240;
export const SIZE = 1080;
export const colors = {ink:'#FFFFE3', ground:'#4A4A4A', grey:'#CBCBCB', slate:'#6D8196'};
export const mix = (a:number,b:number,t:number) => a+(b-a)*t;
export const clamp = (v:number) => Math.min(1,Math.max(0,v));
export const smooth = (a:number,b:number,v:number) => {
  const t=clamp((v-a)/(b-a));
  return t*t*t*(t*(t*6-15)+10);
};
export const cycle = (f:number) => ((f%FRAMES)+FRAMES)%FRAMES;
const cubic = (p0:number,p1:number,p2:number,p3:number,t:number) =>
  (1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3;
const starts = [
  {label:'Services',x:258,y:340,angle:-13,c1:[350,160],c2:[650,285]},
  {label:'Prices',x:802,y:451,angle:12,c1:[1030,590],c2:[720,690]},
  {label:'FAQs',x:350,y:720,angle:-9,c1:[130,570],c2:[320,560]},
];

export const sceneAt = (frame:number) => {
  const f=cycle(frame), p=f/FRAMES;
  const panel=smooth(38,91,f)*(1-smooth(179,230,f));
  const rows=starts.map((start,i)=>{
    const enter=spring({frame:f-26-i*8,fps:FPS,config:{mass:.85,damping:15,stiffness:155},durationInFrames:69});
    const exit=smooth(164+i*4,215+i*4,f);
    const gather=enter*(1-exit);
    const breath=Math.sin(p*2*Math.PI+i*1.6);
    const startX=start.x+breath*8;
    const startY=start.y+Math.sin(p*2*Math.PI+i*.8)*9;
    const targetY=398+i*120;
    return {
      label:start.label, gather,
      x:cubic(startX,start.c1[0],start.c2[0],540,gather),
      y:cubic(startY,start.c1[1],start.c2[1],targetY,gather),
      angle:mix(start.angle,0,gather),
      width:mix(232,540,gather),
      height:mix(68,88,gather),
      targetY,startX,startY,
      answer:smooth(.48,.96,gather),
    };
  });
  return {frame:f,p,panel,rows};
};

// Second film: a search becomes a set of results, then one useful website.
export const FOUND_FRAMES=360;
export const getFoundAt = (frame:number) => {
  const f=((frame%FOUND_FRAMES)+FOUND_FRAMES)%FOUND_FRAMES;
  const expand=smooth(8,48,f)*(1-smooth(327,353,f));
  const query='florist near me';
  const typed=Math.floor(query.length*smooth(44,92,f)*(1-smooth(306,331,f)));
  const focus=smooth(139,180,f)*(1-smooth(278,305,f));
  const rows=[0,1,2].map(i=>{
    const enter=spring({frame:f-94-i*8,fps:FPS,config:{mass:.85,damping:17,stiffness:150},durationInFrames:49});
    const leave=smooth(294+i*3,333+i*3,f);
    const opacity=smooth(94+i*8,114+i*8,f)*(1-leave)*(i===0?1:mix(1,.32,focus));
    return {
      x:540+(i%2===0?-1:1)*108*(1-enter)+30*leave,
      y:450+i*120+56*(1-enter)+focus*[45,73,65][i],
      width:i===0?mix(620,700,focus):620,
      height:i===0?mix(88,182,focus):88,
      angle:(i%2===0?-5:5)*(1-enter),
      opacity,enter,leave,
    };
  });
  return {frame:f,expand,typed,query:query.slice(0,typed),focus,rows,searchWidth:mix(92,700,expand)};
};

// Third film: a clear website gains proof through work and client feedback.
export const TRUST_FRAMES=360;
export const getTrustAt=(frame:number)=>{
  const f=((frame%TRUST_FRAMES)+TRUST_FRAMES)%TRUST_FRAMES;
  const assembly=smooth(20,92,f)*(1-smooth(309,348,f));
  const projectIn=spring({frame:f-104,fps:FPS,config:{mass:.85,damping:16,stiffness:155},durationInFrames:64});
  const project=projectIn*(1-smooth(285,325,f));
  const reviewIn=spring({frame:f-130,fps:FPS,config:{mass:.85,damping:17,stiffness:155},durationInFrames:60});
  const review=reviewIn*(1-smooth(279,319,f));
  return {
    frame:f,assembly,
    panel:{x:540,y:500+14*(1-assembly),scale:mix(.92,1,assembly),opacity:mix(.28,1,assembly)},
    project:{
      x:cubic(400,330,170,248,project),y:cubic(480,390,410,468,project),
      angle:mix(3,-8,project),scale:mix(.83,1,project),width:264,height:226,
      opacity:smooth(104,122,f)*(1-smooth(306,330,f)),
    },
    review:{
      x:cubic(600,870,860,738,review),y:cubic(620,598,690,728,review),
      angle:mix(0,6,review),scale:mix(.9,1,review),width:370,height:152,
      opacity:smooth(130,148,f)*(1-smooth(298,324,f)),
    },
  };
};
