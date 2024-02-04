
const SeriesLoader = require("./seriesLoader");
const VolumeGroup = require("./volumeGroup");
const Vec3 = require('gl-matrix/cjs/vec3');

test('VolumeGroup',async ()=> {
  let vg = new VolumeGroup();
  vg.initializeWithImage(this.dicom);
  vg.prep3dParameters();
  let transform = vb.IJKToLPS;
  let originIJK = Vec3.fromValues(0,0,0);
  let firstSlice = vg.images[0];
  let farIJK=Vec3.fromValues(firstSlice.dimensions[0]-1,firstSlice.dimensions[1]-1,vg.images.length-1);
  let originLPS = Vec3.create();
  let farLPS = Vec3.create();
  Vec3.transformMat4(originLPS,originIJK,transform);
  Vec3.transformMat4(farLPS,farIJK,transform);
})
