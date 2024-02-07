import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeDetailsComponent } from './volume-details.component';

describe('VolumeDetailsComponent', () => {
  let component: VolumeDetailsComponent;
  let fixture: ComponentFixture<VolumeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VolumeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
