import { Component, input, output, signal, ViewChild, ElementRef, DestroyRef, inject, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextEditorComponent } from '../../../../shared/components/editor/text-editor.component';
import { Task } from '../../../../core/models/task.model';
import { ActivatedRoute } from '@angular/router';
import { TaskStoreService } from '../../data-access/task-store.service';
import { TaskComment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, TextEditorComponent], 
  templateUrl: './task-overlay.component.html'
})
export class TaskOverlayComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private taskStore = inject(TaskStoreService);
  workspaceId = input.required<string>();
  boardId = input.required<string>();
  comments: Signal<TaskComment[]> = this.taskStore.comments;
  newComment = signal('');
  
  constructor() {
    effect(() => {
      const wId = this.workspaceId();
      const bId = this.boardId();
      const tId = this.task()?.id;

      if (wId && bId && tId) {
        this.taskStore.getCommentsForTask(wId, bId, tId);
      }
    });
  }
  task = input.required<Task>();
  columnName = input.required<string>();
  closed = output<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isEditingDesc = signal(false);
  descValue = signal('<p>This is description content.</p>'); 

  isWritingComment = signal(false);
  attachments = signal<{name: string, url: string}[]>([]);

  close() { this.closed.emit(); }

  enableDescEdit() { this.isEditingDesc.set(true); }
  saveDescription() { this.isEditingDesc.set(false); }
  cancelDescEdit() { this.isEditingDesc.set(false); }

  startWritingComment() { this.isWritingComment.set(true); }
  cancelComment() { 
    this.isWritingComment.set(false); 
    this.newComment.set('');
  }
  postComment() {
    const text = this.newComment().trim();
    if (!text) return;

    const wId = this.workspaceId();
    const bId = this.boardId();
    const tId = this.task()?.id;

    if (wId && bId && tId) {
      this.taskStore.postCommentToTask(wId, bId, tId, text);
      this.cancelComment();
    }
  }

  triggerAttachmentUpload() { this.fileInput.nativeElement.click(); }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.attachments.update(current => [...current, { name: file.name, url: URL.createObjectURL(file) }]);
    }
  }
}