import {useState,useEffect,useLayoutEffect,useRef,useMemo} from 'react';
import {ArrowRight,ArrowLeft,ArrowUpRight,X,Plus,Minus,Eye,Check} from '@phosphor-icons/react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {products,categories,money,imageSrc} from './catalog';
import './fonts.css';
import {HeroPortrait} from './HeroPortrait';
import {ShopLook} from './ShopLook';

gsap.registerPlugin(ScrollTrigger);
const LOGO='./assets/aura-wordmark.webp';
const iconProps={size:20,weight:'light'};

function useReducedMotion(){
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
  return reduced;
}

function useModal(open){
  const ref=useRef(null);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();if(!open&&dialog.open)dialog.close()},[open]);
  return ref;
}

function ProductPhoto({product,kind='object',large=false,...props}){
  const base=kind==='worn'?product.worn:product.image;
  return <img src={imageSrc(base,large?960:480)} srcSet={`${imageSrc(base,480)} 480w, ${imageSrc(base,960)} ${kind==='worn'?960:product.imageWidth}w`} sizes={large?'(max-width: 760px) 100vw, 55vw':'(max-width: 600px) 75vw, (max-width: 1000px) 45vw, 25vw'} alt={kind==='worn'?`${product.name} worn by a model`:product.name} decoding="async" {...props}/>;
}

function ProductCard({product,onOpen,rail}){
  const ref=useRef(null);
  const [near,setNear]=useState(false);
  const [showWorn,setShowWorn]=useState(false);
  useEffect(()=>{const node=ref.current;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setNear(true);observer.disconnect()}},{root:rail.current,rootMargin:'0px 450px'});if(node)observer.observe(node);return()=>observer.disconnect()},[rail,product.id]);
  return <article className={`product-card ${showWorn?'show-worn':''}`} ref={ref}>
    <div className="product-visual">
      <button className="product-image-button" aria-label={`View ${product.name}`} onClick={()=>onOpen(product)}>
        <ProductPhoto product={product} className="object-photo" loading="lazy"/>
        {near&&<ProductPhoto product={product} kind="worn" className="worn-photo" loading="lazy"/>}
      </button>
      <button className="wear-toggle" aria-label={`${showWorn?'Show product':'Show worn view'} of ${product.name}`} aria-pressed={showWorn} onClick={()=>{setNear(true);setShowWorn(v=>!v)}}><Eye size={17} weight="light"/></button>
      <div className="card-sizes" aria-label={`Choose a size for ${product.name}`}>{product.sizes.map(size=><button key={size} onClick={()=>onOpen(product,size)}>{size}</button>)}</div>
    </div>
    <div className="product-caption"><button onClick={()=>onOpen(product)}>{product.name}</button><span>{money(product.price)}</span></div>
    <div className="product-material">{product.color}<span>{product.material}</span></div>
  </article>;
}

