import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import {mat3, mat4, vec3} from "gl-matrix";
import {View} from "../components/view";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkPlane from "@kitware/vtk.js/Common/DataModel/Plane"
import {Vector3} from "@kitware/vtk.js/types";

export class CameraSettings {
  image:vtkImageData | null = null;
  camera:vtkCamera | null = null;
  /**
   * lpsDirectionAxes[0] is the 0 if  LR direction is parallel to the I axis,
   * 1 if parallel to the J axis, and 2 if parallel to the K axis.
   * Similarly, lpsDirectionAxes[1] is 0 if the A/P direction is parallel to the I axis,
   * 1 if parallel to the J axis, and 2 if parallel to the K axis.
   */
  lpsDirectionAxes = [0,0,0];
  /**
   * basisVectorsIJK[0] is the displacement in the I direction in LPS.
   * Similarly, basisVectorsIJK[1] is the displacement in the J direction, and
   * basisVectorsIJK[2] for the K direction.  These are simply the columns from
   * vtkImageData.getDirection().  They are all unit length.
   */
  basisVectorsIJK:vec3[] = [];

  /**
   * fitDiameterLPSView[i] is the dimension across the volume's IJK axis i.
   *
   */
  fitDiameterLPSView = [0,0,0];

  constructor()
  {
    for (let i = 0;i < 3;i++) {
      this.basisVectorsIJK.push(vec3.create());
    }
  }
  initializeCameraControls(image:vtkImageData, camera:vtkCamera) {
    this.image = image;
    this.camera = camera;
  }
  static printMat3(mat:mat3, title:string) {

    console.log(`print of ${title}`)
    for(let row = 0;row < 3;row++) {
      let col = 0;
      let v1 = mat[col*3+row];
      let v2 = mat[(col+1)*3+row];
      let v3 = mat[(col+2)*3+row];
      console.log(v1.toFixed(2),
        v2.toFixed(2),
        v3.toFixed(2));
    }
  }
  static printMat4(mat:mat4, title:string) {

    console.log(`print of ${title}`)
    for(let row = 0;row < 4;row++) {
      let col = 0;
      let v1 = mat[col*4+row];
      let v2 = mat[(col+1)*4+row];
      let v3 = mat[(col+2)*4+row];
      let v4 = mat[(col+3)*4+row];
      console.log(v1.toFixed(2),
        v2.toFixed(2),
        v3.toFixed(2),
        v4.toFixed(2))
    }

  }
  calcImageDominantDirections() {
    if (!this.image) {
      console.error(`Error, calcImageDominantDirections must be called after setImage().`);
      return;
    }

    let maxDisplacement = [-1,-1,-1];

    let directions = this.image.getDirection();
    let spacing = this.image.getSpacing();
    let dims = this.image.getDimensions();
    let dotProd = vec3.create();
    for(let searchingMaxAxis = 0;searchingMaxAxis < 3;searchingMaxAxis++) {
      let vax = vec3.fromValues(0,0,0);
      vax[searchingMaxAxis] = 1;
      for (let volumeAxis = 0;volumeAxis<3;volumeAxis++) {
        let basisVector=vec3.fromValues(
          directions[volumeAxis*3],
          directions[volumeAxis*3+1],
          directions[volumeAxis*3+2]
        );
        vec3.copy(this.basisVectorsIJK[volumeAxis],basisVector);
        let displacement = vec3.dot(vax,basisVector);
        if (displacement > maxDisplacement[searchingMaxAxis]) {
          this.lpsDirectionAxes[searchingMaxAxis] = volumeAxis;
          maxDisplacement[searchingMaxAxis] = displacement;
        }
      }
      this.fitDiameterLPSView[searchingMaxAxis] = (dims[searchingMaxAxis]-1)*spacing[searchingMaxAxis];
    }
  }


