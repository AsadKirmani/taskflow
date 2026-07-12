import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { TaskStore } from '../data-access/task-store.service';
import { Task, TaskLabel } from '../../../core/models/task.model';
import { BoardStore } from '../../boards/data-access/board-store.service';
import { User } from '../../../core/models/user.model';
import { UploadService } from '../../../core/services/upload.service';
import { TaskComment } from '../../../core/models/comment.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivityStore } from '../../activity/data-access/activity-store.service';

@Injectable({
  providedIn: 'root',
})
export class TaskFacade {
  constructor() {}
  private taskStore = inject(TaskStore);
  private boardStore = inject(BoardStore);
  private uploadService = inject(UploadService);
  private taskActivityStore = inject(ActivityStore);
  selectedTaskId = signal<string | null>(null);
  boardMembers = computed(() => this.boardStore.members() ?? []);

  workspaceId = computed(() => this.boardStore.currentBoard()?.workspaceId ?? '');

  currentTask = computed<Task | null>(() => {
    const taskId = this.selectedTaskId();
    if (!taskId) return null;
    return this.taskStore.tasksById()[taskId] || null;
  });

  columnName = computed(
    () =>
      this.boardStore.currentColumns().find((col) => col.id === this.currentTask()?.columnId)
        ?.name || '',
  );

comments = computed(() => {
  const rawComments = this.taskStore.comments();
  const members = this.boardMembers();
  if (!rawComments || !members) return [];
  return rawComments.map(comment => {
    const authorDetails = members.find(m => m.id === comment.authorId); 
    return {
      ...comment,
      authorAvatarUrl: authorDetails?.avatarUrl || undefined,
    };
  });
});

taskActivities = computed(() => this.taskActivityStore.items());
loadTaskActivity(taskId: string) {
  this.taskActivityStore.loadTaskActivity(taskId);
}
  updateTaskProperty(updates: Partial<Task>) {
    const task = this.currentTask();
    if (!task) return;
    this.taskStore.updateTask(task.id, updates);
  }
  removeDueDate() {
    this.updateTaskProperty({ dueDate: null });
  }
  removeStartDate() {
    this.updateTaskProperty({ startDate: null });
  }

  toggleLabel(label: TaskLabel) {
    const task = this.currentTask();
    if (!task) return;
    const currentLabels = task.labels || [];
    const exists = currentLabels.some((l) => l.name === label.name);
    const newLabels = exists
      ? currentLabels.filter((l) => l.name !== label.name)
      : [...currentLabels, label];
    this.updateTaskProperty({ labels: newLabels });
  }
  addChecklistItem(text: string) {
    const task = this.currentTask();
    if (!task) return;
    this.updateTaskProperty({ checklist: [
      ...(task.checklist || []),
      { title: text, isCompleted: false },
    ] });
  }

  toggleChecklistItem(index: number, isCompleted: boolean) {
    const task = this.currentTask();
    if (!task || !task.checklist) return;
    const newChecklist = task.checklist.map((item, i) =>
      i === index ? { ...item, isCompleted } : item,
    );
    this.updateTaskProperty({ checklist: newChecklist });
  }
  deleteChecklistItem(index: number) {
    const task = this.currentTask();
    if (!task || !task.checklist) return;
    this.updateTaskProperty({ checklist: task.checklist.filter((_, i) => i !== index) });
  }
  postComment(text: string) {
    const tId = this.currentTask()?.id;
    if (tId) this.taskStore.postCommentToTask(tId, text);
  }

  toggleTaskMember(userId: string) {
    const task = this.currentTask();
    if (!task) return;

    const currentMembers = task.assigneeIds || [];
    const exists = currentMembers.includes(userId);
    const assignedAt = exists ? null : new Date().toISOString();

    let newMembers;
    if (exists) {
      newMembers = currentMembers.filter((id) => id !== userId);
    } else {
      newMembers = [...currentMembers, userId];
    }

    this.updateTaskProperty({ assigneeIds: newMembers, assignedAt });
  }
  assignedMembers = computed<User[]>(() => {
    const members = this.boardStore.members() || [];
    const memberMap = new Map(members.map((member: User) => [member.id, member]));
    return (this.currentTask()?.assigneeIds || [])
      .map((id) => memberMap.get(id))
      .filter((member): member is User => !!member);
  });
  updateTaskDate(dates: {
    startDate: Date | null;
    dueDate: Date | null;
    startTime?: string | null;
    endTime?: string | null;
  }) {
    const task = this.currentTask();
    if (!task) return;
    const { startDate, dueDate, startTime, endTime } = dates;

    let startDateTime: string | null = null;
    let dueDateTime: string | null = null;

    if (startDate) {
      const startObj = new Date(startDate);

      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        startObj.setHours(hours, minutes, 0, 0);
      } else {
        startObj.setHours(0, 0, 0, 0);
      }
      startDateTime = startObj.toISOString();
    }

    if (dueDate) {
      const dueObj = new Date(dueDate);

      if (endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        dueObj.setHours(hours, minutes, 0, 0);
      } else {
        dueObj.setHours(23, 59, 59, 999);
      }
      dueDateTime = dueObj.toISOString();
    }

    this.updateTaskProperty({  startDate: startDateTime, dueDate: dueDateTime });
  }
  archiveTask(taskId: string, workspaceId: string, taskTitle: string, reason?: string) {
    this.taskStore.archiveTask(taskId, workspaceId, taskTitle, reason);
  }
  uploadTaskAttachment(taskId: string, file: File) {
    this.uploadService.uploadAttachment(taskId, file).subscribe({
      next: (response) => {
        const newAttachment = response.data;
        const currentTask = this.currentTask();

        if (currentTask) {
          const updatedAttachments = [...(currentTask.attachments || []), newAttachment];

          this.updateTaskProperty({ attachments: updatedAttachments });
        }
      },
      error: (err) => {
        console.error('File upload failed:', err);
      },
    });
  }
}