function ProductDialog({selection,onClose,onAdd}){
  const open=!!selection;
  const ref=useModal(open);
  const product=selection?.product;
  const garment=product&&!['Jewelry','Bags'].includes(product.category);
  const [size,setSize]=useState('');
  const [view,setView]=useState('object');
  const [error,setError]=useState('');
  useEffect(()=>{setSize(selection?.initialSize||(product?.sizes.length===1?product.sizes[0]:''));setView('object');setError('')},[selection,product]);
  return <dialog ref={ref} className="product-dialog" aria-labelledby="product-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} data-lenis-prevent>
    {product&&<div className="product-dialog-body">
      <button className="close-button" aria-label="Close product details" onClick={onClose}><X {...iconProps}/></button>
      <div className="detail-photography">
        <div className={`detail-photo ${view==='worn'?'is-worn':''}`}>
          {view==='reverse'?<img src={product.reverse} alt={`Back of ${product.name}`}/>:<ProductPhoto key={`${product.id}-${view}`} product={product} kind={view} large/>}
        </div>
        <div className="view-tabs" aria-label="Product photographs">{[['object','The object'],['worn','Worn'],...(product.reverse?[['reverse','Reverse']]:[])].map(([value,label])=><button className={view===value?'active':''} key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{label}</button>)}</div>
      </div>
      <div className="product-information">
        <p className="eyebrow">AURA+ / {product.category}</p>
        <h2 id="product-title">{product.name}</h2>
        <p className="detail-price">{money(product.price)} <span>USD</span></p>
        <p className="detail-description">{product.description}</p>
        <div className="detail-color"><span>Colour</span><span className={`color-chip ${['Vanilla','Cream','Chalk'].includes(product.color)?'light':product.color==='Silver'?'silver':''}`}/>{product.color}</div>
        <div className="size-heading"><span>{product.sizes.length===1?'Size':product.id==='13-signet-ring'?'Select ring size (US)':'Select size'}</span>{garment&&<a href="#size-guide" onClick={e=>{e.preventDefault();const guide=ref.current.querySelector('#size-guide');guide.open=true;guide.scrollIntoView({block:'nearest'})}}>Size guide</a>}</div>
        <div className="size-options">{product.sizes.map(item=><button className={size===item?'selected':''} aria-pressed={size===item} key={item} onClick={()=>{setSize(item);setError('')}}>{item}</button>)}</div>
        <p className="size-error" role="status">{error}</p>
        <button className="primary-button" onClick={()=>{if(!size){setError('Please select a size.');return}onAdd(product,size)}}>Add to bag<Plus size={18}/></button>
        <p className="product-note">Considered forms. Collected with intention.</p>
        <details className="detail-accordion"><summary>Details & care</summary><p>{product.material}. {product.category==='Jewelry'?'Keep dry, avoid fragrance and wipe gently with a soft cloth. Store separately to protect the finish.':product.category==='Bags'?'Wipe with a soft, dry cloth. Protect from prolonged moisture and direct heat; store in a dust bag when resting.':'A relaxed silhouette. Follow the care label; specialist cleaning is recommended for delicate textures.'}</p><p>Shown as a concept collectible. Composition and production details are illustrative.</p></details>
        {garment&&<details className="detail-accordion" id="size-guide"><summary>Fit & size guide</summary><p>Choose your usual size for the intended relaxed fit. Size down for a closer silhouette.</p><table><thead><tr><th>Size</th><th>Chest / waist (cm)</th></tr></thead><tbody>{['XS','S','M','L','XL'].map((s,i)=><tr key={s}><td>{s}</td><td>{product.category==='Trousers'||product.category==='Denim'&&product.id.includes('jeans')?`${66+i*6}–${72+i*6}`:`${80+i*8}–${88+i*8}`}</td></tr>)}</tbody></table><p>Indicative sizing for this concept collection.</p></details>}
      </div>
    </div>}
  </dialog>;
}

