import { VolumeAPI, VolumeInstance } from './exam-series-loader.service'
import { Observable, Subject } from 'rxjs'
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import { mat3, mat4, vec3 } from 'gl-matrix'
import { Vector3 } from '@kitware/vtk.js/types'
import { Injectable } from '@angular/core'

export interface VolumeSlice {
  exam: string
  series: string
  image: number
  pixels: string
}

@Injectable({
  providedIn: 'root'
})
export class VolumeLoaderService {
  volumeInstance: VolumeInstance | null = null
  pixels: Int16Array = new Int16Array(1)
  volumeLoadedSubject: Subject<vtkImageData> = new Subject<vtkImageData>()
  loadProgressSubject: Subject<number> = new Subject<number>()
  pendingSlice = -1
  volume: VolumeAPI | null = null
  onVolumeLoaded (): Observable<vtkImageData> {
    return this.volumeLoadedSubject.asObservable()
  }

  onLoadProgress (): Observable<number> {
    return this.loadProgressSubject.asObservable()
  }

  static printMat4 (mat: mat4, title: string): void {
    console.log(`print of ${title}`)
    for (let row = 0; row < 4; row++) {
      const col = 0
      const v1 = mat[col * 4 + row]
      const v2 = mat[(col + 1) * 4 + row]
      const v3 = mat[(col + 2) * 4 + row]
      const v4 = mat[(col + 3) * 4 + row]
      console.log(v1.toFixed(2),
        v2.toFixed(2),
        v3.toFixed(2),
        v4.toFixed(2))
    }
  }

  static normalizeColumn (normVec: vec3, mat: mat4, col: number): void {
    const columnVec = vec3.fromValues(
      mat[col * 4],
      mat[col * 4 + 1],
      mat[col * 4 + 2])
    vec3.normalize(normVec, columnVec)
  }

  static fromIJK2RASIntoVtkImageGeometry (IJKToLPS: number[], origin: number[], direction: mat3, spacing: number[]): void {
    const ooo = vec3.fromValues(0, 0, 0)
    const ooi = vec3.fromValues(0, 0, 1)
    const oio = vec3.fromValues(0, 1, 0)
    const ioo = vec3.fromValues(1, 0, 0)
    const ijkToLpsMat = mat4.create()
    ijkToLpsMat.forEach((v, i) => {
      ijkToLpsMat[i] = IJKToLPS[i]
    })

    const originRes = vec3.create()
    vec3.transformMat4(originRes, ooo, ijkToLpsMat)
    const tmpVec = vec3.create()
    const diffVec = vec3.create()
    vec3.transformMat4(tmpVec, ooi, ijkToLpsMat)
    originRes.forEach((v, i) => {
      origin[i] = v
    })
    vec3.transformMat4(tmpVec, ioo, ijkToLpsMat)
    vec3.subtract(diffVec, tmpVec, originRes)
    spacing[0] = vec3.length(diffVec)
    console.log(`spacing[0]:${spacing[0]} based on diffVec:${diffVec}`)

    vec3.transformMat4(tmpVec, oio, ijkToLpsMat)
    vec3.subtract(diffVec, tmpVec, originRes)
    spacing[1] = vec3.length(diffVec)

    vec3.transformMat4(tmpVec, ooi, ijkToLpsMat)
    vec3.subtract(diffVec, tmpVec, originRes)
    spacing[2] = vec3.length(diffVec)
    const col = vec3.create()
    for (let colIndex = 0; colIndex < 3; colIndex++) {
      VolumeLoaderService.normalizeColumn(col, ijkToLpsMat, colIndex)
      for (let r = 0; r < 3; r++) {
        direction[colIndex * 3 + r] = col[r]
      }
    }
  }

