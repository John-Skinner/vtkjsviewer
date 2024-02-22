import ImagePanZoomInteractorStyle from '../../Utilities/ImagePanZoomInteractorStyle'
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { ExamSeriesLoaderService } from '../../services/exam-series-loader.service'
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice'
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer'
import { View } from '../view'
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import { vec3 } from 'gl-matrix'
import { MouseModesComponent } from '../mouse-modes/mouse-modes.component'
import { SliceRenderPipeline } from './SliceRenderPipeline'
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow'
import { CameraSettings } from '../../Utilities/CameraSettings'
import { AppMouseModes } from '../../Utilities/ImagePanZoomInteractorStyle/Constants'
import { SegmentPainter } from '../../Utilities/SegmentPainter'
import { ViewSynchronizerService } from '../../services/view-synchronizer.service'

@Component({
  selector: 'app-slice-view',
  standalone: true,
  imports: [
    MouseModesComponent
  ],
  templateUrl: './slice-view.component.html',
  styleUrl: './slice-view.component.scss'
})
export class SliceViewComponent implements AfterViewInit, View {
  renderPipeline: SliceRenderPipeline = new SliceRenderPipeline()
  @ViewChild('vtkRenderWindowDivI') vtkDiv!: ElementRef
  @Input({ required: true }) viewportWidth: string = '200px'
  @Input({ required: true }) viewportHeight: string = '200px'
  cameraSettings: CameraSettings = new CameraSettings()
  viewDirectionIJKAxisNumber = 2
  painter: SegmentPainter = new SegmentPainter()
  paintRadius = 0
  CursorCoord='';

  constructor (private loaderService: ExamSeriesLoaderService, private viewSynchronizer: ViewSynchronizerService) {
    this.loaderService.onSeriesVolumeLoaded().subscribe((volume) => {
      console.log(`volume loaded with dims:${volume.image.getDimensions()[0]},${volume.image.getDimensions()[1]},${volume.image.getDimensions()[2]}`)

      if (this.renderPipeline.renderWindow === null) {
        throw new Error('Error, pipeline renderer is not initialized.')
      }
      if (this.loaderService.primaryVolume === null) {
        throw new Error('Error, primary volume undefined after volume loaded.')
      }
      if (this.loaderService.labelVolume === null) {
        throw new Error('Error, label volume undefined after volume loaded')
      }
      if (this.loaderService.primaryVolumeStats === null) {
        throw new Error('Error, statistics not present for loaded volume')
      }
      const primaryVolume = this.loaderService.primaryVolume.image
      const labelVolume = this.loaderService.labelVolume.image
      this.renderPipeline.imageMapperK.setInputData(primaryVolume)

      console.log(`label volume is set? dims:${labelVolume.getDimensions()}`)
      this.renderPipeline.overlayMapperK.setInputData(labelVolume)
      const minPix = this.loaderService.primaryVolumeStats.min
      const maxPix = this.loaderService.primaryVolumeStats.max
      const center = (minPix + maxPix) / 2.0
      const window = maxPix - minPix
      console.log(`w/l:${window}/${center}`)
      this.renderPipeline.imageActorK.getProperty().setColorWindow(window)
      this.renderPipeline.imageActorK.getProperty().setColorLevel(center)
      let minSpacing = Number.MAX_SAFE_INTEGER
      const commonSpacing = primaryVolume.getSpacing()

      for (let ax = 0; ax < 3; ax++) {
        if (commonSpacing[ax] < minSpacing) {
          minSpacing = commonSpacing[ax]
        }
      }
      this.paintRadius = 3 * minSpacing
      this.cameraSettings.initializeCameraControls(primaryVolume, this.renderPipeline.renderer.getActiveCamera())

      this.cameraSettings.calcImageDominantDirections()
      this.renderPipeline.initPipelineToCurrentVolume()
      this.cameraSettings.axialView(
        [this.renderPipeline.imageMapperK, this.renderPipeline.overlayMapperK], null)

      this.painter.configure(labelVolume)
      this.renderPipeline.renderWindow.render()
    })
    this.viewSynchronizer.onCursorUpdate().subscribe((coord)=>{
      this.CursorCoord = this.viewSynchronizer.formattedCursorCoord();
    })
  }

  fullReset (view: number) {

  }

  pageTo (relativeISliceNumber: number) {
    const vol = this.renderPipeline.imageMapperK.getInputData()
    const dims = vol.getDimensions()
    const upperSlice = dims[this.renderPipeline.imageMapperK.getSlicingMode()]
    const slice = this.renderPipeline.imageMapperK.getSlice()
    let newSlice = slice + relativeISliceNumber
    if (relativeISliceNumber > 0) {
      if (slice + relativeISliceNumber >= upperSlice) {
        newSlice = upperSlice - 1
      }
    } else {
      if (slice + relativeISliceNumber < 0) {
        newSlice = 0
      }
    }

    this.cameraSettings.pageTo(slice, newSlice,
      [this.renderPipeline.imageMapperK, this.renderPipeline.overlayMapperK], this.viewDirectionIJKAxisNumber)
  }

