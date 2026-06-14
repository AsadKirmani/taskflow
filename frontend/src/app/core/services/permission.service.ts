import { Injectable, signal } from '@angular/core';
import { ROLE_PERMISSIONS } from '../config/permissions';
import { Permission } from '../config/permissions';
import { WorkspaceRole } from '../config/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionService {
 private roleSignal =
    signal<WorkspaceRole | null>(null);

  setRole(role: WorkspaceRole | null) {
    this.roleSignal.set(role);
  }

  get role() {
    return this.roleSignal();
  }

  hasPermission(
    requiredPermission: Permission
  ): boolean {

    const role =
      this.roleSignal();

    if (!role) {
      return false;
    }
    if (role === 'OWNER') {
      return true;
    }
    return (
      ROLE_PERMISSIONS[role]?.includes(
        requiredPermission
    )) ?? false;
  }
}