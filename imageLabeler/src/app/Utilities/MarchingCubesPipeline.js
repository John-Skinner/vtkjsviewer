import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes'
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {BasePipeline} from "./BasePipeline";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";

export class MarchingCubesPipeline extends BasePipeline
{


  /**
   *
   * @param {vtkActor} actor
   */
  constructor()
  {
    super();

    /**
     *
     * @type {vtkActor}
     */

    /**
     * @type {vtkImageMarchingCubes}
     */
    this.mcFilter = vtkImageMarchingCubes.newInstance({
      computeNormals: true,
      mergePoints: true,
      contourValue: 0.0
    });

    /**
     *
     * @type {vtkMapper}
     */
    this.mapper = vtkMapper.newInstance();
    this.mcActor = vtkActor.newInstance();
    this.mcActor.setMapper(this.mapper);
  }

  /**
   *
   * @param {vtkImageData} image
   */
  setImage(image)
  {
    this.image = image;

  }

  configure()
  {
    if (!this.image)
    {
      throw new Error('Error, must have image set before configure');
    }
    console.log('setInputConnection');
  //  this.mcFilter.setInputConnection(this.image);
    this.mcFilter.setInputData(this.image);
    this.mapper.setInputConnection(this.mcFilter.getOutputPort());
  }
  getMcActor() {
    return this.mcActor;
  }

  /**
   *
   * @param {number} value
   */
  updateIsoValue(value)
  {
    console.log(`update iso values to ${value}`);
    this.mcFilter.setContourValue(value);
    let polys = this.mcFilter.getOutputPort();
    console.dir(polys);
    this.renderWindow.render();

  }
}
