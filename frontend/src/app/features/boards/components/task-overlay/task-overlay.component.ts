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
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskLabel, ChecklistItem } from '../../../../core/models/task.model';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { BoardStoreService } from '../../data-access/board-store.service';
import { TaskStoreService } from '../../data-access/task-store.service';
import { TaskComment } from '../../../../core/models/comment.model';

// Naye chhote components import karo
import { TaskQuickActionsComponent } from './components/task-quick-actions.component';
import { TaskDescriptionComponent } from './components/task-description.component';
import { TaskCommentsComponent } from './components/task-comments.component';
import { TaskChecklistComponent } from './components/task-checklist.component';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    DatePipe,
    TaskChecklistComponent,
    TaskQuickActionsComponent,
    TaskDescriptionComponent,
    TaskCommentsComponent,
  ],
  templateUrl: './task-overlay.component.html',
})
export class TaskOverlayComponent {
  private authStore = inject(AuthStoreService);
  private boardStore = inject(BoardStoreService);
  private taskStore = inject(TaskStoreService);

  workspaceId = input.required<string>();
  boardId = input.required<string>();
  columnName = input.required<string>();
  task = input.required<Task>();
  closed = output<void>();
  boardMembers = computed(() => this.boardStore.currentBoard?.members || []);
  currentUser = computed(() => this.authStore.currentUser() || null);
  currentTask = signal<Task | null>(null);
  comments: Signal<TaskComment[]> = this.taskStore.comments;
  attachments = signal<{ name: string; url: string }[]>([]);
  isChecklistVisible = signal(false);
  isMemberPickerOpen = signal(false);

  constructor() {
    effect(() => {
      const t = this.task();
      const currentT = untracked(() => this.currentTask());
      if (t && (!currentT || currentT.id !== t.id)) {
        this.currentTask.set(JSON.parse(JSON.stringify(t)));
        this.taskStore.getCommentsForTask(t.id);
      }
    });
  }

  close() {
    this.closed.emit();
  }

  updateTaskProperty(key: keyof Task, value: any) {
    const task = this.currentTask();
    if (!task) return;
    this.currentTask.set({ ...task, [key]: value });
    this.taskStore.updateTask(task.id, { [key]: value });
  }

  toggleLabel(label: TaskLabel) {
    const task = this.currentTask();
    if (!task) return;
    const currentLabels = task.labels || [];
    const exists = currentLabels.some((l) => l.name === label.name);
    const newLabels = exists
      ? currentLabels.filter((l) => l.name !== label.name)
      : [...currentLabels, label];
    this.updateTaskProperty('labels', newLabels);
  }

  addChecklistItem(text: string) {
    const task = this.currentTask();
    if (!task) return;
    this.updateTaskProperty('checklist', [
      ...(task.checklist || []),
      { title: text, isCompleted: false },
    ]);
  }

  toggleChecklistItem(index: number, isCompleted: boolean) {
    const task = this.currentTask();
    if (!task || !task.checklist) return;
    const newChecklist = [...task.checklist];
    newChecklist[index].isCompleted = isCompleted;
    this.updateTaskProperty('checklist', newChecklist);
  }

  deleteChecklistItem(index: number) {
    const task = this.currentTask();
    if (!task || !task.checklist) return;
    this.updateTaskProperty(
      'checklist',
      task.checklist.filter((_, i) => i !== index),
    );
  }

  removeDueDate() {
    this.updateTaskProperty('dueDate', null);
  }

  postComment(text: string) {
    const tId = this.task()?.id;
    if (tId) this.taskStore.postCommentToTask(tId, text);
  }

  onFileSelected(file: File) {
    this.attachments.update((current) => [
      ...current,
      { name: file.name, url: URL.createObjectURL(file) },
    ]);
  }
  toggleTaskMember(userId: string) {
    const task = this.currentTask();
    if (!task) return;

    const currentMembers = task.assigneeIds || [];
    const exists = currentMembers.includes(userId);

    let newMembers;
    if (exists) {
      // Agar pehle se hai toh remove karo
      newMembers = currentMembers.filter((id) => id !== userId);
    } else {
      // Agar nahi hai toh add karo
      newMembers = [...currentMembers, userId];
    }

    // Yeh function automatically Frontend + Backend DB dono update kar dega!
    this.updateTaskProperty('assigneeIds', newMembers);
  }
}
