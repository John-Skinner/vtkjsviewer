const ImageLoader = require('./imageLoader.js');
test('constructor',async ()=> {
  let il = new ImageLoader();
  await il.loadFile('/tmp/i.ima');
})

