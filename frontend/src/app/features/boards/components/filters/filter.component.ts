import { Component, model, output } from '@angular/core';
import { BoardFilterSelection } from './filter-selection.model';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-apply-filter',
  standalone: true,
  imports: [...APP_ICONS, UiButtonComponent],
  templateUrl: './filter.component.html',
  host: {
    'document:click': 'close()',
  },
})
export class ApplyFilterComponent {
  readonly filter: BoardFilterSelection = {
    noMembers: false,
    me: false,
    completed: false,
    incomplete: false,
    dueDate: 'all',
    labels: [],
    activity: [],
  };
  filtersChanged = output<BoardFilterSelection>();
  filterClose = output<void>();

  isOpen = model<boolean>(false);
  close(): void {
    this.isOpen.set(false);
  }

  toggleFlag(key: 'noMembers' | 'me' | 'completed' | 'incomplete', checked: boolean): void {
    this.filter[key] = checked;
    this.emitChange();
  }

  selectDueDate(value: BoardFilterSelection['dueDate'], checked: boolean): void {
    this.filter.dueDate = checked ? value : 'all';
    this.emitChange();
  }

  toggleLabel(label: string, checked: boolean): void {
    this.filter.labels = checked
      ? [...this.filter.labels, label]
      : this.filter.labels.filter((item) => item !== label);
    this.emitChange();
  }

  toggleActivity(
    type: 'recentlyupdated' | 'recentlycreated' | 'activeinlastweek' | 'activeinlastmonth',
    checked: boolean,
  ): void {
    this.filter.activity = checked
      ? [...this.filter.activity, type]
      : this.filter.activity.filter((item) => item !== type);
    this.emitChange();
  }

  private emitChange(): void {
    this.filtersChanged.emit({
      ...this.filter,
      labels: [...this.filter.labels],
      activity: [...this.filter.activity],
    });
  }
}
