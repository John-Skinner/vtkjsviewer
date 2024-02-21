import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {VrTransferFuncWidget} from "./VrTransferFuncWidget";
import {ExamSeriesLoaderService} from "../../services/exam-series-loader.service";
import {VrRenderPipeline} from "../../Utilities/VrRenderPipeline";

@Component({
  selector: 'app-vropacity-widget',
  standalone: true,
  imports: [],
  templateUrl: './vropacity-widget.component.html',
  styleUrl: './vropacity-widget.component.scss'
})
export class VropacityWidgetComponent implements AfterViewInit, OnChanges {
  @ViewChild('vrWidgetControlID') widgetDiv!:ElementRef;
  @Input({required:true}) VrPipeline:VrRenderPipeline  | null = null;

  vrTransferFunctionWidget:VrTransferFuncWidget = new VrTransferFuncWidget();
  constructor(private examSeriesVolumeLoader:ExamSeriesLoaderService)
  {
    this.examSeriesVolumeLoader.onSeriesVolumeLoaded().subscribe((v)=> {
      if (!this.examSeriesVolumeLoader.primaryVolume) {
        throw new Error('no primary volume on load');
      }
      let primaryVolume = this.examSeriesVolumeLoader.primaryVolume.image;
      if (!primaryVolume) {
        throw new Error('no primary volume on load');
      }
      let labelVolume = this.examSeriesVolumeLoader.labelVolume?.image;
      if (!labelVolume) {
        throw new Error('no label volume on load');
      }
      if (!this.VrPipeline) {
        throw new Error('no pipeline initialized');
      }
      if (!this.VrPipeline.primaryPiecewiseFunction) {
        throw new Error('no primary piecewise function');
      }
      if (!this.VrPipeline.primaryColorTransferFunction) {
        throw new Error('no primary color transfer function');
      }
      if (!this.VrPipeline.renderWindow) {
        throw new Error('no render window ');
      }
      this.vrTransferFunctionWidget.configure(this.widgetDiv.nativeElement as HTMLDivElement,
        this.VrPipeline.primaryColorTransferFunction,
        this.VrPipeline.primaryPiecewiseFunction,
        primaryVolume,
        this.VrPipeline.renderWindow);
      this.vrTransferFunctionWidget.addGaussian(0.2,0.2,0.1,0.0,0.0);
      this.VrPipeline.labelVrMapper.setInputData(labelVolume);
      this.VrPipeline.renderer.addActor(this.VrPipeline.labelVrActor);
    })

  }

  ngAfterViewInit(): void
  {
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    console.log(`Input changed: ${changes}`);
  }

}
