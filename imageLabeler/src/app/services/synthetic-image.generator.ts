import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import { mat3 } from 'gl-matrix'

export interface VolumeDescription {
  dimension: number[]
  spacing: number[]
  direction: mat3
  origin: number[]
}

type PixelArrayType = Uint8Array | Int16Array

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SyntheticImageGenerator {
  private static setPixel (contents: PixelArrayType, dims: number[], xyz: number[], value: number): void {
    if (xyz[0] >= dims[0]) {
      return
    }
    if (xyz[1] >= dims[1]) {
      return
    }
    if (xyz[2] >= dims[2]) {
      return
    }
    contents[dims[0] * dims[1] * xyz[2] + dims[0] * xyz[1] + xyz[0]] = value
  }

  private static fillTile (array: PixelArrayType, dims: number[], diameter: number, address: number[], value: number): void {
    const pixAddr = [0, 0, 0]
    const corner = [address[0] * diameter, address[1] * diameter, address[2] * diameter]
    for (let iz = 0; iz < diameter; iz++) {
      pixAddr[2] = corner[2] + iz
      for (let iy = 0; iy < diameter; iy++) {
        pixAddr[1] = corner[1] + iy
        for (let ix = 0; ix < diameter; ix++) {
          pixAddr[0] = corner[0] + ix
          this.setPixel(array, dims, pixAddr, value)
        }
      }
    }
  }

  private static fillPixels (pixels: PixelArrayType, dims: number[], checkerDiameter: number, intensityPattern: number[]): void {
    for (let iz = 0; iz < Math.ceil(dims[2] / checkerDiameter); iz++) {
      for (let iy = 0; iy < Math.ceil(dims[1] / checkerDiameter); iy++) {
        for (let ix = 0; ix < Math.ceil(dims[0] / checkerDiameter); ix++) {
          const colorMod = (ix + iy + iz) % intensityPattern.length
          const color = intensityPattern[colorMod]
          this.fillTile(pixels, dims, checkerDiameter, [ix, iy, iz], color)
        }
      }
    }
  }

  public static createCheckerBoard (inImage: vtkImageData, dims: number[], checkerDiameter: number, intensityPattern: number[]): void {
    const pixels = new Int16Array(dims[0] * dims[1] * dims[2])
    this.fillPixels(pixels, dims, checkerDiameter, intensityPattern)

    const data = vtkDataArray.newInstance({
      name: 'intensity',
      numberOfComponents: 1,
      values: pixels
    })
    data.setRange({
      min: -32768,
      max: 32767
    }, 0)
    inImage.getPointData().setScalars(data)
    const dir = mat3.create()
    inImage.setDimensions(dims)
    inImage.setExtent(0, dims[0] - 1, 0, dims[1] - 1, 0, dims[2] - 1)
    inImage.setDirection(dir)
    inImage.setOrigin([10, 20, 30])
    inImage.setSpacing([10, 10, 10])
    console.log('direction, origin, spacing set')
  }

  public static applyCheckerBoard (inImage: vtkImageData, checkerDiameter: number, intensityPattern: number[]): void {
    const pixels = inImage.getPointData().getScalars().getData() as Int16Array
    const dims = inImage.getDimensions()
    this.fillPixels(pixels, dims, checkerDiameter, intensityPattern)
  }

  public static applyConstant (inImage: vtkImageData, value: number): void {
    const pixels = inImage.getPointData().getScalars().getData() as Int16Array
    pixels.forEach((v, i) => {
      pixels[i] = value
    })
  }

  public static createConstant (inImage: vtkImageData, volDesc: VolumeDescription, intensity: number): void {
    const dims = volDesc.dimension
    const pixels = new Int16Array(dims[0] * dims[1] * dims[2])
    pixels.forEach((v, i) => {
      pixels[i] = intensity
    })

    const data = vtkDataArray.newInstance({
      name: 'intensity',
      numberOfComponents: 1,
      values: pixels
    })
    data.setRange({
      min: -32768,
      max: 32767
    }, 0)
    inImage.getPointData().setScalars(data)
    inImage.setDimensions(dims)
    inImage.setExtent(0, dims[0] - 1, 0, dims[1] - 1, 0, dims[2] - 1)
    inImage.setDirection(volDesc.direction)
    inImage.setOrigin([volDesc.origin[0], volDesc.origin[1], volDesc.origin[2]])
    inImage.setSpacing(volDesc.spacing)
  }
}