function Bag({open,onClose,cart,onChange,onRemove,onExplore}){
  const ref=useModal(open);
  const [step,setStep]=useState('bag');
  useEffect(()=>{if(open)setStep('bag')},[open]);
  const items=cart.map(row=>({...row,product:products.find(p=>p.id===row.id)})).filter(row=>row.product);
  const count=items.reduce((a,b)=>a+b.quantity,0);
  const total=items.reduce((a,b)=>a+b.quantity*b.product.price,0);
  function save(){try{localStorage.setItem('aura-selection',JSON.stringify({date:new Date().toISOString(),items:cart}))}catch{}setStep('saved')}
  return <dialog ref={ref} className="bag-dialog" aria-labelledby="bag-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} data-lenis-prevent>
    <div className="bag-body"><div className="bag-heading"><h2 id="bag-title">{step==='bag'?<>Your bag <sup>({count})</sup></>:step==='review'?'Your selection':'Collected with intention.'}</h2><button className="icon-button" onClick={onClose} aria-label="Close bag"><X {...iconProps}/></button></div>
    {step==='saved'?<div className="saved-selection"><Check size={36} weight="thin"/><h3>A collection<br/>in the making.</h3><p>Your selection has been saved on this device. No order has been placed and no payment has been taken.</p><button className="primary-button" onClick={()=>{onClose();onExplore()}}>Keep exploring<ArrowRight {...iconProps}/></button></div>:items.length===0?<div className="empty-bag"><p className="eyebrow">A space for considered objects</p><h3>Your collection<br/>starts here.</h3><button className="text-link" onClick={()=>{onClose();onExplore()}}>Explore collectibles<ArrowRight {...iconProps}/></button></div>:<>
      {step==='review'&&<div className="checkout-note"><p className="eyebrow">AURA+ concept store</p><p>Review and save your selection. This fictional storefront does not accept payments or place orders.</p><button className="text-link" onClick={()=>setStep('bag')}><ArrowLeft size={16}/>Edit bag</button></div>}
      <div className="bag-items">{items.map(row=><article className="bag-item" key={`${row.id}-${row.size}`}>
        <div className="bag-item-image"><ProductPhoto product={row.product}/></div>
        <div className="bag-item-description"><div><h3>{row.product.name}</h3><p>{row.product.color} / {row.size}</p></div><div className="bag-item-bottom">{step==='bag'?<div className="quantity"><button aria-label={`Decrease quantity of ${row.product.name}`} onClick={()=>onChange(row.id,row.size,-1)} disabled={row.quantity<=1}><Minus size={12}/></button><span>{row.quantity}</span><button aria-label={`Increase quantity of ${row.product.name}`} onClick={()=>onChange(row.id,row.size,1)} disabled={row.quantity>=9}><Plus size={12}/></button></div>:<span>Qty {row.quantity}</span>}<span>{money(row.product.price*row.quantity)}</span></div>{step==='bag'&&<button className="remove-item" onClick={()=>onRemove(row.id,row.size)}>Remove</button>}</div>
      </article>)}</div>
      <div className="bag-summary"><div><span>Subtotal</span><span>{money(total)} USD</span></div><p>A considered selection, at your own pace.</p><button className="primary-button" onClick={()=>step==='bag'?setStep('review'):save()}>{step==='bag'?'Review selection':'Save my selection'}<ArrowRight {...iconProps}/></button>{step==='bag'&&<button className="continue-button" onClick={onClose}>Continue collecting</button>}</div>
    </>}
    </div>
  </dialog>;
}

