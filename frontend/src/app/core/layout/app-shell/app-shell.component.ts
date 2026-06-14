import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
  <div class="flex w-screen h-screen overflow-hidden bg-slate-50 relative">
    
    @if (isMobile() && isSidebarOpen()) {
      <div 
        (click)="isSidebarOpen.set(false)"
        class="fixed inset-0 bg-slate-950/40 z-40 transition-opacity duration-300 md:hidden">
      </div>
    }

    <aside 
      [class.w-[250px]]="isSidebarOpen() && !isMobile()"
      [class.w-20]="!isSidebarOpen() && !isMobile()" 
      [class.fixed]="isMobile()"
      [class.inset-y-0]="isMobile()"
      [class.left-0]="isMobile()"
      [class.z-50]="isMobile()"
      [class.translate-x-0]="isMobile() && isSidebarOpen()"
      [class.-translate-x-full]="isMobile() && !isSidebarOpen()"
      class="h-full bg-base-100 transition-all duration-300 ease-in-out border-r border-base-content/10 shadow-none">
      
      <app-sidebar 
        [isCollapsed]="!isSidebarOpen() && !isMobile()" 
        (navigate)="handleSidebarNavigate()" 
        class="h-full w-full">
      </app-sidebar>
    </aside>

    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      
      <app-navbar (menuToggle)="toggleMobileSidebar()"></app-navbar>
      
      <main class="flex-1 overflow-auto p-4 min-h-0 bg-base-100">
        <router-outlet />
      </main>
      
    </div>
  </div>
`,
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
    this.mobileQuery = media.matchMedia('(max-width: 767px)');
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