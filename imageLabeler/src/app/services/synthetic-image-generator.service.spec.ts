import { TestBed } from '@angular/core/testing';

import { SyntheticImageGeneratorService } from './synthetic-image-generator.service';
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";

describe('SyntheticImageGeneratorService', () => {
  let service: SyntheticImageGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyntheticImageGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('checkerboard',()=> {
    let image=vtkImageData.newInstance();
    service.createCheckerBoard(image,[64,64,64],8,[0,1000,2000]);
    let data = image.getPointData().getScalars().getData();
    let i16Array = data as Int8Array;
    console.log(`length of array:${i16Array.length}`);
    let aPixel= i16Array[10]
    console.log(`pixel at 10:${aPixel}`);
    expect(aPixel).toEqual(1000);
  })
});
