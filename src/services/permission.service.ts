import { WorkspaceMemberModel } from '../models/workspace-member.model';
import { ROLE_PERMISSIONS, PERMISSION, Permission } from '../config/roles';
import { AppError } from '../shared/errors/app-error';
import { WorkspaceRole } from '../shared/constants/enums'

export class PermissionService {

  /**
   * Returns user's role in workspace
   */
  private static async getUserRole(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceRole | null> {
    const membership =
      await WorkspaceMemberModel
        .findOne({
          workspaceId,
          userId
        })
        .select('role')
        .lean();
    return membership?.role ?? null;
  }

  /**
   * Returns true/false
   */
  static async hasPermission(
    userId: string,
    workspaceId: string,
    permission: Permission
  ): Promise<boolean> {
    const role =
      await this.getUserRole(
        userId,
        workspaceId
      );
    if (!role) {
      return false;
    }
    if (role === 'OWNER') return true;

    const permissions =
      ROLE_PERMISSIONS[
        role as keyof typeof ROLE_PERMISSIONS
      ];

    if (!permissions) {
      return false;
    }

    return permissions.includes(permission);
  }

  /**
   * Throws if permission missing
   */
  static async ensure(
    userId: string,
    workspaceId: string,
    permission: Permission
  ): Promise<void> {

    const allowed =
      await this.hasPermission(
        userId,
        workspaceId,
        permission
      );

    if (!allowed) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }
  }
  static async ensureTaskPermission(
  userId: string,
  task: {
    workspaceId: string;
  },
  permission: Permission
): Promise<void> {

  await this.ensure(
    userId,
    task.workspaceId,
    permission
  );
}
static async ensureBoardPermission(
  userId: string,
  board: {
    workspaceId: string;
  },
  permission: Permission
): Promise<void> {

  await this.ensure(
    userId,
    board.workspaceId,
    permission
  );
}
static async ensureColumnPermission(
  userId: string,
  column: {
    workspaceId: string;
  },
  permission: Permission
): Promise<void> {

  await this.ensure(
    userId,
    column.workspaceId,
    permission
  );
}
static async ensureCommentPermission(
  userId: string,
  comment: {
    workspaceId: string;
  },
  permission: Permission
): Promise<void> {

  await this.ensure(
    userId,
    comment.workspaceId,
    permission
  );
}
/**
   * Comment Ownership
   */

  static async ensureCommentOwnership(
    userId: string,
    comment: {
      authorId: string;
      workspaceId: string;
    }
  ): Promise<void> {

    const role =
      await this.getUserRole(
        userId,
        comment.workspaceId
      );

    if (!role) {
      throw new AppError(
        'Forbidden',
        403,
        'FORBIDDEN'
      );
    }

    if (
      role === 'OWNER' ||
      role === 'ADMIN'
    ) {
      return;
    }

    const ownsComment =
      comment.authorId.toString() ===
      userId.toString();

    if (!ownsComment) {
      throw new AppError(
        'You can only modify your own comment',
        403,
        'FORBIDDEN'
      );
    }
  }
static async ensureCanInviteRole(
  currentUserId: string,
  workspaceId: string,
  invitedRole: WorkspaceRole
): Promise<void> {

  const currentRole =
    await this.getUserRole(
      currentUserId,
      workspaceId
    );

  if (!currentRole) {
    throw new AppError(
      'Forbidden',
      403,
      'FORBIDDEN'
    );
  }

  if (currentRole === 'OWNER') {
    return;
  }

  if (currentRole === 'ADMIN') {

    if (
      invitedRole === 'ADMIN' ||
      invitedRole === 'OWNER'
    ) {
      throw new AppError(
        'Admins cannot invite admins or owners',
        403,
        'FORBIDDEN'
      );
    }

    return;
  }

  throw new AppError(
    'Forbidden',
    403,
    'FORBIDDEN'
  );
}
static async ensureCanChangeRole(
  currentUserId: string,
  workspaceId: string,
  targetRole: WorkspaceRole
): Promise<void> {

  const currentRole =
    await this.getUserRole(
      currentUserId,
      workspaceId
    );

  if (!currentRole) {
    throw new AppError(
      'Forbidden',
      403,
      'FORBIDDEN'
    );
  }

  if (currentRole === 'OWNER') {
    return;
  }

  throw new AppError(
    'Only owners can change roles',
    403,
    'FORBIDDEN'
  );
}
  /**
   * Role hierarchy
   */

  static async ensureCanManageMember(
    currentUserId: string,
    targetUserId: string,
    workspaceId: string
  ): Promise<void> {

    const currentUser =
      await WorkspaceMemberModel.findOne({
        workspaceId,
        userId: currentUserId
      });

    const targetUser =
      await WorkspaceMemberModel.findOne({
        workspaceId,
        userId: targetUserId
      });

    if (!currentUser || !targetUser) {
      throw new AppError(
        'Member not found',
        404,
        'NOT_FOUND'
      );
    }

    const ROLE_WEIGHT = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      GUEST: 1
    };

    if (
      ROLE_WEIGHT[
        targetUser.role as keyof typeof ROLE_WEIGHT
      ] === 4
    ) {
      throw new AppError(
        'Owner cannot be modified',
        403,
        'FORBIDDEN'
      );
    }

    if (
      ROLE_WEIGHT[
        currentUser.role as keyof typeof ROLE_WEIGHT
      ] <=
      ROLE_WEIGHT[
        targetUser.role as keyof typeof ROLE_WEIGHT
      ]
    ) {
      throw new AppError(
        'Cannot manage equal or higher role',
        403,
        'FORBIDDEN'
      );
    }
  }
}