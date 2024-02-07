import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PolyViewComponent} from "./components/poly-view/poly-view.component";
import {ExamSeriesListComponent} from "./components/exam-series-list/exam-series-list.component";
import {SliceViewComponent} from "./components/slice-view/slice-view.component";
import {VrViewComponent} from "./components/vr-view/vr-view.component";
import {VolumeDetailsComponent} from "./components/volume-details/volume-details.component";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [RouterOutlet, PolyViewComponent, ExamSeriesListComponent, SliceViewComponent, VrViewComponent, VolumeDetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'imageLabeler';
}
