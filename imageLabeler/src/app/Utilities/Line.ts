import vtkLineSource from "@kitware/vtk.js/Filters/Sources/LineSource";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import {Vector3} from "@kitware/vtk.js/types";

export class Line  {
  source:vtkLineSource = vtkLineSource.newInstance();
  actor:vtkActor = vtkActor.newInstance();
  mapper:vtkMapper = vtkMapper.newInstance();

  constructor(ijkBasis:number)
  {
    let farPoint:Vector3 = [0,0,0];
    farPoint[ijkBasis] = 1;
    // setPointFrom isn't working, as well as setPoint(vector)
    this.source.setPoint1(0,0,0);
    this.source.setPoint2(farPoint[0],farPoint[1],farPoint[2]);
    this.actor.getProperty().setColor(1,0,0);
    this.mapper.setInputData(this.source.getOutputData());
    this.actor.setMapper(this.mapper);
  }
}
