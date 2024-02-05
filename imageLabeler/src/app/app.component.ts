import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {VrViewComponent} from "./components/vr-view/vr-view.component";
import {ExamSeriesListComponent} from "./components/exam-series-list/exam-series-list.component";
import {SliceViewComponent} from "./components/slice-view/slice-view.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VrViewComponent, ExamSeriesListComponent, SliceViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'imageLabeler';
}
