// src/services/permission.service.ts
import { WorkspaceModel } from "../models/workspace.model";
import { ROLE_PERMISSIONS } from "../config/roles";
import { WorkspaceMemberModel } from "../models/workspace-member.model";

class PermissionService {
  
  static async checkMembershipAndRole(userId: string, workspaceId: string) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) return { isMember: false, role: null };
    
    // 🛡️ FIX 1: THE GOD MODE CHECK
    // Agar user khud Workspace ka Owner hai, toh usko direct OWNER role de do
    if (workspace.ownerId.toString() === userId.toString()) {
      return { isMember: true, role: 'OWNER' };
    }
    
    // 🛡️ FIX 2: MEMBER COLLECTION CHECK
    // (status: 'ACTIVE' hata diya taaki query simple aur error-free rahe)
    const member = await WorkspaceMemberModel.findOne({ workspaceId, userId });
    
    if (!member) {
      return { isMember: false, role: null };
    }

    return { isMember: true, role: member.role };
  }

  static async hasPermission(userId: string, workspaceId: string, requiredPermission: string) {
    const { isMember, role } = await this.checkMembershipAndRole(userId, workspaceId);
    
    // 🐛 DEBUG LOGS
    console.log(`\n--- PERMISSION CHECK ---`);
    console.log(`[DEBUG] UserID: ${userId}`);
    console.log(`[DEBUG] WorkspaceID: ${workspaceId}`);
    console.log(`[DEBUG] IsMember: ${isMember}, Role: ${role}`);
    console.log(`[DEBUG] Required Permission: ${requiredPermission}`);
    
    if (!isMember || !role) {
       console.log(`[DEBUG] ❌ Access Denied: Not a member or no role.`);
       return false;
    }

    // Dynamic Role Fetch
    const userPermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];

    if (!userPermissions) {
       console.log(`[DEBUG] ❌ Access Denied: Invalid role found in DB.`);
       return false;
    }

    if (userPermissions.includes('*')) {
        console.log("[DEBUG] ✅ Access Granted: User is OWNER.");
        return true;
    } 

    const hasAccess = userPermissions.includes(requiredPermission);
    console.log(`[DEBUG] Has Access?: ${hasAccess ? '✅ YES' : '❌ NO'}`);
    
    return hasAccess;
  }
}

export { PermissionService };