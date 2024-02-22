import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core'
import { AppMouseModes } from '../../Utilities/ImagePanZoomInteractorStyle/Constants'

@Component({
  selector: 'app-mouse-modes',
  standalone: true,
  templateUrl: './mouse-modes.component.html',
  styleUrl: './mouse-modes.component.scss'
})
export class MouseModesComponent {
  @ViewChild('panID') panRadio!: ElementRef
  @ViewChild('zoomID') zoomRadio!: ElementRef
  @ViewChild('pageID') pageRadio!: ElementRef
  @Output() mouseModeEvent = new EventEmitter<number>()
  @Output() drawColorEvent = new EventEmitter<number>()
  currentMode: AppMouseModes = AppMouseModes.WL
  setMouseModePan () {
    this.mouseModeEvent.emit(AppMouseModes.PAN)
    this.currentMode = AppMouseModes.PAN
  }

  setMouseModeZoom () {
    this.mouseModeEvent.emit(AppMouseModes.ZOOM)
    this.currentMode = AppMouseModes.ZOOM
    console.log('zoom')
  }

  setMouseModePage () {
    this.mouseModeEvent.emit(AppMouseModes.PAGE)
    this.currentMode = AppMouseModes.PAGE
  }

  setWL () {
    this.mouseModeEvent.emit(AppMouseModes.WL)
    this.currentMode = AppMouseModes.WL
  }

  setRC () {
    this.mouseModeEvent.emit(AppMouseModes.RC)
    this.currentMode = AppMouseModes.RC
  }

  setDraw () {
    this.mouseModeEvent.emit(AppMouseModes.DRAW)
    this.currentMode = AppMouseModes.DRAW
  }

  setErase () {
    this.mouseModeEvent.emit(AppMouseModes.ERASE)
    this.currentMode = AppMouseModes.ERASE
  }

  setDrawValue (event: Event) {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value
    const iValue = Number(value)
    this.drawColorEvent.emit(iValue)
    console.log(`draw value:${iValue}`)
  }
}
