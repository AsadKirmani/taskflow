import { Component, input, output, signal, ViewChild, ElementRef, inject, effect, Signal, untracked } from '@angular/core';
  import { CommonModule, DatePipe } from '@angular/common';
  import { MatIconModule } from '@angular/material/icon';
  import { TextEditorComponent } from '../../../../shared/components/editor/text-editor.component';
  import { Task, TaskLabel, ChecklistItem } from '../../../../core/models/task.model';
  import { TaskStoreService } from '../../data-access/task-store.service';
  import { TaskComment } from '../../../../core/models/comment.model';
  import { TaskLabelsComponent } from './components/task-labels.component';
  import { TaskChecklistComponent } from './components/task-checklist.component';

  @Component({
    selector: 'app-task-overlay',
    standalone: true,
    imports: [CommonModule, MatIconModule, TextEditorComponent, TaskLabelsComponent, TaskChecklistComponent, DatePipe], 
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
    isChecklistVisible = signal(false);
    // Popup kholne/band karne ke liye naya signal
  isChecklistPickerOpen = signal(false);

  // Popup se data aane par add karne aur popup band karne ka function
  addChecklistFromMenu(title: string) {
    if (!title.trim()) return;
    
    this.addChecklistItem(title); // Tera purana function call hoga jo DB update karta hai
    this.isChecklistPickerOpen.set(false); // Data add hote hi popup automatically band!
  }

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor() {
      // 🚀 FIX: Jab bhi parent se naya task aaye, uski ek LOCAL DEEP COPY bana lo
      effect(() => {
        const t = this.task(); // Parent se aaya hua task
        
        // untracked use kiya taaki loop na bane
        const currentT = untracked(() => this.currentTask());

        // Data sirf tab overwrite karo jab ID alag ho
        if (t && (!currentT || currentT.id !== t.id)) {
          this.currentTask.set(JSON.parse(JSON.stringify(t))); 
          this.descValue.set(t.description || '<p>No description yet.</p>');
          this.taskStore.getCommentsForTask(t.id);
        }
      }); //
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
      this.taskStore.updateTask(task.id, { [key]: value });
    }

    // ---------------------------------------------------
    // 🏷️ LABELS LOGIC (Updated for Child Component)
    // ---------------------------------------------------
    
    // 🚀 Yeh function child component emit karega
    toggleLabel(label: TaskLabel) {
      console.log('Toggling label:', label);
      const task = this.currentTask();
      if (!task) return;

      const currentLabels = task.labels || [];
      const exists = currentLabels.some(l => l.name === label.name);

      let newLabels;
      if (exists) {
        // Agar label pehle se hai, toh usko list se hata do (Remove)
        newLabels = currentLabels.filter(l => l.name !== label.name);
      } else {
        // Agar nahi hai, toh array mein add kar do (Add)
        newLabels = [...currentLabels, label];
      }

      this.updateTaskProperty('labels', newLabels);
    }

    // Yeh function HTML me label delete icon pe click karne ke liye hai
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
      console.log(`Item ${index} clicked! Backend ko bheja ja raha hai:`, isCompleted)
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
    getFormattedDate(dateString: string | null | undefined): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
    // Native Date Picker ko force open karne ke liye
    openDatePicker(inputElement: HTMLInputElement) {
      try {
        // Modern browsers ke liye best tareeka
        if (typeof inputElement.showPicker === 'function') {
          inputElement.showPicker();
        } else {
          // Fallback purane browsers ke liye
          inputElement.click(); 
        }
      } catch (e) {
        console.error('Date picker open nahi hua:', e);
      }
    }
    changeDueDate(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.value) {
        try {
          // input.value "YYYY-MM-DD" format mein hota hai
          // Isko pure ISO Datetime (Zod compatible) mein convert karo
          const isoDateString = new Date(input.value).toISOString();
          
          this.updateTaskProperty('dueDate', isoDateString);
        } catch (error) {
          console.error('Date conversion failed', error);
        }
      }
    }

    // Agar date delete karni ho
    removeDueDate() {
      this.updateTaskProperty('dueDate', null);
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
        this.attachments.update(current => [...current, { name: file.name, url: URL.createObjectURL(file) }]);
      }
    }
  }