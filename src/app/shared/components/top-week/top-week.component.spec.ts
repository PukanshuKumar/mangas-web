import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopWeekComponent } from './top-week.component';

describe('TopWeekComponent', () => {
  let component: TopWeekComponent;
  let fixture: ComponentFixture<TopWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
