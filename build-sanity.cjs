// Apply published CMS content to the packaged static portfolio; no browser tokens or CORS needed.
const fs = require('node:fs');
const path = require('node:path');
const projectId = 'yjcpyptx';
const dataset = 'production';
const {applyCatalogues} = require('./catalogue-renderer.cjs');
const query = '{"homepage": *[_type == "homepage" && _id == "homepage"][0], "projects": *[_type == "project"] | order(order asc, _id asc){..., "imageUrl": image.asset->url}, "catalogues": *[_id in ["menuCatalogue", "materialCatalogue", "trackCatalogue"]]{..., "mealDays": mealDays[]{..., "imageUrl": image.asset->url}, items[]{..., "imageUrl": image.asset->url, "audioUrl": audio.asset->url, dishes[]{...}}}}';
const concepts = {
  catering: {style: 'catering', image: 'olive-and-ember', alt: 'Olive & Ember catering website concept'},
  'rivet-beam': {style: 'steel', image: 'rivet-and-beam', alt: 'Rivet & Beam steel website concept'},
  afterhours: {style: 'afterhours', image: 'afterhours', alt: 'AFTERHOURS music studio website concept'},
  'little-joy': {style: 'little-joy', image: 'little-joy', alt: 'Little Joy Play Co. soft-play hire website concept', caseStudy: true},
};
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
function required(document, fields) {
  for (const field of fields) {
    if (typeof document[field] !== 'string' || !document[field].trim()) {
      throw new Error(`Sanity ${document._id || document.title || 'document'}: missing ${field}`);
    }
  }
}
function renderProject(project, index) {
  required(project, ['title', 'concept', 'category', 'description', 'scope', 'idea', 'execution', 'disclaimer']);
  const concept = concepts[project.concept];
  if (!concept) throw new Error(`Unsupported concept page: ${project.concept}`);
  let image = `assets/${concept.image}-preview.png`;
  if (project.imageUrl) {
    const url = new URL(project.imageUrl);
    if (url.origin !== 'https://cdn.sanity.io' || !url.pathname.startsWith(`/images/${projectId}/${dataset}/`)) {
      throw new Error('Unexpected Sanity image URL');
    }
    url.search = 'w=1280&h=900&fit=crop&auto=format';
    image = url.href;
  }
  const href = `projects/${project.concept}/index.html`;
  const action = concept.caseStudy ? 'Read the case study' : 'Explore the concept';
  return `<article class="project${index % 2 ? ' project-reverse' : ''}"><a class="project-visual ${concept.style}-visual" href="${href}" aria-label="${escape(`Open ${project.title} concept`)}"><div class="browser-bar" aria-hidden="true"><span class="browser-dots">● ● ●</span><span>${escape(project.title.toUpperCase())} / CONCEPT PREVIEW</span><span>↗</span></div><img src="${escape(image)}" alt="${escape(project.image?.alt || concept.alt)}" width="1280" height="900"${index ? ' loading="lazy"' : ''}></a><div class="project-copy"><p class="project-number">${String(index + 1).padStart(2, '0')} / ${escape(project.category.toUpperCase())}</p><h3>${escape(project.title)}</h3><span class="concept-tag">${project.featured === true ? 'FEATURED PROJECT' : 'INDEPENDENT CONCEPT'}</span><p>${escape(project.description)}</p><p class="project-scope">${escape(project.scope)}</p><a class="text-link" href="${href}">${action} <span aria-hidden="true">↗</span></a><details class="case-study"><summary>Behind the design <span aria-hidden="true">+</span></summary><div><h4>The idea</h4><p>${escape(project.idea)}</p><h4>How it took shape</h4><p>${escape(project.execution)}</p><p class="case-note">${escape(project.disclaimer)}</p></div></details></div></article>`;
}
function applyContent(html, content) {
  if (content.homepage) {
    const home = content.homepage;
    required(home, ['heading', 'subheading', 'intro', 'seoTitle', 'seoDescription']);
    html = html.replace(/<h1 id="hero-title">[\s\S]*?<\/h1>/, `<h1 id="hero-title">${escape(home.heading)}<br><span>${escape(home.subheading)}</span></h1>`);
    html = html.replace(/(<div class="hero-bottom">[\s\S]*?<\/div><p>)[\s\S]*?(<\/p><\/div>)/, (_match, start, end) => start + escape(home.intro) + end);
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(home.seoTitle)}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(home.seoDescription)}">`);
  }
  if (content.projects?.length) {
    const used = new Set();
    for (const project of content.projects) {
      if (used.has(project.concept)) throw new Error(`Duplicate CMS concept: ${project.concept}`);
      used.add(project.concept);
    }
    const cards = content.projects.filter(project => project.visible !== false).map(renderProject).join('\n      ');
    const pattern = /(<section id="work"[\s\S]*?<\/h2><\/div><p>[\s\S]*?<\/p><\/div>)\s*[\s\S]*?(\s*<\/section>)/;
    if (!pattern.test(html)) throw new Error('Portfolio work section markup changed; update the CMS renderer.');
    html = html.replace(pattern, (_match, heading, end) => `${heading}\n      ${cards}${end}`);
  }
  return html;
}
async function main() {
  if (process.argv.includes('--offline')) {
    console.log('Sanity: offline build requested; using checked-in portfolio content.');
    return;
  }
  const endpoint = new URL(`https://${projectId}.api.sanity.io/v2026-10-01/data/query/${dataset}`);
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('perspective', 'published');
  const response = await fetch(endpoint, {signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`Sanity content fetch failed (${response.status}). Check dataset access, or use --offline for local builds.`);
  const {result} = await response.json();
  if (!result || !Array.isArray(result.projects)) throw new Error('Unexpected Sanity response.');
  const filename = path.join(__dirname, '_site-video/studio/index.html');
  const html = fs.readFileSync(filename, 'utf8');
  fs.writeFileSync(filename, applyContent(html, result));
  applyCatalogues(path.join(__dirname, '_site-video'), result.catalogues);
  console.log(`Sanity: ${(result.catalogues || []).length} published catalogues.`);
  console.log(`Sanity: ${result.homepage ? 'homepage' : 'default homepage'}, ${result.projects.length} published projects${result.projects.length ? '' : ' (using checked-in project cards)'}.`);
}
module.exports = {applyContent, renderProject};
if (require.main === module) main().catch((error) => {console.error(error.message); process.exitCode = 1;});
