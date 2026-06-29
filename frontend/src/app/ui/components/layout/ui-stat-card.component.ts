import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-5 bg-base-100 rounded-box border border-base-300 transition-all" [ngClass]="hoverClass()">
      <div class="card-header flex gap-3 pb-3 items-center justify-between text-center">
        <h2 class="card-title font-bold text-base-content">{{ title() }}</h2>
      </div>
      <div class="card-body items-start">
        <p class="text-4xl font-extrabold text-base-content mb-1">{{ value() }}</p>
        <p class="text-xs font-bold tracking-wide uppercase" [ngClass]="'text-' + variant()">
          {{ subText() }}
        </p>
      </div>
    </div>
  `
})
export class UiStatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  subText = input.required<string>();
  variant = input<'info' | 'error' | 'warning' | 'success'>('info');

  hoverClass() {
    return `hover:border-${this.variant()}/50`;
  }
}