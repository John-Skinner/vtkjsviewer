import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {mat3} from "gl-matrix";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";


export class ImageUtilities {
  public static createInt16ImageFromImage(image:vtkImageData) {
    let newImage = vtkImageData.newInstance();
    let dims = image.getDimensions();
    let newDims = [dims[0],dims[1],dims[2]]; // copy brute force
    let direction=mat3.clone(image.getDirection());
    console.log(`orig direction:${image.getDirection()}`);
    let spacing = image.getSpacing();
    let origin = image.getOrigin();
    let newOrigin = [origin[0],origin[1],origin[2]] // copy brute force
    let pixels = new Int16Array(newDims[0]*newDims[1]*newDims[2]);
    pixels.forEach((v,i)=> {
      pixels[i] = 100;
    });
    let data = vtkDataArray.newInstance({
      name:'intensity',
      numberOFComponents:1,
      values:pixels
    })
    data.setRange({
      min:-32768,
      max:32767
    },0);
    newImage.getPointData().setScalars(data);
    newImage.setDimensions(newDims);
    newImage.setExtent(0,newDims[0]-1,
      0,newDims[1]-1,
      0,newDims[2]-1);
    newImage.setDirection(direction);
    console.log(`get direction:${newImage.getDirection()}`);
    // needs Vector3 type which is explicit 3 element array
    newImage.setOrigin([newOrigin[0],newOrigin[1],newOrigin[2]]);
    newImage.setSpacing([spacing[0],spacing[1],spacing[2]]);
    return newImage;
  }
}
