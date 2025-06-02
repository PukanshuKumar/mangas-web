import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TopWeekComponent } from '../../shared/components/top-week/top-week.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MangaService } from '../../core/services/manga.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    TopWeekComponent,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss',
})
export class ListViewComponent implements OnInit {
  genreNames: string[] = [];
  selectedGenres: { id: string; name: string }[] = [];
  mangaGenresList: any[] = [];
  filteredMangasList: any[] = [];
  searchResults: any[] = [];

  searchForm!: FormGroup;
  showFilter = false;
  showGenresFilter = false;
  isLoading = false;

  page: number = 1;
  currentPage = 1;
  itemsPerPage = 10;
  totalManga = 0;
  totalPages = 0;
  pagesToShow: number[] = [];

  offset = 0;
  limit = 10;
  genres: any = [];
  status = 'all';
  category = '';
  keyword = '';

  constructor( private mangaService: MangaService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder ) {
    this.searchForm = this.fb.group({ orderBy: [''], status: ['all'], keyword: ['']});
    this.router.events.subscribe(async (ev) => { this.selectedGenres = []; this.updateGenre(); });
  }



  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.genreNames = params['genrenames']?.split(',').map((g: string) => this.capitalize(g.trim())) || [];
      this.status = params['status'] || 'all';
      this.page = parseInt(params['page'], 10) || 1;
      this.category = params['category'] || '';

      this.currentPage = params['offset'] ? Math.floor(+params['offset'] / this.itemsPerPage) + 1 : 1;
      this.offset = parseInt(params['offset'], 10) || 0;
      this.limit = parseInt(params['limit'], 10) || 10;
      this.genres = params['genres'] ? [params['genres']] : [];
      this.keyword = params['keyword'] || '';

      this.searchForm.patchValue({
        orderBy: this.category,
        status: this.status,
        keyword: this.keyword
      });

      this.loadFilteredMangas(
        this.offset,
        this.limit,
        this.genres,
        this.status,
        this.category,
        this.keyword
      );
    });

    this.loadGenresList();
    this.updateGenre();
  }

  updateGenre(): void {
    if (this.genres.length && this.genreNames.length) {
      this.toggleGenre({ id: this.genres[0], name: this.genreNames[0] });
    }
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  toggleGenresFilter(): void {
    this.showGenresFilter = !this.showGenresFilter;
  }

  toggleGenre(genre: any): void {
    const index = this.selectedGenres.findIndex(g => g.id === genre.id);
    if (index !== -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
  }

  isSelected(genre: any): boolean {
    return this.selectedGenres.some(g => g.id === genre.id);
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async loadFilteredMangas(offsetP: number, limitP: number, genresP: string[], statusP: string, categoryP: string, keywordP: string = ''): Promise<void> {
    this.isLoading = true;

    try {
      const res = await this.mangaService.getMangaList(offsetP, limitP, genresP, statusP, categoryP, keywordP).toPromise();

      const results = await Promise.all(res.data.map(async (manga: any) => {
        const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
        const authorRel = manga.relationships.find((r: any) => r.type === 'author');

        let cover = 'https://via.placeholder.com/150';
        if (coverRel) {
          const coverRes = await this.mangaService.getCoverImage(coverRel.id).toPromise();
          const coverName = coverRes?.data?.attributes?.fileName;
          if (coverName) {
            cover = `https://uploads.mangadex.org/covers/${manga.id}/${coverName}.256.jpg`;
          }
        }

        let author = 'Unknown';
        if (authorRel) {
          const authorRes = await this.mangaService.getAuthor(authorRel.id).toPromise();
          author = authorRes?.data?.attributes?.name || 'Unknown';
        }

        const chapterRes = await this.mangaService.getLatestChapter(manga.id).toPromise();
        const chapterData = chapterRes?.data?.[0]?.attributes || {};

        const statsRes = await this.mangaService.getStats(manga.id).toPromise();
        const stats = statsRes?.statistics?.[manga.id] || {};
        const follows = stats.follows || 0;
        const rating = stats.rating?.average ? (stats.rating.average / 2).toFixed(1) : 'N/A';

        let tag = '';
        if (follows > 50000) tag = 'ss';
        else if (follows > 10000) tag = 'hot';

        const createdAt = new Date(manga.attributes.createdAt);
        const now = new Date();
        if ((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) < 30) {
          tag = 'new';
        }

        const altTitle = manga.attributes.altTitles?.find((t: any) => t.en)?.en || 'No Title';
        const updatedAt = new Date(manga.attributes.updatedAt);
        const formattedUpdateTime = updatedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

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
          popularityTag: tag
        };
      }));

      this.filteredMangasList = results;
      this.totalManga = res.total || 0;
      this.totalPages = Math.ceil(this.totalManga / this.itemsPerPage);
      this.updatePagesArray();
    } catch (error) {
      console.error('Error loading mangas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    const offset = (page - 1) * this.itemsPerPage;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { offset },
      queryParamsHandling: 'merge'
    });
  }

  updatePagesArray(): void {
    const range = 2;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    this.pagesToShow = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  loadGenresList(): void {
    this.mangaService.getGenresList().subscribe(async (res: any) => {
      this.mangaGenresList = res.data.map((tag: any) => ({
        id: tag.id,
        name: tag.attributes.name.en
      }))
            this.mangaGenresList = this.mangaGenresList.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    });
  }

  onSearch() {
    // const { orderBy, status, keyword } = this.searchForm.value;
    const orderBy = this.searchForm.value.orderBy || '';
    const status = this.searchForm.value.status || 'all';
    const keyword = this.searchForm.value.keyword || '';
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    // Only use genre IDs (string[])
    const selectedGenreIds: string[] = this.selectedGenres.map((genre: any) =>
      typeof genre === 'object' && genre.id ? genre.id : genre
    );
    this.loadFilteredMangas( this.currentPage, offset, selectedGenreIds, status, orderBy,keyword );
  }
}
