import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, effect, inject } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Directive({ selector: '[appCan]', standalone: true })
export class CanDirective implements OnInit {
  @Input('appCan') permission!: string;
  private permissionService = inject(PermissionService);
  private checkAccess = this.permissionService.hasPermission(this.permission);

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {
    effect(() => {
      if (this.checkAccess()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnInit() {}
}