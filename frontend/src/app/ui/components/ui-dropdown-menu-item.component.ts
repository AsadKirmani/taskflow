import { Component, input, output, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CdkMenuItem } from '@angular/cdk/menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  hostDirectives: [CdkMenuItem],
  host: {
    '[class]': 'computedClass()'
  },
  template: `
    <span class="flex items-center gap-3 w-full text-left pointer-events-none">
      <ng-content></ng-content>
    </span>
  `,
})
export class UiDropdownMenuItemComponent implements OnInit, OnDestroy {
  active = input<boolean>(false); 
  onClick = output<void>();

  private menuItem = inject(CdkMenuItem);
  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.menuItem.triggered.subscribe(() => {
      this.onClick.emit();
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  computedClass = computed(() => {
    const base = 'w-full px-3 py-2 text-sm flex items-center text-base-content transition-colors cursor-pointer rounded-md outline-none';
    const interactive = 'bg-transparent hover:bg-base-200 focus-visible:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/50';

    if (this.active()) {
      return `${base} bg-base-300 border-l-4 border-primary font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/50`; 
    }
    return `${base} ${interactive}`;
  });
}