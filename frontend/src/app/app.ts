import { Component, signal, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { polyfill } from 'mobile-drag-drop';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { AuthStoreService } from './features/auth/data-access/auth-store.service';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html'
})
export class App implements OnInit {
  protected readonly title = signal('Taskflow');
  private authStore = inject(AuthStoreService);
  private shortcuts = inject(KeyboardShortcutsService);
 
  constructor(private matIconRegistry: MatIconRegistry) {
    polyfill({
      holdToDrag: 500
    })
    window.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if(target.closest('[draggable="true"]')) {
        e.preventDefault();
      }
    })
  }
  ngOnInit(): void {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    this.authStore.initializeSession().subscribe();
  }
  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    const isTyping = ['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase() || '');
    if (isTyping) return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.shortcuts.triggerSearch();
    }

    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.shortcuts.triggerCreate();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.shortcuts.triggerEscape();
    }
  }
}
