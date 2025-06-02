import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MangaService } from '../../../core/services/manga.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent  implements OnInit {
  mangaGenresList: any[] = [];
  topAllTimeManga: any[] = [];
  newMangaWeeklyManga: any[] = [];

  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.loadGenresList();
    this.loadTopAllTime();
    this.loadNewMangaWeekly();
  }

  loadGenresList() {
    this.mangaService.getGenresList().subscribe(async (res: any) => {
      const results = await Promise.all(res.data.map(async (tag: any) => {
        return {
          id: tag.id,
          name: tag.attributes.name.en
        };
      }));

      this.mangaGenresList = results;
    });
  }

  loadTopAllTime() {
    this.mangaService.getTopAllTime().subscribe(async (res: any) => {
      const results = await Promise.all(res.data.map(async (manga: any) => {

        const chapterRes = await this.mangaService.getLatestChapter(manga.id).toPromise();
        const chapterData = chapterRes?.data?.[0]?.attributes || {};

        const altTitlesForTitle = manga.attributes.altTitles?.length > 0
            ? (manga.attributes.altTitles.find((obj: any) => obj.en)
                ? manga.attributes.altTitles.find((obj: any) => obj.en).en
                : Object.values(manga.attributes.altTitles[0])[0])
            : "No Title";

        return {
          id: manga.id,
          title: manga.attributes.title.en || altTitlesForTitle,
          chapter: chapterData.chapter || 'N/A',
          chapterTitle: chapterData.title || '',
          updatedAt: chapterData.readableAt || ''
        };
      }));

      this.topAllTimeManga = results;
    });
  }

  loadNewMangaWeekly() {
    this.mangaService.getNewMangaWeekly().subscribe(async (res: any) => {
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

        // Title fallback
        const altTitle = manga.attributes.altTitles?.find((alt: any) => alt.en)?.en
                      || (manga.attributes.altTitles?.length ? Object.values(manga.attributes.altTitles[0])[0] : 'No Title');

        return {
          id: manga.id,
          title: manga.attributes.title.en || altTitle,
          cover: coverUrl,
        };
      }));

      this.newMangaWeeklyManga = results;
    });
  }

}
