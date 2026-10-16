// The helper functions createVariableCollection/createComponentWithVariants are
// prepended from the installed Figma skill; page selection is owned by this call.
const page=await figma.getNodeByIdAsync('0:1');
await figma.setCurrentPageAsync(page);
const createdNodeIds=[],variableIds=[],styleIds=[];
const rgb=hex=>({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255});
await Promise.all([{family:'DM Sans',style:'Regular'},{family:'DM Sans',style:'SemiBold'},{family:'Syne',style:'Medium'}].map(f=>figma.loadFontAsync(f)));
const {collection,modeIds}=await createVariableCollection('Tedits Studio / Ink wash',['Default']);
const mode=modeIds.Default;
const colors={};
for(const [name,hex] of Object.entries({charcoal:'#4A4A4A',gray:'#CBCBCB',ivory:'#FFFFE3',slate:'#6D8196'})){
  const primitive=figma.variables.createVariable('primitive/'+name,collection,'COLOR');primitive.scopes=[];primitive.setValueForMode(mode,rgb(hex));variableIds.push(primitive.id);
  const semantic=figma.variables.createVariable('color/'+name,collection,'COLOR');semantic.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];semantic.setValueForMode(mode,{type:'VARIABLE_ALIAS',id:primitive.id});semantic.setVariableCodeSyntax('WEB',`var(--${name})`);variableIds.push(semantic.id);colors[name]=semantic;
}
const space={};
for(const value of [8,16,24,28,32,40,48,56,64,80,88,96,100]){const v=figma.variables.createVariable('space/'+value,collection,'FLOAT');v.scopes=['GAP'];v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB',`var(--space-${value})`);variableIds.push(v.id);space[value]=v;}
const radius=figma.variables.createVariable('radius/small',collection,'FLOAT');radius.scopes=['CORNER_RADIUS'];radius.setValueForMode(mode,3);radius.setVariableCodeSyntax('WEB','var(--radius-small)');variableIds.push(radius.id);
const styles={};
for(const [name,family,style,size,line] of [['Hero','Syne','Medium',94,99],['Heading','Syne','Medium',54,60],['Project title','Syne','Medium',36,43],['Body','DM Sans','Regular',14,24],['Small','DM Sans','Regular',12,20],['Label','DM Sans','SemiBold',9,15]]){
  const ts=figma.createTextStyle();ts.name='Tedits Studio/'+name;ts.fontName={family,style};ts.fontSize=size;ts.lineHeight={unit:'PIXELS',value:line};styles[name]=ts;styleIds.push(ts.id);
}
const fill=(name,opacity=1)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb({charcoal:'#4A4A4A',gray:'#CBCBCB',ivory:'#FFFFE3',slate:'#6D8196'}[name]),opacity},'color',colors[name]);
function label(parent,value,size=12,color='charcoal'){
  const t=figma.createText();t.fontName={family:'DM Sans',style:'Regular'};t.characters=value;t.fontSize=size;t.fills=[fill(color)];parent.appendChild(t);createdNodeIds.push(t.id);return t;
}
const clearX=Math.max(0,...page.children.map(n=>n.x+n.width))+2800;
const links=await createComponentWithVariants({name:'Tedits Studio / Text link',variantAxes:{Style:['Underline','Plain']},baseProps:{width:240,height:44,layoutMode:'HORIZONTAL',itemSpacing:24,padding:{top:8,bottom:8,left:0,right:0},fills:[]},page});
links.componentSet.x=clearX;links.componentSet.y=0;
const linkProps={};
const sharedLinkProperty=links.componentSet.addComponentProperty('Label','TEXT','Explore the concept');
for(const variant of links.variants){
  variant.primaryAxisAlignItems='SPACE_BETWEEN';variant.counterAxisAlignItems='CENTER';variant.fills=[];
  const txt=label(variant,'Explore the concept',12);txt.fontName={family:'DM Sans',style:'SemiBold'};
  const prop=sharedLinkProperty;txt.componentPropertyReferences={characters:prop};linkProps[variant.name]=prop;
  label(variant,'↗',20);
  if(variant.name.includes('Underline')){variant.strokes=[fill('charcoal')];variant.strokeTopWeight=0;variant.strokeLeftWeight=0;variant.strokeRightWeight=0;variant.strokeBottomWeight=1;}
}
const tag=figma.createComponent();tag.name='Tedits Studio / Concept tag';tag.layoutMode='HORIZONTAL';tag.resize(150,26);tag.primaryAxisAlignItems='CENTER';tag.counterAxisAlignItems='CENTER';tag.fills=[];tag.strokes=[fill('charcoal',.22)];tag.cornerRadius=2;tag.x=clearX;tag.y=180;page.appendChild(tag);createdNodeIds.push(tag.id);label(tag,'INDEPENDENT CONCEPT',7);
const preview=await createComponentWithVariants({name:'Tedits Studio / Project preview',variantAxes:{Size:['Desktop','Mobile']},baseProps:{width:744,height:568,layoutMode:'VERTICAL',itemSpacing:0,padding:{top:28,bottom:28,left:28,right:28},fills:[fill('gray')]},page});
preview.componentSet.x=clearX;preview.componentSet.y=280;
const previewImages={};
const sharedPreviewProperty=preview.componentSet.addComponentProperty('Project','TEXT','CONCEPT PREVIEW');
for(const variant of preview.variants){
  const mobile=variant.name.includes('Mobile');const width=mobile?350:744,pad=mobile?16:28,imageWidth=width-pad*2;
  variant.resize(width,imageWidth*900/1280+28+pad*2);variant.paddingTop=pad;variant.paddingBottom=pad;variant.paddingLeft=pad;variant.paddingRight=pad;variant.setBoundVariable('cornerRadius',radius);variant.fills=[fill('gray')];
  const bar=figma.createAutoLayout('HORIZONTAL');bar.name='Browser frame';bar.resize(imageWidth,28);bar.layoutSizingVertical='FIXED';bar.fills=[fill('ivory')];bar.primaryAxisAlignItems='SPACE_BETWEEN';bar.counterAxisAlignItems='CENTER';bar.paddingLeft=12;bar.paddingRight=12;variant.appendChild(bar);createdNodeIds.push(bar.id);
  label(bar,'● ● ●',6);const title=label(bar,'CONCEPT PREVIEW',6);const prop=sharedPreviewProperty;title.componentPropertyReferences={characters:prop};label(bar,'↗',12);
  const image=figma.createRectangle();image.name='Project screenshot';image.resize(imageWidth,imageWidth*900/1280);image.fills=[{type:'IMAGE',imageHash:'6af459eece2f2c684f73be8b7633eccd8b185c14',scaleMode:'FIT'}];variant.appendChild(image);createdNodeIds.push(image.id);previewImages[variant.name]={imageId:image.id,labelProperty:prop};
}
const swatches=await createComponentWithVariants({name:'Tedits Studio / Palette swatch',variantAxes:{Color:['charcoal','gray','ivory','slate']},baseProps:{width:158,height:220,layoutMode:'VERTICAL',padding:{top:16,bottom:16,left:12,right:12}},page});
swatches.componentSet.x=clearX;swatches.componentSet.y=1050;
for(const [index,variant]of swatches.variants.entries()){
  const color=variant.name.split('=')[1];variant.fills=[fill(color)];variant.primaryAxisAlignItems='SPACE_BETWEEN';variant.counterAxisAlignItems='MIN';label(variant,String(index+1).padStart(2,'0'),9,color==='charcoal'||color==='slate'?'ivory':'charcoal');label(variant,{charcoal:'#4A4A4A',gray:'#CBCBCB',ivory:'#FFFFE3',slate:'#6D8196'}[color],9,color==='charcoal'||color==='slate'?'ivory':'charcoal');
}
for(const root of [links.componentSet,preview.componentSet,swatches.componentSet]){createdNodeIds.push(root.id,...root.findAll(()=>true).map(n=>n.id));}
return {createdNodeIds:[...new Set(createdNodeIds)],collectionId:collection.id,variableIds,styleIds,colors:Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,v.id])),spaces:Object.fromEntries(Object.entries(space).map(([k,v])=>[k,v.id])),styles:Object.fromEntries(Object.entries(styles).map(([k,v])=>[k,v.id])),components:{links:links.variants.map(v=>({id:v.id,name:v.name,labelProperty:linkProps[v.name]})),tag:tag.id,previews:preview.variants.map(v=>({id:v.id,name:v.name,...previewImages[v.name]})),swatches:swatches.variants.map(v=>({id:v.id,name:v.name}))}};
