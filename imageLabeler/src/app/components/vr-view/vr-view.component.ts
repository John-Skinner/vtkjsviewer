import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ExamSeriesLoaderService} from "../../services/exam-series-loader.service";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import {VropacityWidgetComponent} from "../vropacity-widget/vropacity-widget.component";
import { VrRenderPipeline} from "../../Utilities/VrRenderPipeline";
import {ViewSynchronizerService} from "../../services/view-synchronizer.service";

@Component({
  selector: 'app-vr-view',
  standalone: true,
  imports: [
    VropacityWidgetComponent
  ],
  templateUrl: './vr-view.component.html',
  styleUrl: './vr-view.component.scss'
})
export class VrViewComponent implements AfterViewInit {
  renderPipeline:VrRenderPipeline = new VrRenderPipeline();
  @ViewChild('vtkRenderWindowDiv') vtkDiv!:ElementRef;
  constructor(private loaderService:ExamSeriesLoaderService,private viewSynchronizer:ViewSynchronizerService)
  {
    this.loaderService.onSeriesVolumeLoaded().subscribe((volume)=>{
      if (!this.loaderService.primaryVolume) {
        throw new Error('loading error: primary volume missing.');
      }
      if (!this.loaderService.labelVolume) {
        throw new Error('loading error: primary volume missing.');
      }


      this.renderPipeline.initPipelineToCurrentVolumes(this.loaderService.primaryVolume.image,this.loaderService.labelVolume?.image);


      let labelVolume = this.loaderService.labelVolume?.image;
      if (!labelVolume) {
        throw new Error('No Label Volume after load.');
      }


      this.renderPipeline.renderer.resetCamera();
      this.renderPipeline.renderWindow?.render();

    });
    this.viewSynchronizer.onUpdateLabelVolume().subscribe(()=> {
      this.renderPipeline.renderWindow?.render();
    })
  }

ngAfterViewInit()
{
  let interactor = vtkInteractorStyleTrackballCamera.newInstance();
  this.renderPipeline.initCommonVtkJSPipeline(this.vtkDiv,interactor);
  try {
    if (!this.renderPipeline.renderer)
    {
      return;
    }
    if (!this.renderPipeline.renderWindow)
    {
      return;
    }
    this.renderPipeline.renderer.addActor(this.renderPipeline.primaryVrActor);

  }
  catch (e) {

  }
}
}
