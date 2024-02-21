import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {VolumeLoaderService} from "../../services/volume-loader.service";


@Component({
  selector: 'app-volume-details',
  standalone: true,
  imports: [],
  templateUrl: './volume-details.component.html',
  styleUrl: './volume-details.component.scss'
})
export class VolumeDetailsComponent implements AfterViewInit {
  @ViewChild('progressItem') progress!: ElementRef;
  constructor(private volumeLoadService:VolumeLoaderService)
  {
    this.volumeLoadService.onLoadProgress().subscribe((completion)=>
    {
      if (this.progress) {
        let progressItem = this.progress.nativeElement as HTMLProgressElement;
        progressItem.value = completion;
      }
    })
  }

  ngAfterViewInit(): void
  {
    if (this.progress) {
      let progressItem = this.progress.nativeElement as HTMLProgressElement;
      progressItem.value = 0;
    }
  }
}
