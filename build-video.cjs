// Publish only the independent video site, never the local Studio collection.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, '_site-video');
if (fs.existsSync(out) && fs.readdirSync(out).length) {
  throw new Error('_site-video must be empty before building; use a fresh checkout for deployment.');
}
fs.mkdirSync(out, {recursive: true});
const files = [
  'index.html', 'video-preview.css', 'video-player.css', 'video-preview.js', 'contact.js',
  'site-loader.css', 'site-loader.js',
  'smooth-scroll.css', 'smooth-scroll.js',
  'vendor/lenis/lenis-1.3.27.min.js', 'vendor/lenis/LICENSE.txt',
  'section-navigation.js',
  'Assets/tedits-bear-favicon-32.png',
  'Assets/tedits-brand/tedits-logo.svg', 'Assets/tedits-brand/tedits-logo-on-dark.svg',
  'Assets/tedits-brand/DM-Sans-Regular.ttf', 'Assets/tedits-brand/DM-Sans-Semibold.ttf',
  'Assets/tedits-brand/DM-Sans-OFL.txt',
  'Assets/tedits-brand/Syne-Medium.ttf', 'Assets/tedits-brand/Syne-Semibold.ttf',
  'Assets/tedits-brand/Syne-Bold.ttf', 'Assets/tedits-brand/Syne-OFL.txt',
  'Assets/video-posters/teditstudio-launch.webp', 'Assets/video-posters/violet-light.webp',
  'Assets/video-posters/delta-force.webp', 'Assets/video-posters/20min-edit.webp',
  'Assets/video-posters/the-lead.webp', 'Assets/video-posters/spiderman-superman.webp',
  'videos/teditstudio-launch.mp4', 'videos/Violet-light-edit.mp4', 'videos/Delta-Force-Edit.mp4', 'videos/20min-edit.mp4',
  'videos/The_lead-prodbyTeddBear-Trimed.mp4', 'videos/Spiderman-Superman.mp4'
];
for (const file of files) {
  const destination = path.join(out, file);
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.copyFileSync(path.join(root, file), destination);
}
const siteUrl = 'https://teddybear-cpp.github.io/Tedits/';
let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
html = html.replace('  <meta name="robots" content="noindex">', `  <link rel="canonical" href="${siteUrl}">`);
// Restore the portfolio URL when that separate website has been deployed.
html = html.replace('href="studio/index.html">Explore Tedits Studio', 'href="mailto:teditstudiozm@gmail.com?subject=Web%20design%20enquiry">Ask about web design');
if (/noindex|href="studio\//.test(html)) throw new Error('Unpublished preview details remain');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
console.log(`Built ${files.length + 3} video-site files in ${out}`);
