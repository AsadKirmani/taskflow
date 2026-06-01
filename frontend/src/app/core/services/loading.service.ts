import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequestsSubject = new BehaviorSubject<number>(0);

  readonly activeRequests$ = this.activeRequestsSubject.asObservable();
  readonly isLoading$ = this.activeRequests$.pipe(map(count => count > 0));

  start(): void {
    this.activeRequestsSubject.next(this.activeRequestsSubject.getValue() + 1);
  }

  stop(): void {
    const nextValue = Math.max(0, this.activeRequestsSubject.getValue() - 1);
    this.activeRequestsSubject.next(nextValue);
  }
}