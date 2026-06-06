import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';
import { BoardStoreService } from '../../../features/boards/data-access/board-store.service';

@Component({
  selector: 'app-global-boards',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './global-boards.component.html'
})
export class GlobalBoardsComponent {
  protected readonly workspaceStore = inject(WorkspaceStoreService);
  protected readonly boardStore = inject(BoardStoreService);

  getBoardsByWorkspace(workspaceId: string) {
    return this.boardStore.allBoards.filter(board => board.workspaceId === workspaceId);
  }
}