import { Directive, input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { Permission } from '../../core/config/permissions';

@Directive({
  selector: '[appCan]',
  standalone: true,
})
export class CanDirective {
  permission = input.required<Permission>({ alias: 'appCan' });

  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const requiredPerm = this.permission();

      const isAllowed = this.permissionService.hasPermission(requiredPerm);

      if (isAllowed) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
