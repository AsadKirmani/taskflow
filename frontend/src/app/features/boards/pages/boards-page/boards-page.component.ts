import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; 
import { BoardStore } from '../../data-access/board-store.service';
import { WorkspaceStoreService } from '../../../../features/workspace/data-access/workspace-store.service';
import { Board } from '../../../../core/models/board.model';
import { BoardModalComponent } from '../../components/board-modal.component';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { InviteMemberModalComponent } from '../../components/invite-modal.component';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [RouterLink, BoardModalComponent, InviteMemberModalComponent, LucideArrowRight],
  templateUrl: './boards-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsPageComponent implements OnInit {
  protected readonly boardStore = inject(BoardStore);
  protected readonly workspaceStore = inject(WorkspaceStoreService);
  protected readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  isBoardModalOpen = signal(false);
  isInviteModalOpen = signal(false);

  readonly currentWorkspaceId = computed(() => this.workspaceStore.activeWorkspace()?.id ?? null);
  
  readonly availableWorkspaces = computed(() => {
    return this.workspaceStore.workspaces().map(ws => ({ id: ws.id, name: ws.name }));
  });

  readonly isWorkspaceMode = computed(() => !!this.currentWorkspaceId());

  readonly displayedWorkspaces = computed(() => {
    const activeWs = this.workspaceStore.activeWorkspace();

    return activeWs ? [activeWs] : this.workspaceStore.workspaces();
  });

  ngOnInit(): void {
    this.boardStore.loadAllBoards();
    this.route.paramMap.subscribe(params => {
      const wId = params.get('workspaceId');
      
      this.workspaceStore.setActiveWorkspace(wId);
    });
  }

  getBoardsByWorkspace(workspaceId: string): Board[] {
    const currentUser = this.authStore.currentUser();
    const boardsList = this.boardStore.allBoards;

    const filteredBoards = boardsList().filter((board: Board) => {
      if (board.workspaceId !== workspaceId) return false;
      if (board.visibility === 'private') {
        const isCreator = board.createdBy === currentUser?.id;
        return isCreator;
      }
      
      return true;
    });
    return filteredBoards;
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