
import { TestBed } from '@angular/core/testing';

import {SegmentPainter} from "./SegmentPainter";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {SyntheticImageGenerator, VolumeDescription} from "../services/synthetic-image.generator";
import {mat3, mat4, vec3} from "gl-matrix";
let painter: SegmentPainter = new SegmentPainter();
let labelImage:vtkImageData;
beforeEach(()=>{
  painter = new SegmentPainter();
  labelImage=vtkImageData.newInstance();
  let direction = mat3.create();
  mat3.identity(direction);
  let testVol:VolumeDescription = {
    origin:[0,0,0],
    spacing:[10,10,10],
    dimension:[50,50,30],
    direction:direction
  }
  SyntheticImageGenerator.createConstant(labelImage,testVol,100);
  painter.configure(labelImage);
})
describe('SegmentPainter', () => {


  it('should be created', () => {
    expect(painter).toBeTruthy();
    let spacing = labelImage.getSpacing();
    expect(spacing.length).toEqual(3);
  });
  it('findStartExpansion',()=> {

    let p1=vec3.fromValues(50,-10,0);
    let p2=vec3.fromValues(50,200,0);
    let p01 = vec3.fromValues(9,15,0);
    let p02 = vec3.fromValues(5,-8,0);
    let p03 = vec3.fromValues(5,25,0);
    let testp1 = vec3.fromValues(5,5,5);
    painter.initDraw(p1,p2);
    let visited = painter.visited(testp1);
    expect(visited).toBeFalse();
    painter.visit(testp1);
    visited = painter.visited(testp1);
    expect(visited).toBeTrue();
    let d = painter.distance(p01);
    expect(d).toEqual(40);
    d = painter.distance(p02);
    expect(d).toEqual(70);
    d = painter.distance(p03);
    expect(d).toEqual(50);
  });
  it('findInitialPoint',()=>{
    let p1=vec3.fromValues(50,-10,0);
    let p2=vec3.fromValues(50,200,0);
    let ijk2lps=labelImage.getIndexToWorld();
    let spacing=labelImage.getSpacing();
    let lps2ijk=mat4.create();
    mat4.invert(lps2ijk,ijk2lps);
    let p1IJK=vec3.create();
    vec3.transformMat4(p1IJK,p1,lps2ijk);
    painter.initDraw(p1,p2);
    let initialPoint = painter.findInitialPoint();
    let initialPointDistance = painter.distance(initialPoint);
    expect(initialPointDistance).toBeLessThan(Math.max(spacing[0],spacing[1],spacing[2]));

  })
  it('draw',()=>{

    let p1 = vec3.fromValues(50,90,40);
    let p2 = vec3.fromValues(50,30,40);
    let paintedPixels = painter.draw(p1,p2,30,2);
    expect(paintedPixels).toEqual(297);
  })
});
