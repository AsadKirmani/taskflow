import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardStoreService } from '../../data-access/board-store.service';
import { WorkspaceStoreService } from '../../../../features/workspace/data-access/workspace-store.service';
import { Board } from '../../../../core/models/board.model';
import { BoardModalComponent } from '../../components/board-modal.component';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { InviteMemberModalComponent } from '../../components/invite-modal.component';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [RouterLink, BoardModalComponent, InviteMemberModalComponent],
  templateUrl: './boards-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsPageComponent implements OnInit {
  protected readonly boardStore = inject(BoardStoreService);
  protected readonly workspaceStore = inject(WorkspaceStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStoreService);
  
  currentWorkspaceId = signal<string | null>(null);
  isBoardModalOpen = signal(false);
  isInviteModalOpen = signal(false);
  availableWorkspaces = computed(() => {
    return this.workspaceStore.workspaces().map(ws => ({ id: ws.id, name: ws.name }));
  });
  isWorkspaceMode = computed(() => !!this.currentWorkspaceId());

  displayedWorkspaces = computed(() => {
    const wsId = this.currentWorkspaceId();
    if (wsId) {
      const activeWs = this.workspaceStore.workspaces().find(ws => ws.id === wsId);
      return activeWs ? [activeWs] : [];
    }
    return this.workspaceStore.workspaces();
  });

  ngOnInit(): void {
    this.boardStore.loadAllBoards();
    this.route.paramMap.subscribe(params => {
      this.currentWorkspaceId.set(params.get('workspaceId'));
    });
  }

  getBoardsByWorkspace(workspaceId: string): Board[] {
    const currentUser = this.authStore.currentUser();
    return this.boardStore.allBoards.filter(board => {
     if(board.workspaceId !== workspaceId) return false;
     if(board.visibility === 'private') {
      return board.createdBy === currentUser?.id;
    }
    return true;
    });
  }

  openBoard(board: Board): void {
    const boardId = board.id;
    if (!boardId) return;
    this.router.navigate(['/boards', boardId, this.toSlug(board.name)]);
  }

  toggleBoardModal(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isBoardModalOpen.set(true);
  }
  closeBoardModal(): void {
    this.isBoardModalOpen.set(false);
  }
  openInviteModal(): void {
    this.isInviteModalOpen.set(true);
  }
  closeInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'board';
  }
}