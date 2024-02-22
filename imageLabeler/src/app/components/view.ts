import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer'
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice'
import { vec3 } from 'gl-matrix'


/**
 * The view interface is used to bind the interaction with the different views.
 * At present, only the slice view (SliceViewComponent) implements View.
 */
export interface View {
  pageTo: (relativeISliceNumber: number) => void
  panTo: (initialDisplayCoord: vec3, originalDisplayCoord: vec3, origCamPos: vec3, origCamFocus: vec3) => void
  zoomTo: (initialDisplayCoord: vec3, originalDisplayCoord: vec3, origParallelScale: number) => void

  /**
   *
   * @param view 2 for axial (2 is the si axis), 1 for coronal (ap axis), and 0 for sagittal (rl axis)
   */
  fullReset: (view: number) => void
  rc: (displayCoord: vec3) => void
  draw: (dcP1: vec3, dcP2: vec3, intensity: number) => void
  endDraw: () => void
  getInputVolume: () => vtkImageData
  getPrimaryRenderer: () => vtkRenderer
  getLabelRenderer: () => vtkRenderer
  getPrimaryImageSlice: () => vtkImageSlice
  getLabelImageSlice: () => vtkImageSlice

}
