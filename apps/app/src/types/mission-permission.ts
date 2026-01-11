import type { User, Mission, MissionPermission } from "@prisma/client";

export type UserWithRole = User & {
  role: string;
};

export type MissionWithPermissions = Mission & {
  permissions: (MissionPermission & {
    user: UserWithRole;
    grantedByUser: UserWithRole;
  })[];
};

export interface MissionPermissionsModalProps {
  mission: MissionWithPermissions;
  currentUserId: string;
  onSave: (
    missionId: string,
    isPublic: boolean,
    authorizedUserIds: string[]
  ) => Promise<void>;
}

export interface PermissionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}
