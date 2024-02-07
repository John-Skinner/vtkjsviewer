import {VolumeAPI, VolumeInstance} from "./exam-series-loader.service";
import {Subject} from "rxjs";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import {mat3, mat4, vec3} from "gl-matrix";

export interface VolumeSlice {
  exam:string,
  series:string,
  image:number,
  pixels:string
}


export class VolumeLoaderService {
  volumeInstance :VolumeInstance | null = null;
  pixels:Int16Array = new Int16Array(1);
  volumeLoadedSubject:Subject<vtkImageData> = new Subject<vtkImageData>();
  pendingSlice = -1;
  volume:VolumeAPI;
  onVolumeLoaded() {
    return this.volumeLoadedSubject.asObservable();
  }

  constructor(volumeDescription:VolumeAPI) {
    this.volume = volumeDescription;



  }
  static normalizeColumn(normVec:vec3,mat:mat4,col:number) {
    let columnVec=vec3.fromValues(
      mat[col*4],
      mat[col*4+1],
      mat[col*4+2]);
    vec3.normalize(normVec,columnVec);
  }
  static fromIJK2RASIntoVtkImageGeometry(IJKToLPS:number[],origin:number[],direction:mat3,spacing:number[]) {
    let ooo = vec3.fromValues(0,0,0);
    let ooi = vec3.fromValues(0,0,1);
    let oio = vec3.fromValues(0,1,0);
    let ioo = vec3.fromValues(1,0,0);
    let ijkToLpsMat = mat4.create();
    ijkToLpsMat.forEach((v,i)=>{
      ijkToLpsMat[i] = IJKToLPS[i];
    })

    let originRes = vec3.create();
    vec3.transformMat4(originRes,ooo,ijkToLpsMat);
    let tmpVec = vec3.create();
    let diffVec = vec3.create();
    vec3.transformMat4(tmpVec,ooi,ijkToLpsMat);
    originRes.forEach((v,i)=>{
      origin[i] = v;
    });
    vec3.transformMat4(tmpVec,ioo,ijkToLpsMat);
    vec3.subtract(diffVec,ioo,ooo);
    spacing[0] = vec3.length(diffVec);

    vec3.transformMat4(tmpVec,oio,ijkToLpsMat);
    vec3.subtract(diffVec,oio,ooo);
    spacing[1] = vec3.length(diffVec);

    vec3.transformMat4(tmpVec,ooi,ijkToLpsMat);
    vec3.subtract(diffVec,ooi,ooo);
    spacing[2] = vec3.length(diffVec);
    let col=vec3.create();
    for (let colIndex = 0;colIndex < 3;colIndex++) {
      VolumeLoaderService.normalizeColumn(col,ijkToLpsMat,colIndex);
      for (let r = 0;r < 3;r++) {
        direction[colIndex*3+r] = col[r];
      }
    }
  }

  static base64ToShortArray(base64:string) {
     let binaryString = atob(base64);
     console.log(`encoded length:${base64.length} binary string length:${binaryString.length}` );
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    var shorts = new Int16Array(bytes.buffer);
    let imageSize = shorts.length;
    let lastPixel = shorts[imageSize-1]
    console.log(`copied image length:${imageSize} last pixel:${lastPixel}`);
    return shorts;
  }
  aLoad() {
    return new Promise<VolumeInstance>((res, rej) =>
    {
      this.load(res, rej);
    });
  }
  load(res:(res:VolumeInstance)=>void,rej:(rej:string)=>void) {
    this.pendingSlice = 0;
    this.pixels = new Int16Array(this.volume.ijkDimension[0]*this.volume.ijkDimension[1]*this.volume.ijkDimension[2]);
    this.loadNextSlice(res,rej);
  }

  createVtkImageDataInstance(pixels:Int16Array) {
    let image = vtkImageData.newInstance();
    let data = vtkDataArray.newInstance({
      name:'intensity',
      numberOfComponents:1,
      values:pixels
    })
    data.setRange(({
      min:-32768,
      max:32767
    }),0);
    image.getPointData().setScalars(data);
    image.setDimensions(this.volume.ijkDimension);
    image.setExtent(0,this.volume.ijkDimension[0]-1,0,this.volume.ijkDimension[1]-1,0,this.volume.ijkDimension[2]-1);
    let vtkOrigin = [0,0,0];
    let vtkDirection = mat3.create();
    let vtkSpacing = [0,0,0];
    VolumeLoaderService.fromIJK2RASIntoVtkImageGeometry(this.volume.transform,vtkOrigin,vtkDirection,vtkSpacing);
    image.setSpacing(vtkSpacing);
    let volumeInstance:VolumeInstance = {
      image:image,
      direction:vtkDirection,
      position:vtkOrigin
    }
    return volumeInstance;

    // origin and direction will be captured by actor.
  }
  loadNextSlice(res:(res:VolumeInstance)=>void,rej:(rej:string)=>void)
  {

    console.log(`callback this:${this}`);
    console.dir(this);
    fetch('/images/e' + this.volume.exam + '/s' + this.volume.series + '/i' + this.pendingSlice)
      .then((response)=>{
        response.json()
          .then((jsonParsed)=>{
            let volumeSlice = jsonParsed as VolumeSlice;
            let shorts = VolumeLoaderService.base64ToShortArray(volumeSlice.pixels);
            let sliceSize  = this.volume.ijkDimension[0]*this.volume.ijkDimension[1];
            console.log(`adding slice:${this.pendingSlice} array size:${shorts.length}`);
            let base = sliceSize*this.pendingSlice;
            for(let i = 0;i < sliceSize;i++) {
              this.pixels[base+i] = shorts[i];
            }
            if (this.pendingSlice < this.volume.ijkDimension[2]-1) {
              this.pendingSlice++;
              requestIdleCallback(()=>{this.loadNextSlice(res,rej)});
            }
            else {
              this.volumeInstance = this.createVtkImageDataInstance(this.pixels);
              if (this.volumeInstance) {

                console.log(`volume resolves to:${this.volumeInstance.image.getDimensions()}`);
                res(this.volumeInstance);
              }
              else {
                rej("image is void");
              }
            }
          })
      })
  }

}
