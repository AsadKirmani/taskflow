import { Component, input, output } from '@angular/core';
import { TaskLabel } from '../../../core/models/task.model';
import { ActionLabelComponent } from './quick-actions/action-label.component';
import { ActionChecklistComponent } from './quick-actions/action-checklist.component';
import { ActionAttachmentsComponent } from './quick-actions/action-attatchments.component';
import { ActionMembersComponent } from './quick-actions/action-members.component';
import { User } from '../../../core/models/user.model';
import { CustomDatepickerComponent } from '../../../shared/components/datepicker/custom-datepicker.component';
import { TaskDates } from '../../../shared/components/datepicker/custom-datepicker.component';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-quick-actions',
  standalone: true,
  imports: [
    ActionLabelComponent,
    ActionChecklistComponent,
    ActionAttachmentsComponent,
    ActionMembersComponent,
    CustomDatepickerComponent,
  ],
  template: `
    <div class="flex flex-wrap gap-2">
      <app-action-label [labels]="appliedLabels()" (labelToggled)="labelToggled.emit($event)">
      </app-action-label>
      <app-action-checklist (itemAdded)="checklistAdded.emit($event)"></app-action-checklist>
      <app-custom-datepicker (dateApplied)="dueDateChanged.emit($event)"></app-custom-datepicker>

      <app-action-members
        [availableMembers]="availableMembers()"
        [currentUser]="currentUser()"
        [assignedMemberIds]="assignedMemberIds()"
        (memberToggled)="memberToggled.emit($event)"
      ></app-action-members>

      <app-action-attachments (fileSelected)="fileSelected.emit($event)"></app-action-attachments>
    </div>
  `,
})
export class TaskQuickActionsComponent {
  availableMembers = input<User[]>([]);
  currentUser = input<User | null>(null);
  labelToggled = output<TaskLabel>();
  checklistAdded = output<string>();
  dueDateChanged = output<TaskDates>();
  memberToggled = output<string>();
  fileSelected = output<File>();
  task = input.required<Task>();
  appliedLabels = input<TaskLabel[]>([]);
  assignedMemberIds = input<string[]>([]);
}
