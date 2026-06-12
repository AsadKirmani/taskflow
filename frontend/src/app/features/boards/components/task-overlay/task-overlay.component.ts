import { Component, input, output, signal, ViewChild, ElementRef, inject, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextEditorComponent } from '../../../../shared/components/editor/text-editor.component';
import { Task, TaskLabel, ChecklistItem } from '../../../../core/models/task.model'; // Make sure interfaces exist
import { TaskStoreService } from '../../data-access/task-store.service';
import { TaskComment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, TextEditorComponent], 
  templateUrl: './task-overlay.component.html'
})
export class TaskOverlayComponent {
  private taskStore = inject(TaskStoreService);
  
  // Inputs & Outputs
  workspaceId = input.required<string>();
  boardId = input.required<string>();
  columnName = input.required<string>();
  task = input.required<Task>(); // Parent se aane wala fresh task
  closed = output<void>();

  // 🚀 Yahan hum Optimistic UI ke liye ek Local Copy banayenge
  currentTask = signal<Task | null>(null);

  // Existing States
  comments: Signal<TaskComment[]> = this.taskStore.comments;
  newComment = signal('');
  isEditingDesc = signal(false);
  descValue = signal(''); 
  isWritingComment = signal(false);
  attachments = signal<{name: string, url: string}[]>([]);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    // 🚀 FIX: Jab bhi parent se naya task aaye, uski ek LOCAL DEEP COPY bana lo
    // Taaki hum UI mein instantly changes dikha sakein bina parent state tode
    effect(() => {
      const t = this.task();
      if (t) {
        this.currentTask.set(JSON.parse(JSON.stringify(t))); 
        this.descValue.set(t.description || '<p>No description yet.</p>');
        this.taskStore.getCommentsForTask(t.id);
      }
    }, { allowSignalWrites: true });
  }

  close() { this.closed.emit(); }

  // ---------------------------------------------------
  // 🚀 UNIVERSAL TASK UPDATER (The Magic Helper)
  // ---------------------------------------------------
  private updateTaskProperty(key: keyof Task, value: any) {
    const task = this.currentTask();
    if (!task) return;

    // 1. Optimistic UI Update (UI instantly fast react karega)
    const updatedTask = { ...task, [key]: value };
    this.currentTask.set(updatedTask);

    // 2. API Call (Store ko bolo backend update kare)
    // Ensure tumhare TaskStoreService me 'updateTask' method ho!
    this.taskStore.updateTask(task.id, { [key]: value });
  }

  // ---------------------------------------------------
  // 🏷️ LABELS LOGIC
  // ---------------------------------------------------
  addLabel(name: string, color: string) {
    const task = this.currentTask();
    if (!task) return;
    
    const newLabels = [...(task.labels || []), { name, color }];
    this.updateTaskProperty('labels', newLabels);
  }
  // 🚀 Dynamic Label Generator (Testing ke liye)
  addNewLabel() {
    const name = prompt('Enter new label name:');
    if (!name) return;
    
    // Random mast colors pick karega
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    this.addLabel(name, randomColor);
  }

  removeLabel(index: number) {
    const task = this.currentTask();
    if (!task || !task.labels) return;

    const newLabels = task.labels.filter((_, i) => i !== index);
    this.updateTaskProperty('labels', newLabels);
  }

  // ---------------------------------------------------
  // ✅ CHECKLIST LOGIC
  // ---------------------------------------------------
  addChecklistItem(text: string) {
    const task = this.currentTask();
    if (!task) return;

    const newItem: ChecklistItem = { title: text, isCompleted: false };
    const newChecklist = [...(task.checklist || []), newItem];
    this.updateTaskProperty('checklist', newChecklist);
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

    const newChecklist = task.checklist.filter((_, i) => i !== index);
    this.updateTaskProperty('checklist', newChecklist);
  }

  // ---------------------------------------------------
  // 📅 DATES & 🚩 PRIORITY LOGIC
  // ---------------------------------------------------
  changePriority(newPriority: 'low' | 'medium' | 'high' | 'urgent') {
    this.updateTaskProperty('priority', newPriority);
  }

  changeDueDate(date: string | null) {
    this.updateTaskProperty('dueDate', date);
  }

  // ---------------------------------------------------
  // 📝 DESCRIPTION & COMMENTS LOGIC
  // ---------------------------------------------------
  enableDescEdit() { this.isEditingDesc.set(true); }
  cancelDescEdit() { this.isEditingDesc.set(false); }
  
  saveDescription() {
    this.updateTaskProperty('description', this.descValue());
    this.isEditingDesc.set(false);
  }

  startWritingComment() { this.isWritingComment.set(true); }
  cancelComment() { 
    this.isWritingComment.set(false); 
    this.newComment.set('');
  }
  
  postComment() {
    const text = this.newComment().trim();
    const tId = this.task()?.id;
    if (!text || !tId) return;

    this.taskStore.postCommentToTask(tId, text);
    this.cancelComment();
  }

  // ---------------------------------------------------
  // 📎 ATTACHMENTS LOGIC
  // ---------------------------------------------------
  triggerAttachmentUpload() { this.fileInput.nativeElement.click(); }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Isko bhi store ke through upload karwana padega actual backend ke liye
      this.attachments.update(current => [...current, { name: file.name, url: URL.createObjectURL(file) }]);
    }
  }
}