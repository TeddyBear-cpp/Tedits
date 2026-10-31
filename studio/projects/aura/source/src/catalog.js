const entries = [
  ['05-zip-cardigan','Zip cardigan','Knitwear',185,'Vanilla','Wool / cashmere','A soft architectural layer. A compact stand collar, considered volume, and a clean zip closure. Finished with a discreet AURA wordmark label.'],
  ['06-belted-coat','Belted coat','Outerwear',620,'Vanilla','Textured shearling concept','An enveloping silhouette in warm ivory. An open neckline and matching belt let the material and its generous proportions take the lead.'],
  ['07-quarter-zip-knit','Quarter-zip knit','Knitwear',210,'Ink','Wool / cashmere','Quiet structure, substantial softness. A high ribbed collar and silver zip bring a precise finish to an easy, generous knit.'],
  ['08-fluid-trousers','Fluid trousers','Trousers',160,'Cream','Fluid crepe','A study in movement. Full-length, softly gathered trousers with a wide leg and an uninterrupted, fluid line.'],
  ['10-denim-jacket','Washed denim jacket','Denim',340,'Washed black','Cotton denim','A familiar form, reinterpreted. Fine silver-grey linework meets charcoal denim, with an oversized, time-worn AURA wordmark across the back.'],
  ['11-silver-ear-clip','Sculptural ear clip','Jewelry',85,'Silver','Polished metal concept','The AURA plus becomes a small sculptural object. Swept points, softly curved cutouts, and a polished silver finish. A single ear clip.'],
  ['01-coated-hooded-jacket','Cocoon hooded jacket','Outerwear',480,'Ink','Coated cotton concept','Volume with intention. Dropped shoulders, sculptural sleeves, and a substantial hood create an enveloping silhouette in coated black.'],
  ['02-sculptural-knit','Sculptural knit','Knitwear',390,'Chalk','Textured wool concept','A tactile composition of cable knit, wrapped collar, and asymmetric layers. An expressive silhouette that lets texture become the detail.'],
  ['03-boxy-zip-shirt','Boxy zip shirt','Tops',195,'Stone','Cotton twill','An exacting everyday shape. Dense cotton twill, an architectural collar, and a silver zip create a clean, considered utility piece.'],
  ['04-wide-leg-trousers','Linework trousers','Trousers',220,'Ink','Technical cloth concept','Generous proportions with one expressive gesture. Fine silver-grey linework follows the lower leg of this flowing black silhouette.'],
  ['09-washed-jeans','Washed baggy jeans','Denim',240,'Washed black','Cotton denim','Cut wide and made to move. A soft charcoal wash, exaggerated leg, and familiar five-pocket construction. Chain shown as styling.'],
  ['12-arc-pendant','Arc pendant','Jewelry',110,'Silver','Polished silver-tone metal','A small signature, suspended. The swept AURA plus is cast as a sculptural pendant on a fine silver-tone chain.'],
  ['13-signet-ring','Signet ring','Jewelry',95,'Silver','Polished silver-tone metal','A familiar heirloom form with a sharper signature. A softly brushed face carries the raised AURA plus, framed by polished shoulders.'],
  ['14-open-cuff','Open cuff','Jewelry',140,'Silver','Polished silver-tone metal','An uninterrupted silver line, finished with a single sculptural gesture. An open cuff with a swept AURA plus at one end.'],
  ['15-east-west-bag','East–West bag','Bags',360,'Ink','Leather','An elongated, structured shoulder bag in smooth black leather. A quiet silver AURA plus plaque, an adjustable strap and a clean zip closure.'],
  ['16-crescent-bag','Crescent bag','Bags',320,'Charcoal','Leather','Soft volume in charcoal leather. A curved shoulder silhouette with a detachable silver-tone chain and sculptural AURA plus charm.'],
];
export const products = entries.map(([id,name,category,price,color,material,description])=>({
  id,name,category,price,color,material:material.replace(' concept',''),description,
  sizes:id==='13-signet-ring'?['US 6','US 7','US 8','US 9','US 10']:['Jewelry','Bags'].includes(category)?['One size']:['XS','S','M','L','XL'],
  imageWidth:category==='Bags'?768:960,
  image:`./assets/${id}-object`,worn:`./assets/${id}-worn`,
  reverse:id==='10-denim-jacket'?`./assets/${id}-reverse-960.webp`:null,
}));
export const categories=['All collectibles','Outerwear','Knitwear','Denim','Trousers','Tops','Bags','Jewelry'];
export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export const imageSrc = (base,width=480)=>`${base}-${width}.webp`;
