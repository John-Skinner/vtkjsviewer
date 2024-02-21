import { TestBed } from '@angular/core/testing';
import {CameraSettings} from "./CameraSettings";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {mat3} from "gl-matrix";
import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";

describe('CameraSettings', () => {



  it('should be created', () => {
    let image=vtkImageData.newInstance();
    let direction = mat3.fromValues(1,0,0,0,1,0,0,0,1);
    image.setDirection(direction);
    image.setDimensions([100,100,50]);
    image.setSpacing([10,10,2]);
    image.setOrigin([100,50,0]);
    let camera = vtkCamera.newInstance();
    let cs = new CameraSettings();
    cs.calcImageDominantDirections();
    cs.axialView(null);
    let center = camera.getFocalPoint();
    let pos = camera.getPosition();
    let clipRange = camera.getClippingRange();
    console.log(`center:${center} pos:${pos} clipRange:${clipRange}`);


  });
});
