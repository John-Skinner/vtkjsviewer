const Vec3 = require('gl-matrix/cjs/vec3')
const Mat4 = require('gl-matrix/cjs/mat4')
const {isNear, lineToPoint, loadMat4Column, printMat} = require('./math');

/**
 * VolumeGroup Encapsulates one individual 3D Volume of slices.
 * Currently, SeriesLoader only supports series with one 3D volume.
 * In The future, multi-volume series will be supported by modeling
 * each individual volume with one VolumeGroup.
 */
class VolumeGroup
{
  constructor()
  {
    /**
     * @type {ImageLoader[]}
     */
    this.images = [];
    /**
     *
     * @type {ImageLoader}
     */
    this.repImage = null;
    this.normal = Vec3.create();
    this.basePoint = Vec3.create();
    this.dims = [0, 0];
    this.spacingDrDc = [0.0, 0.0];
    this.spacingPrecision = 0.01;
    this.ulhcPrecision = 0.1;
    this.linePoint1 = Vec3.create();
    this.linePoint2 = Vec3.create();
    this.irregularSpacing = 1;
    this.lessThan2Slices = 2;
    this.loadSuccess = 0;
    this.loadStatus = this.loadSuccess;
    this.IJKToLPS = Mat4.create();
  }


  /**
   *
   * @param {ImageLoader} otherImage
   */
  isCompatible(otherImage)
  {
    let is = true;
    if (otherImage.dimensions[0] !== this.dims[0])
    {
      return false;
    }
    if (otherImage.dimensions[1] !== this.dims[1])
    {
      return false;
    }
    if (!isNear(otherImage.pixelSpacingDrDc[0], this.spacingDrDc[0], this.spacingPrecision))
    {
      return false;
    }
    if (!isNear(otherImage.pixelSpacingDrDc[1], this.spacingDrDc[1], this.spacingPrecision))
    {
      return false;
    }
    let distanceToMyULHC = lineToPoint(this.linePoint1, this.linePoint2, otherImage.ulhc);
    return distanceToMyULHC <= this.ulhcPrecision;

  }

  /**
   *
   * @param {ImageLoader} otherImage
   */
  initializeWithImage(otherImage)
  {
    this.repImage = otherImage;
    Vec3.copy(this.normal, otherImage.normal);
    Vec3.copy(this.basePoint, otherImage.ulhc);
    this.dims = [...otherImage.dimensions];
    this.spacingDrDc = [...otherImage.pixelSpacingDrDc];
    Vec3.copy(this.linePoint1, otherImage.ulhc);
    Vec3.copy(this.linePoint2, otherImage.ulhc);
    Vec3.add(this.linePoint2, this.linePoint2, this.normal);
  }

  /**
   *
   * @param {Vec3} vec
   * @param {number} i
   * @param {number} mag
   */
  sliceDisplacement(vec, i)
  {

    Vec3.subtract(vec, this.images[i + 1].ulhc, this.images[i].ulhc);
  }

  prep3dParameters()
  {
    let sliceDisplacement = Vec3.create();
    // check regular spacing rule
    if (this.images.length < 2)
    {
      this.loadStatus = this.lessThan2Slices;
      return;
    }
    this.sliceDisplacement(sliceDisplacement, 0);
    let standardSliceDistance = Vec3.length(sliceDisplacement);
    console.log(`Slice spacing:${standardSliceDistance}`);
    for (let i = 1; i < this.images.length - 1; i++)
    {
      this.sliceDisplacement(sliceDisplacement, i);
      let currentSliceDistance = Vec3.length(sliceDisplacement);
      if (!isNear(currentSliceDistance, standardSliceDistance, 0.01))
      {
        this.loadStatus = this.irregularSpacing;
        console.error(`Irregular spacing.  First:${standardSliceDistance} Current:${currentSliceDistance}`);
        return;
      }
    }
    let firstSlice = this.images[0];
    loadMat4Column(this.IJKToLPS, 0, firstSlice.rowVector[0] * firstSlice.pixelSpacingDrDc[0],
      firstSlice.rowVector[1] * firstSlice.pixelSpacingDrDc[0],
      firstSlice.rowVector[2] * firstSlice.pixelSpacingDrDc[0],
      0);
    loadMat4Column(this.IJKToLPS, 1, firstSlice.columnVector[0] * firstSlice.pixelSpacingDrDc[1],
      firstSlice.columnVector[1] * firstSlice.pixelSpacingDrDc[1],
      firstSlice.columnVector[2] * firstSlice.pixelSpacingDrDc[1],
      0)
    loadMat4Column(this.IJKToLPS, 2, firstSlice.normal[0] * standardSliceDistance,
      firstSlice.normal[1] * standardSliceDistance,
      firstSlice.normal[2] * standardSliceDistance,
      0);
    loadMat4Column(this.IJKToLPS, 3, firstSlice.ulhc[0],
      firstSlice.ulhc[1],
      firstSlice.ulhc[2],
      1);
    printMat(this.IJKToLPS, 'Volume Group IJK2LPS')
  }

}

module.exports = VolumeGroup;
