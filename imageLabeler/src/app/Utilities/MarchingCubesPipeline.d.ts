import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {BasePipeline} from "./BasePipeline";

export class MarchingCubesPipeline extends BasePipeline
{
  constructor();
  setImage(image:vtkImageData):void;
  configure():void;
  updateIsoValue(value:number):void;
  getMcActor():vtkActor;
}
