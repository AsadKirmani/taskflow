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

      // Show a single workspace name in the header area.
      return uniqueWorkspaceNames[0] ?? '';
    })
  );

  constructor() {
    this.loadBoards();
    
  }

  private loadBoards(): void {
    this.boardStore.loadBoards();
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