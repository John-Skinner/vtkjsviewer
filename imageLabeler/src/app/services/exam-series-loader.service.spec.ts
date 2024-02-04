import { TestBed } from '@angular/core/testing';

import { ExamSeriesLoaderService } from './exam-series-loader.service';

describe('ExamSeriesLoaderService', () => {
  let service: ExamSeriesLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamSeriesLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
