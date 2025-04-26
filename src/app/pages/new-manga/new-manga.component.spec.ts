import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMangaComponent } from './new-manga.component';

describe('NewMangaComponent', () => {
  let component: NewMangaComponent;
  let fixture: ComponentFixture<NewMangaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMangaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMangaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
