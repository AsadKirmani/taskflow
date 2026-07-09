import {
  Component,
  input,
  output,
  signal,
  inject,
  effect,
  Signal,
  untracked,
  computed,
} from '@angular/core';
import { Task } from '../../core/models/task.model';
import { AuthStoreService } from '../auth/data-access/auth-store.service';
import { TaskStore } from './data-access/task-store.service';
import { TaskComment } from '../../core/models/comment.model';
import { TaskQuickActionsComponent } from './components/task-quick-actions.component';
import { TaskDescriptionComponent } from './components/task-description.component';
import { TaskCommentsComponent } from './components/task-comments.component';
import { TaskChecklistComponent } from './components/task-checklist.component';
import { TaskFacade } from './facades/task.facade';
import { TaskHeaderComponent } from './components/task-header.component';
import { TaskAssigneesComponent } from './components/task-assignees.component';
import { TaskDueDateComponent } from './components/task-duedate.component';
import { TaskAttachmentsComponent } from './components/task-attachments.component';
import { TaskActivityComponent } from './components/task.activity.component';
import { APP_ICONS } from '../../core/icons/lucide-icons';

@Component({
  selector: 'app-task',
  imports: [
    TaskHeaderComponent,
    TaskChecklistComponent,
    TaskAssigneesComponent,
    TaskDueDateComponent,
    TaskAttachmentsComponent,
    TaskQuickActionsComponent,
    TaskDescriptionComponent,
    TaskCommentsComponent,
    TaskActivityComponent,
    ...APP_ICONS,
  ],
  templateUrl: './task.component.html',
  providers: [TaskFacade],
})
export class TaskComponent {
  private authStore = inject(AuthStoreService);
  private taskStore = inject(TaskStore);

  constructor() {
    effect(() => {
      const t = this.task();
      const currentT = untracked(() => this.facade.currentTask());
      if (t && (!currentT || currentT.id !== t.id)) {
        this.facade.selectedTaskId.set(t.id);
        this.taskStore.getCommentsForTask(t.id);
        this.facade.loadTaskActivity(t.id);
      }
    });
  }
  facade = inject(TaskFacade);
  workspaceId = input.required<string>();
  boardId = input.required<string>();
  task = input.required<Task>();
  currentUser = computed(() => this.authStore.currentUser() || null);
  comments: Signal<TaskComment[]> = this.taskStore.comments;
  isChecklistVisible = signal(false);
  isMemberPickerOpen = signal(false);
  closed = output<void>();
  close() {
    this.closed.emit();
  }
  openAssigneePicker() {
    this.isMemberPickerOpen.set(true);
  }
}
