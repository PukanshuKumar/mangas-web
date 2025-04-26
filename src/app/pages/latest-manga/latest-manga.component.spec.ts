import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestMangaComponent } from './latest-manga.component';

describe('LatestMangaComponent', () => {
  let component: LatestMangaComponent;
  let fixture: ComponentFixture<LatestMangaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestMangaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestMangaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
