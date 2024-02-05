import { Injectable } from '@angular/core';
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import {mat3} from "gl-matrix";
interface ArrayShape  {
  contents:Int16Array,
  dims:number[]
}
@Injectable({
  providedIn: 'root'
})
export class SyntheticImageGeneratorService {
  private setPixel(array:ArrayShape,xyz:number[],value:number) {
    array.contents[array.dims[0]*array.dims[1]*xyz[2]+array.dims[0]*xyz[1]+xyz[0]] = value;
  }
  private fillTile(array:ArrayShape,diameter:number,address:number[],value:number) {
    let pixAddr = [0,0,0];
    let corner = [address[0]*diameter, address[1]*diameter,address[2]*diameter];
    for (let iz = 0;iz < diameter;iz++) {
      pixAddr[2] = corner[2]+iz;
      for (let iy = 0;iy < diameter;iy++) {
        pixAddr[1] = corner[1]+iy;
        for (let ix = 0;ix < diameter;ix++) {
          pixAddr[0] = corner[0]+ix;
          this.setPixel(array,pixAddr,value);
        }
      }
    }
  }

  constructor() { }
  createCheckerBoard(inImage:vtkImageData, dims:number[], checkerDiameter:number, intensityPattern:number[]) {

    console.log(`Start loading checkerboard with dims:${dims} diameter:${checkerDiameter}`);
    let pixels = new Int16Array(dims[0]*dims[1]*dims[2]);
    let pixelsArray:ArrayShape = {
      contents:pixels,
      dims:dims
    }
    for (let iz = 0;iz < Math.floor(dims[2]/checkerDiameter);iz++) {
      for (let iy = 0;iy <Math.floor(dims[1]/checkerDiameter);iy++) {
        for (let ix = 0;ix < Math.floor(dims[0]/checkerDiameter);ix++) {
          let colorMod = (ix+iy+iz) % intensityPattern.length;
          let color=intensityPattern[colorMod];
          this.fillTile(pixelsArray,checkerDiameter,[ix,iy,iz],color);
        }
      }
    }
    let data = vtkDataArray.newInstance({
      name:'intensity',
      numberOfComponents:1,
      values:pixels
    });
    data.setRange({
      min:-32768,
      max:32767
    },0);
    inImage.getPointData().setScalars(data);
    let dir=mat3.create();
    inImage.setDimensions(dims);
    inImage.setExtent(0,dims[0]-1,0,dims[1]-1,0,dims[2]-1);
    inImage.setDirection(dir);
    inImage.setOrigin([10,20,30]);
    inImage.setSpacing([10,10,10]);
    console.log(`direction, origin, spacing set`);
  }
}
