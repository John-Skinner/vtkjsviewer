const SeriesLoader = require('./seriesLoader.js');
const {printMat} = require('./math')
test('constructor', async () =>
{
  let sl = new SeriesLoader();
  await sl.loadDirectory('/Users/johnskinner/DICOMImages/25/11-SPGR');
  sl.presortImages();
  if (sl.loadErrorOccured)
  {
    expect(false).toBeTrue();
    return;
  }
  let IJK2LPS = sl.IJKToLPS;
  printMat(IJK2LPS, 'IJK2LPS');

})