export function App(){
  const reduced=useReducedMotion();
  const root=useRef(null),rail=useRef(null),lenis=useRef(null),drag=useRef(null),skipClick=useRef(false);
  const [selection,setSelection]=useState(null),[bagOpen,setBagOpen]=useState(false),[category,setCategory]=useState('All collectibles');
  const [progress,setProgress]=useState(0),[canNext,setCanNext]=useState(true),[headerSolid,setHeaderSolid]=useState(false);
  const [cart,setCart]=useState(()=>{try{const data=JSON.parse(localStorage.getItem('aura-bag')||'[]');return Array.isArray(data)?data.filter(i=>products.some(p=>p.id===i.id&&p.sizes.includes(i.size))&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=9):[]}catch{return[]}});
  const visible=useMemo(()=>category==='All collectibles'?products:products.filter(p=>p.category===category),[category]);
  const count=cart.reduce((sum,row)=>sum+row.quantity,0);
  useEffect(()=>{try{localStorage.setItem('aura-bag',JSON.stringify(cart))}catch{}},[cart]);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setHeaderSolid(!entry.isIntersecting),{threshold:0});observer.observe(document.querySelector('.hero'));return()=>observer.disconnect()},[]);
  useEffect(()=>{
    if(reduced)return;
    const scroll=new Lenis({duration:1.05,smoothWheel:true,anchors:false});lenis.current=scroll;
    scroll.on('scroll',ScrollTrigger.update);
    const tick=time=>scroll.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
    return()=>{gsap.ticker.remove(tick);scroll.destroy();lenis.current=null};
  },[reduced]);
  useEffect(()=>{const open=!!selection||bagOpen;document.documentElement.classList.toggle('modal-open',open);if(open)lenis.current?.stop();else lenis.current?.start();return()=>document.documentElement.classList.remove('modal-open')},[selection,bagOpen]);
  useLayoutEffect(()=>{
    const context=gsap.context(()=>{
      if(reduced){gsap.set('.reveal',{opacity:1,y:0});return}
      gsap.to('.hero-image',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      gsap.utils.toArray('.reveal').forEach(el=>gsap.fromTo(el,{opacity:0,y:18},{opacity:1,y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
      gsap.utils.toArray('.study-image img').forEach(el=>gsap.fromTo(el,{y:25},{y:-20,ease:'none',scrollTrigger:{trigger:el.closest('.study-piece'),start:'top bottom',end:'bottom top',scrub:1}}));
    },root);
    return()=>context.revert();
  },[reduced]);
  function go(id){const node=document.getElementById(id);if(!node)return;if(lenis.current&&!reduced)lenis.current.scrollTo(node,{offset:-75,force:true});else node.scrollIntoView({behavior:'auto'});history.replaceState(null,'',`#${id}`)}
  function openProduct(product,initialSize){setSelection({product,initialSize})}
  function addItems(items){setCart(rows=>{const next=rows.map(row=>({...row}));for(const {product,size} of items){const found=next.find(row=>row.id===product.id&&row.size===size);if(found)found.quantity=Math.min(9,found.quantity+1);else next.push({id:product.id,size,quantity:1})}return next});setSelection(null);setBagOpen(true)}
  function add(product,size){addItems([{product,size}])}
  function updateProgress(){const el=rail.current;if(!el)return;const max=el.scrollWidth-el.clientWidth;setProgress(max>0?el.scrollLeft/max:0);setCanNext(el.scrollLeft<max-3)}
  useEffect(()=>{rail.current?.scrollTo({left:0});const raf=requestAnimationFrame(updateProgress);const observer=new ResizeObserver(updateProgress);if(rail.current)observer.observe(rail.current);return()=>{cancelAnimationFrame(raf);observer.disconnect()}},[category]);
  function moveRail(direction){const el=rail.current;if(!el)return;const card=el.querySelector('.product-card');const step=window.matchMedia('(max-width:760px)').matches&&card?card.getBoundingClientRect().width+parseFloat(getComputedStyle(el).columnGap):el.clientWidth*.85;el.scrollBy({left:direction*step,behavior:reduced?'instant':'smooth'})}
  function pointerDown(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('.card-sizes,.wear-toggle'))return;drag.current={x:e.clientX,left:rail.current.scrollLeft,active:false,pointer:e.pointerId};skipClick.current=false}
  function pointerMove(e){const d=drag.current;if(!d)return;const delta=e.clientX-d.x;if(Math.abs(delta)>7){d.active=true;skipClick.current=true;rail.current.setPointerCapture(e.pointerId);rail.current.classList.add('is-dragging');e.preventDefault();rail.current.scrollLeft=d.left-delta}}
  function pointerUp(){const d=drag.current;if(d?.active&&rail.current.hasPointerCapture(d.pointer))rail.current.releasePointerCapture(d.pointer);drag.current=null;rail.current?.classList.remove('is-dragging')}
  return <div ref={root}>
    <a className="skip-link" href="#collection">Skip to collection</a>
    <header className={`site-header ${headerSolid?'is-solid':''}`}><a href="#top" onClick={e=>{e.preventDefault();go('top')}} aria-label="AURA+ home"><img className="header-logo" src={LOGO} alt="AURA+" width="140" height="42"/></a><nav aria-label="Main navigation"><a href="#collection" onClick={e=>{e.preventDefault();go('collection')}}>Collectibles</a><a href="#looks" onClick={e=>{e.preventDefault();go('looks')}}>Shop the look</a><a href="#philosophy" onClick={e=>{e.preventDefault();go('philosophy')}}>Philosophy</a><button onClick={()=>setBagOpen(true)}>Bag <span>({count})</span></button></nav></header>
    <main>
      <section className="hero" id="top" aria-label="AURA+ wearable art collection">
        <h1 className="sr-only">AURA+ — For modern collectors of wearable art.</h1>
        <HeroPortrait/>
        <div className="hero-copy"><p>For modern<br/>collectors of<br/><em>wearable art.</em></p><button className="hero-action" onClick={()=>go('collection')}><span className="short-rule"/>Explore collectibles<ArrowRight size={22} weight="thin"/></button></div>
        <p className="hero-edition">AURA+ / COLLECTIBLE FORMS</p>
      </section>
      <section className="collection" id="collection" aria-labelledby="collection-title">
        <div className="collection-toolbar reveal"><h2 id="collection-title" className="eyebrow">The collection</h2><div className="rail-progress" aria-hidden="true"><span style={{transform:`translateX(${progress*300}%)`}}/></div><div className="rail-controls"><button className="icon-button" aria-label="Previous collectibles" disabled={progress<=.005} onClick={()=>moveRail(-1)}><ArrowLeft {...iconProps}/></button><button className="icon-button" aria-label="Next collectibles" disabled={!canNext} onClick={()=>moveRail(1)}><ArrowRight {...iconProps}/></button></div></div>
        <div className="collection-filters" aria-label="Filter collection">{categories.map(item=><button key={item} className={category===item?'active':''} aria-pressed={category===item} onClick={()=>{setCategory(item);rail.current?.scrollTo({left:0,behavior:"instant"})}}>{item}</button>)}<span className="piece-count">{visible.length} pieces</span></div>
        <div className="collection-rail" ref={rail} onScroll={updateProgress} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClickCapture={e=>{if(skipClick.current){e.preventDefault();e.stopPropagation();skipClick.current=false}}}>{visible.map(product=><ProductCard key={product.id} product={product} onOpen={openProduct} rail={rail}/>)}</div>
        <div className="collection-footnote"><span>Considered objects. Released when ready.</span><span>Scroll to explore <ArrowRight size={14}/></span></div>
      </section>
      <ShopLook onOpen={openProduct} onAdd={addItems}/>
      <section className="material-study" aria-labelledby="study-title">
        <div className="study-heading reveal"><p className="eyebrow">A study in contrast</p><h2 id="study-title">Sculpted volume.<br/><em>Tactile form.</em></h2><p>Two expressions of the same idea.<br/>Presence, without excess.</p></div>
        <div className="study-pair">{[products.find(p=>p.id==='01-coated-hooded-jacket'),products.find(p=>p.id==='02-sculptural-knit')].map((p,i)=><article className={`study-piece study-piece-${i} reveal`} key={p.id}><button className="study-image" aria-label={`Discover ${p.name}`} onClick={()=>openProduct(p)}><ProductPhoto product={p} large loading="lazy"/></button><div className="study-caption"><div><span className="eyebrow">{i===0?'01 / Coated form':'02 / Knitted form'}</span><h3>{p.name}</h3></div><button className="icon-button" aria-label={`View ${p.name}`} onClick={()=>openProduct(p)}><ArrowUpRight size={24} weight="thin"/></button></div></article>)}</div>
      </section>
      <section className="philosophy reveal" id="philosophy" aria-labelledby="philosophy-title"><h2 id="philosophy-title">AN OCEAN<br/><em>of</em> IDEAS</h2><div className="philosophy-copy"><p>AN OCEAN of IDEAS exists at the intersection of fashion and design, where each collectible is a limited-edition piece designed by Teddy Chungu.</p><p>No forced releases. We unveil collectibles to our collectors whenever ready, from the hands of our master artisans to yours. A gallery of wearable art.</p><p>Collectibles that honor the time, materiality, and the human hands behind each piece.</p><p>This is fashion for collectors who understand that true luxury isn't about having more.</p></div></section>
    </main>
    <footer className="site-footer"><a href="#top" onClick={e=>{e.preventDefault();go('top')}} aria-label="AURA+ home"><img src={LOGO} width="130" height="40" alt="AURA+"/></a><p>A gallery of wearable art.<br/><span>By Teddy Chungu</span></p><button className="text-link" onClick={()=>go('top')}>Back to top<ArrowUpRight size={17}/></button><span className="copyright">© {new Date().getFullYear()} AURA+</span></footer>
    <ProductDialog selection={selection} onClose={()=>setSelection(null)} onAdd={add}/>
    <Bag open={bagOpen} onClose={()=>setBagOpen(false)} cart={cart} onExplore={()=>go('collection')} onChange={(id,size,delta)=>setCart(rows=>rows.map(r=>r.id===id&&r.size===size?{...r,quantity:Math.max(1,Math.min(9,r.quantity+delta))}:r))} onRemove={(id,size)=>setCart(rows=>rows.filter(r=>!(r.id===id&&r.size===size)))}/>
  </div>;
}
