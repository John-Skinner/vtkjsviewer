import { TestBed } from '@angular/core/testing'

import { ViewSynchronizerService } from './view-synchronizer.service'

describe('ViewSynchronizerService', () => {
  let service: ViewSynchronizerService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ViewSynchronizerService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
