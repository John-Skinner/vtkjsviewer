import { TestBed } from '@angular/core/testing'

import { ViewSynchronizerService } from './view-synchronizer.service'

describe('ViewSynchronizerService', () => {
  let service: ViewSynchronizerService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ViewSynchronizerService)
  })

  it('coord string', () => {
    expect(service).toBeTruthy()
    service.lps = [5,6,7];
    let coordStr = service.formattedCursorCoord();
    expect(coordStr).toEqual('L5.0/P6.0/S7.0');
    service.lps = [-1,-2,-3];
    coordStr = service.formattedCursorCoord();
    expect(coordStr).toEqual('R1.0/A2.0/I3.0');
    service.lps = [0,0,0];
    coordStr = service.formattedCursorCoord();
    expect(coordStr).toEqual('L0.0/P0.0/S0.0');
  })
})
