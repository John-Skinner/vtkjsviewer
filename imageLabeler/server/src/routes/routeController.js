const Koa = require('koa');
const fs = require('fs');
const {promisify} = require('util');
const path = require('node:path');
const areaddir=promisify(require('fs').readdir);
const SeriesLoader = require('../app/utilities/seriesLoader')
let mySeriesLoader = new SeriesLoader();


const KoaRouter = require('@koa/router');
let rootImagesDir="/Users/johnskinner/DICOMImages";
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

  await mySeriesLoader.loadDirectory(seriesPath);
  mySeriesLoader.presortImages();
  if (mySeriesLoader.loadErrorOccured) {
    ctx.body  = 'Error Loading Series';
    return;
  }
  let transform  = mySeriesLoader.IJKToLPS;
  let volume = mySeriesLoader.dicomGroups[0];
  let numImages = volume.images.length;
  ctx.body = {
    transform: transform,
    ijkDimension:[volume.repImage.dimensions[0],
    volume.repImage.dimensions[1],numImages]
  };
});

module.exports = router;
