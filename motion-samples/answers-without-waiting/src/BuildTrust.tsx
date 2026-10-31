import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {colors,getTrustAt,smooth} from './motion';

const {ink,ground,grey,slate}=colors;
const star=Array.from({length:10},(_,i)=>{
  const angle=-Math.PI/2+i*Math.PI/5,r=i%2?4.1:9;
  return `${Math.cos(angle)*r},${Math.sin(angle)*r}`;
}).join(' ');

// One original project illustration appears on the site and its lifted work card.
const WorkArt:React.FC<{x:number;y:number;scale?:number}>=({x,y,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
  <rect width="220" height="142" rx="12" fill={slate} fillOpacity=".28"/>
  <path d="M50 119V75a47 47 0 0 1 94 0v44" stroke={ink} strokeWidth="1.5" opacity=".75"/>
  <path d="M69 119V75a28 28 0 0 1 56 0v44" stroke={ink} strokeWidth="1" opacity=".35"/>
  <circle cx="165" cy="43" r="16" fill={ink} fillOpacity=".65"/>
  <path d="M28 119h164" stroke={ink} strokeWidth="1.2" opacity=".6"/>
</g>;

export const BuildTrust:React.FC=()=>{
  const {frame:f,assembly,panel,project,review}=getTrustAt(useCurrentFrame());
  const header=smooth(34,70,f)*(1-smooth(310,338,f));
  const hero=smooth(50,96,f)*(1-smooth(300,333,f));
  const details=smooth(70,110,f)*(1-smooth(297,329,f));
  return <AbsoluteFill style={{backgroundColor:ground,overflow:'hidden',fontFamily:'DM Sans'}}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
      <g transform={`translate(${panel.x} ${panel.y}) scale(${panel.scale})`} opacity={panel.opacity}>
        <rect x="-280" y="-220" width="560" height="440" rx="30" fill={ground}/>
        <rect x="-280" y="-220" width="560" height="440" rx="30" fill={slate} fillOpacity={assembly*.07}/>
        <rect x="-280" y="-220" width="560" height="440" rx="30" stroke={ink} strokeWidth="1.5" opacity=".65"/>
        <g opacity={header}>
          <path d="M-280-163H280" stroke={ink} strokeWidth="1" opacity=".16"/>
          {[0,1,2].map(i=><circle key={i} cx={-250+i*13} cy="-191" r="3" fill={ink} opacity={.35+i*.2}/>)}
          <text y="-186" textAnchor="middle" fill={grey} fontFamily="DM Sans" fontSize="16" letterSpacing=".5">your website</text>
          <path d="M240-186l8-8m-8 0h8v8" stroke={grey} strokeWidth="1.2" strokeLinecap="round"/>
        </g>
        <g opacity={hero} transform={`translate(0 ${18*(1-hero)})`}>
          <WorkArt x={-254} y={-133}/>
          <text x="-7" y="-96" fill={ink} fontFamily="DM Sans" fontSize="30" letterSpacing="-.6">Your work.</text>
          <text x="-7" y="-59" fill={ink} fontFamily="DM Sans" fontSize="30" letterSpacing="-.6">Your story.</text>
          <path d="M-7-30h218m-218 15h172" stroke={grey} strokeWidth="3" strokeLinecap="round" opacity=".5"/>
          <rect x="-7" y="8" width="130" height="32" rx="16" stroke={ink} strokeWidth="1" opacity=".5"/>
          <path d="M10 24h78m8-4 4 4-4 4" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity=".65"/>
        </g>
        <g opacity={details}>
          <path d="M-253 78H253" stroke={ink} strokeWidth="1" opacity=".13"/>
          {[0,1,2].map(i=><g key={i} transform={`translate(${-253+i*173} 105)`}>
            <rect width="151" height="70" rx="12" stroke={ink} strokeWidth="1" opacity=".2"/>
            <path d="M16 23h83m-83 14h112m-112 12h68" stroke={grey} strokeWidth="2" strokeLinecap="round" opacity=".45"/>
          </g>)}
        </g>
      </g>

      <g transform={`translate(${project.x} ${project.y}) rotate(${project.angle}) scale(${project.scale})`} opacity={project.opacity}>
        <rect x="-132" y="-113" width="264" height="226" rx="23" fill={ground}/>
        <rect x="-132" y="-113" width="264" height="226" rx="23" fill={slate} fillOpacity=".09"/>
        <rect x="-132" y="-113" width="264" height="226" rx="23" stroke={ink} strokeWidth="1.5" opacity=".75"/>
        <WorkArt x={-110} y={-91}/>
        <text x="-110" y="88" fill={ink} fontFamily="DM Sans" fontSize="25" letterSpacing="-.4">Selected work</text>
        <path d="M96 78l8 8m-8 0h8v-8" stroke={ink} strokeWidth="1.2" strokeLinecap="round"/>
      </g>

      <g transform={`translate(${review.x} ${review.y}) rotate(${review.angle}) scale(${review.scale})`} opacity={review.opacity}>
        <rect x="-185" y="-76" width="370" height="152" rx="23" fill={ground}/>
        <rect x="-185" y="-76" width="370" height="152" rx="23" fill={slate} fillOpacity=".1"/>
        <rect x="-185" y="-76" width="370" height="152" rx="23" stroke={ink} strokeWidth="1.5" opacity=".75"/>
        {[0,1,2,3,4].map(i=>{
          const reveal=smooth(156+i*5,171+i*5,f)*(1-smooth(291,312,f));
          return <polygon key={i} points={star} transform={`translate(${-154+i*26} -43)`} fill={ink} fillOpacity={.1+.8*reveal} stroke={ink} strokeWidth=".8"/>;
        })}
        <text x="-157" y="0" fill={ink} fontFamily="DM Sans" fontSize="27" letterSpacing="-.5">Client reviews</text>
        <path d="M-157 28h276m-276 16h207" stroke={grey} strokeWidth="3" strokeLinecap="round" opacity=".55"/>
        <path d="M64 44h37" stroke={slate} strokeWidth="3" strokeLinecap="round"/>
        <path d="M138-44h14v15h-6m-25-15h14v15h-6" stroke={ink} strokeWidth="1.2" opacity=".4"/>
      </g>
    </svg>
    <div style={{position:'absolute',top:883,left:0,right:0,display:'flex',justifyContent:'center',gap:14,color:ink,fontFamily:'Syne',fontWeight:500,fontSize:47,letterSpacing:'-1.4px',lineHeight:1.1}}>
      {['Earn','their','trust.'].map((word,i)=>{
        const enter=smooth(165+i*6,190+i*6,f),leave=smooth(278+i*2,302+i*2,f);
        return <span key={word} style={{opacity:enter*(1-leave),transform:`translateY(${18*(1-enter)-8*leave}px)`,filter:`blur(${2*(1-enter)}px)`}}>{word}</span>;
      })}
    </div>
  </AbsoluteFill>;
};
