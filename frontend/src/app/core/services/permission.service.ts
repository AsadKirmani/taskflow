import { Injectable, signal, computed } from '@angular/core';
import { ROLE_PERMISSIONS } from '../config/permissions';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private roleSignal = signal<string | null>(null);

  constructor(private router: Router) {}
  hasPermission = (requiredPermission: string) => computed(() => {
    const role = this.roleSignal();
    if (!role) return false;
    
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions?.includes('*')) return true;
    return permissions?.includes(requiredPermission) ?? false;
  });

  setRole(role: string) {
    this.roleSignal.set(role);
  }
  // permission.service.ts mein
updateUserContext(workspaces: any[]) {
  // Jab bhi user kisi workspace page pe jaye, wahan ka role pick karke signal update kar do
  const currentWorkspaceId = this.router.url.split('/')[2]; 
  const ws = workspaces.find(w => w.id === currentWorkspaceId);
  if (ws) {
    this.setRole(ws.role);
  }
}
}