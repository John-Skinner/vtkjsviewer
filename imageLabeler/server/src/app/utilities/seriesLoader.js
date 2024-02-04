const fs=require('fs');
const {promisify}=require('util');
const ImageLoader=require('./imageLoader');
const VolumeGroup = require("./volumeGroup");
const Mat4 = require('gl-matrix/cjs/mat4')


const areaddir=promisify(require('fs').readdir);

/**
 * SeriesLoader examines all the DICOM part 10 files within a directory
 * and sorts them into a 3D volume and the transform matrix for it.
 * Future:  Currently only supports the case where the directory contains
 * slices only for one 3D volume.  There are some future support for
 * directories that contain multiple volumes.  The VolumeGroup will play
 * a role in that extension.
 */
class SeriesLoader {
  constructor()
  {
    /**
     * @type {ImageLoader[]}
     */
    this.dicomFiles=[];
    this.dicomGroups = []
    this.loadErrorOccured = false;
    this.IJKToLPS = Mat4.create();
  }
  async loadDirectory(directory)
  {


    let dirents = await areaddir(directory,{withFileTypes:true});
    console.log(`Processing ${dirents.length} files`);
    try
    {
      dirents.forEach((dirent) =>
      {
        if (dirent.isFile())
        {
          let dicomFile = dirent.path + '/' + dirent.name;
          let image = new ImageLoader();
          image.loadFile(dicomFile);
          this.dicomFiles.push(image);
        } else
        {
          console.log(`isDirectory(${dirent.name()})`)
        }
      },this)
    }
    catch(err) {
      console.error(`Error in reading series:${err}`);
    }

  }

  /**
   *
   * @param {ImageLoader} image1
   * @param {ImageLoader} image2
   */
  ordering(image1,image2) {
    let found2IsGreater = image1.geoSortKeys.some((image1key,i)=>{
      return image1key < image2.geoSortKeys[i];
    });
    if (!found2IsGreater) {
      return -1;
    }
    return 1;
  }

  presortImages() {
    let initialRefImage = this.dicomFiles[0];
    let currentVolumeGroup = new VolumeGroup();
    currentVolumeGroup.initializeWithImage(initialRefImage);
    this.dicomGroups.push(currentVolumeGroup);
    this.dicomFiles.forEach((image)=>{
      image.calcGeoSortKeys(initialRefImage.ulhc);
    })

    this.dicomFiles.sort(this.ordering);
    this.dicomFiles.forEach((image)=>{
      console.log(`keys:${image.geoSortKeys} ulhc:${image.ulhc}`);
      if (currentVolumeGroup.isCompatible(image)) {
        currentVolumeGroup.images.push(image);
      }
      else {
        console.error(`Error, only one volume group supported at this time`);
        this.loadErrorOccured = true;

      }

    });
    if (!this.loadErrorOccured) {
      this.dicomGroups[0].prep3dParameters();
  }
    let vg = this.dicomGroups[0];
    if (vg.loadStatus  !== vg.loadSuccess) {
      return;
    }
    this.IJKToLPS = vg.IJKToLPS;
}

}
module.exports = SeriesLoader;
