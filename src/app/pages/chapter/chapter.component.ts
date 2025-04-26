import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MangaService } from '../../core/services/manga.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [HeaderComponent,FooterComponent,CommonModule,RouterModule,FormsModule],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss'
})
export class ChapterComponent implements OnInit {
  chapterData: string[] = [];
  mangaDetails: any;
  chapterList: any[] = [];  // Add this at the top with your other variables
  selectedChapterId: string = '';
  selectedMangaId: string = '';
  mangaTitle: string = '';

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute, private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const chapterId = params.get('id');
      const mangaId = params.get('mangaid');
      if (chapterId) {
        this.selectedChapterId = chapterId;
        this.chapterData = await this.getChapterPages(chapterId);
      }
      if (mangaId) {
        this.selectedMangaId = mangaId;
        this.loadChapterList(mangaId);
        this.loadMangaTitle(mangaId);
      }
    });
  }

  loadMangaTitle(mangaId: string) {
    this.mangaService.getManga(mangaId).subscribe({
      next: (mangaRes: any) => {
        try {
          const manga = mangaRes.data;
          if (!manga) throw new Error('Manga not found');

          // First, try to get the English title
          let title = manga.attributes.title?.en;

          // If not available, fallback to any alternate title
          if (!title) {
            const altTitles = manga.attributes.altTitles;
            if (altTitles && altTitles.length > 0) {
              title = Object.values(altTitles[0])[0] as string;
            } else {
              title = 'No Title';
            }
          }

          // ✅ Title is ready to use
          this.mangaTitle = title;
        } catch (error) {
          console.error('Error fetching manga title:', error);
        }
      },
      error: (err) => {
        console.error('Error fetching manga:', err);
      }
    });
  }


  async loadChapterList(mangaId: string) {
    let allChapters: any[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const chapterRes = await this.mangaService.getChaptersList(mangaId, 100, offset).toPromise();

      const chapters = chapterRes.data.map((ch: any) => ({
        id: ch.id,
        chapterNumber: ch.attributes.chapter || 'N/A',
        title: ch.attributes.title || `Chapter ${ch.attributes.chapter || 'N/A'}`,
        uploadedTime: new Date(ch.attributes.readableAt).toLocaleString("en-US", {
          month: "short", day: "2-digit", year: "numeric"
        })
      }));

      allChapters = allChapters.concat(chapters);

      if (chapterRes.data.length === 100) {
        offset += 100;
      } else {
        hasMore = false;
      }
    }

  // REMOVE DUPLICATES BASED ON chapterNumber
  const uniqueChaptersMap = new Map<string, any>();
  allChapters.forEach(chapter => {
    if (!uniqueChaptersMap.has(chapter.chapterNumber)) {
      uniqueChaptersMap.set(chapter.chapterNumber, chapter);
    }
  });

  this.chapterList = Array.from(uniqueChaptersMap.values());
    // this.chapterList = allChapters;
  }

  get currentChapterInfo(): string {
    const chapter = this.chapterList.find(ch => ch.id === this.selectedChapterId);
    if (chapter) {
      return `Chapter ${chapter.chapterNumber} - ${chapter.title}`;
    }
    return 'Unknown Chapter';
  }


  canGoToPrevious(): boolean {
    const index = this.chapterList.findIndex(ch => ch.id === this.selectedChapterId);
    return index < this.chapterList.length - 1;
  }

  canGoToNext(): boolean {
    const index = this.chapterList.findIndex(ch => ch.id === this.selectedChapterId);
    return index > 0;
  }

  goToPreviousChapter() {
    const index = this.chapterList.findIndex(ch => ch.id === this.selectedChapterId);
    if (index < this.chapterList.length - 1) {
      this.selectedChapterId = this.chapterList[index + 1].id;
      this.router.navigate(['/chapter', this.selectedChapterId, this.selectedMangaId]);
    }
  }

  goToNextChapter() {
    const index = this.chapterList.findIndex(ch => ch.id === this.selectedChapterId);
    if (index > 0) {
      this.selectedChapterId = this.chapterList[index - 1].id;
      this.router.navigate(['/chapter', this.selectedChapterId, this.selectedMangaId]);
    }
  }

  async getChapterPages(chapterId: string): Promise<string[]> {
    try {
      const res = await this.mangaService.getChapter(chapterId).toPromise();
      const baseUrl = res.baseUrl;
      const hash = res.chapter.hash;
      const pages = res.chapter.data;
      return pages.map((filename: string) => `${baseUrl}/data/${hash}/${filename}`);
    } catch (err) {
      console.error(`Failed to get pages for chapter ${chapterId}:`, err);
      return [];
    }
  }

  onChapterSelect(event: any) {
    const chapterId = event.target.value;
    if (chapterId) {
      this.selectedChapterId = chapterId;
      this.router.navigate(['/chapter', chapterId, this.selectedMangaId]);
    }
  }
}
