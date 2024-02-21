import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {VolumeLoaderService} from "./volume-loader.service";
import {ImageUtilities} from "../Utilities/ImageUtilities";
import {SyntheticImageGenerator} from "./synthetic-image.generator";
import {CameraSettings} from "../Utilities/CameraSettings";
import {PixelStatistics} from "../Utilities/PixelStatistics";

export interface ExamSeriesNode {
  name:string;
  parent?:string;
  children?:ExamSeriesNode[];
}
interface ExamListAPI {
  exams:string[]
}
interface SeriesListAPI {
  exam:string;
  series:string[];
}
export interface VolumeInstance {
  image:vtkImageData,

}
export interface VolumeAPI {
  exam:string;
  series:string;
  transform:number[];
  ijkDimension:number[]
}


@Injectable({
  providedIn: 'root'
})
export class ExamSeriesLoaderService {
  examsList:ExamSeriesNode[] = [];
  examLoadedSubject = new Subject<void>();
  seriesLoadedSubject = new Subject<string>();
  seriesVolumeSubject = new Subject<VolumeInstance>();
  labelVolume:VolumeInstance | null = null;
  primaryVolume:VolumeInstance | null = null;
  useSynthLoad = false;
  primaryVolumeStats:PixelStatistics | null = null;

  onExamLoadedSubject() {
    return this.examLoadedSubject.asObservable();
  }
  onSeriesLoadedSubject() {
    return this.seriesLoadedSubject.asObservable();
  }
  onSeriesVolumeLoaded() {
    return this.seriesVolumeSubject.asObservable();
  }
  constructor(private volumeLoader:VolumeLoaderService)
  {
  }

  public async LoadExamsList()
  {
    const response = await fetch('/images');

    console.log(`response:${response.body}`);
    console.dir(response);
    let exams = await response.json() as ExamListAPI;
    exams.exams.forEach((dir)=>{
      let examEntry:ExamSeriesNode = {
        name:dir
      }
      this.examsList.push(examEntry);
    });
    for (const node of this.examsList)
    {
      await this.LoadSeriesList(node.name);
    }
    this.examLoadedSubject.next();

  }
  public async LoadSeriesList(exam:string) {
    console.log(`loading series of exam:${exam}`);
    let examEntry = this.examsList.findIndex((node)=>{
      return (node.name === exam);
    });
    if (examEntry === -1) {
      console.error(`Error, the exam for the eries does not exist from the ${exam} entry`);
      return;
    }
    let parent = this.examsList[examEntry];
    parent.children = [];
    let seriesResponse = await fetch('/images/e' + exam);
    console.log(`series response return with ${seriesResponse}`);
    let series = await seriesResponse.json() as SeriesListAPI;
    series.series.forEach((seriesEntry)=> {
      let entry:ExamSeriesNode = {
        name:seriesEntry,
        parent:exam
      }
      parent.children?.push(entry);
    })
    this.seriesLoadedSubject.next(exam);
  }
  fillLabelVolumeFromPrimaryVolume() {
    if (this.primaryVolume) {
      if (this.primaryVolume.image) {
        this.labelVolume = {
          image:ImageUtilities.createInt16ImageFromImage(this.primaryVolume.image)
        };
        SyntheticImageGenerator.applyConstant(this.labelVolume.image,0)
      }
    }

  }
  public async getSeriesVolumeSummary(exam:string, series:string) {
    let volumeResponse = await fetch('/images/e'+ exam + '/s' + series);
    let volume = await volumeResponse.json() as VolumeAPI;
    try {


      if (this.useSynthLoad) {
        let checkerVolume = vtkImageData.newInstance();
        SyntheticImageGenerator.createCheckerBoard(checkerVolume,[64,64,32],8,[0,1000]);
        this.primaryVolume = {
          image: checkerVolume
        };
        let ijk2lps=checkerVolume.getIndexToWorld();
        CameraSettings.printMat4(ijk2lps,'checker volume');
        console.log(`origin:${checkerVolume.getOrigin()}`);
        console.log(`dimension:${checkerVolume.getDimensions()}`);
        console.log(`spacing:${checkerVolume.getSpacing()}`);

      }
      else {
        this.primaryVolume = await this.volumeLoader.aLoad(volume);
      }
      this.primaryVolumeStats = new PixelStatistics(this.primaryVolume.image);
      this.primaryVolumeStats.computeStats();

      this.fillLabelVolumeFromPrimaryVolume();

      this.seriesVolumeSubject.next(this.primaryVolume);
    }
    catch (e) {
      console.log(`pixel load error:${e}`);
    }

  }

  getExams() {
    return this.examsList;
  }
}
