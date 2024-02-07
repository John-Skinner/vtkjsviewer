import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ExamSeriesLoaderService} from "../../services/exam-series-loader.service";
import {PipelineElements, ViewUtilitiesService} from "../../services/view-utilities.service";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";

class SliceRenderPipeline extends PipelineElements
{
  imageMapperI = vtkImageMapper.newInstance();
  imageMapperJ = vtkImageMapper.newInstance();
  imageMapperK = vtkImageMapper.newInstance();
  imageActorI = vtkImageSlice.newInstance();
  imageActorJ = vtkImageSlice.newInstance();
  imageActorK = vtkImageSlice.newInstance();
  constructor()
  {
    super();
    this.imageActorI.setMapper(this.imageMapperI);
    this.imageActorJ.setMapper(this.imageMapperJ);
    this.imageActorK.setMapper(this.imageMapperK);
  }
}

@Component({
  selector: 'app-slice-view',
  standalone: true,
  imports: [],
  templateUrl: './slice-view.component.html',
  styleUrl: './slice-view.component.scss'
})
export class SliceViewComponent implements AfterViewInit
{
  renderPipeline: SliceRenderPipeline = new SliceRenderPipeline();
  @ViewChild('vtkRenderWindowDivI') vtkDiv!: ElementRef;

  constructor(private loaderService: ExamSeriesLoaderService, private viewUtilities: ViewUtilitiesService)
  {
    this.loaderService.onSeriesVolumeLoaded().subscribe((volume) =>
    {
      console.log(`volume loaded with dims:${volume.image.getDimensions()[0]},${volume.image.getDimensions()[1]},${volume.image.getDimensions()[2]}`);
      this.renderPipeline.imageMapperK.setInputData(volume.image);
      this.renderPipeline.imageMapperK.setKSlice(10);
      this.renderPipeline.renderer?.resetCamera();
      this.renderPipeline.imageActorK.getProperty().setColorWindow(3000);
      this.renderPipeline.imageActorK.getProperty().setColorLevel(1000);
      this.renderPipeline.renderWindow?.render();



    })
  }

  ngAfterViewInit(): void
  {
    this.viewUtilities.initCommonVtkJSPipeline(this.renderPipeline, this.vtkDiv);
    try
    {
      if (!this.renderPipeline.renderer)
      {
        return;
      }
      if (!this.renderPipeline.renderWindow)
      {
        return;
      }
      this.renderPipeline.renderer.addActor(this.renderPipeline.imageActorK);
      // we just add one orientation for now.


    } catch (e)
    {
    }
  }

}
