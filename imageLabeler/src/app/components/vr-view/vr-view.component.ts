import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { ExamSeriesLoaderService } from '../../services/exam-series-loader.service'
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera'
import { VropacityWidgetComponent } from '../vropacity-widget/vropacity-widget.component'
import { VrRenderPipeline } from '../../Utilities/VrRenderPipeline'
import { ViewSynchronizerService } from '../../services/view-synchronizer.service'
import { CameraSettings } from '../../Utilities/CameraSettings'

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
  renderPipeline: VrRenderPipeline = new VrRenderPipeline()
  cameraSettings: CameraSettings = new CameraSettings()
  @ViewChild('vtkRenderWindowDiv') vtkDiv!: ElementRef
  constructor (private loaderService: ExamSeriesLoaderService, private viewSynchronizer: ViewSynchronizerService) {
    this.loaderService.onSeriesVolumeLoaded().subscribe(() => {
      if (this.loaderService.primaryVolume === null) {
        throw new Error('loading error: primary volume missing.')
      }
      if (this.loaderService.labelVolume === null) {
        throw new Error('loading error: primary volume missing.')
      }

      this.renderPipeline.initPipelineToCurrentVolumes(this.loaderService.primaryVolume.image, this.loaderService.labelVolume?.image)

      const labelVolume = this.loaderService.labelVolume?.image
      if (labelVolume === null) {
        throw new Error('No Label Volume after load.')
      }

      this.cameraSettings.initializeCameraControls(this.loaderService.primaryVolume.image, this.renderPipeline.renderer.getActiveCamera())
      this.cameraSettings.axialView([], null)

      //  this.renderPipeline.renderer.resetCamera();
      this.renderPipeline.renderWindow?.render()
    })
    this.viewSynchronizer.onUpdateLabelVolume().subscribe(() => {
      this.renderPipeline.renderWindow?.render()
    })
  }

  ngAfterViewInit () {
    const interactor = vtkInteractorStyleTrackballCamera.newInstance()
    this.renderPipeline.initCommonVtkJSPipeline(this.vtkDiv, interactor)
    try {
      if (this.renderPipeline.renderWindow === null) {
        return
      }
      this.renderPipeline.renderer.addActor(this.renderPipeline.primaryVrActor)
    } catch (e) {

    }
  }
}
