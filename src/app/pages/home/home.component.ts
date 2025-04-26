import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MangaService } from '../../core/services/manga.service';
import { CommonModule } from '@angular/common';
import { TopWeekComponent } from '../../shared/components/top-week/top-week.component';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent,FooterComponent,CommonModule,TopWeekComponent,RouterModule,SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  latestMangas: any[] = [];

  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.loadLatestMangas();
  }

  loadLatestMangas() {
    this.mangaService.getLatestMangas().subscribe(async (res: any) => {
      const now = new Date();

      const results = await Promise.all(res.data.map(async (manga: any) => {
        // Cover Image
        let coverUrl = 'https://via.placeholder.com/150';
        const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
        if (coverRel) {
          try {
            const coverData = await this.mangaService.getCoverImage(coverRel.id).toPromise();
            if (coverData?.data?.attributes?.fileName) {
              coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}.256.jpg`;
            }
          } catch (err) {
            console.error('Error fetching cover:', err);
          }
        }

      // Author
      let author = 'Unknown';
      const authorRel = manga.relationships.find((r: any) => r.type === 'author' || r.type === 'artist');
      if (authorRel) {
        try {
          const authorData = await this.mangaService.getAuthor(authorRel.id).toPromise();
          author = authorData?.data?.attributes?.name || 'Unknown';
        } catch (err) {
          console.error('Error fetching author:', err);
        }
      }

      // Last 3 Chapters
      let lastThreeChapters = [];
      try {
        const chapterRes = await this.mangaService.getChapters(manga.id, 3).toPromise();
        lastThreeChapters = chapterRes?.data?.map((ch: any) => ({
          chapter: ch.attributes.chapter || 'N/A',
          title: ch.attributes.title || '',
          id: ch.id,
          updatedAt: ch.attributes.readableAt || 'Unknown Date'
        })) || [];
      } catch (err) {
        console.error('Error fetching chapters:', err);
      }

      // Tags
      const tags = manga.attributes.tags.map((tag: any) => tag.attributes.name.en);

      // Stats
      let follows = 0, rating = 'N/A';
      try {
        const statsRes = await this.mangaService.getStats(manga.id).toPromise();
        follows = statsRes?.statistics?.[manga.id]?.follows || 0;
        const rawRating = statsRes?.statistics?.[manga.id]?.rating?.average || 0;
        rating = rawRating ? (rawRating / 2).toFixed(1) : 'N/A';
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

      // Popularity Tag
      let tag = '';
      if (follows > 50000) tag = 'ss';
      else if (follows > 10000) tag = 'hot';
      if ((now.getTime() - new Date(manga.attributes.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 30) tag = 'new';



        // Title fallback
        const altTitle = manga.attributes.altTitles?.find((alt: any) => alt.en)?.en
                      || (manga.attributes.altTitles?.length ? Object.values(manga.attributes.altTitles[0])[0] : 'No Title');

        return {
          id: manga.id,
          title: manga.attributes.title.en || altTitle,
          cover: coverUrl,
          author,
          chapters: lastThreeChapters,
          tags,
          rating,
          popularityTag: tag
        };
      }));

      this.latestMangas = results;
    });
  }

  formatTime(timestamp:any) {
    const date:any = new Date(timestamp);
    const now:any = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    // 1. Format as "1 hour ago" or "2 days ago"
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} day ago`;
    }

    // 2. Format as "May 14, 2024"
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

}