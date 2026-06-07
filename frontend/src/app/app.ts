import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { ThemeService } from './core/services/theme.service'
import { polyfill } from 'mobile-drag-drop';
import { ToastContainerComponent } from './shared/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html'
})
export class App implements OnInit {
  protected readonly title = signal('Taskflow');
  private themeService = inject(ThemeService);
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
  }
}
