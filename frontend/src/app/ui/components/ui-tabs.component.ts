import { 
  ChangeDetectionStrategy, 
  Component, 
  contentChildren, 
  input, 
  output, 
  effect, 
  untracked 
} from '@angular/core';
import { UiTabComponent } from './ui-tab.component';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  template: `
    <div class="w-full flex flex-col">
      <div role="tablist" [class]="computedTablistClass()">
        @for (tab of tabs(); track tab.label(); let i = $index) {
          <button
            role="tab"
            type="button"
            [attr.aria-selected]="tab.isActive()"
            [disabled]="tab.disabled()"
            [class]="computedTabClass(tab.isActive(), tab.disabled())"
            (click)="selectTab(tab, i)"
          >
            {{ tab.label() }}
          </button>
        }
      </div>
      <div class="w-full relative">
        <ng-content></ng-content>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiTabsComponent {
  variant = input<'bordered' | 'boxed' | 'base'>('bordered');
  size = input<'sm' | 'md' | 'lg'>('md');
  tabChange = output<number>();
  tabs = contentChildren(UiTabComponent);

  constructor() {
    effect(() => {
      const tabList = this.tabs();
      untracked(() => {
        if (tabList.length > 0 && !tabList.some(t => t.isActive())) {
          const firstAvailable = tabList.find(t => !t.disabled()) || tabList[0];
          this.selectTab(firstAvailable, tabList.indexOf(firstAvailable), false);
        }
      });
    });
  }

  selectTab(selectedTab: UiTabComponent, index: number, emitEvent = true) {
    if (selectedTab.disabled()) return;
    
    this.tabs().forEach(t => t.isActive.set(false));
    selectedTab.isActive.set(true);
    
    if (emitEvent) {
      this.tabChange.emit(index);
    }
  }

computedTablistClass(): string {
  const base = 'flex flex-nowrap overflow-x-auto hide-scrollbar w-full';
  
  const variants = {
    bordered: 'gap-x-4 overflow-hidden',
    boxed: 'gap-x-1 p-1 bg-base-100 rounded-lg border border-base-300 inline-flex w-max',
    base: 'gap-x-2 '
  };
  
  return `${base} ${variants[this.variant()]}`;
}

computedTabClass(isActive: boolean, isDisabled: boolean): string {
  let base = 'whitespace-nowrap font-medium transition-all duration-200 flex items-center justify-center ';
  
  if (this.variant() === 'boxed') {
    base += 'px-4 py-2 rounded-lg text-sm ';
  } else {
    base += 'py-3 px-1 border-b-2 -mb-[1px] text-sm ';
  }

  if (isActive) {
    if (this.variant() === 'bordered') {
      base += 'border-primary text-primary ';
    } else {
      base += 'bg-neutral text-neutral-content shadow-sm ';
    }
  } else {
    base += this.variant() === 'bordered' 
      ? 'border-transparent text-base-content hover:text-base-content/70 ' 
      : 'text-base-content/70 hover:text-base-content hover:bg-base-200 '; 
  }
  
  if (isDisabled) {
    base += 'opacity-40 cursor-not-allowed ';
  }
  return base;
}
}