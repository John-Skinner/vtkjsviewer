import { Component, type OnInit } from '@angular/core'
import { NestedTreeControl } from '@angular/cdk/tree'
import {
  MatNestedTreeNode,
  MatTree,
  MatTreeNestedDataSource,
  MatTreeNode, MatTreeNodeDef,
  MatTreeNodeOutlet,
  MatTreeNodeToggle
} from '@angular/material/tree'
import { MatIcon } from '@angular/material/icon'
import { ExamSeriesLoaderService, ExamSeriesNode } from '../../services/exam-series-loader.service'
import { MatIconButton } from '@angular/material/button'

/**
 * ExamSeriesListComponent serves as the view into the 'database' of images, as well as the
 * control for loading datasets.
 */

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
    new NestedTreeControl<ExamSeriesNode>(node => node.children)

  examsSource = new MatTreeNestedDataSource<ExamSeriesNode>()
  constructor (private examSeriesService: ExamSeriesLoaderService) {
    this.examSeriesService.onExamLoadedSubject().subscribe(() => {
      console.log('update the exam level')
      this.examsSource.data = this.examSeriesService.getExams()
    })
  }

  expand (node: ExamSeriesNode): void {
    let hasChildren = node !== null
    if (hasChildren) {
      hasChildren = node.children !== undefined
      if (hasChildren) {
        console.log(`number of children:${node.children?.length}`)
      }
    }
    if (hasChildren) {
      console.log(`parent(${node.name})`)
    } else {
      console.log(` getSeriesVolumeSummary(${node.parent},${node.name})`)
      this.examSeriesService.getSeriesVolumeSummary(node.parent, node.seriesDir)
        .then(() => { console.log('series summary returned') })
        .catch((reason) => {
          throw new Error(`Error, fetching series reason:${reason}`)
        })
    }
  }

  hasChild = (_: number, node: ExamSeriesNode): boolean => {
    if (node === undefined) {
      return false
    }
    if (node.children === undefined) {
      return false
    }
    if (node.children.length === 0) {
      return false
    }
    return true
  }

  ngOnInit (): void {
    this.loadExamSeries()
      .then(() => {
        console.log('initial load started')
      })
      .catch((reason) => {
        throw new Error(`Error on loading exams reason:${reason}`)
      })
  }

  async loadExamSeries (): Promise<void> {
    await this.examSeriesService.LoadExamsList()
    console.log('response returned')
  }
}
