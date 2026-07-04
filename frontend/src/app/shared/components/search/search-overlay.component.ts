import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../core/services/search.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-overlay.component.html',
})
export class SearchOverlayComponent {
  searchService = inject(SearchService);

  isOpen = signal(false);
  searchQuery = signal('');
  isSearching = signal(false);
  searchResults = signal<Task[]>([]);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    this.closeSearch();
  }

  openSearch() {
    this.isOpen.set(true);
    setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
  }

  closeSearch() {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('search-backdrop')) {
      this.closeSearch();
    }
  }

  onInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    if (!this.searchQuery().trim()) {
      this.searchResults.set([]);
    }
  }

  async triggerSearch(query: string = this.searchQuery()) {
    if (!query.trim()) return;

    this.searchQuery.set(query);
    this.isSearching.set(true);

    try {
      const results = await this.searchService.searchFromDB(query);
      this.searchResults.set(results);
    } finally {
      this.isSearching.set(false);
    }
  }
}
