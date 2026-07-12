import { Component, computed, effect, ElementRef, HostListener, inject, input, model, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BoardStore } from '../data-access/board-store.service';
import { TaskStore } from '../../task/data-access/task-store.service';
import { UiTabsComponent } from '../../../ui/components/ui-tabs.component';
import { UiTabComponent } from '../../../ui/components/ui-tab.component';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';

type ArchiveEntityType = 'board' | 'column' | 'task';

interface BoardArchiveApiItem {
  _id?: string;
  entityType?: ArchiveEntityType;
  entityId?: string;
  entityName?: string;
  createdAt?: string;
  archivedAt?: string;
  restoredAt?: string | null;
  reason?: string;
}

interface BoardArchiveItem {
  id: string;
  entityType: 'column' | 'task';
  entityId: string;
  name: string;
  archivedAt: Date;
  reason: string;
}

@Component({
  selector: 'app-archive-items',
  standalone: true,
  imports: [DatePipe, UiTabsComponent, UiTabComponent, UiButtonComponent, ...APP_ICONS],
  template: `
    <section
      class="fixed right-3 top-20 z-50 w-[min(28rem,calc(100vw-1.5rem))] max-h-[70vh] overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-2xl"
    >
        <header class="flex items-start justify-between gap-3 border-b border-base-300 p-4">
          <div>
            <h2 class="text-lg font-bold text-base-content">Archived Items</h2>
            <p class="text-xs text-base-content/60">Restore hidden tasks and lists for this board.</p>
          </div>
          <ui-button variant="ghost" size="icon"  title="Close" (click)="close()">
          <svg lucideX class="w-4 h-4"></svg>
          </ui-button>
        </header>

        <div class="p-2 border-b border-base-300">
          <ui-tabs variant="boxed" class="w-full" (tabChange)="onTabChange($event)">
            <ui-tab
              label="Tasks"
            ></ui-tab>
            <ui-tab
              label="Lists"
            ></ui-tab>
          </ui-tabs>
        </div>

        @if (filteredItems().length === 0) {
          <div class="p-4 text-center flex flex-col items-center">
            <div class="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mb-3">
              <span class="text-xl">📦</span>
            </div>
            <h3 class="text-base font-semibold">No archived {{ activeTab() }} found</h3>
            <p class="text-xs text-base-content/60">Items you archive will appear here.</p>
          </div>
        } @else {
          <ul class="divide-y divide-base-300 overflow-y-auto max-h-[46vh]">
            @for (item of filteredItems(); track item.id) {
              <li class="p-4 hover:bg-base-200/50 transition-colors flex items-center justify-between gap-4">
                <div class="flex flex-col min-w-0">
                  <span class="font-medium text-base-content truncate">{{ item.name }}</span>
                  <span class="text-xs text-base-content/60 mt-0.5">
                    Archived on {{ item.archivedAt | date:'mediumDate' }}
                  </span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    class="w-full hover:bg-base-300 text-base-content flex "
                    title="Restore"
                    (click)="item.entityType === 'task' ? restoreTask(item) : restoreColumn(item)"
                  >
                    <svg lucideRotateCcw class="w-4 h-4"></svg>
                    <span class="hidden sm:inline ml-1 text-xs">Restore</span>
                  </button>
                </div>
              </li>
            }
          </ul>
        }
    </section>
  `
})
export class ArchiveItemsComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  boardStore = inject(BoardStore);
  taskStore = inject(TaskStore);
  activeTab = signal<'tasks' | 'columns'>('tasks');
  boardId = input<string>('');
  isOpen = model<boolean>(false);
  archivedItems = signal<BoardArchiveItem[]>([]);

  close = () => this.isOpen.set(false);

  restoreColumn = async (item: BoardArchiveItem) => {
    if (!this.boardId()) return;
    await this.boardStore.restoreColumn(item.entityId, this.boardStore.currentBoard()?.workspaceId ?? '');
    this.archivedItems.set(this.archivedItems().filter((i) => i.entityId !== item.entityId));
  };
  restoreTask = async (item: BoardArchiveItem) => {
    if (!this.boardId()) return;
    await this.taskStore.restoreTask(item.entityId, this.boardStore.currentBoard()?.workspaceId ?? '', item.name);
    this.archivedItems.set(this.archivedItems().filter((i) => i.entityId !== item.entityId));
  };

  filteredItems = computed(() => {
    const type = this.activeTab() === 'tasks' ? 'task' : 'column';
    return this.archivedItems().filter((item) => item.entityType === type);
  });

  onTabChange(index: number) {
    this.activeTab.set(index === 0 ? 'tasks' : 'columns');
  }

  constructor() {
    effect(() => {
      const boardId = this.boardId() || this.boardStore.currentBoardId() || '';
      if (!boardId) {
        this.archivedItems.set([]);
        return;
      }

      void this.loadArchivedItems(boardId);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen()) return;

    const target = event.target as Node | null;
    if (!target) return;

    if (!this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.close();
    }
  }

  private async loadArchivedItems(boardId: string) {
    const items = await this.boardStore.loadArchivedItemsInBoard(boardId);

    const mapped = (items as BoardArchiveApiItem[])
      .map((item) => {
        const entityType = item.entityType;
        if (entityType !== 'task' && entityType !== 'column') {
          return null;
        }

        return {
          id: item._id ?? item.entityId ?? '',
          entityType,
          entityId: item.entityId ?? '',
          name: item.entityName ?? 'Untitled',
          archivedAt: new Date(item.createdAt ?? item.archivedAt ?? Date.now()),
          reason: item.reason ?? '',
        } satisfies BoardArchiveItem;
      })
      .filter((item): item is BoardArchiveItem => item !== null && !!item.id);

    this.archivedItems.set(mapped);
  }
}