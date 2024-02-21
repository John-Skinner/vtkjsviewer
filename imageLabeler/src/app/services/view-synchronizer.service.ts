import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ViewSynchronizerService {
  labelUpdatedSubject:Subject<void> = new Subject();

  constructor() { }
  updateLabelVolume() {
    this.labelUpdatedSubject.next();
  }
  onUpdateLabelVolume() {
    return this.labelUpdatedSubject.asObservable();
  }
}
