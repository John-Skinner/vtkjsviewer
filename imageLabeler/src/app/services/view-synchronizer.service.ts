import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ViewSynchronizerService {
  labelUpdatedSubject = new Subject<void>()
  cursorUpdateSubject = new Subject<number[]>()
  lps = [0,0,0];

  private annotatedCoord(v:number,negChar:string, posChar:string) {
    if (v < 0) {
      return negChar + Number.parseFloat((-v).toString()).toFixed(1);
    }
    else {
      return posChar + Number.parseFloat((v).toString()).toFixed(1);
    }
  }
  formattedCursorCoord():string {
    // LR

    let coordString = '';

      coordString += this.annotatedCoord(this.lps[0],'R','L');
      coordString += '/' + this.annotatedCoord(this.lps[1],'A','P');
      coordString += '/' + this.annotatedCoord(this.lps[2],'I','S');
      return coordString;
  }

  updateLabelVolume (): void {
    this.labelUpdatedSubject.next()
  }

  onUpdateLabelVolume (): Observable<void> {
    return this.labelUpdatedSubject.asObservable()
  }
  updateCursor(lps:number[]) {
    this.lps[0] = lps[0];
    this.lps[1] = lps[1];
    this.lps[2] = lps[2];
    this.cursorUpdateSubject.next(this.lps);
  }
  onCursorUpdate():Observable<number[]> {
    return this.cursorUpdateSubject.asObservable();
  }
}
