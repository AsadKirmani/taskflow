import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../core/services/export.service';
import { APP_ICONS } from '../../core/icons/lucide-icons';

@Component({
  selector: 'app-share-export',
  standalone: true,
  imports: [CommonModule, ...APP_ICONS],
  template: `
    <div
      class="w-full rounded-lg transition-all duration-200 overflow-hidden mt-2 border"
      [class.border-base-300]="isOpen()"
      [class.border-none]="!isOpen()"
      [class.bg-base-200]="isOpen()"
      [class.bg-base-100]="!isOpen()"
    >
      <button
        (click)="isOpen.set(!isOpen())"
        class="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors focus:outline-none text-base-content"
        [class.hover:bg-base-200]="!isOpen()"
      >
        <div class="flex items-center gap-2">
          <span>Share</span>
        </div>

        <svg
          lucideChevronDown
          class="text-[18px] w-[18px] h-[18px] transition-transform duration-300"
          [class.rotate-180]="isOpen()"
          [class.text-base-content]="isOpen()"
        ></svg>
      </button>

      @if (isOpen()) {
        <div
          class="bg-base-100 border-t border-base-300 pb-1 px-1.5 rounded-b-lg transition-all duration-200"
        >
          <div class="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Share
          </div>
          <button
            (click)="copyLink()"
            class="w-full text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center gap-2 transition-colors"
          >
            <svg lucideLink class="text-[18px] w-[18px] h-[18px]"></svg>
            <span>{{ copied() ? 'Link Copied!' : 'Copy Link' }}</span>
          </button>

          <div class="border-t border-base-300 mx-3 my-1"></div>

          <div class="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Export
          </div>
          <button
            (click)="exportJson()"
            class="w-full text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center gap-2 transition-colors"
          >
            <svg lucideData class="text-[18px] w-[18px] h-[18px]"></svg>
            <span>Export to JSON</span>
          </button>
          <button
            (click)="exportCsv()"
            class="w-full text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center gap-2 transition-colors"
          >
            <svg lucideFileText class="text-[18px] w-[18px] h-[18px]"></svg>
            <span>Export to CSV</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ShareExportComponent {
  private exportService = inject(ExportService);

  dataToExport = input.required<any>();
  exportFileName = input<string>('exported-task');

  isOpen = signal(false);
  copied = signal(false);

  async copyLink() {
    const success = await this.exportService.copyLinkToClipboard();
    if (success) {
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
        this.isOpen.set(false);
      }, 2000);
    }
  }

  exportJson() {
    this.exportService.exportToJson(this.dataToExport(), this.exportFileName());
    this.isOpen.set(false);
  }

  exportCsv() {
    this.exportService.exportToCsv(this.dataToExport(), this.exportFileName());
    this.isOpen.set(false);
  }
}
