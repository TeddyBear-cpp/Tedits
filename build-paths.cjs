const path = require('node:path');
// Allow verification in a fresh directory without replacing an existing build.
const output = path.resolve(__dirname, process.env.TEDITS_BUILD_DIR || '_site-video');
const relative = path.relative(__dirname, output);
if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
  throw new Error('Build output must be a child directory of this workspace.');
}
module.exports = {output};
