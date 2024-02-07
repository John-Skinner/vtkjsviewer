import {ElementRef, Injectable} from '@angular/core';
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
export class PipelineElements {
  openGLRenderWindow:vtkOpenGLRenderWindow | null = null;
  renderWindow:vtkRenderWindow | null = null;
  renderer:vtkRenderer | null = null;
  interactor:vtkRenderWindowInteractor | null = null;
  windowWidth = 0;
  windowHeight = 0;
  container:HTMLDivElement | null = null;

  }


@Injectable({
  providedIn: 'root'
})
export class ViewUtilitiesService
{

  constructor()
  {
  }

  initCommonVtkJSPipeline(pipeline: PipelineElements, vtkDiv: ElementRef)
  {
    pipeline.container = vtkDiv.nativeElement as HTMLDivElement;
    pipeline.windowWidth = pipeline.container.clientWidth;
    pipeline.windowHeight = pipeline.container.clientHeight;
    pipeline.renderWindow = vtkRenderWindow.newInstance();
    pipeline.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
    pipeline.openGLRenderWindow.setContainer(pipeline.container);
    pipeline.openGLRenderWindow.setSize(pipeline.windowWidth, pipeline.windowHeight);
    pipeline.renderWindow.addView(pipeline.openGLRenderWindow);

    pipeline.renderer = vtkRenderer.newInstance();
    pipeline.renderWindow.addRenderer(pipeline.renderer);
    pipeline.interactor = vtkRenderWindowInteractor.newInstance();
    pipeline.interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    pipeline.interactor.setView(pipeline.openGLRenderWindow);
    pipeline.interactor.initialize();
    pipeline.interactor.bindEvents(pipeline.container);

    console.log('init render window render');
  }
}
