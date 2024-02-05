import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {mat4} from 'gl-matrix'
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import {SyntheticImageGeneratorService} from "./synthetic-image-generator.service";
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
export interface VolumeAPI {
  exam:string;
  series:string;
  transform:number[];
  ijkDimension:number[]
}
interface Volume {
  transform:mat4;
  ijkDimension:number[]
}

@Injectable({
  providedIn: 'root'
})
export class ExamSeriesLoaderService {
  examsList:ExamSeriesNode[] = [];
  volume:vtkImageData = vtkImageData.newInstance();
  examLoadedSubject = new Subject<void>();
  seriesLoadedSubject = new Subject<string>();
  seriesVolumeSubject = new Subject<vtkImageData>();

  onExamLoadedSubject() {
    return this.examLoadedSubject.asObservable();
  }
  onSeriesLoadedSubject() {
    return this.seriesLoadedSubject.asObservable();
  }
  onSeriesVolumeLoaded() {
    return this.seriesVolumeSubject.asObservable();
  }


  constructor(private syntheticVolumeService:SyntheticImageGeneratorService) {

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
    let examEntry = this.examsList.findIndex((node,index)=>{
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
  public async getSeriesVolumeSummary(exam:string, series:string) {
    let pendingSlice = 0;
    let volumeResponse = await fetch('/images/e'+ exam + '/s' + series);
    let volume = await volumeResponse.json() as VolumeAPI;

 //   let volume = vtkImageData.newInstance();
 //   this.syntheticVolumeService.createCheckerBoard(volume,[64,64,64],4,[1000,2000])
 ///   this.seriesVolumeSubject.next(volume);
  }

  getExams() {
    return this.examsList;
  }
}
