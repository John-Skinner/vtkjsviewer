import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import '@kitware/vtk.js/Rendering/Profiles/Geometry'
import '@kitware/vtk.js/Rendering/Profiles/Volume'
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera'
import { ExamSeriesLoaderService } from '../../services/exam-series-loader.service'
import { MarchingCubesPipeline } from '../../Utilities/MarchingCubesPipeline'

@Component({
  selector: 'app-poly-view',
  standalone: true,
  imports: [],
  templateUrl: './poly-view.component.html',
  styleUrl: './poly-view.component.scss'
})
export class PolyViewComponent implements AfterViewInit {
  renderPipeline: MarchingCubesPipeline = new MarchingCubesPipeline()

  @ViewChild('vtkRenderWindowDiv') vtkDiv!: ElementRef
  constructor (private examSeriesLoader: ExamSeriesLoaderService) {
    examSeriesLoader.onSeriesVolumeLoaded().subscribe((vol) => {
      console.log('volume loaded to polyview')
      if (this.examSeriesLoader.primaryVolume === null) {
        throw new Error('Error, primary volume not set after series loaded')
      }
      if (this.examSeriesLoader.labelVolume === null) {
        throw new Error('Error, primary volume not set after series loaded')
      }
      const labelVolume = this.examSeriesLoader.labelVolume.image
      if (labelVolume === null) {
        console.error('label volume is null on load')
        return
      }
      const primaryVolume = this.examSeriesLoader.primaryVolume.image
      if (primaryVolume === null) {
        console.error('primary volume is null on load')
        return
      }
      this.renderPipeline.setImage(labelVolume)
      this.renderPipeline.configure()
      this.renderPipeline.renderer.addActor(this.renderPipeline.getMcActor())
      this.renderPipeline.updateIsoValue(0.0)
    })
  }

  updateIsoValue (event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value
    const isoValue = Number(value)
    this.renderPipeline.updateIsoValue(isoValue)
    this.renderPipeline.renderer.resetCamera()
    this.renderPipeline.renderWindow?.render()
  }

  ngAfterViewInit (): void {
    const interactor = vtkInteractorStyleTrackballCamera.newInstance()
    this.renderPipeline.initCommonVtkJSPipeline(this.vtkDiv, interactor)

    try {
      if (this.renderPipeline.renderWindow === null) {
        return
      }

      this.renderPipeline.renderer.resetCamera()
      console.log('init render window render')
      this.renderPipeline.renderWindow.render()
    } catch (e) {
      console.log('error caught')
    }
  }
}
