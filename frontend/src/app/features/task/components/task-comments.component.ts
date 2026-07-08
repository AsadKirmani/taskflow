import { Component, HostListener, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TextEditorComponent } from '../../../shared/components/editor/text-editor.component';
import { TaskComment } from '../../../core/models/comment.model';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [TextEditorComponent, DatePipe, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg lucideMessageSquare class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
        <h3 class="font-semibold text-base text-base-content m-0">Comments and activity</h3>
      </div>
      <ui-button
       variant="outline"
       size="sm"
      >
        Show details
      </ui-button>
    </div>

    <div class="flex flex-col gap-2 mt-4 relative">
      @if (!isWriting()) {
        <div
          (click)="startWriting()"
          class="w-full bg-base-100 border border-base-300 rounded-md p-3 shadow-sm text-sm text-base-content/70 cursor-text hover:bg-base-200 transition-colors"
        >
          Write a comment...
        </div>
      } @else {
        <div class="flex flex-col gap-2 animate-in fade-in duration-200">
          <app-text-editor
            [(value)]="newComment"
            placeholder="Write a comment..."
            minHeight="80px"
          ></app-text-editor>
          <div class="flex items-center gap-2 mt-2">
            <ui-button
              [disabled]="newComment().trim() === '' || newComment().trim() === '<p></p>'"
              [loading]="posting()"
              loadingText="Saving..."
              (click)="post()"
              variant="primary"
              size="sm"
            >
              Save
            </ui-button>
            <ui-button
              (click)="cancel()"
              variant="ghost"
              size="sm"
            >
              Cancel
            </ui-button>
          </div>
        </div>
      }
    </div>

    <div class="flex flex-col gap-5 mt-4">
      @for (comment of comments(); track comment.id) {
        <div class="flex items-start gap-3">
          <div
            class="w-8 h-8 rounded-full bg-base-100 border border-base-300 text-accent flex items-center justify-center text-xs font-bold"
          >
            {{ comment.author.charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col flex-1">
            <div class="text-sm text-base-content leading-tight">
              <span class="font-bold text-accent">{{ comment.author }}</span>
              <span class="text-base-content/70 mx-1">added a comment</span>
            </div>
            <div class="text-xs text-base-content/70 mb-1.5 mt-0.5">
              {{ comment.createdAt | date: 'short' }}
            </div>
            <div
              class="bg-base-200 border border-base-300 rounded-md p-3 text-sm text-base-content prose prose-sm max-w-none"
              [innerHTML]="comment.content"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskCommentsComponent {
  comments = input.required<TaskComment[]>();
  commentPosted = output<string>();
  commentDeleted = output<string>();
  posting = signal(false);
  isWriting = signal(false);
  newComment = signal('');

  startWriting() {
    this.isWriting.set(true);
  }
  cancel() {
    this.isWriting.set(false);
    this.newComment.set('');
  }

  post() {
    const text = this.newComment().trim();
    if (!text || text === '<p></p>') return;
    this.posting.set(true);
    this.commentPosted.emit(text);
    this.cancel();
    this.posting.set(false);
  }
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.post();
    }
  }
}
