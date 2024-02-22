import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ViewSynchronizerService {
  labelUpdatedSubject = new Subject<void>()

  updateLabelVolume (): void {
    this.labelUpdatedSubject.next()
  }

  onUpdateLabelVolume (): Observable<void> {
    return this.labelUpdatedSubject.asObservable()
  }
}
