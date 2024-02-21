import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VropacityWidgetComponent } from './vropacity-widget.component';

describe('VropacityWidgetComponent', () => {
  let component: VropacityWidgetComponent;
  let fixture: ComponentFixture<VropacityWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VropacityWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VropacityWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