  getInputVolume (): vtkImageData {
    const inputVol = this.renderPipeline.imageMapperK.getInputData()
    const dims = inputVol.getDimensions()
    console.log(`getInputVolume returning vol with dims:${dims}`)
    return this.renderPipeline.imageMapperK.getInputData()
  }

  getPrimaryRenderer (): vtkRenderer {
    return this.renderPipeline.renderer
  }

  getLabelRenderer (): vtkRenderer {
    return this.renderPipeline.overlayRenderer
  }

  getPrimaryImageSlice (): vtkImageSlice {
    return this.renderPipeline.imageActorK
  }

  getLabelImageSlice (): vtkImageSlice {
    return this.renderPipeline.overlayImageActor
  }

  updateMouseMode (mode: AppMouseModes) {
    console.log(`mouseMode:${mode}`)
    if (this.renderPipeline.interactor === null) {
      return
    }

    const pzInteractor = this.renderPipeline.interactorStyle as ImagePanZoomInteractorStyle
    if (mode === AppMouseModes.ERASE) {
      pzInteractor.setMouseBtn1Mode(AppMouseModes.DRAW)
      pzInteractor.setDrawValue(0)
    } else {
      if (mode === AppMouseModes.DRAW) {
        pzInteractor.setMouseBtn1Mode(AppMouseModes.DRAW)
        pzInteractor.setDrawValue(100)
      } else {
        pzInteractor.setMouseBtn1Mode(mode)
      }
    }
  }

  updateDrawColor (intensity: number) {
    console.log(`updateDrawColor(${intensity})`)
    const pzInteractor = this.renderPipeline.interactorStyle as ImagePanZoomInteractorStyle
    pzInteractor.setDrawValue(intensity)
  }

  ngAfterViewInit (): void {
    const interactor = ImagePanZoomInteractorStyle.newInstance()
    interactor.setView(this)
    interactor.setInteractionMode('IMAGE3D')
    interactor.setMouseBtn1Mode(AppMouseModes.WL) // sync with the setting in the html input radio buttons

    this.renderPipeline.initCommonVtkJSPipeline(this.vtkDiv, interactor)
    try {
      if (this.renderPipeline.renderWindow === null) {
        return
      }
      console.log('added overlay renderer to window')
      this.renderPipeline.renderer.setLayer(1)
      this.renderPipeline.overlayRenderer.setLayer(2)
      this.renderPipeline.renderWindow.setNumberOfLayers(5)

      this.renderPipeline.renderer.addActor(this.renderPipeline.imageActorK)
      this.renderPipeline.overlayRenderer.addActor(this.renderPipeline.overlayImageActor)
      for (let ax = 0; ax < 3; ax++) {
      //  this.renderPipeline.renderer.addActor(this.renderPipeline.primaryBasisLines[ax].actor);
      //  this.renderPipeline.overlayRenderer.addActor(this.renderPipeline.overlayBasisLines[ax].actor);
      }
      this.renderPipeline.renderWindow.addRenderer(this.renderPipeline.overlayRenderer)
      this.renderPipeline.overlayRenderer.resetCamera()
      this.renderPipeline.renderer.resetCamera()
      this.renderPipeline.renderWindow.render()

      // we just add one orientation for now.
    } catch (e) {
    }
  }

  getPipelineViewSize () {
    if (this.renderPipeline.renderWindow === null) {
      throw new Error('invalid render pipeline state')
    }
    const views = this.renderPipeline.renderWindow.getViews()
    const view = views[0]
    return view.getViewportSize(this.renderPipeline.renderer)
  }

  displayToLPS (lps: vec3, display: vec3) {
    if (this.renderPipeline.renderWindow === null) {
      throw new Error('invalid render pipeline state')
    }
    const views = this.renderPipeline.renderWindow.getViews()
    const view = views[0]
    const normDisplay = view.displayToNormalizedDisplay(display[0], display[1], display[2])
    const vpSize = this.getPipelineViewSize()
    const aspect = vpSize[0] / vpSize[1]
    const renderer = this.renderPipeline.renderer
    const projCoord = renderer.normalizedDisplayToProjection(normDisplay[0], normDisplay[1], 0)
    const viewCoord = renderer.projectionToView(projCoord[0], projCoord[1], projCoord[2], aspect)
    const worldCoord = renderer.viewToWorld(viewCoord[0], viewCoord[1], viewCoord[2])
    lps[0] = worldCoord[0]
    lps[1] = worldCoord[1]
    lps[2] = worldCoord[2]
  }

