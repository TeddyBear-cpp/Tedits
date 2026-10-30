// Add the independent Studio homepage and its concept pages to Pages.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const {output: out} = require('./build-paths.cjs');
if (!fs.existsSync(path.join(out, 'index.html'))) throw new Error('Run build-video.cjs first');
const files = [
  'studio/index.html', 'studio/why-teditstudio.html', 'studio/enquire.html',
  'studio/studio-services.css', 'studio/enquiry.js',
  'studio/studio-contact.css', 'studio/studio-contact.js',
  'studio/studio-rounded.css', 'studio/studio-clouds.js', 'studio/studio-navigation.js',
  'studio/studio-story.css', 'studio/studio-story-stack.css', 'studio/studio-story-stack.js',
  'studio/studio-ui.css', 'studio/studio-ui.js', 'studio/studio-enquiry.css',
  'studio/studio.css', 'studio/studio-motion.css',
  'studio/studio-theme.css', 'studio/studio-theme.js', 'studio/studio-hero.css',
  'studio/projects/catering/index.html', 'studio/projects/catering/style.css',
  'studio/projects/catering/finish.css', 'studio/projects/catering/fonts.css', 'studio/projects/catering/script.js',
  'studio/projects/rivet-beam/index.html', 'studio/projects/rivet-beam/concept.css', 'studio/projects/rivet-beam/concept.js',
  'studio/projects/afterhours/index.html', 'studio/projects/afterhours/afterhours-audio.css', 'studio/projects/afterhours/afterhours-audio.js'
];
// Lossless originals remain available to local design previews. Public pages
// and the CMS renderer use the smaller WebP derivatives.
const designOnlyAssets = new Set([
  'studio/assets/olive-and-ember-preview.png',
  'studio/assets/rivet-and-beam-preview.png',
  'studio/assets/little-joy-preview.png',
  'studio/assets/afterhours-preview.png',
  'studio/assets/tedeats-preview.png',
]);
function collectAssets(folder) {
  for (const entry of fs.readdirSync(path.join(root,folder), {withFileTypes:true})) {
    const relative = `${folder}/${entry.name}`;
    if (designOnlyAssets.has(relative)) continue;
    if (entry.isDirectory()) collectAssets(relative);
    else if (/\.(svg|png|jpe?g|webp|ttf|otf|mp3|mp4|ico)$|(?:OFL|LICENSE)\.txt$/i.test(entry.name)) files.push(relative);
  }
}
for (const folder of ['studio/assets','studio/projects/catering/assets','studio/projects/rivet-beam/concept-assets','studio/projects/afterhours/assets']) collectAssets(folder);
// Complete static concepts include their own page, styles, scripts and assets.
function collectLittleJoy(folder) {
  for (const entry of fs.readdirSync(path.join(root, folder), {withFileTypes:true})) {
    const relative = `${folder}/${entry.name}`;
    if (entry.isDirectory()) collectLittleJoy(relative);
    else if (/\.(html|css|js|svg|png|jpe?g|webp|ttf|otf|ico)$|(?:OFL|LICENSE)\.txt$/i.test(entry.name)) files.push(relative);
  }
}
collectLittleJoy('studio/projects/little-joy');
collectLittleJoy('studio/projects/tedeats');
for (const file of files) {
  const destination = path.join(out,file);
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  fs.copyFileSync(path.join(root,file),destination);
}
const studioUrl = 'https://teddybear-cpp.github.io/Tedits/studio/';
const studioIndex = path.join(out,'studio/index.html');
let html = fs.readFileSync(studioIndex,'utf8');
html = html.replace('<meta name="robots" content="noindex">', `<link rel="canonical" href="${studioUrl}">`);
html = html.replace(/<script>if\(location\.hash\.startsWith\('#figmacapture='\)\)[\s\S]*?<\/script>/, '');
if (/figmacapture|noindex/.test(html)) throw new Error('Studio preview configuration remains');
fs.writeFileSync(studioIndex,html);
// The legacy Why URL stays a redirect with the homepage as its canonical URL.
for (const page of ['enquire.html']) {
  const filename = path.join(out, 'studio', page);
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace('<meta name="robots" content="noindex">', `<link rel="canonical" href="${studioUrl}${page}">`);
  if (content.includes('name="robots" content="noindex"')) throw new Error(`Studio ${page} retains preview noindex`);
  fs.writeFileSync(filename, content);
}
// Concepts stay accessible from the portfolio without posing as real businesses in search.
for (const concept of ['catering','rivet-beam','afterhours','tedeats']) {
  const filename = path.join(out,`studio/projects/${concept}/index.html`);
  let page = fs.readFileSync(filename,'utf8');
  if (!page.includes('name="robots"')) page = page.replace('</head>','<meta name="robots" content="noindex">\n</head>');
  fs.writeFileSync(filename,page);
}
for (const relative of files.filter(file => file.startsWith('studio/projects/little-joy/') && file.endsWith('.html'))) {
  const filename = path.join(out, relative);
  let page = fs.readFileSync(filename, 'utf8');
  if (!page.includes('name="robots"')) page = page.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  fs.writeFileSync(filename, page);
}
const videoIndex = path.join(out,'index.html');
const video = fs.readFileSync(videoIndex,'utf8').replace('href="mailto:teditstudiozm@gmail.com?subject=Web%20design%20enquiry">Ask about web design','href="studio/index.html">Explore Tedits Studio');
fs.writeFileSync(videoIndex,video);
const sitemapFile = path.join(out,'sitemap.xml');
fs.writeFileSync(sitemapFile,fs.readFileSync(sitemapFile,'utf8').replace('</urlset>',`<url><loc>${studioUrl}</loc></url><url><loc>${studioUrl}enquire.html</loc></url></urlset>`));
// The same validation also runs after CMS rendering.
require('./validate-output.cjs').validateOutput(out);
console.log(`Added ${files.length} Studio files. All packaged HTML/CSS references resolve.`);
