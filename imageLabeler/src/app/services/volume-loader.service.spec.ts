import { TestBed } from '@angular/core/testing';

import { VolumeLoaderService } from './volume-loader.service';

describe('VolumeLoaderService', () => {
  let service: VolumeLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VolumeLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
