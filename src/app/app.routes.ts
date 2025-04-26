import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/guards.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // index.html → Home Page

  // Auth Pages
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Bookmark (with AuthGuard)
  {
    path: 'bookmark',
    loadComponent: () =>
      import('./pages/bookmark/bookmark.component').then(m => m.BookmarkComponent),
    canActivate: [AuthGuard]
  },

  // Chapter Page
  {
    path: 'chapter/:id/:mangaid',
    loadComponent: () =>
      import('./pages/chapter/chapter.component').then(m => m.ChapterComponent)
  },

  // Detail View Page
  {
    path: 'manga/:id',
    loadComponent: () =>
      import('./pages/detail-view/detail-view.component').then(m => m.DetailViewComponent)
  },

  // Latest Manga Page
  {
    path: 'latest-manga',
    loadComponent: () =>
      import('./pages/latest-manga/latest-manga.component').then(m => m.LatestMangaComponent)
  },

  // List View Page
  {
    path: 'list-view',
    loadComponent: () =>
      import('./pages/list-view/list-view.component').then(m => m.ListViewComponent)
  },

  // New Manga Page
  {
    path: 'new-manga',
    loadComponent: () =>
      import('./pages/new-manga/new-manga.component').then(m => m.NewMangaComponent)
  },

  // Top Manga Page
  {
    path: 'top-manga',
    loadComponent: () =>
      import('./pages/top-manga/top-manga.component').then(m => m.TopMangaComponent)
  },

  // Wildcard Route (404)
  {
    path: '**',
    redirectTo: ''
  }
];