  panTo (currentDisplayCoord: vec3, originalDisplayCoord: vec3, camPos: vec3, camFocus: vec3): void {
    console.log(`pan cur:${currentDisplayCoord} init:${originalDisplayCoord}`)
    const camera = this.renderPipeline.renderer.getActiveCamera()
    const initLPS = vec3.create()
    const curLPS = vec3.create()
    this.displayToLPS(initLPS, originalDisplayCoord)
    this.displayToLPS(curLPS, currentDisplayCoord)
    console.log(`from:${initLPS} to:${curLPS}`)
    const lpsDisplacement = vec3.create()
    vec3.subtract(lpsDisplacement, initLPS, curLPS)
    const newCamLocs = vec3.create()
    const camLocs = vec3.create()
    vec3.copy(camLocs, camPos)
    vec3.add(newCamLocs, camLocs, lpsDisplacement)
    camera.setPosition(newCamLocs[0], newCamLocs[1], newCamLocs[2])
    vec3.copy(camLocs, camFocus)
    vec3.add(newCamLocs, camLocs, lpsDisplacement)
    camera.setFocalPoint(newCamLocs[0], newCamLocs[1], newCamLocs[2])
  }

  zoomTo (currentDisplayCoord: vec3, originalDisplayCoord: vec3, origParallelScale: number): void {
    const viewportSize = this.getPipelineViewSize()
    const vpCenter = vec3.fromValues(viewportSize[0] / 2.0, viewportSize[1] / 2.0, 0.0)
    const vpCenterLPS = vec3.create()
    this.displayToLPS(vpCenterLPS, vpCenter)
    const currentLPS = vec3.create()
    const initialLPS = vec3.create()
    this.displayToLPS(currentLPS, currentDisplayCoord)
    this.displayToLPS(initialLPS, originalDisplayCoord)
    const origDistance = vec3.distance(vpCenterLPS, initialLPS)
    const newDistance = vec3.distance(vpCenterLPS, currentLPS)
    const ratio = origDistance / newDistance
    const camera = this.renderPipeline.renderer.getActiveCamera()
    console.log(`ratio:${ratio} current Scale: ${camera.getParallelScale()} proposed scale:${origParallelScale * ratio}`)
    camera.setParallelScale(origParallelScale * ratio)
  }

  displayCamFocusToLPS (displayCoord: vec3, lpsCoord: vec3) {
    if (this.renderPipeline.renderWindow === null) {
      console.error('no render window')
      return
    }

    const views = this.renderPipeline.renderWindow.getViews() as unknown as vtkOpenGLRenderWindow[]
    const view = views[0]
    const normDisplay = view.displayToNormalizedDisplay(displayCoord[0], displayCoord[1], 0.0)

    const vpSize = view.getViewportSize(this.renderPipeline.renderer)

    const aspect = vpSize[0] / vpSize[1]
    const camera = this.renderPipeline.renderer.getActiveCamera()
    const focalPoint = camera.getFocalPoint()

    const focalViewCoord = this.renderPipeline.renderer.worldToView(focalPoint[0], focalPoint[1], focalPoint[2])

    const projCoord = this.renderPipeline.renderer.normalizedDisplayToProjection(normDisplay[0], normDisplay[1], 0)

    const viewCoord2 = this.renderPipeline.renderer.projectionToView(projCoord[0], projCoord[1], projCoord[2], aspect)
    // view coordinate z is distance down the view frustum, so take the camera focal point's z coordinate
    // into the cursor's x/y coords.
    viewCoord2[2] = focalViewCoord[2]
    const worldCoord = this.renderPipeline.renderer.viewToWorld(viewCoord2[0], viewCoord2[1], viewCoord2[2])
    vec3.set(lpsCoord, worldCoord[0], worldCoord[1], worldCoord[2])
  }

  rc (displayCoord: vec3): void {
    if (this.renderPipeline.renderWindow === null) {
      console.error('no render window')
      return
    }
    const lpsCoord = vec3.create()
    this.displayCamFocusToLPS(displayCoord, lpsCoord)
    this.viewSynchronizer.updateCursor([lpsCoord[0],lpsCoord[1],lpsCoord[2]]);
  }

  draw (dcP1: vec3, dcP2: vec3, intensity: number) {
    console.log(`draw from ${dcP1} to ${dcP2} with ${intensity}`)
    const lps1 = vec3.create()
    const lps2 = vec3.create()
    this.displayCamFocusToLPS(dcP1, lps1)
    this.displayCamFocusToLPS(dcP2, lps2)
    console.log(` label draw(${lps1},${lps2},${this.paintRadius},${intensity}`)
    this.painter.draw(lps1, lps2, this.paintRadius, intensity)

    this.renderPipeline.overlayMapperK.getInputData().modified()
    this.renderPipeline.overlayMapperK.modified()
    this.renderPipeline.overlayImageActor.getMapper().modified()
    this.renderPipeline.overlayRenderer.getRenderWindow()?.render()
  }

  endDraw () {
    this.viewSynchronizer.updateLabelVolume()
  }
}
