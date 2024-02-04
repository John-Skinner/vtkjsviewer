import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSeriesListComponent } from './exam-series-list.component';

describe('ExamSeriesListComponent', () => {
  let component: ExamSeriesListComponent;
  let fixture: ComponentFixture<ExamSeriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSeriesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamSeriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
