import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  template: `
    <section>
      <h1>Settings</h1>
      <p>Settings placeholder page.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {}