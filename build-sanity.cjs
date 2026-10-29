// Apply published CMS content to the packaged static portfolio; no browser tokens or CORS needed.
const fs = require('node:fs');
const path = require('node:path');
const projectId = 'yjcpyptx';
const dataset = 'production';
const {applyCatalogues} = require('./catalogue-renderer.cjs');
const {applyServicePages} = require('./service-page-renderer.cjs');
const query = '{"homepage": *[_type == "homepage" && _id == "homepage"][0], "whyPage": *[_type == "whyPage" && _id == "whyPage"][0], "enquiryPage": *[_type == "enquiryPage" && _id == "enquiryPage"][0], "projects": *[_type == "project"] | order(order asc, _id asc){..., "imageUrl": image.asset->url}, "catalogues": *[_id in ["menuCatalogue", "materialCatalogue", "trackCatalogue"]]{..., "mealDays": mealDays[]{..., "imageUrl": image.asset->url}, items[]{..., "imageUrl": image.asset->url, "audioUrl": audio.asset->url, dishes[]{...}}}}';
const concepts = {
  catering: {style: 'catering', image: 'olive-and-ember', alt: 'Olive & Ember catering website concept'},
  'rivet-beam': {style: 'steel', image: 'rivet-and-beam', alt: 'Rivet & Beam steel website concept'},
  afterhours: {style: 'afterhours', image: 'afterhours', alt: 'AFTERHOURS music studio website concept', compactDescription: 'Music, mood & interaction'},
  'little-joy': {style: 'little-joy', image: 'little-joy', alt: 'Little Joy Play Co. soft-play hire website concept', caseStudy: true, compactDescription: 'A gentler way to plan a party'},
  tedeats: {style: 'tedeats', image: 'tedeats', localImage: 'projects/tedeats/assets/dinner-alt-1.jpg', alt: 'Friends sharing dinner in the Tedeats Events concept'},
};
const projectSeeds = Object.fromEntries(fs.readFileSync(path.join(__dirname, 'studio-teditstudio/seed.ndjson'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).filter(doc => doc._type === 'project').map(doc => [doc.concept, doc]));
const storyDescriptions = {
  catering: 'Help someone picture their occasion, explore the menus, and start a conversation. A warm catering concept built around those decisions.',
  'rivet-beam': 'Give experienced buyers a clear catalogue, and people with a new idea a comfortable way to explain it. Two starting points, one industrial concept.',
  tedeats: 'Make the invitation part of the experience. An events concept that introduces its personality through an unfolding letter and a guided planning journey.',
};
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
function required(document, fields) {
  for (const field of fields) {
    if (typeof document[field] !== 'string' || !document[field].trim()) {
      throw new Error(`Sanity ${document._id || document.title || 'document'}: missing ${field}`);
    }
  }
}
function projectImage(project) {
  const concept = concepts[project.concept];
  if (!concept) throw new Error(`Unsupported concept page: ${project.concept}`);
  let image = concept.localImage || `assets/${concept.image}-preview.png`;
  if (project.imageUrl) {
    const url = new URL(project.imageUrl);
    if (url.origin !== 'https://cdn.sanity.io' || !url.pathname.startsWith(`/images/${projectId}/${dataset}/`)) {
      throw new Error('Unexpected Sanity image URL');
    }
    url.search = 'w=1280&h=900&fit=crop&auto=format';
    image = url.href;
  }
  return image;
}
function renderProject(project, index, {story = false} = {}) {
  required(project, ['title', 'concept', 'category', 'description', 'scope', 'idea', 'execution', 'disclaimer']);
  const concept = concepts[project.concept];
  const image = projectImage(project);
  const href = `projects/${project.concept}/index.html`;
  const action = concept.caseStudy ? 'Read the case study' : 'Explore the concept';
  return `<article class="${story ? 'story-reveal ' : ''}project${index % 2 ? ' project-reverse' : ''}"><a class="project-visual ${concept.style}-visual" href="${href}" aria-label="${escape(`Open ${project.title} concept`)}"><div class="browser-bar" aria-hidden="true"><span class="browser-dots">● ● ●</span><span>${escape(project.title.toUpperCase())} / CONCEPT PREVIEW</span><span>↗</span></div><img src="${escape(image)}" alt="${escape(project.image?.alt || concept.alt)}" width="1280" height="900" loading="lazy"></a><div class="project-copy"><p class="project-number">${String(index + 1).padStart(2, '0')} / ${escape(project.category.toUpperCase())}</p><h3>${escape(project.title)}</h3><span class="concept-tag">${!story && project.featured === true ? 'FEATURED PROJECT' : 'INDEPENDENT CONCEPT'}</span><p>${escape(project.description)}</p><p class="project-scope">${escape(project.scope)}</p><a class="text-link" href="${href}">${action} <span aria-hidden="true">↗</span></a><details class="case-study"><summary>Behind the design <span aria-hidden="true">+</span></summary><div><h4>The idea</h4><p>${escape(project.idea)}</p><h4>How it took shape</h4><p>${escape(project.execution)}</p><p class="case-note">${escape(project.disclaimer)}</p></div></details></div></article>`;
}
function migrateProject(project, story) {
  const stale = project.concept === 'tedeats' && /AI-generated imagery|seal tracing|printed seal/i
    .test([project.description, project.execution, project.disclaimer].join(' '));
  if (stale) project = {...project, description: projectSeeds.tedeats.description,
    execution: projectSeeds.tedeats.execution, disclaimer: projectSeeds.tedeats.disclaimer};
  // Keep the new purpose-led copy when the CMS still holds the old seed defaults.
  if (story && storyDescriptions[project.concept] && project.description === projectSeeds[project.concept]?.description) {
    project = {...project, description: storyDescriptions[project.concept]};
  }
  return project;
}
function renderCompactProject(project) {
  required(project, ['title', 'concept']);
  const image = projectImage(project);
  const concept = concepts[project.concept];
  return `<a class="story-reveal" href="projects/${project.concept}/index.html" aria-label="${escape(project.title + ' — independent concept')}"><img src="${escape(image)}" alt="${escape(project.image?.alt || concept.alt)}" width="1280" height="900" loading="lazy"><span><strong>${escape(project.title)}</strong><small>${escape(concept.compactDescription || project.category)}</small></span><span aria-hidden="true">↗</span></a>`;
}
function applySelectedProjects(html, projects) {
  const visible = new Map(projects.filter(project => project.visible !== false).map(project => [project.concept, migrateProject(project, true)]));
  const selected = ['catering', 'rivet-beam', 'tedeats'].map(concept => visible.get(concept)).filter(Boolean);
  const compact = ['afterhours', 'little-joy'].map(concept => visible.get(concept)).filter(Boolean);
  const pattern = /(<section id="work"[^>]*>\s*<div class="section-heading[^>]*>[\s\S]*?<\/div>)\s*[\s\S]*?(\s*<\/section>)/;
  if (!pattern.test(html)) throw new Error('Selected work section markup changed; update the CMS renderer.');
  html = html.replace(pattern, (_match, heading, end) => {
    const intro = selected.length === 3 ? 'Three independent concepts.' : selected.length === 1 ? 'One independent concept.' : selected.length === 2 ? 'Two independent concepts.' : 'New concepts are taking shape.';
    heading = heading.replace(/(<p>)[\s\S]*?(<br>)/, (_text, start, br) => start + intro + br);
    return `${heading}\n${selected.map((project, index) => renderProject(project, index, {story: true})).join('\n')}${end}`;
  });
  const extraPattern = /(<section class="wrap more-work"[^>]*>[\s\S]*?<div class="more-work-links">)[\s\S]*?(<\/div><\/section>)/;
  if (!extraPattern.test(html)) throw new Error('More work section markup changed; update the CMS renderer.');
  return html.replace(extraPattern, (_match, start, end) => compact.length
    ? `${start}\n${compact.map(renderCompactProject).join('\n')}\n${end}` : '');
}
function applyContent(html, content) {
  if (content.homepage) {
    const home = content.homepage;
    required(home, ['heading', 'subheading', 'intro', 'seoTitle', 'seoDescription']);
    // Migrate the previous default copy without changing custom CMS headlines.
    const legacyHero = html.includes('id="cloud-scene"') && home.heading === 'Thoughtful websites.' && ['Designed for your business.', 'Distinctly your business.'].includes(home.subheading);
    const heading = legacyHero ? 'Design that' : home.heading;
    const subheading = legacyHero ? 'connects.' : home.subheading;
    html = html.replace(/<h1 id="hero-title">[\s\S]*?<\/h1>/, `<h1 id="hero-title">${escape(heading)}<br><span>${escape(subheading)}</span></h1>`);
    html = html.replace(/(<div class="cloud-copy">[\s\S]*?<\/h1><p>)[\s\S]*?(<\/p>)/, (_match, start, end) => start + escape(legacyHero ? 'Thoughtful websites, shaped around you.' : home.intro) + end);
    html = html.replace(/(<div class="hero-bottom">[\s\S]*?<\/div><p>)[\s\S]*?(<\/p><\/div>)/, (_match, start, end) => start + escape(home.intro) + end);
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(home.seoTitle)}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(home.seoDescription)}">`);
  }
  if (content.projects?.length) {
    const used = new Set();
    for (const project of content.projects) {
      if (used.has(project.concept)) throw new Error(`Duplicate CMS concept: ${project.concept}`);
      used.add(project.concept);
      if (!concepts[project.concept]) throw new Error(`Unsupported concept page: ${project.concept}`);
    }
    if (html.includes('class="wrap more-work"')) return applySelectedProjects(html, content.projects);
    const cards = content.projects.filter(project => project.visible !== false)
      .map((project, index) => renderProject(migrateProject(project, false), index)).join('\n      ');
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
  applyServicePages(path.join(__dirname, '_site-video'), result);
  console.log(`Sanity: ${(result.catalogues || []).length} published catalogues.`);
  console.log(`Sanity: ${result.homepage ? 'homepage' : 'default homepage'}, ${result.projects.length} published projects${result.projects.length ? '' : ' (using checked-in project cards)'}.`);
}
module.exports = {applyContent, renderProject};
if (require.main === module) main().catch((error) => {console.error(error.message); process.exitCode = 1;});
