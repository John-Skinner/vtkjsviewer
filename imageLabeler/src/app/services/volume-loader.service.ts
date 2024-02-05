import { Injectable } from '@angular/core';
import {VolumeAPI} from "./exam-series-loader.service";
import {Subject} from "rxjs";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
export interface VolumeSlice {
  exam:string,
  series:string,
  image:number,
  pixels:string
}

@Injectable({
  providedIn: 'root'
})
export class VolumeLoaderService {
  image:vtkImageData | null = null;
  pixels:Int16Array = new Int16Array(1);
  volumeLoadedSubject:Subject<vtkImageData> = new Subject<vtkImageData>();
  pendingSlice = -1;
  volume:VolumeAPI;
  onVolumeLoaded() {
    return this.volumeLoadedSubject.asObservable();
  }

  constructor(volumeDescription:VolumeAPI) {
    this.volume = volumeDescription;
  }
  loadPixels() {
    this.pendingSlice = 0;
    this.pixels = new Int16Array(this.volume.ijkDimension[0]*this.volume.ijkDimension[1]*this.volume.ijkDimension[2]);
    this.loadNextSlice();

  }
  base64ToShortArray(base64:string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    var shorts = new Int16Array(bytes.buffer);
    return shorts;
  }

  async loadNextSlice()
  {
    let volumeResponse = await fetch('/images/e' + this.volume.exam + '/s' + this.volume.series + '/i' + this.pendingSlice);
    let volumeSlice = await volumeResponse.json() as VolumeSlice;
    let shorts = this.base64ToShortArray(volumeSlice.pixels);
    let sliceSize = this.volume.ijkDimension[0]*this.volume.ijkDimension[1];
    let base = sliceSize*this.pendingSlice;
    for(let i = 0;i < sliceSize;i++) {
      this.pixels[base+i] = shorts[i];
    }
  }
}
