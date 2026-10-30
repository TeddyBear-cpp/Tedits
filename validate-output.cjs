const fs = require('node:fs');
const path = require('node:path');

function validateOutput(root) {
  const files = new Set();
  function walk(folder) {
    for (const entry of fs.readdirSync(folder, {withFileTypes: true})) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(file);
      else files.add(path.relative(root, file).replaceAll('\\', '/'));
    }
  }
  walk(root);
  for (const file of files) {
    if (!/\.(html|css)$/.test(file)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const references = [...text.matchAll(/(?:src|href|poster)=["']([^"']+)["']|url\(["']?([^)'"\s]+)["']?\)/g)].map(m => m[1] || m[2]);
    for (const ref of references) {
      if (/^(?:[a-z]+:|\/\/|#)/i.test(ref)) continue;
      const pathname = decodeURIComponent(ref.split(/[?#]/)[0]);
      const resolved = pathname.startsWith('/') ? pathname.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname));
      if (!files.has(resolved)) throw new Error(`Missing asset or filename case mismatch: ${file} -> ${ref}`);
    }
  }
  return files.size;
}
module.exports = {validateOutput};
if (require.main === module) {
  const {output} = require('./build-paths.cjs');
  console.log(`Validated ${validateOutput(output)} packaged files.`);
}
