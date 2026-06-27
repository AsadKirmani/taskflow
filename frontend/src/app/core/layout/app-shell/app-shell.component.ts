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
  <div class="flex w-full h-[100dvh] overflow-hidden bg-base-200">
  
  @if (isMobile() && isSidebarOpen()) {
    <div 
      role="button"
      tabindex="-1"
      aria-label="Close sidebar"
      (click)="isSidebarOpen.set(false)"
      class="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm transition-all duration-300 ease-in-out md:hidden">
    </div>
  }

  <aside 
    [class.w-[260px]]="isSidebarOpen() && !isMobile()"
    [class.w-[84px]]="!isSidebarOpen() && !isMobile()" 
    [class.fixed]="isMobile()"
    [class.inset-y-0]="isMobile()"
    [class.left-0]="isMobile()"
    [class.z-50]="isMobile()"
    [class.translate-x-0]="isMobile() && isSidebarOpen()"
    [class.-translate-x-full]="isMobile() && !isSidebarOpen()"
    class="h-full bg-base-100 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) border-r border-base-content/10 flex-shrink-0 shadow-2xl md:shadow-none">
    
    <app-sidebar 
      [isCollapsed]="!isSidebarOpen() && !isMobile()" 
      (navigate)="handleSidebarNavigate()" 
      class="block h-full w-full">
    </app-sidebar>
  </aside>

  <div class="flex-1 flex flex-col h-full min-w-0 relative">
    
    <app-navbar 
      (menuToggle)="toggleMobileSidebar()"> 
    </app-navbar>
    
    <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-base-content/20 scrollbar-track-base-200">
      <div class="max-w-7xl mx-auto h-full w-full">
        <router-outlet />
      </div>
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