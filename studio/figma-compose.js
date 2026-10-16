// Inputs STATE, MODEL and SVG are supplied from the verified local source.
const page=await figma.getNodeByIdAsync('0:1');await figma.setCurrentPageAsync(page);
await Promise.all([{family:'DM Sans',style:'Regular'},{family:'DM Sans',style:'SemiBold'},{family:'Syne',style:'Medium'}].map(f=>figma.loadFontAsync(f)));
const createdNodeIds=[],mutatedNodeIds=['7:2','7:3'];
const variables=Object.fromEntries(await Promise.all(Object.entries(STATE.colors).map(async([key,id])=>[key,await figma.variables.getVariableByIdAsync(id)])));
const components=Object.fromEntries(await Promise.all([...STATE.components.links,...STATE.components.previews,...STATE.components.swatches,{id:STATE.components.tag,name:'Tag'}].map(async spec=>[spec.name,await figma.getNodeByIdAsync(spec.id)])));
const hexes={charcoal:'#4A4A4A',gray:'#CBCBCB',ivory:'#FFFFE3',slate:'#6D8196'};
const rgb=hex=>({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255});
const paint=(key,opacity=1)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(hexes[key]),opacity},'color',variables[key]);
const track=node=>{createdNodeIds.push(node.id);return node;};
function frame(parent,name,width,direction='VERTICAL',gap=0,color=null){
  const f=track(figma.createAutoLayout(direction));f.name=name;f.resize(width,10);f.fills=color?[paint(color)]:[];f.itemSpacing=gap;
  f.primaryAxisSizingMode=direction==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=direction==='VERTICAL'?'FIXED':'AUTO';f.clipsContent=false;parent.appendChild(f);return f;
}
function text(parent,value,width,size=14,color='charcoal',display=false,weight='Regular'){
  const t=track(figma.createText());t.name=value.slice(0,60);t.fontName={family:display?'Syne':'DM Sans',style:display?'Medium':weight};t.characters=value;
  t.textStyleId=STATE.styles[display?(size>=70?'Hero':size>=40?'Heading':'Project title'):size<=9?'Label':size<=12?'Small':'Body'];
  t.fontSize=size;t.lineHeight={unit:'PERCENT',value:display?112:170};t.letterSpacing={unit:'PIXELS',value:display?(size>70?-4:size>40?-2:-1):size<=9?1:0};t.fills=[paint(color)];t.resize(width,10);parent.appendChild(t);t.textAutoResize='HEIGHT';t.layoutSizingHorizontal='FIXED';t.layoutSizingVertical='HUG';return t;
}
function spacer(parent,width,height){const f=frame(parent,'Space / '+height,width);f.resize(width,height);f.primaryAxisSizingMode='FIXED';return f;}
function rule(parent,width,color='charcoal',opacity=.22){const r=track(figma.createRectangle());r.name='Divider';r.resize(width,1);r.fills=[paint(color,opacity)];parent.appendChild(r);return r;}
function link(parent,label,width=240,color='charcoal',plain=false){
  const source=STATE.components.links.find(s=>s.name===`Style=${plain?'Plain':'Underline'}`);const inst=track(components[source.name].createInstance());inst.name='Link / '+label;parent.appendChild(inst);inst.resize(width,44);inst.setProperties({[source.labelProperty]:label});
  inst.findAllWithCriteria({types:['TEXT']}).forEach(t=>{t.fills=[paint(color)];mutatedNodeIds.push(t.id);});if(!plain)inst.strokes=[paint(color)];return inst;
}
function logo(parent,width=180,dark=false){
  const row=frame(parent,'Tedits Studio / vector logo',width+88,'HORIZONTAL',16);row.counterAxisAlignItems='CENTER';
  const svg=SVG.replace('<svg ','<svg width="180" height="34" ');
  const vector=track(figma.createNodeFromSvg(svg));vector.name='Supplied Tedits logo / editable vector';vector.resize(width,width*1274/6768.2);row.appendChild(vector);createdNodeIds.push(...vector.findAll(()=>true).map(n=>n.id));
  if(dark)vector.findAll(n=>'fills'in n&&Array.isArray(n.fills)).forEach(n=>{n.fills=n.fills.map(p=>p.type==='SOLID'?paint('ivory'):p);mutatedNodeIds.push(n.id);});
  text(row,'STUDIO',64,8,dark?'ivory':'charcoal',false,'SemiBold');return row;
}
function heading(parent,model,width,mobile){
  const col=frame(parent,'Section heading',width,'VERTICAL',16);text(col,model.label,width,9);text(col,model.heading,width,mobile?36:54,'charcoal',true);return col;
}
const arrowMaster=track(figma.createComponent());arrowMaster.name='Tedits Studio / Palette arrow';arrowMaster.layoutMode='HORIZONTAL';arrowMaster.resize(44,44);arrowMaster.primaryAxisAlignItems='CENTER';arrowMaster.counterAxisAlignItems='CENTER';arrowMaster.fills=[];arrowMaster.strokes=[paint('charcoal',.22)];arrowMaster.x=3415;arrowMaster.y=1500;page.appendChild(arrowMaster);
const arrowText=text(arrowMaster,'→',24,20);const arrowProperty=arrowMaster.addComponentProperty('Arrow','TEXT','→');arrowText.componentPropertyReferences={characters:arrowProperty};
const hashes=['6af459eece2f2c684f73be8b7633eccd8b185c14','456a8db320c3f426af2122efbc48babd9230d2b9','49ab4d56d84aef52e616032718e161a6f52925e5'];
const output=[];
for(const [id,mobile]of[['7:2',false],['7:3',true]]){
  const root=await figma.getNodeByIdAsync(id);const W=mobile?390:1440,P=mobile?20:80,C=W-P*2;
  root.fills=[paint('ivory')];root.primaryAxisSizingMode='AUTO';root.itemSpacing=0;
  function section(name,color=null,padding=mobile?64:96){const f=frame(root,name,W,'VERTICAL',0,color);f.paddingLeft=P;f.paddingRight=P;f.paddingTop=padding;f.paddingBottom=padding;return f;}
  const header=section('Header',null,0);header.paddingTop=mobile?24:32;header.paddingBottom=mobile?24:32;
  const nav=frame(header,'Brand and navigation',C,mobile?'VERTICAL':'HORIZONTAL',mobile?20:0);nav.primaryAxisAlignItems=mobile?'MIN':'SPACE_BETWEEN';nav.counterAxisAlignItems=mobile?'MIN':'CENTER';logo(nav,mobile?144:180);
  const navRow=frame(nav,'Navigation',mobile?C:428,'HORIZONTAL',mobile?16:32);navRow.primaryAxisAlignItems='SPACE_BETWEEN';for(const label of ['Work','Approach','About me','Let’s talk ↗'])text(navRow,label,mobile?label==='About me'?70:60:82,mobile?10:12);spacer(header,C,24);rule(header,C);
  const hero=section('Hero / animated ink wash reference',null,0);hero.paddingTop=mobile?32:48;hero.paddingBottom=0;
  hero.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[1,0,0],[0,1,0]],gradientStops:[{position:0,color:{...rgb('#FFFFE3'),a:1}},{position:.75,color:{r:.91,g:.93,b:.87,a:1}},{position:1,color:{...rgb('#FFFFE3'),a:1}}]}];
  const meta=frame(hero,'Hero labels',C,mobile?'VERTICAL':'HORIZONTAL',mobile?6:0);meta.primaryAxisAlignItems=mobile?'MIN':'SPACE_BETWEEN';MODEL.hero.meta.forEach((value,index)=>text(meta,value,mobile?C:index?350:520,mobile?7:9));
  spacer(hero,C,mobile?32:48);const title=frame(hero,'Hero headline',C);MODEL.hero.heading.split('\n').forEach((line,index)=>text(title,line,C,mobile?36:94,index?'slate':'charcoal',true));spacer(hero,C,mobile?32:48);
  const hb=frame(hero,'Hero introduction',C,mobile?'VERTICAL':'HORIZONTAL',mobile?24:0);hb.primaryAxisAlignItems=mobile?'MIN':'SPACE_BETWEEN';hb.counterAxisAlignItems=mobile?'MIN':'MAX';
  if(mobile){text(hb,MODEL.hero.intro,C,14);link(hb,'Explore selected work',230);}else{link(hb,'Explore selected work',230);text(hb,MODEL.hero.intro,370,16);}spacer(hero,C,mobile?40:64);rule(hero,C);
  const heroLine=frame(hero,'Hero divider labels',C,'HORIZONTAL',16);heroLine.paddingTop=18;heroLine.paddingBottom=18;heroLine.primaryAxisAlignItems='SPACE_BETWEEN';text(heroLine,'01 — WEB DESIGN',mobile?125:200,mobile?7:8);if(!mobile)text(heroLine,'COLOUR. CHARACTER. CLARITY.',330,8);text(heroLine,'SCROLL TO EXPLORE ↓',mobile?145:220,mobile?7:8,'slate');rule(hero,C);
  const work=section('Selected concepts');heading(work,MODEL.work,C,mobile);spacer(work,C,24);text(work,MODEL.work.intro,mobile?C:500,12);spacer(work,C,mobile?32:48);
  for(const [index,project]of MODEL.projects.entries()){
    if(index){spacer(work,C,mobile?48:80);rule(work,C);spacer(work,C,mobile?48:80);}
    const row=frame(work,'Project / '+project.title,C,mobile?'VERTICAL':'HORIZONTAL',mobile?28:56);row.counterAxisAlignItems='CENTER';const visualWidth=mobile?350:744,copyWidth=mobile?350:480;
    const copy=frame(row,'Project context',copyWidth);text(copy,project.number,copyWidth,8);spacer(copy,copyWidth,20);text(copy,project.title,copyWidth,mobile?32:36,'charcoal',true);spacer(copy,copyWidth,16);
    const badge=track(components.Tag.createInstance());copy.appendChild(badge);spacer(copy,copyWidth,20);text(copy,project.description,copyWidth,13);spacer(copy,copyWidth,16);text(copy,project.scope,copyWidth,10);spacer(copy,copyWidth,16);link(copy,'Explore the concept',240);spacer(copy,copyWidth,22);rule(copy,copyWidth);link(copy,'Behind the design',copyWidth,'charcoal',true);
    const source=STATE.components.previews.find(s=>s.name===`Size=${mobile?'Mobile':'Desktop'}`);const visual=track(components[source.name].createInstance());visual.name='Concept preview / '+project.title;row.appendChild(visual);visual.resize(visualWidth,visual.height);visual.setProperties({[source.labelProperty]:project.bar});visual.fills=[paint(index===1?'slate':index===2?'charcoal':'gray')];
    const image=visual.findAllWithCriteria({types:['RECTANGLE']}).find(n=>n.name==='Project screenshot');image.fills=[{type:'IMAGE',imageHash:hashes[index],scaleMode:'FIT'}];mutatedNodeIds.push(image.id);
    if(mobile||index!==1)row.insertChild(0,visual);createdNodeIds.push(...visual.findAll(()=>true).map(n=>n.id),...badge.findAll(()=>true).map(n=>n.id));
  }
  const approach=section('Tailored colour and design');rule(approach,C);spacer(approach,C,32);const ap=frame(approach,'Brand approach and palette',C,mobile?'VERTICAL':'HORIZONTAL',mobile?40:88);const left=frame(ap,'Brand approach',mobile?350:560);heading(left,MODEL.approach,mobile?350:560,mobile);spacer(left,mobile?350:560,24);text(left,MODEL.approach.intro,mobile?350:400,14);spacer(left,mobile?350:560,28);link(left,'Let’s find your direction',260);
  const palette=frame(ap,'Palette gallery / Ink Wash',mobile?350:632);const pl=frame(palette,'Palette title',mobile?350:632,'HORIZONTAL');pl.primaryAxisAlignItems='SPACE_BETWEEN';text(pl,'INK WASH',150,8);text(pl,'01 / 05',60,8);spacer(palette,mobile?350:632,16);
  const swatches=frame(palette,'Four editable colour swatches',mobile?350:632,'HORIZONTAL');for(const key of ['charcoal','gray','ivory','slate']){
    const inst=track(components['Color='+key].createInstance());inst.name='Ink wash / '+key;swatches.appendChild(inst);inst.resize(mobile?87.5:158,mobile?190:220);createdNodeIds.push(...inst.findAll(()=>true).map(n=>n.id));
    // Same ivory labels used by the accessible local palette display.
    inst.findAllWithCriteria({types:['TEXT']}).forEach(t=>{t.fills=[paint(key==='gray'||key==='ivory'?'charcoal':'ivory')];mutatedNodeIds.push(t.id);});
  }
  spacer(palette,mobile?350:632,16);const toolbar=frame(palette,'Palette navigation',mobile?350:632,'HORIZONTAL');toolbar.primaryAxisAlignItems='SPACE_BETWEEN';toolbar.counterAxisAlignItems='CENTER';text(toolbar,'TEDITS STUDIO / WEB DESIGN',mobile?230:400,7);const arrows=frame(toolbar,'Previous and next palette',96,'HORIZONTAL',8);for(const symbol of ['←','→']){const inst=track(arrowMaster.createInstance());arrows.appendChild(inst);inst.setProperties({[arrowProperty]:symbol});createdNodeIds.push(...inst.findAll(()=>true).map(n=>n.id));}
  spacer(palette,mobile?350:632,20);text(palette,'A quiet balance of charcoal, cool gray, soft ivory, and slate blue. Your website’s palette will be chosen for your brand’s own character.',mobile?350:632,11);spacer(palette,mobile?350:632,28);rule(palette,mobile?350:632);spacer(palette,mobile?350:632,20);
  const principles=frame(palette,'Design principles',mobile?350:632,'HORIZONTAL',16);for(const [label,desc]of[['COLOUR','A palette with purpose.'],['TYPE','A voice you recognise.'],['LAYOUT','A clear path through.']]){const c=frame(principles,label,mobile?106:200,'VERTICAL',8);text(c,label,mobile?106:200,8);text(c,desc,mobile?106:200,10);}
  const services=section('Services');heading(services,MODEL.services,C,mobile);spacer(services,C,24);text(services,MODEL.services.intro,mobile?C:500,12);spacer(services,C,40);for(const item of MODEL.services.items){rule(services,C);spacer(services,C,28);const r=frame(services,item.title,C,mobile?'VERTICAL':'HORIZONTAL',mobile?12:32);text(r,item.number,mobile?C:60,9,'slate');text(r,item.title,mobile?C:550,mobile?23:26,'charcoal',true);text(r,item.description,mobile?C:606,13);spacer(services,C,28);}
  const about=section('About Me','charcoal');const ab=frame(about,'About columns',C,mobile?'VERTICAL':'HORIZONTAL',mobile?32:100);const aboutLeft=frame(ab,'About heading',mobile?350:590);text(aboutLeft,MODEL.about.label,mobile?350:590,9,'ivory');spacer(aboutLeft,mobile?350:590,20);text(aboutLeft,MODEL.about.heading,mobile?350:590,mobile?40:58,'ivory',true);spacer(aboutLeft,mobile?350:590,40);text(aboutLeft,MODEL.about.location,mobile?350:590,8,'gray');const aboutRight=frame(ab,'Personal introduction',mobile?350:590,'VERTICAL',24);MODEL.about.paragraphs.forEach((value,index)=>text(aboutRight,value,mobile?350:590,index===0?20:13,index===0?'ivory':'gray'));link(aboutRight,'See my video & motion work',290,'ivory');
  const contact=section('Contact','charcoal');text(contact,MODEL.contact.label,C,9,'ivory');spacer(contact,C,28);text(contact,MODEL.contact.heading,C,mobile?46:84,'ivory',true);spacer(contact,C,44);const cb=frame(contact,'Email contact',C,mobile?'VERTICAL':'HORIZONTAL',mobile?24:0);cb.primaryAxisAlignItems=mobile?'MIN':'SPACE_BETWEEN';text(cb,'teditstudiozm@gmail.com ↗',mobile?350:800,mobile?18:32,'ivory');text(cb,MODEL.contact.intro,mobile?350:320,12,'ivory');
  const footer=section('Footer',null,36);const fr=frame(footer,'Footer content',C,mobile?'VERTICAL':'HORIZONTAL',24);fr.primaryAxisAlignItems=mobile?'MIN':'SPACE_BETWEEN';fr.counterAxisAlignItems=mobile?'MIN':'CENTER';logo(fr,mobile?120:144);text(fr,'© 2026 Tedits Studio · Zambia / Worldwide',mobile?350:420,10);text(fr,'Video & motion ↗',mobile?350:180,10);
  root.placeholder=false;output.push({id:root.id,width:root.width,height:root.height,textCount:root.findAllWithCriteria({types:['TEXT']}).length,instanceCount:root.findAllWithCriteria({types:['INSTANCE']}).length});
}
return {createdNodeIds:[...new Set(createdNodeIds)],mutatedNodeIds:[...new Set(mutatedNodeIds)],screens:output,arrowComponentId:arrowMaster.id};
