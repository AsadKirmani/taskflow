import { Component, input, output } from '@angular/core';
import { TaskLabel } from '../../../../../core/models/task.model';
import { ActionLabelComponent } from '../components/quick-actions/action-label.component';
import { ActionChecklistComponent } from '../components/quick-actions/action-checklist.component';
import { ActionDatesComponent } from '../components/quick-actions/action-date.component';
import { ActionAttachmentsComponent } from '../components/quick-actions/action-attatchments.component';
import { ActionMembersComponent } from '../components/quick-actions/action-members.component';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-task-quick-actions',
  standalone: true,
  imports: [
    ActionLabelComponent,
    ActionChecklistComponent,
    ActionDatesComponent,
    ActionAttachmentsComponent,
    ActionMembersComponent
  ],
  template: `
    <div class="flex flex-wrap gap-2">
      <app-action-label
        [appliedLabels]="appliedLabels()"
        (labelToggled)="labelToggled.emit($event)"
      >
      </app-action-label>
      <app-action-checklist
        (itemAdded)="checklistAdded.emit($event)"
      ></app-action-checklist>
      <app-action-dates 
        [dueDate]="dueDate()" 
        (dateSelected)="dueDateChanged.emit($event)">
      </app-action-dates>
      
      <app-action-members 
        [availableMembers]="availableMembers()"
        [assignedMemberIds]="assignedMemberIds()"
        [currentUser]="currentUser()"
        (memberToggled)="memberToggled.emit($event)"
      ></app-action-members>
      
      <app-action-attachments (fileSelected)="fileSelected.emit($event)"></app-action-attachments>
    </div>
  `,
})
export class TaskQuickActionsComponent {
  dueDate = input<string | null | undefined>(null);
  appliedLabels = input<TaskLabel[]>([]);
  assignedMemberIds = input<string[]>([]);
  availableMembers = input<User[]>([]);
  currentUser = input<User | null>(null);
  labelToggled = output<TaskLabel>();
  labelsClicked = output<void>();
  checklistAdded = output<string>();
  checklistToggled = output<{ index: number, isCompleted: boolean }>();
  checklistDeleted = output<number>();
  dueDateChanged = output<string>();
  memberToggled = output<string>();
  fileSelected = output<File>();
}