  static base64ToShortArray (base64: string): Int16Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return new Int16Array(bytes.buffer)
  }

  async aLoad (volume: VolumeAPI): Promise<VolumeInstance> {
    this.volume = volume
    return await new Promise<VolumeInstance>((resolve, reject) => {
      this.load(resolve, reject)
    })
  }

  load (res: (res: VolumeInstance) => void, rej: (rej: string) => void): void {
    this.pendingSlice = 0
    if (this.volume === null) {
      console.error('Error, no volume set yet via aLoad()')
      return
    }
    this.pixels = new Int16Array(this.volume.ijkDimension[0] * this.volume.ijkDimension[1] * this.volume.ijkDimension[2])
    this.loadNextSlice(res, rej)
  }

  createVtkImageDataInstance (pixels: Int16Array): VolumeInstance | null {
    const image = vtkImageData.newInstance()
    const data = vtkDataArray.newInstance({
      name: 'intensity',
      numberOfComponents: 1,
      values: pixels
    })
    data.setRange(({
      min: -32768,
      max: 32767
    }), 0)
    image.getPointData().setScalars(data)
    if (this.volume === null) {
      console.error('Error, no volume set yet via aLoad()')
      return null
    }
    image.setDimensions(this.volume.ijkDimension)
    image.setExtent(0, this.volume.ijkDimension[0] - 1, 0, this.volume.ijkDimension[1] - 1, 0, this.volume.ijkDimension[2] - 1)
    const vtkOrigin = [0, 0, 0]
    const vtkDirection = mat3.create()
    const vtkSpacing = [0, 0, 0]
    VolumeLoaderService.fromIJK2RASIntoVtkImageGeometry(this.volume.transform, vtkOrigin, vtkDirection, vtkSpacing)
    image.setSpacing(vtkSpacing)
    image.setDirection(vtkDirection)
    const vecOrigin: Vector3 = [vtkOrigin[0], vtkOrigin[1], vtkOrigin[2]]
    image.setOrigin(vecOrigin)
    const ijkToLPS = image.getIndexToWorld()
    VolumeLoaderService.printMat4(ijkToLPS, 'image ijk2lps')
    const volumeInstance: VolumeInstance = {
      image
    }
    return volumeInstance

    // origin and direction will be captured by actor.
  }

  loadNextSlice (res: (res: VolumeInstance) => void, rej: (rej: string) => void): void {
    if (this.volume === null) {
      console.error('Error, no volume set yet via aLoad()')
      return
    }
    fetch('/images/e' + this.volume.exam + '/s' + this.volume.series + '/i' + this.pendingSlice)
      .then((response): void => {
        response.json()
          .then((jsonParsed) => {
            if (this.volume === null) {
              console.error('Error, no volume set yet via aLoad()')
              return
            }
            const volumeSlice = jsonParsed as VolumeSlice
            const shorts = VolumeLoaderService.base64ToShortArray(volumeSlice.pixels)
            const sliceSize = this.volume.ijkDimension[0] * this.volume.ijkDimension[1]
            const base = sliceSize * this.pendingSlice
            for (let i = 0; i < sliceSize; i++) {
              this.pixels[base + i] = shorts[i]
            }
            if (this.pendingSlice < this.volume.ijkDimension[2] - 1) {
              this.pendingSlice++
              const percentDone = 100.0 * this.pendingSlice / (this.volume.ijkDimension[2] - 1)
              this.loadProgressSubject.next(percentDone)
              setTimeout(() => {
                this.loadNextSlice(res, rej)
              }, 10)
              // not available in mobile or safari           requestIdleCallback(()=>{this.loadNextSlice(res,rej)});
            } else {
              this.loadProgressSubject.next(100)
              this.volumeInstance = this.createVtkImageDataInstance(this.pixels)
              if (this.volumeInstance !== null) {
                console.log(`volume resolves to:${this.volumeInstance.image.getDimensions()}`)
                res(this.volumeInstance)
              } else {
                rej('image is void')
              }
            }
          })
          .catch((reason) => {
            console.error(`Error, body not legal json content due to ${reason}`)
          })
      })
      .catch((reason) => {
        console.error(`fetch failed with reason:${reason}`)
      })
  }
}
