import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PolyViewComponent } from './poly-view.component'

describe('VrViewComponent', () => {
  let component: PolyViewComponent
  let fixture: ComponentFixture<PolyViewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolyViewComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(PolyViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
