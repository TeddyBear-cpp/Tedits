const {createPreviewServer} = require('../preview-server.cjs');
createPreviewServer().listen(8086, '127.0.0.1', () => {
  console.log('Cloud parallax: http://127.0.0.1:8086/hero-parallax/index.html');
});
