import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = true;
  isDarkTheme = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

toggleTheme(isDark: boolean): void {
  this.isDarkTheme = isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark-theme', isDark);
}

  constructor(private router: Router) {}

  onEnterSearch(searchTerm: string): void {
    if (!searchTerm) {
      return;
    }
    this.router.navigate(['/list-view'], {
      queryParams: { keyword: searchTerm },
    });
  }
}
