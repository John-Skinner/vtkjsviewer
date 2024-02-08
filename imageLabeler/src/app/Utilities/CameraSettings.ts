import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";

export class CameraSettings {
  _camera:vtkCamera | null = null;
  _image:vtkImageData | null = null;
  _initialized = false;
  constructor()
  {
  }

  private calcVolumeFeature() {
    if (!this._camera) {
      console.error('')
    }
  }
 controlVolumeViewWithCamera(image:vtkImageData,camera:vtkCamera) {
    if (!camera) {
      console.error('Error, must set camera with non-null value');
      return;
    }
    if (!image) {
      console.error('Error, must set image to non-null value');
      return;
    }
    this._camera = camera;
    this._image = image;
    this._initialized = true;
 }
  setAxialView() {

  }
}
