import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {colors,getFoundAt,mix,smooth} from './motion';

const {ink,ground,grey,slate}=colors;
const Magnifier:React.FC<{x:number;y:number}>=({x,y})=><g transform={`translate(${x} ${y})`} stroke={ink} strokeWidth="2.5" strokeLinecap="round">
  <circle r="12"/><path d="M9 9l10 10"/>
</g>;

export const GetFound:React.FC=()=>{
  const {frame:f,expand,query,focus,rows,searchWidth}=getFoundAt(useCurrentFrame());
  const searchLeft=540-searchWidth/2;
  const searching=smooth(92,100,f)*(1-smooth(108,122,f));
  return <AbsoluteFill style={{backgroundColor:ground,overflow:'hidden',fontFamily:'DM Sans'}}>
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
      <defs>
        <clipPath id="query-clip"><rect x={searchLeft+85} y="268" width={Math.max(0,searchWidth-164)} height="64"/></clipPath>
      </defs>
      <g opacity={expand}>
        <text x="540" y="209" textAnchor="middle" fontFamily="DM Sans" fontSize="16" fill={grey} letterSpacing="3">LOCAL SEARCH</text>
      </g>

      {/* A single search symbol stretches into the input, then closes again. */}
      <rect x={searchLeft} y="254" width={searchWidth} height="92" rx="46" fill={ground}/>
      <rect x={searchLeft} y="254" width={searchWidth} height="92" rx="46" fill={slate} opacity=".08"/>
      <rect x={searchLeft} y="254" width={searchWidth} height="92" rx="46" stroke={ink} strokeWidth={1.5+searching*.5} opacity={.65+searching*.3}/>
      <Magnifier x={searchLeft+46} y={298+searching*2}/>
      <g clipPath="url(#query-clip)">
        <text x={searchLeft+89} y="313" fill={ink} fontFamily="DM Sans" fontSize="38" letterSpacing="-.6">{query}</text>
      </g>
      <g opacity={smooth(.72,1,expand)} transform={`translate(${540+searchWidth/2-47} 300) scale(${1-searching*.08})`}>
        <circle r="22" fill={ink} fillOpacity=".07"/>
        <path d="M-7 0H8m-6-6 6 6-6 6" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Three results settle in. The useful website grows; the others recede. */}
      {rows.map((row,i)=>{
        const left=-row.width/2;
        return <g key={i} opacity={row.opacity} transform={`translate(${row.x} ${row.y}) rotate(${row.angle})`}>
          <rect x={left} y={-row.height/2} width={row.width} height={row.height} rx="23" fill={ground}/>
          <rect x={left} y={-row.height/2} width={row.width} height={row.height} rx="23" fill={i===0?ink:slate} opacity={i===0?mix(.015,.065,focus):.04}/>
          <rect x={left} y={-row.height/2} width={row.width} height={row.height} rx="23" stroke={ink} strokeWidth={i===0?mix(1.2,1.8,focus):1.2} opacity={i===0?mix(.28,.8,focus):.24}/>
          {i===0?<>
            <g transform={`translate(${left+48} ${mix(0,-40,focus)})`} stroke={ink} strokeWidth="1.4" opacity=".85">
              <circle r="14"/><ellipse rx="6" ry="14"/><path d="M-13-5h26m-26 10h26"/>
            </g>
            <text x={left+83} y={mix(12,-29,focus)} fill={ink} fontFamily="DM Sans" fontSize="34" letterSpacing="-.5">Your business</text>
            <g opacity={focus}>
              <text x={left+83} y="6" fill={grey} fontFamily="DM Sans" fontSize="22">yourwebsite.com</text>
              <path d={`M${left+31} 42h332m-332 16h245`} stroke={grey} strokeWidth="3" strokeLinecap="round" opacity=".55"/>
              <path d={`M${left+376} 42h64m-152 16h52`} stroke={slate} strokeWidth="3" strokeLinecap="round"/>
            </g>
            <g transform={`translate(${row.width/2-42} ${mix(0,-37,focus)})`}>
              <circle r="17" stroke={ink} strokeWidth="1.2" opacity={focus*.6}/>
              <path d="M-6 0H7m-5-5 5 5-5 5" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </>:<>
            <circle cx={left+48} cy="0" r="13" stroke={grey} strokeWidth="1.2" opacity=".6"/>
            <path d={`M${left+83} -7h${i===1?210:260}m-${i===1?210:260} 20h${i===1?330:290}`} stroke={grey} strokeWidth="3" strokeLinecap="round" opacity=".5"/>
          </>}
        </g>;
      })}
    </svg>
    <div style={{position:'absolute',top:866,left:0,right:0,display:'flex',justifyContent:'center',gap:14,color:ink,fontFamily:'Syne',fontWeight:500,fontSize:47,letterSpacing:'-1.4px',lineHeight:1.1}}>
      {['Be','found.'].map((word,i)=>{
        const enter=smooth(153+i*6,181+i*6,f),leave=smooth(279+i*2,305+i*2,f);
        return <span key={word} style={{opacity:enter*(1-leave),transform:`translateY(${18*(1-enter)-8*leave}px)`,filter:`blur(${2*(1-enter)}px)`}}>{word}</span>;
      })}
    </div>
  </AbsoluteFill>;
};
