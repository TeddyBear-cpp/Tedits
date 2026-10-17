const fs=require('fs');
const filename='projects/afterhours/index.html';
let html=fs.readFileSync('afterhours-source/dist/index.html','utf8');
html=html.replace(/<button class="tweaks-toggle"[\s\S]*?<\/aside>/,'');
html=html.replace(/\.tweaks-toggle\{[^}]*\}/g,'').replace(/\.tweaks-panel[^{}]*\{[^}]*\}/g,'');
html=html.replace(/body\[data-layout=(?:sleeve|listening)\][^{}]*\{[^}]*\}/g,'');
html=html.replace('or the Tweaks control','itself');
html=html.replace('Activate to toggle continuous rotation. Reduced motion preferences set the default; you can explicitly enable motion using the record itself.','Activate to toggle continuous rotation. Press Escape to pause. Reduced motion preferences set the default; you can explicitly enable motion using the record.');
html=html.replace(",motionInput=document.getElementById('motion')",'');
html=html.replaceAll('motionInput.checked=enabled;','');
html=html.replace('motionInput.checked=true;','');
html=html.replace('playing=!playing','playing=!playing;hover=false');
html=html.replace(/motionInput\.addEventListener\('change',[^\n]*\n/,'');
html=html.replace(/const tweaks=document\.getElementById\('tweaks'\)[^\n]*/,"document.addEventListener('keydown',e=>{if(e.key==='Escape'){playing=false;hover=false;update()}});update();");
html=html.replace('<body data-layout="studio">','<body data-layout="studio"><div class="concept-banner"><span>FICTIONAL STUDIO · MUSIC BY TEDDYBEAR</span><a href="../../index.html#work">Tedits Studio portfolio ↗</a></div>');
html=html.replace('<span>®</span>','');
html=html.replace('<title>AFTERHOURS — Sound for the small hours</title>','<title>AFTERHOURS — Fictional studio concept | Tedits Studio</title><meta name="robots" content="noindex">');
html=html.replace('DESIGN STUDY / V0','FICTIONAL STUDIO CONCEPT');
html=html.replace(/<section id="beats">[\s\S]*?<\/section>/,fs.readFileSync('afterhours-tracks.html','utf8').trim());
html=html.replace('<small>ORIGINAL SOUNDS</small>','<small>TEDDYBEAR</small>');
html=html.replace('THE SMALL HOURS COLLECTION<br>STEREO · DESIGN EDITION','TWO INSTRUMENTALS<br>LOCAL LISTENING EDITION');
html=html.replace('</head>','<link rel="stylesheet" href="afterhours-audio.css">\n</head>');
html=html.replace('</body>','<script src="afterhours-audio.js"></script>\n</body>');
html=html.replace('License comparison · content pending','Illustrative licence structure');
html=html.replace('[File formats, usage limits, and release permissions]','A place to explain file formats, permitted uses, and release limits.');
html=html.replace('[Stems, expanded rights, and distribution details]','A place to explain stems, broader uses, and distribution terms.');
html=html.replace('[Availability, ownership terms, and custom quote]','A place to discuss availability, individual terms, and a custom arrangement.');
html=html.replaceAll('Price and final terms pending','Concept only · no licence or price offered');
html=html.replace('Inquiry form in the next build.','Concept only · no production service or booking offered.');
html=html.replace('Fictional studio · First visual draft','Fictional studio · Independent concept by Tedits Studio');
// Preserve the Studio split on roomy screens; the old grouped rule reduced
// both the entire hero and its headline to body size without changing the grid.
html=html.replace('.hero,h1,.summary{font-size:16px;max-width:340px}',
  '.hero{grid-template-columns:minmax(0,1fr);min-height:0;gap:48px;padding-block:48px 56px}.intro{min-width:0}h1{font-size:clamp(64px,19vw,116px);max-width:none}.summary{font-size:17px;max-width:345px}');
html=html.replace('.record-area{min-height:350px;padding-bottom:28px}',
  '.record-area{width:100%;max-width:440px;min-height:0;margin-inline:auto;padding-bottom:32px}');
// Container-relative typography keeps the cue and record label proportional
// to the vinyl rather than to the viewport. The cue stays inside the stage.
html=html.replace('.record-stage{width:100%;max-width:555px;',
  '.record-stage{container-type:inline-size;width:100%;max-width:555px;');
// Clip the rotating square box to the disc's circular frame, preventing
// horizontal overflow at intermediate rotation angles on narrow screens.
html=html.replace('.record-button{width:94%;','.record-button{overflow:hidden;width:94%;');
html=html.replace('.orbit-note{position:absolute;top:1%;right:0;color:var(--accent);font-size:11px;',
  '.orbit-note{position:absolute;top:-12px;right:0;z-index:1;color:var(--accent);font-size:clamp(9px,2.4cqi,11px);');
html=html.replace(/\.cue\{[^}]*\}/,
  '.cue{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;gap:clamp(6px,1.8cqi,10px);width:max-content;max-width:86%;font-size:clamp(11px,2.7cqi,12px);line-height:1.35;text-align:center;background:var(--ink);padding:clamp(7px,2cqi,10px) clamp(9px,2.8cqi,14px);border:1px solid var(--line);pointer-events:none}');
html=html.replace('.cue i{width:7px;height:7px;',
  '.cue i{flex-shrink:0;width:clamp(5px,1.4cqi,7px);height:clamp(5px,1.4cqi,7px);');
html=html.replace('.label small{font-size:9px}.label strong{font-size:27px}.label .bottom-label{font-size:7px}',
  '.label small{font-size:clamp(6px,2.1cqi,9px)}.label strong{font-size:clamp(14px,5.2cqi,27px)}.label .bottom-label{font-size:clamp(5px,1.7cqi,7px)}');
html=html.replace('</style>',`.concept-banner{display:flex;justify-content:space-between;gap:20px;padding:12px 5.5vw;background:var(--paper);color:var(--ink);font-size:9px;letter-spacing:.07em}.concept-banner a{text-decoration:underline;text-underline-offset:3px}footer{padding-bottom:28px}@media(max-width:600px){.concept-banner{flex-direction:column;gap:6px;font-size:8px}}\n</style>`);
fs.writeFileSync(filename,html);
console.log('AFTERHOURS local copy prepared; original hosted source preserved.');
