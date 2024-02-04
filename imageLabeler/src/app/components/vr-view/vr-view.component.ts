import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import '@kitware/vtk.js/Rendering/Profiles/Geometry'
import '@kitware/vtk.js/Rendering/Profiles/Volume'
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";'@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkOpenGLRenderWindow, {IOpenGLRenderWindowInitialValues} from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
@Component({
  selector: 'app-vr-view',
  standalone: true,
  imports: [],
  templateUrl: './vr-view.component.html',
  styleUrl: './vr-view.component.scss'
})
export class VrViewComponent implements AfterViewInit {
  windowWidth = 0;
  windowHeight = 0;
  renderWindow:vtkRenderWindow | null = null;
  openGLRenderWindow:vtkOpenGLRenderWindow | null = null;
  @ViewChild('vtkRenderWindowDiv') vtkDiv!:ElementRef;

  ngAfterViewInit(): void
  {
    let container = this.vtkDiv.nativeElement as HTMLDivElement;
    this.windowWidth = container.clientWidth;
    this.windowHeight = container.clientHeight;
    console.log(`window size:${this.windowWidth} x ${this.windowHeight}`)

    this.renderWindow = vtkRenderWindow.newInstance();
    const initialValues:IOpenGLRenderWindowInitialValues = {};
    if (!initialValues) {
      console.error('Error, unable to create render window');
      return;
    }
    try
    {
      this.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
      this.openGLRenderWindow.setContainer(container);
      this.openGLRenderWindow.setSize(this.windowWidth, this.windowHeight);
      this.renderWindow.addView(this.openGLRenderWindow);
      const coneSource = vtkConeSource.newInstance();
      const actor = vtkActor.newInstance();
      const mapper = vtkMapper.newInstance();
      actor.setMapper(mapper);
      mapper.setInputConnection(coneSource.getOutputPort());
      const renderer = vtkRenderer.newInstance();
      this.renderWindow.addRenderer(renderer);
      const interactor = vtkRenderWindowInteractor.newInstance();
      interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
      interactor.setView(this.openGLRenderWindow);
      interactor.initialize();
      interactor.bindEvents(container);
      renderer.addActor(actor);
      renderer.resetCamera();
      console.log('init render window render');
      this.renderWindow.render();
    }
    catch (e) {
      console.log('error caught');
    }
  }
}
