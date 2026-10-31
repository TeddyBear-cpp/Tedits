import React from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {colors,cycle,mix,sceneAt,smooth} from './motion';

loadFont({family:'DM Sans',url:staticFile('fonts/DM-Sans-Regular.ttf'),weight:'400'});
loadFont({family:'DM Sans',url:staticFile('fonts/DM-Sans-Semibold.ttf'),weight:'600'});
loadFont({family:'Syne',url:staticFile('fonts/Syne-Medium.ttf'),weight:'500'});

const {ink,ground,grey,slate}=colors;

export const Answers:React.FC=()=>{
  const frame=useCurrentFrame();
  const {frame:f,panel,rows}=sceneAt(frame);
  const boxReveal=smooth(42,99,f)*(1-smooth(174,230,f));
  const resolved=smooth(87,120,f)*(1-smooth(164,195,f));
  return <AbsoluteFill style={{backgroundColor:ground,overflow:'hidden',fontFamily:'DM Sans'}}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" style={{position:'absolute',inset:0}}>
      {/* The browser perimeter is drawn into existence rather than faded as a card. */}
      <g opacity={panel}>
        <rect x="220" y="250" width="640" height="520" rx="32" fill={ground}/>
        <rect x="221" y="251" width="638" height="518" rx="31" fill={slate} opacity=".08"/>
      </g>
      <rect x="220" y="250" width="640" height="520" rx="32" pathLength="1"
        stroke={ink} strokeWidth="1.5" strokeDasharray="1" strokeDashoffset={1-boxReveal}
        opacity={boxReveal*.65} transform="rotate(0 540 510)"/>
      <g opacity={boxReveal}>
        <path d="M220 311H860" stroke={ink} strokeWidth="1" opacity=".16"/>
        {[0,1,2].map(i=><circle key={i} cx={250+i*13} cy="281" r="3" fill={ink} opacity={.35+i*.2}/>)}
        <text x="540" y="287" fill={grey} textAnchor="middle" fontFamily="DM Sans" fontSize="16" letterSpacing=".5">your website</text>
        <path d="M818 286l8-8m-8 0h8v8" stroke={grey} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {rows.map((row,i)=>{
        const left=-row.width/2, top=-row.height/2;
        const contentOpacity=row.answer;
        const outlineAlpha=mix(.5,.2,Math.min(1,row.gather));
        return <g key={row.label} transform={`translate(${row.x} ${row.y}) rotate(${row.angle})`}>
          <rect x={left} y={top} width={row.width} height={row.height} rx={mix(34,17,row.gather)} fill={ground}/>
          <rect x={left} y={top} width={row.width} height={row.height} rx={mix(34,17,row.gather)} fill={slate} opacity={.1*contentOpacity}/>
          <rect x={left} y={top} width={row.width} height={row.height} rx={mix(34,17,row.gather)} stroke={ink} strokeWidth="1.25" opacity={outlineAlpha}/>
          <circle cx={left+31} cy={mix(0,-9,row.gather)} r="4" fill={ink}/>
          <text x={left+50} y={mix(10,-2,row.gather)} fill={ink} fontFamily="DM Sans" fontSize="32" letterSpacing="-.5">{row.label}</text>
          <g opacity={contentOpacity}>
            <path d={`M${left+50} 20h${[204,158,228][i]}`} stroke={grey} strokeWidth="3" strokeLinecap="round" opacity=".55"/>
            <path d={`M${left+64+[204,158,228][i]} 20h${[48,68,34][i]}`} stroke={slate} strokeWidth="3" strokeLinecap="round"/>
            <path d={`M${row.width/2-38} -4l7 7-7 7`} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".75"/>
          </g>
        </g>;
      })}

      {/* Tiny travelling indicators make the organised state feel active. */}
      {rows.map((row,i)=>{
        const beat=smooth(104+i*11,114+i*11,f)*(1-smooth(125+i*11,137+i*11,f));
        return <g key={i} opacity={resolved*beat}>
          <circle cx="796" cy={row.targetY} r="13" stroke={ink} strokeWidth="1"/>
          <circle cx="796" cy={row.targetY} r="4" fill={ink}/>
        </g>;
      })}
    </svg>
    <div style={{position:'absolute',top:856,left:0,right:0,display:'flex',justifyContent:'center',gap:13,color:ink,fontFamily:'Syne',fontWeight:500,fontSize:47,letterSpacing:'-1.4px',lineHeight:1.1}}>
      {['All','in','one','place.'].map((word,i)=>{
        const enter=smooth(88+i*5,108+i*5,cycle(frame));
        const leave=smooth(171+i*2,189+i*2,cycle(frame));
        const alpha=enter*(1-leave);
        return <span key={word} style={{display:'inline-block',opacity:alpha,transform:`translateY(${18*(1-enter)-8*leave}px)`,filter:`blur(${(1-enter)*2}px)`}}>{word}</span>;
      })}
    </div>
  </AbsoluteFill>;
};
