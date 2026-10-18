const fs = require('node:fs');
const path = require('node:path');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const localImages = ['assets/seasonal-meals.jpg','assets/brunch.jpg','assets/salad.jpg','assets/menu-feast.jpg','assets/menu-brunch.jpg','assets/menu-everyday.jpg','assets/meal-monday.jpg','assets/meal-tuesday.jpg','assets/meal-wednesday.jpg','assets/meal-thursday.jpg','assets/meal-friday.jpg','assets/meal-saturday.jpg','concept-assets/steel-beams.jpg','concept-assets/metal-tubes.jpg','concept-assets/welder-hero.jpg'];
const localAudio = ['assets/audio/do-this-often-teddybear.mp3','assets/audio/the-lead-teddybear.mp3'];
function asset(remote, local, kind) {
  if (remote) {
    const url = new URL(remote);
    if (url.origin !== 'https://cdn.sanity.io' || !url.pathname.startsWith(`/${kind}/yjcpyptx/production/`)) throw Error('Unexpected catalogue asset URL');
    return url.href;
  }
  if (!(kind === 'images' ? localImages : localAudio).includes(local)) throw Error('Choose a supported local catalogue asset');
  return local;
}
function replace(html, pattern, value) {
  if (!pattern.test(html)) throw Error('Catalogue template changed; update renderer');
  return html.replace(pattern, () => value);
}
function validate(doc, max, fields) {
  if (!Array.isArray(doc.items) || !doc.items.length || doc.items.length > max) throw Error(`Invalid ${doc._type} item count`);
  for (const item of doc.items) for (const field of fields) if (typeof item[field] !== 'string' || !item[field].trim()) throw Error(`Catalogue item missing ${field}`);
}
function renderMenus(html, doc) {
  validate(doc, 8, ['title','eyebrow','heading','accent','occasion','alt']);
  const menus = {};
  doc.items.forEach((item, i) => {
    if (!['Weddings & celebrations','Breakfast & brunch','Weekly meal prep'].includes(item.occasion)) throw Error('Invalid menu occasion');
    validate({items:item.dishes}, 20, ['title','description']);
    menus[`menu${i}`] = {id:`menu${i}`,label:item.title,eyebrow:item.eyebrow,title:item.heading,accent:item.accent,occasion:item.occasion,image:asset(item.imageUrl,item.localImage,'images'),fallbackImage:item.localImage,alt:item.image?.alt || item.alt,dishes:item.dishes.map(d => [d.title, d.description + (d.dietary ? ` · ${d.dietary}` : '')])};
  });
  const mealDays = doc.mealDays || [];
  const expectedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (mealDays.length && (mealDays.length !== expectedDays.length || mealDays.some((day,i) => day.day !== expectedDays[i]))) throw Error('Weekly meal photos must be ordered Monday through Saturday');
  const renderedDays = mealDays.map(day => {
    if (!day.day || !day.alt) throw Error('Weekly meal photo is missing its day or description');
    return {day:day.day,image:asset(day.imageUrl,day.localImage,'images'),alt:day.image?.alt || day.alt};
  });
  const tabs = doc.items.map((item,i) => `<button id="tab-menu${i}" role="tab" aria-selected="${i === 0}" aria-controls="menu-panel" tabindex="${i ? -1 : 0}" data-menu="menu${i}">${escape(item.title)}</button>`).join('');
  html = replace(html, /<div class="menu-tabs[^>]*>[\s\S]*?<\/div>/, `<div class="menu-tabs reveal" role="tablist" aria-label="Sample menus">${tabs}</div>`);
  const first = menus.menu0;
  html = html.replace('aria-labelledby="tab-feast"', 'aria-labelledby="tab-menu0"');
  html = replace(html, /<img id="menu-image"[^>]*>/, `<img id="menu-image" src="${escape(first.image)}" alt="${escape(first.alt)}" loading="lazy">`);
  html = replace(html, /<p class="eyebrow" id="menu-eyebrow">[\s\S]*?<\/p>/, `<p class="eyebrow" id="menu-eyebrow">${escape(first.eyebrow)}</p>`);
  html = replace(html, /<h3 id="menu-title">[\s\S]*?<\/h3>/, `<h3 id="menu-title">${escape(first.title)}<br><em>${escape(first.accent)}</em></h3>`);
  html = replace(html, /<ul id="menu-dishes">[\s\S]*?<\/ul>/, `<ul id="menu-dishes">${first.dishes.map(([name,desc]) => `<li><b>${escape(name)}</b><span>${escape(desc)}</span></li>`).join('')}</ul>`);
  html = html.replace(/(id="menu-enquiry" data-enquiry=")[^"]*"/, `$1${escape(first.occasion)}"`);
  html = html.replace(/<script id="cms-menus" type="application\/json">[\s\S]*?<\/script>/g, '');
  return html.replace('</head>', `<script id="cms-menus" type="application/json">${json({menus,mealDays:renderedDays})}</script></head>`);
}
function renderMaterials(html, doc) {
  validate(doc,24,['title','description','enquiry','alt']);
  const cards = doc.items.map((item,i) => {
    if (!['structural','tubes','custom'].includes(item.enquiry)) throw Error('Invalid material enquiry');
    const availability = item.availability || 'Available';
    if (!['Available','Limited availability','Temporarily unavailable'].includes(availability)) throw Error('Invalid material availability');
    for (const date of [item.promoStart,item.promoEnd]) if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Invalid promotion date');
    if (item.promoStart && item.promoEnd && item.promoStart > item.promoEnd) throw Error('Promotion end date precedes its start date');
    const today = new Date().toISOString().slice(0,10);
    const promoActive = item.promo && (!item.promoStart || today >= item.promoStart) && (!item.promoEnd || today <= item.promoEnd);
    const label = promoActive ? item.promo : `MATERIAL / ${String(i+1).padStart(2,'0')}`;
    return `<article class="product"><div class="product-photo ${item.enquiry === 'tubes' ? 'tubes-photo' : item.enquiry === 'custom' ? 'fabrication-photo' : ''}"><img src="${escape(asset(item.imageUrl,item.localImage,'images'))}" alt="${escape(item.image?.alt || item.alt)}" width="1000" height="750" loading="lazy"><span class="photo-index">${escape(label)}</span></div><div class="product-heading"><h3>${escape(item.title)}</h3><span aria-hidden="true">↗</span></div><p>${escape(item.description)}</p><p class="availability">${escape(availability)}</p><a href="#quote" data-material="${item.enquiry}">Plan a material enquiry <span aria-hidden="true">→</span></a></article>`;
  }).join('\n');
  return replace(html, /<div class="product-grid">[\s\S]*?<\/div>(?=<div class="custom-enquiry-callout")/, `<div class="product-grid">${cards}</div>`);
}
function renderTracks(html, doc) {
  validate(doc,30,['title','artist','genre','tag']);
  const cards = doc.items.map((item,i) => {
    const id = `cms-track-${i}`, title = escape(item.title), artist = escape(item.artist);
    if (item.spotify && !/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/.test(item.spotify)) throw Error('Invalid Spotify track URL');
    const status = item.status || 'Available';
    if (!['Available','Upcoming','Archived'].includes(status)) throw Error('Invalid track status');
    if (item.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(item.releaseDate)) throw Error('Invalid track release date');
    const featured = item.featured === true;
    const tag = `${featured ? 'Featured · ' : ''}${status !== 'Available' ? `${status} · ` : ''}${item.tag}`;
    return `<article class="track" data-audio-track data-artist="${artist}" aria-labelledby="${id}-title">
      <button class="play" type="button" data-play aria-label="Play ${title} by ${artist}" aria-pressed="false" hidden><span aria-hidden="true">▶</span></button>
      <div class="track-title-group"><p class="track-title" id="${id}-title">${title}</p><small>${artist} · ${escape(item.genre)}${item.releaseDate ? ` · ${escape(item.releaseDate)}` : ''}</small></div><span class="tag">${escape(tag)}</span><span class="length" data-duration>—:—</span>
      <div class="track-transport"><audio class="track-audio" controls preload="metadata" aria-label="${title} by ${artist}"><source src="${escape(asset(item.audioUrl,item.localAudio,'files'))}" type="audio/mpeg"></audio>
      <div class="track-controls" hidden><label class="sr-only" for="seek-${id}">Seek within ${title}</label><input id="seek-${id}" class="track-seek" data-seek type="range" min="0" max="1000" step="1" value="0" aria-valuetext="0:00" disabled><div class="track-readout"><span data-time>0:00 / —:—</span><button class="audio-mute" data-mute type="button" aria-label="Mute ${title}" aria-pressed="false">Mute</button></div></div><p class="track-error" role="status" hidden></p>
      ${item.spotify ? `<a class="spotify-link" href="${escape(item.spotify)}" target="_blank" rel="noopener noreferrer" aria-label="Stream ${title} on Spotify (opens in a new tab)"><img src="assets/spotify-icon-white.svg" alt="" width="24" height="24"><span>Stream on Spotify</span><span aria-hidden="true">↗</span></a>` : ''}</div>
      ${item.note ? `<p class="sample-note">${escape(item.note)}</p>` : ''}</article>`;
  }).join('\n');
  return replace(html, /<div class="tracks">[\s\S]*?<\/div>\s*(?=<p class="notice")/, `<div class="tracks">${cards}</div>\n`);
}
function applyCatalogues(root, docs) {
  const renderers = {menuCatalogue:['catering',renderMenus],materialCatalogue:['rivet-beam',renderMaterials],trackCatalogue:['afterhours',renderTracks]};
  const outputs = [];
  for (const doc of docs || []) {
    if (!renderers[doc._type] || doc._id !== doc._type) throw Error('Unexpected catalogue document');
    const [folder,render] = renderers[doc._type];
    const file = path.join(root,'studio/projects',folder,'index.html');
    outputs.push([file,render(fs.readFileSync(file,'utf8'),doc)]);
  }
  outputs.forEach(([file,html]) => fs.writeFileSync(file,html));
}
module.exports = {renderMenus,renderMaterials,renderTracks,applyCatalogues};
