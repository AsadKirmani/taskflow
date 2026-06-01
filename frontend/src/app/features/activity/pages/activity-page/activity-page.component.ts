import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  template: `
    <section>
      <h1>Activity</h1>
      <p>Recent activity placeholder page.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityPageComponent {}