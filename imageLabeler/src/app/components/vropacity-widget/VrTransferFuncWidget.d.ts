import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";

export class VrTransferFuncWidget {
  constructor();
  configure(container:HTMLDivElement,colorTransferFunc:vtkColorTransferFunction,
            opacityFunc:vtkPiecewiseFunction,image:vtkImageData,
            renderWindow:vtkRenderWindow):void;
  render():void;
  addGaussian(position:number, height:number,width:number,xBias:number,yBias:number):void;
}
