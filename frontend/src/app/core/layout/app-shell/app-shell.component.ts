import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, NavbarComponent],
  template: `
    <mat-sidenav-container class="app-shell-container">
      <mat-sidenav
        [opened]="isSidebarOpen()"
        [mode]="isMobile() ? 'over' : 'side'"
        (openedChange)="isSidebarOpen.set($event)"
        class=""
      >
        <app-sidebar (navigate)="handleSidebarNavigate()" class="app-sidebar"></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content class="app-shell-content">
        <app-navbar (menuToggle)="toggleMobileSidebar()"></app-navbar>
        <main class="app-shell-main p-4">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      min-height: 100dvh;
    }

    .app-shell-container {
      height: 100%;
    }
      mat-sidenav {
  --mat-sidenav-container-width: 250px;
}

    .app-shell-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .app-shell-main {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }

    :host ::ng-deep .mat-drawer-content,
    :host ::ng-deep .mat-sidenav-content {
      transform: none !important;
    }
  `],
  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnDestroy {
  private readonly mobileQueryListener: () => void;
  readonly isSidebarOpen = signal(false);
  protected readonly isMobile = signal(false);
  protected readonly isTaskOverlayActive = signal(false);
  private readonly mobileQuery: MediaQueryList;
  private readonly router = inject(Router);
  private lastDesktopSidebarOpen = true;
  private wasTaskOverlayActive = false;
  private readonly routerEventsSubscription;
  
  constructor() {
    const media = inject(MediaMatcher);
    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this.isMobile.set(this.mobileQuery.matches);
    this.isSidebarOpen.set(!this.mobileQuery.matches);
    this.updateTaskOverlayState(this.router.url);
    this.mobileQueryListener = () => {
      this.isMobile.set(this.mobileQuery.matches);
      this.isSidebarOpen.set(!this.mobileQuery.matches);
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);

    this.routerEventsSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.updateTaskOverlayState(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
    this.routerEventsSubscription.unsubscribe();
  }

  toggleMobileSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  handleSidebarNavigate(): void {
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  private updateTaskOverlayState(url: string): void {
    const active = this.router.parseUrl(url).queryParamMap.has('taskId');
    this.isTaskOverlayActive.set(active);

    if (active && !this.wasTaskOverlayActive) {
      this.lastDesktopSidebarOpen = this.isSidebarOpen();
      this.isSidebarOpen.set(false);
      this.wasTaskOverlayActive = true;
      return;
    }

    if (!active && this.wasTaskOverlayActive) {
      if (!this.isMobile()) {
        this.isSidebarOpen.set(this.lastDesktopSidebarOpen);
      }
      this.wasTaskOverlayActive = false;
    }
  }
}