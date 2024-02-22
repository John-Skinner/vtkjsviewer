import { TestBed } from '@angular/core/testing'

import { SyntheticImageGenerator } from './synthetic-image.generator'

describe('SyntheticImageGeneratorService', () => {
  let service: SyntheticImageGenerator

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = new SyntheticImageGenerator()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
