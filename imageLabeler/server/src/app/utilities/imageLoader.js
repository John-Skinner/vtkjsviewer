let dicomParser = require('dicom-parser')
const Vec3 = require('gl-matrix/cjs/vec3');
const fs = require('fs');

class ImageLoader {
  static tieBreaker = 0;
  constructor()
  {
    this.rowVector = Vec3.create();
    this.columnVector = Vec3.create();
    this.normal = Vec3.create();
    this.ulhc = Vec3.create();
    this.dimensions = [0,0];
    this.pixels = new Uint16Array(1);
    this.pixelsCoded=''; // base64
    this.pixelSpacingDrDc = [0,0];
    this.examName='';
    this.seriesName='';
    this.imageName='';
    this.geoSortKeys = [];
  }
  loadFile(pathAndFile) {
    let dicomFileAsBuffer = fs.readFileSync(pathAndFile);
    try {
      let dataset = dicomParser.parseDicom(dicomFileAsBuffer);
      let pn = dataset.string('x00100010');
      let ulhc = dataset.float('x00200032');
      this.rowVector[0] = dataset.floatString('x00200037',0);
      this.rowVector[1] = dataset.floatString('x00200037',1);
      this.rowVector[2] = dataset.floatString('x00200037',2);

      this.columnVector[0] = dataset.floatString('x00200037',3);
      this.columnVector[1] = dataset.floatString('x00200037',4);
      this.columnVector[2] = dataset.floatString('x00200037',5);
      Vec3.cross(this.normal,this.rowVector,this.columnVector);
      Vec3.normalize(this.normal,this.normal);

      this.ulhc[0] = dataset.floatString('x00200032',0);
      this.ulhc[1] = dataset.floatString('x00200032',1);
      this.ulhc[2] = dataset.floatString('x00200032',2);

      this.dimensions[1] = dataset.uint16('x00280010');
      this.dimensions[0] = dataset.uint16('x00280011');

      this.pixelSpacingDrDc[0]=dataset.floatString('x00280030',0);
      this.pixelSpacingDrDc[1]=dataset.floatString('x00280030',1);
      this.examName = dataset.string('x00200010');
      this.seriesName=dataset.intString('x00200011');
      this.imageName=dataset.intString('x00200013');
      let pixelsElement = dataset.elements.x7fe00010;
      let pixelArray= dicomParser.sharedCopy(dicomFileAsBuffer,pixelsElement.dataOffset,pixelsElement.length);
      this.pixels = new Uint16Array(this.dimensions[0]*this.dimensions[1]);
      let leSum = 0.0;
      let beSum = 0.0;
      for (let i = 0;i < this.pixels.length/2;i++) {
        // use little endian ordering
        let b1 = pixelArray[i*2];
        let b2 = pixelArray[i*2+1];
        beSum += (b1*256+b2);
        leSum += (b2*256+b1);
        this.pixels[i] = b2 * 256 + b1;
      }
      this.pixelsCoded = Buffer.from(this.pixels).toString('base64');


    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   *
   * @param {Vec3} masterOrigin
   */
  calcGeoSortKeys(masterOrigin) {
    let product=Vec3.create();
    let relativePos=Vec3.create();
    this.geoSortKeys.push(Math.round(this.normal[0]*100));
    this.geoSortKeys.push(Math.round(this.normal[1]*100));
    this.geoSortKeys.push(Math.round(this.normal[2]*100));
    Vec3.sub(relativePos,masterOrigin,this.ulhc);
    let displacement = Vec3.dot(this.normal,relativePos);
    this.geoSortKeys.push(Math.round(displacement*1000));
    let imageNumber = Number(this.imageName);
    this.geoSortKeys.push(imageNumber);
    this.geoSortKeys.push(ImageLoader.tieBreaker++);
  }

  /**
   *
   * @param {ImageLoader} other
   */

}
module.exports = ImageLoader;
