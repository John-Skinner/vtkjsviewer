import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import '@kitware/vtk.js/Rendering/Profiles/Geometry'
import '@kitware/vtk.js/Rendering/Profiles/Volume'
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import {PipelineElements, ViewUtilitiesService} from "../../services/view-utilities.service";

class PolyRenderPipeline extends PipelineElements {

}

@Component({
  selector: 'app-poly-view',
  standalone: true,
  imports: [],
  templateUrl: './poly-view.component.html',
  styleUrl: './poly-view.component.scss'
})
export class PolyViewComponent implements AfterViewInit {
  renderPipeline:PolyRenderPipeline = new PolyRenderPipeline();


  @ViewChild('vtkRenderWindowDiv') vtkDiv!:ElementRef;
  constructor(private viewUtilities:ViewUtilitiesService)
  {
  }

  ngAfterViewInit(): void
  {
    this.viewUtilities.initCommonVtkJSPipeline(this.renderPipeline,this.vtkDiv);

    try
    {

      if (!this.renderPipeline.renderer) {
      return;
      }
      if (!this.renderPipeline.renderWindow) {
        return;
      }


      const coneSource = vtkConeSource.newInstance();
      const actor = vtkActor.newInstance();
      const mapper = vtkMapper.newInstance();
      actor.setMapper(mapper);
      mapper.setInputConnection(coneSource.getOutputPort());

      this.renderPipeline.renderer.addActor(actor);
      this.renderPipeline.renderer.resetCamera();
      console.log('init render window render');
      this.renderPipeline.renderWindow.render();
    }
    catch (e) {
      console.log('error caught');
    }
  }
}
