import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ActivityItem, ActivityRef, formatActivityAction } from '../../../activity/models/activity.model';
import { CustomDatepickerComponent } from '../../../../shared/components/datepicker/custom-datepicker.component';
import { DashboardStore } from '../../data-access/dashboard-store.service';

export interface DashboardTaskRow {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  dueDate: string | null;
  priority: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink, CustomDatepickerComponent],
  templateUrl: './dashboard-page.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  
  // 🚀 Sirf aur sirf Store inject kiya hai
  readonly store = inject(DashboardStore);

  ngOnInit() {
    // 🚀 Data load karne ka command seedha store ko de diya
    this.store.loadDashboardData();
  }

  // --- UI Helpers (Strictly for styling and routing) ---

  readonly priorityClassMap: Record<string, string> = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  };

  getTaskStatusClass(task: DashboardTaskRow): string {
    return task.isCompleted ? 'text-green-500' : 'text-blue-500';
  }

  getPriorityClass(priority: string): string {
    return this.priorityClassMap[priority.toLowerCase()] ?? 'text-gray-500';
  }

  getBoardRoute(boardId: string, boardName: string): string[] {
    return ['/boards', boardId, this.toSlug(boardName || 'board')];
  }

  getTaskQueryParams(task: DashboardTaskRow): Record<string, string> {
    return {
      taskId: task.id,
      taskTitle: this.toSlug(task.title)
    };
  }

  describeActivity(item: ActivityItem): string {
    const actor = this.getRef(item.userId)?.name || 'Someone';
    const task = this.getRef(item.taskId)?.title;
    const board = this.getRef(item.boardId)?.name;
    const action = formatActivityAction(item.actionType);

    if (task) {
      return `${actor} ${action} "${task}"`;
    }

    if (board) {
      return `${actor} ${action} on board "${board}"`;
    }

    return `${actor} ${action}`;
  }

  private getRef(value: string | ActivityRef | null | undefined): ActivityRef | null {
    if (!value || typeof value === 'string') {
      return null;
    }
    return value;
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }
}