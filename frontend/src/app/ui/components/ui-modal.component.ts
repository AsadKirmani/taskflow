import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6"
      >
        <div
          class="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          (click)="close.emit()"
        ></div>

        <div
          class="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-base-100 shadow-2xl transition-all border border-base-300/10 animate-in fade-in zoom-in-95 duration-200"
        >
          <div
            class="px-6 py-4 border-b border-base-300/5 flex items-center justify-between bg-base-100"
          >
            <h3 class="text-lg font-semibold text-base-content">{{ title() }}</h3>
            <button
              (click)="close.emit()"
              class="p-1 rounded-md hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 bg-base-100">
            <ng-content></ng-content>
          </div>

          @if (hasFooter()) {
            <div class="px-6 py-4 bg-base-200/50 border-t border-base-300/5 flex justify-end gap-2">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiModalComponent {
  isOpen = input(false);
  title = input.required<string>();
  hasFooter = input(false);

  close = output<void>();
}
