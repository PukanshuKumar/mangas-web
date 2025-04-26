import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MangaService } from '../../core/services/manga.service';
import { TopWeekComponent } from '../../shared/components/top-week/top-week.component';

@Component({
  selector: 'app-latest-manga',
  standalone: true,
  imports: [HeaderComponent,FooterComponent,RouterModule,TopWeekComponent,CommonModule],
  templateUrl: './latest-manga.component.html',
  styleUrl: './latest-manga.component.scss'
})
export class LatestMangaComponent  implements OnInit {
  genreNames: string[] = [];
  page: number = 1;

  mangaGenresList: any[] = [];
  filteredMangasList: any[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalManga: number = 0;
  totalPages: number = 0;
  pagesToShow: number[] = [];

  offset = 0;
  limit = 10;

  constructor( private mangaService: MangaService, private route: ActivatedRoute, private router: Router ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Reset current page and pagination
      this.currentPage = params['offset'] ? parseInt(params['offset']) / this.itemsPerPage + 1 : 1;
      this.pagesToShow = [];

      this.offset = parseInt(params['offset']) || 0;
      this.limit = parseInt(params['limit']) || 10;

      this.loadFilteredMangas( this.offset, this.limit );
    });
    this.loadGenresList();
    // this.loadFilteredMangas();
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async loadFilteredMangas(
    offsetP: number,
    limitP: number
  ) {
    const offset = offsetP;
    const limit = limitP;
    this.isLoading = true; // Start loading
    this.mangaService
      .getLatestMangaList(offset, limit)
      .subscribe(async (res: any) => {
        const results = await Promise.all(
          res.data.map(async (manga: any) => {
            let cover = 'https://via.placeholder.com/150';
            let author = 'Unknown';
            let latestChapter = null;

            // COVER
            const coverRel = manga.relationships.find(
              (r: any) => r.type === 'cover_art'
            );
            if (coverRel) {
              const coverRes = await this.mangaService
                .getCoverImage(coverRel.id)
                .toPromise();
              const coverName = coverRes.data?.attributes?.fileName;
              if (coverName) {
                cover = `https://uploads.mangadex.org/covers/${manga.id}/${coverName}.256.jpg`;
              }
            }

            // AUTHOR
            const authorRel = manga.relationships.find(
              (r: any) => r.type === 'author'
            );
            if (authorRel) {
              const authorRes = await this.mangaService
                .getAuthor(authorRel.id)
                .toPromise();
              author = authorRes.data?.attributes?.name || 'Unknown';
            }

            // LATEST CHAPTER
            const chapterRes = await this.mangaService
              .getLatestChapter(manga.id)
              .toPromise();
            const chapterData = chapterRes?.data?.[0]?.attributes || {};

            // STATS
            const statsRes = await this.mangaService
              .getStats(manga.id)
              .toPromise();
            const stats = statsRes.statistics?.[manga.id] || {};
            const follows = stats.follows || 0;
            const rawRating = stats.rating?.average || 0;
            const rating = rawRating ? (rawRating / 2).toFixed(1) : 'N/A';

            let tag = '';
            if (follows > 50000) tag = 'ss';
            else if (follows > 10000) tag = 'hot';

            const createdAt = new Date(manga.attributes.createdAt);
            const now = new Date();
            if (
              (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <
              30
            ) {
              tag = 'new';
            }

            const altTitles = manga.attributes.altTitles || [];
            const altTitle =
              altTitles.find((t: any) => t.en)?.en ||
              Object.values(altTitles[0] || {})[0] ||
              'No Title';

            // 🔹 Last Updated
            const updatedAt = new Date(manga.attributes.updatedAt);
            const formattedUpdateTime = updatedAt.toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });

            this.totalManga = res.total || 47276;
            this.totalPages = Math.ceil(this.totalManga / this.itemsPerPage);
            this.updatePagesArray();
            this.isLoading = false; // End loading after data is set
            return {
              id: manga.id,
              title: manga.attributes.title.en || altTitle,
              cover,
              description: manga.attributes.description.en || 'No Description',
              author,
              chapterId: chapterRes?.data?.[0]?.id,
              chapter: chapterData.chapter || 'N/A',
              chapterTitle: chapterData.title || '',
              tags: manga.attributes.tags.map((t: any) => t.attributes.name.en),
              rating,
              lastUpdated: formattedUpdateTime,
              views: follows,
              popularityTag: tag,
            };
          })
        );
        this.filteredMangasList = results;
        console.log(results);
      });
  }

  // goToPage(page: number) {
  //   this.currentPage = page;
  //   const offset = (page - 1) * this.itemsPerPage;

  //   this.loadFilteredMangas(offset, this.itemsPerPage, this.genres, this.status, this.category);
  // }
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    const offset = (page - 1) * this.itemsPerPage;
    // update the route with new offset
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        offset: offset,
      },
      queryParamsHandling: 'merge',
    });
  }

  updatePagesArray() {
    const range = 2; // Show 2 pages before and after current
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);

    this.pagesToShow = [];
    for (let i = start; i <= end; i++) {
      this.pagesToShow.push(i);
    }
  }

  loadGenresList() {
    this.mangaService.getGenresList().subscribe(async (res: any) => {
      const results = await Promise.all(
        res.data.map(async (tag: any) => {
          return {
            id: tag.id,
            name: tag.attributes.name.en,
          };
        })
      );

      this.mangaGenresList = results.sort((a, b) => a.name.localeCompare(b.name));
    });
  }
}
