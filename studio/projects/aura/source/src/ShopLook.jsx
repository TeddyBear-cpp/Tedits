import {useRef,useState} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import {products,money,imageSrc} from './catalog';
import './shop-look.css';

const looks=[
  {id:'after-hours',name:'After hours',description:'Sculptural outerwear, washed denim and a precise silver finish.',photo:'15-east-west-bag',items:['01-coated-hooded-jacket','09-washed-jeans','15-east-west-bag','13-signet-ring']},
  {id:'soft-structure',name:'Soft structure',description:'Ivory layers and fluid proportions, anchored by charcoal leather.',photo:'16-crescent-bag',items:['05-zip-cardigan','08-fluid-trousers','16-crescent-bag','12-arc-pendant']},
];

export function ShopLook({onOpen,onAdd}){
  const [active,setActive]=useState(0);
  const [sizes,setSizes]=useState({});
  const [excluded,setExcluded]=useState({});
  const [attempted,setAttempted]=useState(false);
  const tabs=useRef([]),selects=useRef({});
  const look=looks[active];
  const pieces=look.items.map(id=>products.find(p=>p.id===id)).filter(Boolean);
  const photograph=products.find(p=>p.id===look.photo);
  const selected=pieces.filter(p=>!excluded[p.id]);
  const chosenSize=p=>sizes[p.id]||(p.sizes.length===1?p.sizes[0]:'');
  const missing=selected.filter(p=>!chosenSize(p));
  const total=selected.reduce((sum,p)=>sum+p.price,0);

  function choose(index,focus=false){setActive(index);setAttempted(false);if(focus)tabs.current[index]?.focus()}
  function tabKey(event,index){
    const next=event.key==='ArrowRight'?(index+1)%looks.length:event.key==='ArrowLeft'?(index+looks.length-1)%looks.length:event.key==='Home'?0:event.key==='End'?looks.length-1:null;
    if(next!==null){event.preventDefault();choose(next,true)}
  }
  function collect(){
    setAttempted(true);
    if(missing.length){selects.current[missing[0].id]?.focus();return}
    if(selected.length)onAdd(selected.map(product=>({product,size:chosenSize(product)})));
  }

  return <section className="shop-look" id="looks" aria-labelledby="looks-title">
    <div className="look-heading">
      <div><p className="eyebrow">Curated pairings</p><h2 id="looks-title">Shop the look.</h2><p className="look-intro">Choose a silhouette. Collect it piece by piece.</p></div>
      <div className="look-tabs" role="tablist" aria-label="Choose a styled look">
        {looks.map((item,index)=><button ref={node=>{tabs.current[index]=node}} key={item.id} role="tab" id={`look-tab-${item.id}`} aria-selected={active===index} aria-controls="look-panel" tabIndex={active===index?0:-1} onClick={()=>choose(index)} onKeyDown={event=>tabKey(event,index)}><span aria-hidden="true">0{index+1}</span>{item.name}</button>)}
      </div>
    </div>
    <div className="look-layout" id="look-panel" role="tabpanel" aria-labelledby={`look-tab-${look.id}`}>
      <div className="look-stage">{photograph&&<img key={look.id} src={imageSrc(photograph.worn,960)} srcSet={`${imageSrc(photograph.worn,480)} 480w, ${imageSrc(photograph.worn,960)} 960w`} sizes="(max-width:760px) 100vw, 55vw" alt={`${look.name}: a model wearing ${pieces.map(p=>p.name.toLowerCase()).join(', ')}`} width="1024" height="1536" loading="lazy" decoding="async"/>}</div>
      <div className="look-selection">
        <div className="look-description"><h3>{look.name}</h3><p>{look.description}</p></div>
        <div className="look-pieces">
          {pieces.map(product=>{
            const included=!excluded[product.id],invalid=attempted&&included&&!chosenSize(product);
            return <div className={`look-piece${included?'':' is-excluded'}`} key={product.id}>
              <label className="look-check"><input className="look-checkbox" type="checkbox" checked={included} aria-label={`Include ${product.name}`} onChange={()=>setExcluded(previous=>({...previous,[product.id]:included}))}/></label>
              <button className="look-piece-product" aria-label={`View ${product.name}`} onClick={()=>onOpen(product,chosenSize(product))}><img src={imageSrc(product.image,480)} alt="" width="64" height="88" loading="lazy"/><span><span className="look-piece-name">{product.name}</span><span className="look-piece-colour">{product.color}</span></span></button>
              <div className="look-piece-choice"><span>{money(product.price)}</span>{product.sizes.length===1?<span className="look-one-size">{product.sizes[0]}</span>:<select ref={node=>{selects.current[product.id]=node}} aria-label={`Size for ${product.name}`} aria-invalid={invalid||undefined} aria-describedby={invalid?'look-size-message':undefined} disabled={!included} value={chosenSize(product)} onChange={event=>setSizes(previous=>({...previous,[product.id]:event.target.value}))}><option value="" disabled>Size</option>{product.sizes.map(size=><option key={size} value={size}>{size}</option>)}</select>}</div>
            </div>;
          })}
        </div>
        <p className="look-message" id="look-size-message" role="status">{attempted&&missing.length?'Select a size for the highlighted pieces.':''}</p>
        <div className="look-total" aria-live="polite"><span>{selected.length} {selected.length===1?'piece':'pieces'} selected</span><span>{money(total)} <small>USD</small></span></div>
        <button className="primary-button look-add" disabled={!selected.length} onClick={collect}>Add selected pieces<ArrowRight size={20} weight="light"/></button>
        <p className="look-selection-note">Each piece is available individually.</p>
      </div>
    </div>
  </section>;
}
