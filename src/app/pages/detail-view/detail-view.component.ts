import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { MangaService } from '../../core/services/manga.service';
import { TopWeekComponent } from '../../shared/components/top-week/top-week.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    TopWeekComponent,
    SidebarComponent,
    RouterModule,
  ],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.scss',
})
export class DetailViewComponent implements OnInit {
  mangaData: any[] = [];
  mangaDetails: any;
  mangaIds: any;
  Math = Math;

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const mangaId = params.get('id');
      this.mangaIds = mangaId;
      if (mangaId) {
        this.loadMangaData(mangaId);
      }
    });
  }

  loadMangaData(mangaId: string) {
    this.mangaService.getManga(mangaId).subscribe(async (mangaRes: any) => {
      try {
        const manga = mangaRes.data;

        if (!manga) throw new Error('Manga not found');

        // 🔹 Cover
        let coverUrl = 'https://via.placeholder.com/150';
        const coverRel = manga.relationships.find(
          (rel: any) => rel.type === 'cover_art'
        );
        if (coverRel) {
          try {
            const coverData = await this.mangaService
              .getCoverImage(coverRel.id)
              .toPromise();
            const fileName = coverData.data?.attributes?.fileName;
            if (fileName) {
              coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
            }
          } catch (err) {
            console.error('Error fetching cover:', err);
          }
        }

        // 🔹 Authors
        const authorRel = manga.relationships.find(
          (r: any) => r.type === 'author' || r.type === 'artist'
        );
        let author = 'Unknown';
        if (authorRel) {
          try {
            const authorData = await this.mangaService
              .getAuthor(authorRel.id)
              .toPromise();
            author = authorData.data?.attributes?.name || 'Unknown';
          } catch (err) {
            console.error('Error fetching author:', err);
          }
        }

        // 🔹 Alt Title
        const altTitles =
          manga.attributes.altTitles?.map((alt: any) => {
            return Object.values(alt)[0]; // Grab the title from the object, regardless of language key
          }) || [];

        // 🔹 Alt Title
        const altTitlesForTitle =
          manga.attributes.altTitles?.find((alt: any) => alt.en)?.en ||
          (manga.attributes.altTitles?.length
            ? Object.values(manga.attributes.altTitles[0])[0]
            : 'No Title');

        // 🔹 Chapters
        let chapters: any[] = [];
        try {
          let allChapters: any[] = [];
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const chapterRes = await this.mangaService
              .getChaptersList(mangaId, 100, offset)
              .toPromise();

            const batch = chapterRes.data.map((ch: any) => ({
              id: ch.id,
              chapterNumber: ch.attributes.chapter || 'N/A',
              title: ch.attributes.title || '',
              views: Math.floor(Math.random() * 5000) + 1000,
              uploadedTime: new Date(ch.attributes.readableAt).toLocaleString(
                'en-US',
                {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }
              ),
            }));

            allChapters = allChapters.concat(batch);

            if (chapterRes.data.length === 100) {
              offset += 100;
            } else {
              hasMore = false;
            }
          }

          // REMOVE DUPLICATES BASED ON chapterNumber
          const uniqueChaptersMap = new Map<string, any>();
          allChapters.forEach((chapter) => {
            if (!uniqueChaptersMap.has(chapter.chapterNumber)) {
              uniqueChaptersMap.set(chapter.chapterNumber, chapter);
            }
          });

          chapters = Array.from(uniqueChaptersMap.values());
          // chapters = allChapters;
        } catch (err) {
          console.error('Error fetching chapters:', err);
        }

        // 🔹 Tags
        const genres = manga.attributes.tags.map(
          (tag: any) => tag.attributes.name.en
        );

        // 🔹 Stats
        let follows = 0,
          rating = '1',
          totalLikes = 0;
        try {
          const statsRes = await this.mangaService
            .getStats(mangaId)
            .toPromise();
          const stats = statsRes.statistics?.[mangaId];
          follows = stats?.follows || 0;
          const rawRating = stats?.rating?.average || 0;
          rating = rawRating ? (rawRating / 2).toFixed(1) : '1';
          totalLikes = stats?.rating?.count || 0;
        } catch (err) {
          console.error('Error fetching stats:', err);
        }

        // 🔹 Popularity
        let popularityTag = '';
        const now = new Date();
        if (follows > 50000) popularityTag = 'ss';
        else if (follows > 10000) popularityTag = 'hot';
        if (
          (now.getTime() - new Date(manga.attributes.createdAt).getTime()) /
            (1000 * 60 * 60 * 24) <
          30
        ) {
          popularityTag = 'new';
        }

        // 🔹 Last Updated
        const updatedAt = new Date(manga.attributes.updatedAt);
        const formattedUpdateTime = updatedAt.toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

        // 🔹 Final Object
        const mangaDetails = {
          id: mangaId,
          title: manga.attributes.title.en || altTitlesForTitle,
          cover: coverUrl,
          altTitles: altTitles,
          description: manga.attributes.description.en || 'No Description',
          author,
          status: manga.attributes.status
            ? manga.attributes.status.charAt(0).toUpperCase() +
              manga.attributes.status.slice(1)
            : 'Unknown',
          genres,
          lastUpdated: formattedUpdateTime,
          views: follows,
          rating,
          totalLikes,
          popularityTag,
          chapters,
        };

        // ✅ You can now use `mangaDetails`
        this.mangaDetails = mangaDetails;
      } catch (error) {
        console.error('Error processing manga details:', error);
      }
    });
  }

  formatTime(timestamp: any) {
    const date: any = new Date(timestamp);
    const now: any = new Date();
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
