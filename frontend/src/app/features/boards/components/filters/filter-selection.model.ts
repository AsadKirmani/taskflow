export interface BoardFilterSelection {
  noMembers: boolean;
  me: boolean;
  completed: boolean;
  incomplete: boolean;
  dueDate: 'all' | 'none' | 'overdue' | 'today' | 'this_week';
  labels: string[];
  activity: Array<'recentlyupdated' | 'recentlycreated' | 'activeinlastweek' | 'activeinlastmonth'>;
}
