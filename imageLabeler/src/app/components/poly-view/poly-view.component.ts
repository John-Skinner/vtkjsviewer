import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import '@kitware/vtk.js/Rendering/Profiles/Geometry'
import '@kitware/vtk.js/Rendering/Profiles/Volume'
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import {Line} from "../../Utilities/Line";
import {ExamSeriesLoaderService} from "../../services/exam-series-loader.service";
import {MarchingCubesPipeline} from "../../Utilities/MarchingCubesPipeline";



@Component({
  selector: 'app-poly-view',
  standalone: true,
  imports: [],
  templateUrl: './poly-view.component.html',
  styleUrl: './poly-view.component.scss'
})
export class PolyViewComponent implements AfterViewInit {
  renderPipeline:MarchingCubesPipeline = new MarchingCubesPipeline();



  @ViewChild('vtkRenderWindowDiv') vtkDiv!:ElementRef;
  constructor(private examSeriesLoader:ExamSeriesLoaderService)
  {
    examSeriesLoader.onSeriesVolumeLoaded().subscribe((vol)=>{
      console.log(`volume loaded to polyview`);
      let labelVolume=this.examSeriesLoader.labelVolume?.image;
      if (!labelVolume) {
        console.error(`label volume is null on load`);
        return;
      }
      let primaryVolume = this.examSeriesLoader.primaryVolume?.image;
      if (!primaryVolume) {
        console.error(`primary volume is null on load`);
        return;
      }
      this.renderPipeline.setImage(labelVolume);
      this.renderPipeline.configure();
      this.renderPipeline.renderer.addActor(this.renderPipeline.getMcActor());
      this.renderPipeline.updateIsoValue(0.0);

    })
  }
  updateIsoValue(event:Event) {
    let input = event.target as HTMLInputElement;
    let value =  input.value;
    let isoValue = Number(value);
    this.renderPipeline.updateIsoValue(isoValue);
    this.renderPipeline.renderer.resetCamera();
    this.renderPipeline.renderWindow?.render();
  }

  ngAfterViewInit(): void
  {
    let interactor = vtkInteractorStyleTrackballCamera.newInstance();
    this.renderPipeline.initCommonVtkJSPipeline(this.vtkDiv,interactor);

    try
    {

      if (!this.renderPipeline.renderer) {
      return;
      }
      if (!this.renderPipeline.renderWindow) {
        return;
      }


      this.renderPipeline.renderer.resetCamera();
      console.log('init render window render');
      this.renderPipeline.renderWindow.render();
    }
    catch (e) {
      console.log('error caught');
    }
  }
}
