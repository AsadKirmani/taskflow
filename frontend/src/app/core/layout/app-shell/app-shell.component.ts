import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, NavbarComponent],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav
        [opened]="isSidebarOpen()"
        [mode]="isMobile() ? 'over' : 'side'"
        (openedChange)="isSidebarOpen.set($event)"
        class="p-4 pr-0"
      >
        <app-sidebar (navigate)="handleSidebarNavigate()"></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <app-navbar (menuToggle)="toggleMobileSidebar()"></app-navbar>
        <main class="p-4">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnDestroy {
  private readonly mobileQueryListener: () => void;
  readonly isSidebarOpen = signal(false);
  protected readonly isMobile = signal(false);
  private readonly mobileQuery: MediaQueryList;
  
  constructor() {
    const media = inject(MediaMatcher);
    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this.isMobile.set(this.mobileQuery.matches);
    this.isSidebarOpen.set(!this.mobileQuery.matches);
    this.mobileQueryListener = () => {
      this.isMobile.set(this.mobileQuery.matches);
      this.isSidebarOpen.set(!this.mobileQuery.matches);
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  toggleMobileSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  handleSidebarNavigate(): void {
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }
}