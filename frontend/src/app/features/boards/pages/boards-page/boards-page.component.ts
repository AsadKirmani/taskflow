import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { BoardStoreService } from '../../data-access/board-store.service';
import { MatIconModule } from '@angular/material/icon';
import { Board } from '../../../../core/models/board.model';
import { BoardModalComponent } from '../../components/board-modal.component';



@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, BoardModalComponent],
  templateUrl: './boards-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsPageComponent {
  private readonly boardStore = inject(BoardStoreService);
  private readonly router = inject(Router);
  
  readonly state$ = this.boardStore.state$;
  
  // Kept as fallback static string functions since your modal might expect them
  selectedWorkspaceId = () => '';
  selectedWorkspaceName = () => '';
  
  // Renamed with a '$' suffix to explicitly denote an RxJS Observable stream
  readonly availableWorkspaces$ = this.state$.pipe(
    map(state => {
      const workspaceMap: Record<string, string> = {};
      state.boards.forEach(board => {
        if (board.workspaceId && board.workSpaceName) {
          workspaceMap[board.workspaceId] = board.workSpaceName;
        }
      });
      return Object.entries(workspaceMap).map(([id, name]) => ({ id, name }));
    })
  );

  isBoardModalOpen = false;

  readonly workSpaceName$ = this.state$.pipe(
    map(state => {
      const uniqueWorkspaceNames = [
        ...new Set(
          state.boards
            .map(board => board.workSpaceName?.trim())
            .filter((name): name is string => Boolean(name))
        )
      ];
      return uniqueWorkspaceNames[0] ?? '';
    })
  );

  constructor() {
    this.loadBoards();
  }

  private loadBoards(): void {
    this.boardStore.getAllBoards();
  }

  readonly openBoard = (board: Board & { _id?: string }): void => {
    const boardId = board.id || board._id;
    if (!boardId) {
      console.error('Open board failed: board id is undefined', board);
      return;
    }
    this.router.navigate(['/boards', boardId, this.toSlug(board.name)]);
  };

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'board';
  }

  createBoardModal(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isBoardModalOpen = !this.isBoardModalOpen;
  }
}