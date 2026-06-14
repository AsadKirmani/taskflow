import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../core/models/task.model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  
  
  recentSearches = signal<string[]>(    
    JSON.parse(localStorage.getItem('kanban_recent_searches') || '[]')
  );

  addRecentSearch(query: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    const current = this.recentSearches().filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());
    const updated = [cleanQuery, ...current].slice(0, 5); 
    
    this.recentSearches.set(updated);
    localStorage.setItem('kanban_recent_searches', JSON.stringify(updated));
  }

  removeRecentSearch(query: string) {
    const updated = this.recentSearches().filter(q => q !== query);
    this.recentSearches.set(updated);
    localStorage.setItem('kanban_recent_searches', JSON.stringify(updated));
  }

  async searchFromDB(query: string): Promise<Task[]> {
    if (!query.trim()) return [];
    
    this.addRecentSearch(query);

    try {
      const results = await firstValueFrom(
        this.http.get<Task[]>(`${environment.apiUrl}/search?q=${encodeURIComponent(query)}`)
      );
      return results;
    } catch (error) {
        console.error('Search error:', error);
      return [];
    }
  }
}