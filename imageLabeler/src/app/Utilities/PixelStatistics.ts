import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";

export class PixelStatistics {
  image:vtkImageData;
  minIntensity=0;
  maxIntensity=0;
  averageIntensity = 0;
  constructor(image:vtkImageData)
  {
    this.image = image;
  }
  computeStats() {
    let pixels=this.image.getPointData().getScalars().getData();
    console.log(`num pixels for stats:${pixels.length}`);
    let min = Number.MAX_SAFE_INTEGER;
    let max=-Number.MAX_SAFE_INTEGER;
    let sum = 0.0
    pixels.forEach((p,i)=>{
      sum += p;
      min = Math.min(min,p);
      max = Math.max(max,p);
    })
    this.minIntensity = min;
    this.maxIntensity = max;
    this.averageIntensity = sum/pixels.length;
  }

  get min() {
    return this.minIntensity;
  }
  get max() {
    return this.maxIntensity
  }
  get ave() {
    return this.averageIntensity;
  }
}
