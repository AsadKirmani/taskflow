import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskLabel } from '../../../../core/models/task.model';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-action-label',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="relative inline-flex">
      <ui-button
        (click)="isOpen.set(!isOpen())"
        variant="outline"
        [active]="isOpen()"
      >
        <svg lucideTag class="w-4 h-4 mr-2"></svg> Labels
      </ui-button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>

        <div
          class="absolute top-full left-0 mt-2 w-64 bg-base-100 border border-base-300 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <h4 class="text-xs font-bold text-base-content/70 uppercase mb-3 text-center">Labels</h4>

          <div class="flex flex-col gap-2">
            @for (label of availableLabels; track label.name) {
              <div
                (click)="onLabelClick($event, label)"
                class="relative flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                [style.backgroundColor]="label.color"
              >
                <span class="text-sm font-bold text-white">{{ label.name }}</span>

                @if (hasLabel(label)) {
                  <svg lucideCheck class="w-4 h-4 font-bold"></svg>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ActionLabelComponent {
  labels = input<TaskLabel[]>([]);

  labelToggled = output<TaskLabel>();

  isOpen = signal(false);

  availableLabels: TaskLabel[] = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#10b981' },
    { name: 'Design', color: '#a855f7' },
    { name: 'Urgent', color: '#f97316' },
    { name: 'Documentation', color: '#6b7280' },
  ];

  hasLabel(label: TaskLabel): boolean {
    return this.labels().some((l) => l.name === label.name);
  }

  onLabelClick(event: Event, label: TaskLabel) {
    event.stopPropagation();
    this.labelToggled.emit(label);
  }
}
