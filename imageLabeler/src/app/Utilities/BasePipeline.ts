import {ElementRef, Injectable} from '@angular/core';
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkInteractorStyle from "@kitware/vtk.js/Rendering/Core/InteractorStyle";
export class BasePipeline
{
  openGLRenderWindow:vtkOpenGLRenderWindow | null = null;
  renderWindow:vtkRenderWindow | null = null;

  renderer:vtkRenderer;
  interactor:vtkRenderWindowInteractor | null = null;
  interactorStyle:vtkInteractorStyle | null = null;
  windowWidth = 0;
  windowHeight = 0;
  container:HTMLDivElement | null = null;

  constructor()
  {
    this.renderer = vtkRenderer.newInstance();

  }



  initCommonVtkJSPipeline(vtkDiv: ElementRef, interaction:vtkInteractorStyle)
  {
    try
    {
      this.container = vtkDiv.nativeElement as HTMLDivElement;
      this.windowWidth = this.container.clientWidth;
      this.windowHeight = this.container.clientHeight;
      this.renderWindow = vtkRenderWindow.newInstance();
      this.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
      this.openGLRenderWindow.setContainer(this.container);
      this.openGLRenderWindow.setSize(this.windowWidth, this.windowHeight);
      this.renderWindow.addView(this.openGLRenderWindow);
      this.renderWindow.addRenderer(this.renderer);
      this.interactor = vtkRenderWindowInteractor.newInstance();

      this.interactor.setInteractorStyle(interaction);
      this.interactorStyle = interaction;
      this.interactor.setView(this.openGLRenderWindow);
      this.interactor.initialize();
      this.interactor.bindEvents(this.container);
    }
    catch (e) {
      console.error(`Caught initialize core pipeline error:${e}`);
    }

    console.log('init render window render');
  }
}