 static calcDominantDirectionFromCameraView(camera:vtkCamera,image:vtkImageData) {
    let viewDirection=camera.getDirectionOfProjection();
    let directions = vec3.create();
    let tmpDim = image.getDimensions();
    console.log(`get dims:${tmpDim}`);
    let dirMatrix = image.getDirection();
    vec3.transformMat3(directions,viewDirection,dirMatrix)
   let mainDir=vec3.create();
    let maxDirDisplacement = -1;
    let mainIJKAxis=-1;
    directions.forEach((disp,i)=>{
      if (Math.abs(disp) > maxDirDisplacement) {
        maxDirDisplacement = Math.abs(disp);
        mainDir[0] = dirMatrix[i*3];
        mainDir[1] = dirMatrix[i*3+1];
        mainDir[2] = dirMatrix[i*3+2];
        mainIJKAxis = i;
      }
    })
   console.log(`directions:${directions}`);
    return {
      ijkIndex:mainIJKAxis,
      xyzDir:mainDir
    }
 }
 static viewVolumeSlice(direction1Neg1:number, view:View, camera:vtkCamera) {

    let image = view.getInputVolume();
    let dominantDir=this.calcDominantDirectionFromCameraView(camera,image);

    console.log(`view direction:${camera.getDirectionOfProjection()}, dominant IJK:${dominantDir.ijkIndex} xyzOfAxis:${dominantDir.xyzDir}`);
    let camToViewDir = vec3.dot(dominantDir.xyzDir,camera.getDirectionOfProjection());
    console.log(`pageDir:${direction1Neg1} dotDir:${camToViewDir}`);
    if (camToViewDir*direction1Neg1 > 0) {
      view.pageTo(1);
    }
    else {
      view.pageTo(-1);
    }

 }
 static nearSame(val:vec3,val2:vec3,precision:number) {
    let diff = vec3.create();
    vec3.subtract(diff,val,val2);
    let isNearSame = true;
    diff.forEach((v,i)=> {
      isNearSame = isNearSame && Math.abs(v) < precision;
    })
   return isNearSame;

 }
  axialView(imageMapper:vtkImageMapper[], actor:vtkActor | null) {
    console.log(`axialView`);
    if (!this.image) {
      console.error(`Error, initializeCameraControls not called before axial view.`)
      return;
    }
    if (!this.camera) {
      console.error(`Error, initializeCameraControls not called before axial view.`);
      return;
    }
    this.calcImageDominantDirections();
    let IJKToLPS = this.image.getIndexToWorld();
    if (actor) {
      let actorlocLPS =actor.getPosition();
      let actorLPS=vec3.fromValues(actorlocLPS[0],actorlocLPS[1],actorlocLPS[2]);
      let zero=vec3.fromValues(0,0,0);
      if  (!CameraSettings.nearSame(actorLPS,zero,0.001)) {
        console.error(`Error, image actor must have actor coord of origin.  not, at ${actorLPS}`)
        return;
      }
    }


    let volumeCenterLPS=vec3.create();
    let volumeCenterIJK=vec3.create();
    let viewDirection=vec3.create();
    let dims=this.image.getDimensions();
    volumeCenterIJK[0] = dims[0]/2.0;
    volumeCenterIJK[1] = dims[1]/2.0;
    volumeCenterIJK[2] = dims[2]/2.0;
    vec3.transformMat4(volumeCenterLPS,volumeCenterIJK,IJKToLPS);
    this.camera.setFocalPoint(volumeCenterLPS[0],volumeCenterLPS[1],volumeCenterLPS[2]);
    let siAxis = this.lpsDirectionAxes[2];
    let isDirection = this.basisVectorsIJK[siAxis];
    let cameraPosition = vec3.create();
    let cameraPositionFromCenter=vec3.create();
    let cameraDirectionSign = -1;
    if (isDirection[2] > 0) {
      cameraDirectionSign = -1;
    }
    else {
      cameraDirectionSign = 1;
    }
    vec3.scale(cameraPositionFromCenter,isDirection,cameraDirectionSign);
    vec3.scale(cameraPositionFromCenter,cameraPositionFromCenter,3*this.fitDiameterLPSView[siAxis]);
    vec3.add(cameraPositionFromCenter,cameraPositionFromCenter,volumeCenterLPS);
    this.camera.setPosition(cameraPositionFromCenter[0],cameraPositionFromCenter[1],cameraPositionFromCenter[2]);
    let viewUp = vec3.create();
    let viewUpDirectionSign = 1;
    let apAxisLPS=this.lpsDirectionAxes[1];
    // if the basis vector has P axis as positive, then we need to flip the direction to point to A as view up.
    if (this.basisVectorsIJK[apAxisLPS][1] > 0) {
      viewUpDirectionSign = -1;
    }
    vec3.copy(viewUp,this.basisVectorsIJK[apAxisLPS]);
    vec3.scale(viewUp,viewUp,viewUpDirectionSign);


    this.camera.setViewUp(viewUp[0],viewUp[1],viewUp[2]);
    this.camera.setClippingRange(this.fitDiameterLPSView[siAxis],5*this.fitDiameterLPSView[siAxis]);
    let perpAxis1 = (siAxis+1) % 3;
    let perpAxis2 = (siAxis+2) % 3;
    let fitScale = Math.max(this.fitDiameterLPSView[perpAxis1],this.fitDiameterLPSView[perpAxis2]);
    console.log(`fit scale:${fitScale}`);
    this.camera.setParallelScale(fitScale/2);

    // Snap camera's focal point to the middle slice which may differ from the volume center
    // by a small amount.
    let axis = 2; // for axial views
    let middleSlice = Math.round(dims[axis]/2);
    console.log(`paging to middle of volume ${middleSlice}`);
    this.pageTo(middleSlice-1,middleSlice,imageMapper,axis);


 }
 planeOfSlice(slice:number,viewIJKAxis:number) {
    let slicePointIJK=vec3.fromValues(0,0,0);
    slicePointIJK[viewIJKAxis] = slice;
    let slicePointLPS=vec3.create();
    if (!this.image) {
      console.error('Error, no image set for CameraSettings');
      throw new Error('no image set for CameraSettings');
    }
    let ijk2lps=this.image.getIndexToWorld();
    if (!ijk2lps) {
      console.error('Error, indexToWorld transform is undefined for the image');
      throw new Error('invalid image in camera, no ijk2lps');
    }
    else {
      vec3.transformMat4(slicePointLPS,slicePointIJK,ijk2lps);
      let normal=this.basisVectorsIJK[viewIJKAxis];
      let plane=vtkPlane.newInstance();
      plane.setNormal(normal[0],normal[1],normal[2]);
      plane.setOrigin(slicePointLPS[0],slicePointLPS[1],slicePointLPS[2]);
      return plane;
    }

 }

