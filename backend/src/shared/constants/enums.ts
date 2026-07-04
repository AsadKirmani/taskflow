export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "MEMBER", "GUEST"] as const;
export const BOARD_VISIBILITY = ["private", "workspace"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const INVITATION_STATUS = [
  "pending",
  "accepted",
  "active",
  "expired",
  "revoked",
] as const;
export const THEMES = ["light", "dark", "system"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type BoardVisibility = (typeof BOARD_VISIBILITY)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type InvitationStatus = (typeof INVITATION_STATUS)[number];
export type ThemeMode = (typeof THEMES)[number];
