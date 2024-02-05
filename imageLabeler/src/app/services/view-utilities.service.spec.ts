import { TestBed } from '@angular/core/testing';

import { ViewUtilitiesService } from './view-utilities.service';

describe('ViewUtilitiesService', () => {
  let service: ViewUtilitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewUtilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
