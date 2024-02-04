import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VrViewComponent } from './vr-view.component';

describe('VrViewComponent', () => {
  let component: VrViewComponent;
  let fixture: ComponentFixture<VrViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VrViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VrViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
