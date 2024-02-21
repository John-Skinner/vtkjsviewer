import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouseModesComponent } from './mouse-modes.component';

describe('MouseModesComponent', () => {
  let component: MouseModesComponent;
  let fixture: ComponentFixture<MouseModesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouseModesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MouseModesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
