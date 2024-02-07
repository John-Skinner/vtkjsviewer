import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {PipelineElements, ViewUtilitiesService} from "../../services/view-utilities.service";
import {ExamSeriesLoaderService} from "../../services/exam-series-loader.service";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
class VrRenderPipeline extends PipelineElements {
  vrMapper:vtkVolumeMapper = vtkVolumeMapper.newInstance();
  actor:vtkVolume = vtkVolume.newInstance();
  piecewiseFunction:vtkPiecewiseFunction = vtkPiecewiseFunction.newInstance();
  colorTransferFunction:vtkColorTransferFunction = vtkColorTransferFunction.newInstance();

  constructor()
  {
    super();
    this.actor.setMapper(this.vrMapper);
  }
}

@Component({
  selector: 'app-vr-view',
  standalone: true,
  imports: [],
  templateUrl: './vr-view.component.html',
  styleUrl: './vr-view.component.scss'
})
export class VrViewComponent implements AfterViewInit {
  renderPipeline:VrRenderPipeline = new VrRenderPipeline();
  @ViewChild('vtkRenderWindowDiv') vtkDiv!:ElementRef;
  constructor(private loaderService:ExamSeriesLoaderService,private viewUtilities:ViewUtilitiesService)
  {
    this.loaderService.onSeriesVolumeLoaded().subscribe((volume)=>{
      this.renderPipeline.vrMapper.setInputData(volume.image);
      this.renderPipeline.colorTransferFunction.removeAllPoints();
      this.renderPipeline.colorTransferFunction.addRGBPoint(0,0,1,0);
      this.renderPipeline.colorTransferFunction.addRGBPoint(5000,0,0,1);
      this.renderPipeline.piecewiseFunction.removeAllPoints();
      this.renderPipeline.piecewiseFunction.addPoint(0,0);
      this.renderPipeline.piecewiseFunction.addPoint(2000,0.8);
      this.renderPipeline.piecewiseFunction.addPoint(20000,1.0);
      this.renderPipeline.actor.getProperty().setRGBTransferFunction(0,this.renderPipeline.colorTransferFunction);
      this.renderPipeline.actor.getProperty().setScalarOpacity(0,this.renderPipeline.piecewiseFunction);

      this.renderPipeline.renderer?.resetCamera();
      this.renderPipeline.renderWindow?.render();


    })
  }

ngAfterViewInit()
{
  this.viewUtilities.initCommonVtkJSPipeline(this.renderPipeline, this.vtkDiv);
  try {
    if (!this.renderPipeline.renderer)
    {
      return;
    }
    if (!this.renderPipeline.renderWindow)
    {
      return;
    }
    this.renderPipeline.renderer.addActor(this.renderPipeline.actor);

  }
  catch (e) {

  }
}
}
