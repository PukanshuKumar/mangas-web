import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private readonly BASE_URL = 'https://api.mangadex.org';

  constructor(private http: HttpClient) {}

  getAuthor(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/author/${id}`);
  }
  getChaptersList(mangaId: string, limit: number = 100, offset: number = 0): Observable<any> {
    return this.http.get(`${this.BASE_URL}/chapter`, {
      params: new HttpParams()
        .set('manga', mangaId)
        .set('limit', limit.toString())
        .set('offset', offset.toString())
        .set('translatedLanguage[]', 'en')
        .set('order[chapter]', 'desc')
    });
  }


  getChapters(mangaId: string, limit: number = 3): Observable<any> {
    return this.http.get(`${this.BASE_URL}/chapter`, {
      params: new HttpParams()
        .set('manga', mangaId)
        .set('limit', limit.toString())
        .set('translatedLanguage[]', 'en')
        .set('order[chapter]', 'desc')
    });
  }

  getStats(mangaId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/statistics/manga/${mangaId}`);
  }

  getCoverImage(coverId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/cover/${coverId}`);
  }


  getGenresList(offset = 0): Observable<any> {
    const url = `${this.BASE_URL}/manga/tag`;

    return this.http.get(url);
  }

  getTopWeekly(offset: number = 0): Observable<any> {
    const now = new Date();
    now.setDate(now.getDate() - 7); // Subtract 7 days for weekly data

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const originalDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    const encodedDate = originalDate;

    const url = `${this.BASE_URL}/manga`;
    const params = new HttpParams()
      .set('limit', '10')
      .set('offset', offset)
      .set('updatedAtSince', encodedDate)
      .set('order[latestUploadedChapter]', 'desc');

    return this.http.get(url, { params });
  }

  getTopAllTime(offset = 0): Observable<any> {
    const url = `${this.BASE_URL}/manga`;
    const params = new HttpParams()
      .set('limit', '10')
      .set('order[followedCount]', 'desc');

    return this.http.get(url, { params });
  }

  getNewMangaWeekly(offset = 0): Observable<any> {
    const url = `${this.BASE_URL}/manga`;
    const params = new HttpParams()
      .set('limit', '10')
      .set('order[createdAt]', 'desc')
      .set('hasAvailableChapters', 'true');

    return this.http.get(url, { params });
  }

  getLatestMangas(offset: number = 0): Observable<any> {
    const url = `${this.BASE_URL}/manga`;
    const params = new HttpParams()
      .set('limit', '10')
      .set('offset', offset)
      .set('order[latestUploadedChapter]', 'desc')
      .set('hasAvailableChapters', 'true');

    return this.http.get(url, { params });
  }

  getLatestChapter(mangaId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/chapter`, {
      params: new HttpParams()
        .set('manga', mangaId)
        .set('limit', '1')
        .set('translatedLanguage[]', 'en')
        .set('order[chapter]', 'desc')
    });
  }

  getManga(mangaId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/manga/${mangaId}`);
  }

  // getMangaList( offset: number = 0, limit: number = 10, genres: string[] = [], status: string = 'all', category: 'latest' | 'newest' | 'top-view' = 'latest' ): Observable<any> {
  getMangaList( offset: number = 0, limit: number = 10, genres: string[] = [], status: string, category: string,keyword: string = '' ): Observable<any> {
    let sortQuery = 'order[latestUploadedChapter]=desc';
    if (category === 'newest') {
      sortQuery = 'order[createdAt]=desc';
    } else if (category === 'top-view') {
      sortQuery = 'order[followedCount]=desc';
    }

    let query = `limit=${limit}&offset=${offset}&hasAvailableChapters=true&${sortQuery}`;

    // Genres
    genres.forEach((genre) => {
      query += `&includedTags[]=${genre}`;
    });

    // Status
    if (status && status !== 'all') {
      query += `&status[]=${status}`;
    }
      // Add keyword search
  if (keyword && keyword.trim()) {
    query += `&title=${encodeURIComponent(keyword.trim())}`;
  }

    const fullUrl = `${this.BASE_URL}/manga?${query}`;

    console.log(fullUrl); // to verify final URL
    return this.http.get(fullUrl);
  }

  getNewMangaList( offset: number = 0, limit: number = 10): Observable<any> {
    let query = `limit=${limit}&offset=${offset}&hasAvailableChapters=true&order[createdAt]=desc`;

    const fullUrl = `${this.BASE_URL}/manga?${query}`;
    return this.http.get(fullUrl);
  }

  getLatestMangaList( offset: number = 0, limit: number = 10): Observable<any> {
    let query = `limit=${limit}&offset=${offset}&hasAvailableChapters=true&order[latestUploadedChapter]=desc`;

    const fullUrl = `${this.BASE_URL}/manga?${query}`;
    return this.http.get(fullUrl);
  }

  getHotMangaList( offset: number = 0, limit: number = 10): Observable<any> {
    let query = `limit=${limit}&offset=${offset}&hasAvailableChapters=true&order[followedCount]=desc`;

    const fullUrl = `${this.BASE_URL}/manga?${query}`;
    return this.http.get(fullUrl);
  }

  getChapter(chapterId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/at-home/server/${chapterId}`);
  }
}
