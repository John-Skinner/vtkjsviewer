import {BasePipeline} from "../../Utilities/BasePipeline";
import {CameraSettings} from "../../Utilities/CameraSettings";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkBoundingBox from "@kitware/vtk.js/Common/DataModel/BoundingBox";
import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";

export class SliceRenderPipeline extends BasePipeline
{

  cameraControl  = new CameraSettings()
  camera:vtkCamera | null = null;
  overlayRenderer  = vtkRenderer.newInstance();
  overlayImageActor = vtkImageSlice.newInstance();
  overlayMapperK  = vtkImageMapper.newInstance();
  labelOpacityFunc = vtkPiecewiseFunction.newInstance();
  labelColorTransfer = vtkColorTransferFunction.newInstance();
  imageMapperI = vtkImageMapper.newInstance();
  imageMapperJ = vtkImageMapper.newInstance();
  imageMapperK = vtkImageMapper.newInstance();
  imageActorI = vtkImageSlice.newInstance();
  imageActorJ = vtkImageSlice.newInstance();
  imageActorK = vtkImageSlice.newInstance();


  overlayBoundingBox = vtkBoundingBox.newInstance({bounds:[0,1,0,1,0,1]});
  constructor()
  {
    super();


    if (!this.renderer) {
      console.error('Error, internal error, renderer not defined.')
      return;
    }


    // the preserve color and depth to false means that the renderer
    // for the overlay will be reset so the repaint will start off
    // with the primary image and not work from previous color and depth buffers.
    // @ts-ignore
    this.renderer.setPreserveColorBuffer(false);
    // @ts-ignore
    this.renderer.setPreserveDepthBuffer(false);


    this.overlayImageActor.setMapper(this.overlayMapperK);



    this.imageActorI.setMapper(this.imageMapperI);
    this.imageActorJ.setMapper(this.imageMapperJ);
    this.imageActorK.setMapper(this.imageMapperK);
    this.labelOpacityFunc.removeAllPoints();
    this.labelOpacityFunc.addPoint(0,0.0);
    this.labelOpacityFunc.addPoint(0.5,0.5);
    this.labelOpacityFunc.addPoint(255,0.5);
    this.labelColorTransfer.removeAllPoints();
    this.labelColorTransfer.addRGBPoint(0,1,0,0);
    this.labelColorTransfer.addRGBPoint(30000,1,0,0);
    this.overlayImageActor.getProperty().setScalarOpacity(0,this.labelOpacityFunc);
    this.overlayImageActor.getProperty().setRGBTransferFunction(0,this.labelColorTransfer);


  }
  initPipelineToCurrentVolume() {
    if (!this.renderWindow) {
      console.error('Error, pipeline init when render window is null');
      return;
    }
   // this.overlayMapperK.setKSlice(10);
   // this.renderer.resetCamera();
    this.overlayRenderer.setActiveCamera(this.renderer.getActiveCamera());
    this.overlayRenderer.getActiveCamera().setParallelProjection(true);

  }
}
