import { Component, HostListener, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TextEditorComponent } from '../../../shared/components/editor/text-editor.component';
import { TaskComment } from '../../../core/models/comment.model';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiAvatarComponent } from '../../../ui/components/ui-avatar.component';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [TextEditorComponent, DatePipe, UiButtonComponent, UiAvatarComponent, ...APP_ICONS],
  template: `
    <div>
      <div class="flex items-center gap-2">
        <svg lucideMessageSquare class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
        <h3 class="font-semibold text-base text-base-content m-0">Comments and activity</h3>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-4 relative">
      @if (!isWriting()) {
        <div
          (click)="startWriting()"
          class="w-full bg-base-300 border border-base-300 rounded-field p-3 text-sm text-base-content/70 cursor-text hover:bg-base-100 transition-colors"
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
          <ui-avatar
            [name]="comment.author"
            [src]="comment.authorAvatarUrl"
            size="md"
          ></ui-avatar>
          <div class="flex flex-col flex-1">
            <div class="text-sm text-base-content leading-tight mb-1.5">
              <span class="font-bold text-accent">{{ comment.author }}</span>
              <span class="text-xs text-base-content/70">
                {{ comment.createdAt | date: 'short' }}
              </span>
            </div>
            <div
              class="bg-base-100 border border-base-300 rounded-md p-3 text-sm text-base-content prose prose-sm max-w-none"
              [innerHTML]="comment.content"
            ></div>
            <div class="flex items-center gap-1 mt-1">
            <a class="text-xs text-base-content/70 hover:text-base-content hover:underline cursor-pointer">Edit</a>
              <span class="text-xs text-base-content/70">&bull;</span>
              <a class="text-xs text-base-content/70 hover:text-base-content hover:underline cursor-pointer">Delete</a>
            </div>
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
