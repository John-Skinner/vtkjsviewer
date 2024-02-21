import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkImageProperty from "@kitware/vtk.js/Rendering/Core/ImageProperty";
import vtkInteractorStyle from "@kitware/vtk.js/Rendering/Core/InteractorStyle";
import {View} from "../../components/view";
import {AppMouseModes} from "./Constants";
export interface ImagePanZoomInteractorStyle extends vtkInteractorStyle
{

  handleMouseMove(callData: unknown): void;

  handleLeftButtonPress(callData: unknown): void;

  handleLeftButtonRelease(callData: unknown): void;

  handleStartMouseWheel(callData: unknown): void;

  handleEndMouseWheel(callData: unknown): void;

  handleMouseWheel(callData: unknown): void;

  windowLevel(renderer: vtkRenderer, position: { x: number, y: number }): void;

  slice(renderer: vtkRenderer, position: { x: number, y: number }): void;

  setView(view:View):void;

  setInteractionMode(mode:'IMAGE2D' | 'IMAGE3D')

  setMouseBtn1Mode(mode:AppMouseModes);

  setDrawValue(value:number);
}
  export interface IInteractorStylePanZoomInitialValues {
    currentImageNumber:number;
    interactionMode:'IMAGE2D';
}
export function newInstance(initialValues?:ImagePanZoomInteractorStyle):ImagePanZoomInteractorStyle;
export function extend(
  publicAPI:object,
  model:object,
  initialValues?:IInteractorStylePanZoomInitialValues
):void;
export const ImagePanZoomInteractorStyle: {
  newInstance:typeof newInstance;
  extend:typeof extend;
}
export default ImagePanZoomInteractorStyle;
