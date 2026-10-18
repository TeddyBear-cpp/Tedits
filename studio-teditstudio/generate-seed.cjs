// Copy the existing public portfolio copy into importable Sanity documents.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../studio/index.html'), 'utf8');
const unescape = (text) => text.replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/g, (entity) => ({'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' '}[entity]));
const clean = (text) => unescape(text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
function extract(html, pattern, label) {
  const match = html.match(pattern);
  if (!match) throw new Error(`Could not find ${label} in current portfolio HTML`);
  return clean(match[1]);
}
const home = {
  _id: 'homepage', _type: 'homepage',
  heading: extract(source, /<h1 id="hero-title">([^<]*)/, 'hero heading'),
  subheading: extract(source, /<h1 id="hero-title">[\s\S]*?<span>([\s\S]*?)<\/span>/, 'hero second line'),
  intro: extract(source, /<div class="hero-bottom">[\s\S]*?<\/div><p>([\s\S]*?)<\/p><\/div>/, 'hero introduction'),
  seoTitle: extract(source, /<title>([\s\S]*?)<\/title>/, 'page title'),
  seoDescription: extract(source, /<meta name="description" content="([^"]*)">/, 'page description'),
};
const slugs = ['catering', 'rivet-beam', 'afterhours'];
const articles = [...source.matchAll(/<article class="project(?: project-reverse)?">([\s\S]*?)<\/article>/g)];
if (articles.length !== slugs.length) throw new Error('Portfolio project count changed; review seed generation.');
const projects = articles.map((match, index) => {
  const html = match[1];
  const concept = slugs[index];
  if (!html.includes(`projects/${concept}/index.html`)) throw new Error(`Project order changed at ${concept}`);
  return {
    _id: `project-${concept}`, _type: 'project', concept, order: index + 1, visible: true, featured: false,
    title: extract(html, /<h3>([\s\S]*?)<\/h3>/, `${concept} title`),
    category: extract(html, /<p class="project-number">\d+ \/ ([\s\S]*?)<\/p>/, `${concept} category`),
    description: extract(html, /<span class="concept-tag">[\s\S]*?<\/span><p>([\s\S]*?)<\/p>/, `${concept} description`),
    scope: extract(html, /<p class="project-scope">([\s\S]*?)<\/p>/, `${concept} scope`),
    idea: extract(html, /<h4>The idea<\/h4><p>([\s\S]*?)<\/p>/, `${concept} idea`),
    execution: extract(html, /<h4>How it took shape<\/h4><p>([\s\S]*?)<\/p>/, `${concept} execution`),
    disclaimer: extract(html, /<p class="case-note">([\s\S]*?)<\/p>/, `${concept} disclosure`),
  };
});
const filename = path.join(__dirname, 'seed.ndjson');
fs.writeFileSync(filename, [...[home, ...projects].map((item) => JSON.stringify(item)), ''].join('\n'));
console.log(`Created ${path.basename(filename)} with ${projects.length} existing projects and the homepage.`);
