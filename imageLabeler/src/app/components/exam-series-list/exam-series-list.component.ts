import {Component, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {
  MatNestedTreeNode,
  MatTree,
  MatTreeNestedDataSource,
  MatTreeNode, MatTreeNodeDef,
  MatTreeNodeOutlet,
  MatTreeNodeToggle
} from "@angular/material/tree";
import {MatIcon} from "@angular/material/icon";
import {ExamSeriesLoaderService, ExamSeriesNode} from "../../services/exam-series-loader.service";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'app-exam-series-list',
  standalone: true,
  imports: [
    MatTree,
    MatTreeNodeToggle,
    MatNestedTreeNode,
    MatTreeNode,
    MatIcon,
    MatTreeNodeOutlet,
    MatIconButton,
    MatTreeNodeDef
  ],
  templateUrl: './exam-series-list.component.html',
  styleUrl: './exam-series-list.component.scss'
})
export class ExamSeriesListComponent implements OnInit {
  treeControl =
    new NestedTreeControl<ExamSeriesNode>(node=>node.children);
  examsSource=new MatTreeNestedDataSource<ExamSeriesNode>()
  constructor(private examSeriesService:ExamSeriesLoaderService)
  {
    this.examSeriesService.onExamLoadedSubject().subscribe(()=>
    {
      console.log('update the exam level');
      this.examsSource.data = this.examSeriesService.getExams();
      this.examsSource.data.forEach((entry)=> {
        console.log(`entry for ui:${entry}`);
      })
    })

  }
  expand(node:ExamSeriesNode) {
    if (node.children) {
      console.log(`parent(${node.name})`);
    }
    else {
      if (!node.parent) {
        return;
      }
      console.log(`child(${node.name}) ${node.parent}`);
      this.examSeriesService.getSeriesVolumeSummary(node.parent,node.name)
    }
  }
  leaf() {
    console.log(`leaf`);
  }
  hasChild = (_: number, node: ExamSeriesNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
    this.loadExamSeries().then(()=>{
      console.log(`initial load started`);
    })


    }
    async loadExamSeries()
    {
      await this.examSeriesService.LoadExamsList();
      console.log('response returned');
    }
}
