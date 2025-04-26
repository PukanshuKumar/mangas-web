import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MangaService } from '../../../core/services/manga.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-week',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './top-week.component.html',
  styleUrl: './top-week.component.scss'
})
export class TopWeekComponent implements OnInit, AfterViewInit  {
  topWeeklyManga: any[] = [];
  currentSlide = 0;
  slideTimer: any;

  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.loadTopWeekly();
    // this.autoSlide(); // Start autoplay
  }

  loadTopWeekly() {
    this.mangaService.getTopWeekly().subscribe(async (res: any) => {
      const results = await Promise.all(res.data.map(async (manga: any) => {
        const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
        let coverUrl = 'https://via.placeholder.com/150';

        if (coverRel) {
          const coverData = await this.mangaService.getCoverImage(coverRel.id).toPromise();
          if (coverData?.data?.attributes?.fileName) {
            coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}.256.jpg`;
          }
        }

        const chapterRes = await this.mangaService.getLatestChapter(manga.id).toPromise();
        const chapterData = chapterRes?.data?.[0]?.attributes || {};

        return {
          id: manga.id,
          title: manga.attributes.title.en || 'Untitled',
          cover: coverUrl,
          chapterId: chapterRes?.data?.[0]?.id,
          chapter: chapterData.chapter || 'N/A',
          chapterTitle: chapterData.title || '',
          updatedAt: chapterData.readableAt || ''
        };
      }));

      this.topWeeklyManga = results;
    });
  }

  autoSlide() {
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, 5000); // Slide every 5s
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.topWeeklyManga.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.topWeeklyManga.length) % this.topWeeklyManga.length;
  }

  @ViewChild('slider', { static: false }) slider!: ElementRef;


  ngAfterViewInit() {
    // Now you can safely access this.slider.nativeElement
  }

  scrollSlider(direction: 'next' | 'prev') {
    if (!this.slider) return;
    const container = this.slider.nativeElement;
    const item = container.querySelector('.slider_item');
    if (!item) return;

    const itemWidth = item.offsetWidth;
    const scrollAmount = direction === 'next' ? itemWidth : -itemWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    clearInterval(this.slideTimer);
    this.autoSlide();
  }
}
