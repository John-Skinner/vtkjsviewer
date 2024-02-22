import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { VolumeLoaderService } from '../../services/volume-loader.service'

@Component({
  selector: 'app-volume-details',
  standalone: true,
  imports: [],
  templateUrl: './volume-details.component.html',
  styleUrl: './volume-details.component.scss'
})
export class VolumeDetailsComponent implements AfterViewInit {
  @ViewChild('progressItem') progress!: ElementRef
  constructor (private volumeLoadService: VolumeLoaderService) {
    this.volumeLoadService.onLoadProgress().subscribe((completion) => {
      const progressItem = this.progress.nativeElement as HTMLProgressElement
      progressItem.value = completion
    })
  }

  ngAfterViewInit (): void {
    const progressItem = this.progress.nativeElement as HTMLProgressElement
    progressItem.value = 0
  }
}
