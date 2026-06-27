import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiButtonComponent } from './ui/components/ui-button.component';
import { UiCardComponent } from './ui/components/ui-card.component';
import { UiBadgeComponent } from './ui/components/ui-badge.component';
import { UiAvatarStackComponent } from './ui/components/ui-avatar-stack.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    UiButtonComponent, 
    UiCardComponent, 
    UiBadgeComponent, 
    UiAvatarStackComponent
  ],
  template: `
    <div class="min-h-[100dvh] bg-base-100 text-base-content selection:bg-primary/20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      
      <nav class="fixed top-0 z-50 w-full border-b border-base-content/5 bg-base-100/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div class="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div class="w-6 h-6 rounded-md bg-primary text-primary-content flex items-center justify-center text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            TaskFlow
          </div>

          <div class="hidden md:flex items-center gap-8 text-sm font-medium text-base-content/70">
            <a href="#features" class="hover:text-base-content transition-colors">Features</a>
            <a href="#methodology" class="hover:text-base-content transition-colors">Methodology</a>
            <a href="#pricing" class="hover:text-base-content transition-colors">Pricing</a>
          </div>

          <div class="flex items-center gap-3">
            <ui-button variant="ghost" size="sm" class="hidden sm:inline-flex" (click)="router.navigate(['/auth/login'])">Log in</ui-button>
            <ui-button variant="primary" size="sm" (click)="router.navigate(['/auth/register'])">Get Started</ui-button>
          </div>
        </div>
      </nav>

      <section class="relative pt-40 pb-20 overflow-hidden flex flex-col items-center text-center px-4">
        
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-6">
          <ui-badge variant="neutral" class="rounded-full px-4 py-1.5 shadow-sm bg-base-100 border-base-content/10">
            <span class="mr-2">✨</span> TaskFlow 1.0 is now in Public Beta
          </ui-badge>
        </div>

        <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-base-content max-w-4xl mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Manage projects at the <br class="hidden md:block"/> speed of thought.
        </h1>
        
        <p class="text-lg md:text-xl text-base-content/60 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          A minimalist, lightning-fast Kanban tool designed for high-performance engineering and design teams. Build, track, and ship without the clutter.
        </p>

        <div class="flex items-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <ui-button variant="primary" size="lg">Start Building Free</ui-button>
          <ui-button variant="secondary" size="lg">Book a Demo</ui-button>
        </div>

        <div class="w-full max-w-5xl px-2 sm:px-6 animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div class="relative rounded-2xl bg-base-200 border border-base-content/10 shadow-2xl p-2 md:p-4 ring-1 ring-base-content/5">
            <div class="flex gap-2 mb-4 px-2">
              <div class="w-3 h-3 rounded-full bg-error/80"></div>
              <div class="w-3 h-3 rounded-full bg-warning/80"></div>
              <div class="w-3 h-3 rounded-full bg-success/80"></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              
              <div class="space-y-3">
                <div class="flex items-center justify-between px-1">
                  <h3 class="text-sm font-semibold">Todo</h3>
                  <ui-badge>3</ui-badge>
                </div>
                <ui-card [interactive]="true">
                  <div class="flex justify-between items-start mb-2">
                    <ui-badge variant="error">Urgent</ui-badge>
                    <span class="text-xs text-base-content/40">T-101</span>
                  </div>
                  <h4 class="text-sm font-medium mb-4">Fix authentication race condition in Next.js</h4>
                  <ui-avatar-stack [users]="[{id: '1', name: 'Dev'}]" size="sm" />
                </ui-card>
              </div>

              <div class="space-y-3 hidden md:block">
                <div class="flex items-center justify-between px-1">
                  <h3 class="text-sm font-semibold">In Progress</h3>
                  <ui-badge variant="info">1</ui-badge>
                </div>
                <ui-card [interactive]="true" class="ring-1 ring-primary/20">
                  <div class="flex justify-between items-start mb-2">
                    <ui-badge variant="info">Feature</ui-badge>
                    <span class="text-xs text-base-content/40">T-102</span>
                  </div>
                  <h4 class="text-sm font-medium mb-4">Implement real-time collaboration cursors</h4>
                  <ui-avatar-stack [users]="[{id: '1', name: 'Dev'}, {id: '2', name: 'Design'}]" size="sm" />
                </ui-card>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section id="features" class="py-24 bg-base-100 border-t border-base-content/5 relative">
        <div class="max-w-7xl mx-auto px-6">
          
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold tracking-tight mb-4">Built for focus. Engineered for speed.</h2>
            <p class="text-base-content/60">Everything you need to manage your workflow, stripped of all the unnecessary distractions.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <ui-card class="bg-base-200/50 border-base-content/5 group">
              <div class="w-10 h-10 rounded-lg bg-base-100 border border-base-content/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 15 5.3-5.3a2 2 0 1 0-2.8-2.8L10.2 12.2"/><path d="m14 14-4 4-6-6 4-4"/><path d="M9 9 7 7"/></svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Keyboard First</h3>
              <p class="text-sm text-base-content/60 leading-relaxed">Navigate the entire application, assign tasks, and change statuses without ever touching your mouse.</p>
            </ui-card>

            <ui-card class="bg-base-200/50 border-base-content/5 group">
              <div class="w-10 h-10 rounded-lg bg-base-100 border border-base-content/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Real-time Sync</h3>
              <p class="text-sm text-base-content/60 leading-relaxed">Changes propagate instantly to your entire team. No refreshing, no loading spinners, just raw speed.</p>
            </ui-card>

            <ui-card class="bg-base-200/50 border-base-content/5 group">
              <div class="w-10 h-10 rounded-lg bg-base-100 border border-base-content/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Stark Aesthetics</h3>
              <p class="text-sm text-base-content/60 leading-relaxed">A ruthless reduction of UI clutter. We removed the noise so your team can focus strictly on the work.</p>
            </ui-card>

          </div>
        </div>
      </section>

      <section class="py-24 border-t border-base-content/5 bg-base-200/20 text-center">
        <h2 class="text-4xl font-bold tracking-tight mb-6">Ready to upgrade your workflow?</h2>
        <div class="flex items-center justify-center gap-4">
          <ui-button variant="primary" size="lg" (click)="router.navigate(['/auth/register'])">Get Started</ui-button>
        </div>
      </section>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  router = inject(Router);  
}