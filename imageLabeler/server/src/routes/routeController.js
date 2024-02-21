const {promisify} = require('util');
const areaddir=promisify(require('fs').readdir);
const SeriesLoader = require('../app/utilities/seriesLoader')

class VolumeCacheItem {
  /**
   *
   * @param {SeriesLoader} loader
   */
  constructor(loader)
  {
    this.createTime = Date.now();
    /**
     *
     * @type {SeriesLoader }
     */
    this.series = loader;
  }
}
function volumeNameFor(exam,series) {
  return exam + '/' + series;
}

var volumeCache = new Map();


const KoaRouter = require('@koa/router');
let rootImagesDir="/serverRoot/vtkjsLabeler/DICOMImages";
routerOpts = {
  prefix:'/images'
};
const router = new KoaRouter(routerOpts);

router.get('/',async (ctx)=> {
  console.log('try reading subdir');

  let returnExams = [];
  let dirs = await areaddir(rootImagesDir);
  dirs.forEach((dir)=>{
    returnExams.push(dir);
  })

ctx.body = {
  exams:returnExams
}

});
router.get('/e:examid',async (ctx)=> {
  let returnSeries=[];
  let seriesPath=rootImagesDir + '/' + ctx.params.examid;
  let dirs = await areaddir(seriesPath);
  dirs.forEach((dir)=>{
    returnSeries.push(dir);
  })

  ctx.body = {
    exam:ctx.params.examid,
    series:returnSeries
  }
  console.log(`get exam:${ctx.params.examid}`)
});
router.get('/e:examid/s:seriesid',async(ctx)=> {
  console.log(`get series ${ctx.params.examid} ${ctx.params.seriesid}`);
  let seriesPath = rootImagesDir  + '/' + ctx.params.examid  + '/'  + ctx.params.seriesid;
  let mySeriesLoader = new SeriesLoader();
  await mySeriesLoader.loadDirectory(seriesPath);
  mySeriesLoader.presortImages();
  if (mySeriesLoader.loadErrorOccured) {
    ctx.body  = 'Error Loading Series';
    return;
  }
  let cacheItem = new VolumeCacheItem(mySeriesLoader);

  let volumeName = volumeNameFor(ctx.params.examid,ctx.params.seriesid);
  volumeCache.set(volumeName,cacheItem);
  console.log(`volume cache add:${volumeName}`);
  let transform  = mySeriesLoader.IJKToLPS;
  let volume = mySeriesLoader.dicomGroups[0];
  let numImages = volume.images.length;
  // must match VolumeAPI in ExamSeriesLoaderService
  ctx.body = {
    exam:ctx.params.examid,
    series:ctx.params.seriesid,
    transform: transform,
    ijkDimension:[volume.repImage.dimensions[0],
    volume.repImage.dimensions[1],numImages]
  };
});
router.get('/e:examid/s:seriesid/i:imageid',async(ctx)=> {
  console.log(`get image ${ctx.params.examid} ${ctx.params.seriesid} ${ctx.params.imageid}`);
  let examSeriesKey=volumeNameFor(ctx.params.examid,ctx.params.seriesid);
  console.log(`getting volume for ${examSeriesKey}`);
  if (volumeCache.has(examSeriesKey)) {
    let cacheItem = volumeCache.get(examSeriesKey);
    let seriesLoader = cacheItem.series;
    let volume0 = seriesLoader.dicomGroups[0];
    let imageNumber = Number(ctx.params.imageid);
    if (imageNumber >= volume0.images.length) {
      console.error(`Invalid image request ${imageNumber} from series of ${volume0.images.length}`);
      return;
    }
    let imageLoader = volume0.images[imageNumber];

    // must match interface VolumeSlice in VolumeLoaderService
    ctx.body = {
      exam:ctx.params.examid,
      series:ctx.params.seriesid,
      image:ctx.params.imageid,
      pixels:imageLoader.pixelsCoded
    }


  }
  else {
    console.log(`Error, must have previously done get /images/e:examid/s:seriesid for ${examSeriesKey}`);
  }




})

module.exports = router;