  pageTo(currentSlice: number, newSlice: number,imageMapper:vtkImageMapper[], viewIJKAxis: number) {
    if (!this.camera) {
      console.error(`Error, initializeCameraControls not called before axial view.`);
      return;
    }
    imageMapper.forEach((v,i)=>{
      imageMapper[i].setSlicingMode(viewIJKAxis);
      imageMapper[i].setSlice(newSlice);
    })
    console.log(`page current:${currentSlice} new:${newSlice}`);
    console.log(`focal:${this.camera.getFocalPoint()}`);
    console.log(`pos:${this.camera.getPosition()}`);
    let newSlicePlane = this.planeOfSlice(newSlice,viewIJKAxis);
    let camPos=this.camera.getPosition();
    let camFocus=this.camera.getFocalPoint();
    let camPosProjected:Vector3 = [0,0,0];
    newSlicePlane.projectPoint(camFocus,camPosProjected);
    let spacing=this.image?.getSpacing();
    if (!spacing) {
      console.error(`Error, spacing undefined in the image`);
      throw new Error('spacing undefined in the image');
    }
    let axisSpacing=spacing[viewIJKAxis];
    let directionScale = -Math.sign(newSlice-currentSlice)*axisSpacing*Math.abs(newSlice-currentSlice);
    let displacement = this.basisVectorsIJK[viewIJKAxis];
    let cameraOffset=vec3.create();
    vec3.scale(cameraOffset,displacement,directionScale);
    let newPos=vec3.create();
    vec3.add(newPos,camPos,cameraOffset);
    this.camera.setPosition(newPos[0],newPos[1],newPos[2]);
    this.camera.setFocalPoint(camPosProjected[0],camPosProjected[1],camPosProjected[2]);

    console.log(`focal:${this.camera.getFocalPoint()}`);
    console.log(`pos:${this.camera.getPosition()}`);
 }

}
