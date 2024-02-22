// import {MarchingCubesPipeline} from "./MarchingCubesPipeline";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {BasePipeline} from "./BasePipeline";

export class VrRenderPipeline extends BasePipeline {
  primaryVrMapper:vtkVolumeMapper = vtkVolumeMapper.newInstance();
  labelVrMapper:vtkVolumeMapper = vtkVolumeMapper.newInstance();
  primaryVrActor:vtkVolume = vtkVolume.newInstance();
  labelVrActor:vtkVolume = vtkVolume.newInstance();
  primaryPiecewiseFunction:vtkPiecewiseFunction = vtkPiecewiseFunction.newInstance();
  primaryColorTransferFunction:vtkColorTransferFunction = vtkColorTransferFunction.newInstance();
  labelPiecewiseFunction:vtkPiecewiseFunction = vtkPiecewiseFunction.newInstance();
  labelColorTransferFunction:vtkColorTransferFunction = vtkColorTransferFunction.newInstance();


  constructor()
  {
    super();
    this.primaryVrActor.setMapper(this.primaryVrMapper);
    this.labelVrActor.setMapper(this.labelVrMapper);
  }
  initPipelineToCurrentVolumes(primaryVolume:vtkImageData,labelVolume:vtkImageData) {
    if (!this.renderWindow) {
      console.error('Error, pipeline init when render window is null');
      return;
    }
    this.primaryVrMapper.setInputData(primaryVolume);
    this.labelVrMapper.setInputData(labelVolume);
    this.primaryColorTransferFunction.removeAllPoints();
    let red = 176/256.0;
    let green = 113/256.0;
    let blue = 168/256.0;
    this.primaryColorTransferFunction.addRGBPoint(0,red,green,blue);
    this.primaryColorTransferFunction.addRGBPoint(5000,red,green,blue);
    this.primaryPiecewiseFunction.removeAllPoints();
    this.primaryPiecewiseFunction.addPoint(0,0);
    this.primaryPiecewiseFunction.addPoint(2000,0.8);
    this.primaryPiecewiseFunction.addPoint(20000,1.0);
    this.primaryVrActor.getProperty().setRGBTransferFunction(0,this.primaryColorTransferFunction);
    this.primaryVrActor.getProperty().setScalarOpacity(0,this.primaryPiecewiseFunction);

    this.primaryVrActor.getProperty().setUseGradientOpacity(0,true);
    this.primaryVrActor.getProperty().setShade(true);
    this.primaryVrActor.getProperty().setAmbient(0.5);
    this.primaryVrActor.getProperty().setDiffuse(0.7);


    this.labelColorTransferFunction.removeAllPoints();
    this.labelColorTransferFunction.addRGBPoint(0,0,1,0);
    this.labelColorTransferFunction.addRGBPoint(30000,0,1,0);
    this.labelPiecewiseFunction.removeAllPoints();
    this.labelPiecewiseFunction.addPoint(0,0);
    this.labelPiecewiseFunction.addPoint(1,1);
    this.labelPiecewiseFunction.addPoint(30000,1);
    this.labelVrActor.getProperty().setRGBTransferFunction(0,this.labelColorTransferFunction);
    this.labelVrActor.getProperty().setScalarOpacity(0,this.labelPiecewiseFunction);
    this.labelVrActor.getProperty().setUseGradientOpacity(0,true);
    this.labelVrActor.getProperty().setShade(true);
    this.labelVrActor.getProperty().setAmbient(0.3);
    this.labelVrActor.getProperty().setDiffuse(0.9);


    this.renderer.resetCamera();
    this.renderWindow.render();
  }
}
