// Add the independent Studio homepage and its three concept pages to Pages.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, '_site-video');
if (!fs.existsSync(path.join(out, 'index.html'))) throw new Error('Run build-video.cjs first');
const files = [
  'studio/index.html', 'studio/studio.css', 'studio/studio.js', 'studio/studio-motion.css',
  'studio/studio-theme.css', 'studio/studio-theme.js', 'studio/studio-hero.css', 'studio/studio-hero.js',
  'studio/projects/catering/index.html', 'studio/projects/catering/style.css',
  'studio/projects/catering/finish.css', 'studio/projects/catering/fonts.css', 'studio/projects/catering/script.js',
  'studio/projects/rivet-beam/index.html', 'studio/projects/rivet-beam/concept.css', 'studio/projects/rivet-beam/concept.js',
  'studio/projects/afterhours/index.html', 'studio/projects/afterhours/afterhours-audio.css', 'studio/projects/afterhours/afterhours-audio.js'
];
function collectAssets(folder) {
  for (const entry of fs.readdirSync(path.join(root,folder), {withFileTypes:true})) {
    const relative = `${folder}/${entry.name}`;
    if (entry.isDirectory()) collectAssets(relative);
    else if (/\.(svg|png|jpe?g|webp|ttf|otf|mp3|ico)$|(?:OFL|LICENSE)\.txt$/i.test(entry.name)) files.push(relative);
  }
}
for (const folder of ['studio/assets','studio/projects/catering/assets','studio/projects/rivet-beam/concept-assets','studio/projects/afterhours/assets']) collectAssets(folder);
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
// Concepts stay accessible from the portfolio without posing as real businesses in search.
for (const concept of ['catering','rivet-beam','afterhours']) {
  const filename = path.join(out,`studio/projects/${concept}/index.html`);
  let page = fs.readFileSync(filename,'utf8');
  if (!page.includes('name="robots"')) page = page.replace('</head>','<meta name="robots" content="noindex">\n</head>');
  fs.writeFileSync(filename,page);
}
const videoIndex = path.join(out,'index.html');
const video = fs.readFileSync(videoIndex,'utf8').replace('href="mailto:teditstudiozm@gmail.com?subject=Web%20design%20enquiry">Ask about web design','href="studio/index.html">Explore Tedits Studio');
fs.writeFileSync(videoIndex,video);
const sitemapFile = path.join(out,'sitemap.xml');
fs.writeFileSync(sitemapFile,fs.readFileSync(sitemapFile,'utf8').replace('</urlset>',`<url><loc>${studioUrl}</loc></url></urlset>`));
// Validate local HTML/CSS references, including case on case-insensitive Windows.
const allFiles = [];
function list(folder) {for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {const name=path.join(folder,entry.name);if(entry.isDirectory())list(name);else allFiles.push(path.relative(out,name).replaceAll('\\','/'));}}
list(out);
for (const file of allFiles.filter(f=>/\.(html|css)$/.test(f))) {
  const text=fs.readFileSync(path.join(out,file),'utf8');
  const references=[...text.matchAll(/(?:src|href)="([^"]+)"|url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]||m[2]);
  for(const ref of references) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(ref)) continue;
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),decodeURIComponent(ref.split(/[?#]/)[0])));
    if(!allFiles.includes(resolved)) throw new Error(`Missing asset or filename case mismatch: ${file} -> ${ref}`);
  }
}
console.log(`Added ${files.length} Studio files. All packaged HTML/CSS references resolve.`);
