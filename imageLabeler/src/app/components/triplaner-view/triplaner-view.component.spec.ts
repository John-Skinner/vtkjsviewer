import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriplanerViewComponent } from './triplaner-view.component';

describe('TriplanerViewComponent', () => {
  let component: TriplanerViewComponent;
  let fixture: ComponentFixture<TriplanerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriplanerViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TriplanerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
