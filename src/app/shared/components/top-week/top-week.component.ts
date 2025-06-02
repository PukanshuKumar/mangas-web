import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MangaService } from '../../../core/services/manga.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-week',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-week.component.html',
  styleUrl: './top-week.component.scss',
})
export class TopWeekComponent implements OnInit, AfterViewInit {
  topWeeklyManga: any[] = [];
  currentSlide = 0;
  slideTimer: any;

  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.loadTopWeekly();
    // this.autoSlide(); // Start autoplay
  }

  loadTopWeekly() {
    const validManga: any[] = [];
    const seenMangaIds = new Set<string>();
    let offset = 0;
    const limit = 10;
    let attempt = 0;
    const maxAttempts = 5;

    const fetchMore = async () => {
      if (attempt >= maxAttempts) {
        console.warn(
          `Max attempts (${maxAttempts}) reached. Ending fetch early.`
        );
        this.topWeeklyManga = validManga;
        return;
      }

      attempt++;
      try {
        const res: any = await this.mangaService
          .getTopWeekly(offset)
          .toPromise();
        offset += 10;

        for (const manga of res.data) {
          if (seenMangaIds.has(manga.id)) continue;

          try {
            // Check if chapter exists
            const chapterRes = await this.mangaService
              .getLatestChapter(manga.id)
              .toPromise();

              if (
                !chapterRes ||
                !chapterRes.data ||
                chapterRes.data.length === 0 ||
                chapterRes.data[0].attributes.chapter === null
              ) {
                continue; // skip this manga
              }


            const chapter = chapterRes.data[0];
            const chapterData = chapter.attributes;

            // Get cover
            let coverUrl = 'https://via.placeholder.com/150';
            const coverRel = manga.relationships.find(
              (r: any) => r.type === 'cover_art'
            );
            if (coverRel) {
              const coverData = await this.mangaService
                .getCoverImage(coverRel.id)
                .toPromise();
              if (coverData?.data?.attributes?.fileName) {
                coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}.256.jpg`;
              }
            }


        // 🔹 Alt Title
        const altTitlesForTitle =
        manga.attributes.altTitles?.find((alt: any) => alt.en)?.en ||
        (manga.attributes.altTitles?.length
          ? Object.values(manga.attributes.altTitles[0])[0]
          : 'No Title');

            // Push to result
            validManga.push({
              id: manga.id,
              title: manga.attributes.title.en || altTitlesForTitle ||'Untitled',
              cover: coverUrl,
              chapterId: chapter.id,
              chapter: chapterData.chapter || 'N/A',
              chapterTitle: chapterData.title || '',
              updatedAt: chapterData.readableAt || '',
            });

            seenMangaIds.add(manga.id);

            if (validManga.length === limit) break;
          } catch (err) {
            console.warn(`Skipping manga ${manga.id} due to error`, err);
          }
        }

        // Continue fetching if we still need more
        if (validManga.length < limit) {
          await fetchMore();
        } else {
          this.topWeeklyManga = validManga;
        }
      } catch (err) {
        console.error('Failed to fetch manga list:', err);
      }
    };

    fetchMore();
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
    this.currentSlide =
      (this.currentSlide - 1 + this.topWeeklyManga.length) %
      this.topWeeklyManga.length;
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
